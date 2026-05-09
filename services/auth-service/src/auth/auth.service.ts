import { BadRequestException, Injectable, UnauthorizedException } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { compare, hash } from "bcryptjs";
import { randomUUID } from "crypto";
import { SocialProvider } from "../../generated/prisma-client";
import type { StringValue } from "ms";
import { PrismaService } from "../prisma.service";
import { metricsStore } from "../metrics.store";
import { LoginDto } from "./dto/login.dto";
import { RegisterDto } from "./dto/register.dto";

type SupportedOAuthProvider = "google" | "facebook" | "github" | "microsoft";

type OAuthProviderView = {
  id: SupportedOAuthProvider;
  name: string;
  enabled: boolean;
};

type OAuthConfig = {
  id: SupportedOAuthProvider;
  prismaProvider: SocialProvider;
  displayName: string;
  enabled: boolean;
  clientId: string;
  clientSecret: string;
  authorizationEndpoint: string;
  tokenEndpoint: string;
  scope: string;
};

type OAuthStatePayload = {
  provider: SupportedOAuthProvider;
  redirectUri: string;
  nonce: string;
};

type OAuthProfileCompletionPayload = {
  provider: SupportedOAuthProvider;
  providerAccountId: string;
  email: string;
  suggestedFullName: string;
  nonce: string;
};

type OAuthExchangeResult =
  | {
      accessToken: string;
      refreshToken: string;
      tokenType: "Bearer";
      role: "CLIENT" | "VETERINARY" | "ADMIN";
    }
  | {
      requiresProfileCompletion: true;
      provider: SupportedOAuthProvider;
      email: string;
      suggestedFullName: string;
      completionToken: string;
    };

type OAuthProfile = {
  providerAccountId: string;
  email: string;
  fullName: string;
};

@Injectable()
export class AuthService {
  private static readonly SERVICE_NAME = "auth-service";
  private readonly maxLoginAttempts = Number(process.env.AUTH_MAX_LOGIN_ATTEMPTS ?? 5);
  private readonly loginLockMinutes = Number(process.env.AUTH_LOGIN_LOCK_MINUTES ?? 15);

  constructor(
    private readonly prisma: PrismaService,
    private readonly jwt: JwtService
  ) {}

  async register(dto: RegisterDto) {
    const existing = await this.prisma.user.findUnique({ where: { email: dto.email } });
    if (existing) {
      throw new BadRequestException("El correo ya está registrado");
    }

    const passwordHash = await hash(dto.password, 10);
    const user = await this.prisma.user.create({
      data: {
        email: dto.email,
        passwordHash,
        fullName: dto.fullName,
        role: "CLIENT"
      }
    });

    metricsStore.incrementBusinessMetric(AuthService.SERVICE_NAME, "auth_register_success", { role: user.role });

    return this.issueTokensWithSession(user.id, user.email, user.role, user.fullName);
  }

  async login(dto: LoginDto) {
    const user = await this.prisma.user.findUnique({ where: { email: dto.email } });
    if (!user) {
      metricsStore.incrementBusinessMetric(AuthService.SERVICE_NAME, "auth_login_failed", { reason: "user_not_found" });
      throw new UnauthorizedException("Credenciales inválidas");
    }

    if (user.lockedUntil && user.lockedUntil > new Date()) {
      metricsStore.incrementBusinessMetric(AuthService.SERVICE_NAME, "auth_login_blocked", { reason: "lockout" });
      throw new UnauthorizedException("Cuenta temporalmente bloqueada por múltiples intentos fallidos");
    }

    const isMatch = await compare(dto.password, user.passwordHash);
    if (!isMatch) {
      const nextFailedAttempts = user.failedLoginAttempts + 1;
      const mustLock = nextFailedAttempts >= this.maxLoginAttempts;

      await this.prisma.user.update({
        where: { id: user.id },
        data: {
          failedLoginAttempts: mustLock ? 0 : nextFailedAttempts,
          lockedUntil: mustLock ? new Date(Date.now() + this.loginLockMinutes * 60_000) : null
        }
      });

      metricsStore.incrementBusinessMetric(AuthService.SERVICE_NAME, "auth_login_failed", {
        reason: mustLock ? "max_attempts_reached" : "invalid_password"
      });

      throw new UnauthorizedException("Credenciales inválidas");
    }

    await this.prisma.user.update({
      where: { id: user.id },
      data: {
        failedLoginAttempts: 0,
        lockedUntil: null
      }
    });

    metricsStore.incrementBusinessMetric(AuthService.SERVICE_NAME, "auth_login_success", { role: user.role });

    return this.issueTokensWithSession(user.id, user.email, user.role, user.fullName);
  }

  async refresh(refreshToken: string) {
    try {
      const payload = await this.jwt.verifyAsync<{ sub: string; email: string; role: string; sid: string }>(refreshToken, {
        secret: process.env.JWT_REFRESH_SECRET
      });

      const session = await this.prisma.refreshSession.findFirst({
        where: {
          sid: payload.sid,
          userId: payload.sub,
          revokedAt: null,
          expiresAt: { gt: new Date() }
        }
      });

      if (!session) {
        metricsStore.incrementBusinessMetric(AuthService.SERVICE_NAME, "auth_refresh_failed", { reason: "session_not_found" });
        throw new UnauthorizedException("Sesión de refresh inválida o revocada");
      }

      const valid = await compare(refreshToken, session.tokenHash);
      if (!valid) {
        metricsStore.incrementBusinessMetric(AuthService.SERVICE_NAME, "auth_refresh_failed", { reason: "token_hash_mismatch" });
        throw new UnauthorizedException("Refresh token inválido");
      }

      await this.prisma.refreshSession.update({
        where: { id: session.id },
        data: { revokedAt: new Date() }
      });

      metricsStore.incrementBusinessMetric(AuthService.SERVICE_NAME, "auth_refresh_success");

      const user = await this.prisma.user.findUnique({ where: { id: payload.sub } });
      if (!user) {
        metricsStore.incrementBusinessMetric(AuthService.SERVICE_NAME, "auth_refresh_failed", { reason: "user_not_found" });
        throw new UnauthorizedException("Usuario no encontrado");
      }

      return this.issueTokensWithSession(user.id, user.email, user.role, user.fullName);
    } catch {
      metricsStore.incrementBusinessMetric(AuthService.SERVICE_NAME, "auth_refresh_failed", { reason: "invalid_token" });
      throw new UnauthorizedException("Refresh token inválido");
    }
  }

  async logout(refreshToken: string) {
    try {
      const payload = await this.jwt.verifyAsync<{ sub: string; sid: string }>(refreshToken, {
        secret: process.env.JWT_REFRESH_SECRET
      });

      const session = await this.prisma.refreshSession.findFirst({
        where: { sid: payload.sid, userId: payload.sub, revokedAt: null }
      });

      if (session) {
        await this.prisma.refreshSession.update({
          where: { id: session.id },
          data: { revokedAt: new Date() }
        });
        metricsStore.incrementBusinessMetric(AuthService.SERVICE_NAME, "auth_logout_success", { revoked: "true" });
      } else {
        metricsStore.incrementBusinessMetric(AuthService.SERVICE_NAME, "auth_logout_success", { revoked: "false" });
      }

      return { success: true };
    } catch {
      metricsStore.incrementBusinessMetric(AuthService.SERVICE_NAME, "auth_logout_failed", { reason: "invalid_token" });
      throw new UnauthorizedException("Refresh token inválido");
    }
  }

  async forgotPassword(email: string) {
    // Respuesta uniforme para evitar enumeración de correos.
    await this.prisma.user.findUnique({ where: { email } });
    return {
      success: true,
      message: "Si existe una cuenta con ese correo, se enviarán instrucciones de recuperación"
    };
  }

  listOAuthProviders() {
    const providers = this.getOAuthConfigs();

    return {
      providers: providers.map<OAuthProviderView>((provider) => ({
        id: provider.id,
        name: provider.displayName,
        enabled: provider.enabled
      }))
    };
  }

  async buildOAuthAuthorizationUrl(providerRaw: string, redirectUri: string) {
    const provider = this.requireOAuthProvider(providerRaw);
    const stateSecret = this.getOAuthStateSecret();

    const state = await this.jwt.signAsync(
      {
        provider: provider.id,
        redirectUri,
        nonce: randomUUID()
      } satisfies OAuthStatePayload,
      {
        secret: stateSecret,
        expiresIn: "10m" as StringValue
      }
    );

    const params = new URLSearchParams({
      client_id: provider.clientId,
      redirect_uri: redirectUri,
      response_type: "code",
      scope: provider.scope,
      state
    });

    if (provider.id === "google") {
      params.set("access_type", "offline");
      params.set("prompt", "select_account");
    }

    return {
      authorizationUrl: `${provider.authorizationEndpoint}?${params.toString()}`
    };
  }

  async exchangeOAuthCode(providerRaw: string, code: string, state: string, redirectUri: string): Promise<OAuthExchangeResult> {
    const provider = this.requireOAuthProvider(providerRaw);
    const stateSecret = this.getOAuthStateSecret();

    let parsedState: OAuthStatePayload;
    try {
      parsedState = await this.jwt.verifyAsync<OAuthStatePayload>(state, { secret: stateSecret });
    } catch {
      throw new UnauthorizedException("Estado OAuth inválido o expirado");
    }

    if (parsedState.provider !== provider.id || parsedState.redirectUri !== redirectUri) {
      throw new UnauthorizedException("Estado OAuth inválido");
    }

    const tokenResponse = await fetch(provider.tokenEndpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        Accept: "application/json"
      },
      body: new URLSearchParams({
        client_id: provider.clientId,
        client_secret: provider.clientSecret,
        code,
        redirect_uri: redirectUri,
        grant_type: "authorization_code"
      })
    });

    if (!tokenResponse.ok) {
      throw new UnauthorizedException("No se pudo intercambiar el código OAuth");
    }

    const tokenPayload = (await tokenResponse.json()) as { access_token?: string };
    const accessToken = tokenPayload.access_token;

    if (!accessToken) {
      throw new UnauthorizedException("Respuesta OAuth inválida: access token ausente");
    }

    const profile = await this.fetchOAuthProfile(provider.id, accessToken);

    const existingSocial = await this.prisma.socialAccount.findUnique({
      where: {
        provider_providerAccountId: {
          provider: provider.prismaProvider,
          providerAccountId: profile.providerAccountId
        }
      },
      include: { user: true }
    });

    if (existingSocial) {
      metricsStore.incrementBusinessMetric(AuthService.SERVICE_NAME, "auth_social_login_success", {
        provider: provider.id,
        mode: "existing_social"
      });

      return this.issueTokensWithSession(
        existingSocial.user.id,
        existingSocial.user.email,
        existingSocial.user.role,
        existingSocial.user.fullName
      );
    }

    let user = await this.prisma.user.findUnique({ where: { email: profile.email } });
    if (user) {
      await this.prisma.socialAccount.create({
        data: {
          userId: user.id,
          provider: provider.prismaProvider,
          providerAccountId: profile.providerAccountId
        }
      });

      metricsStore.incrementBusinessMetric(AuthService.SERVICE_NAME, "auth_social_login_success", {
        provider: provider.id,
        mode: "linked_or_created"
      });

      return this.issueTokensWithSession(user.id, user.email, user.role, user.fullName);
    }

    const completionToken = await this.jwt.signAsync(
      {
        provider: provider.id,
        providerAccountId: profile.providerAccountId,
        email: profile.email,
        suggestedFullName: profile.fullName,
        nonce: randomUUID()
      } satisfies OAuthProfileCompletionPayload,
      {
        secret: this.getOAuthStateSecret(),
        expiresIn: "10m" as StringValue
      }
    );

    return {
      requiresProfileCompletion: true,
      provider: provider.id,
      email: profile.email,
      suggestedFullName: profile.fullName,
      completionToken
    };
  }

  async completeOAuthProfile(providerRaw: string, completionToken: string, fullNameRaw: string) {
    const provider = this.requireOAuthProvider(providerRaw);
    const fullName = fullNameRaw.trim();
    if (fullName.length < 3) {
      throw new BadRequestException("El nombre debe tener al menos 3 caracteres");
    }

    let payload: OAuthProfileCompletionPayload;
    try {
      payload = await this.jwt.verifyAsync<OAuthProfileCompletionPayload>(completionToken, {
        secret: this.getOAuthStateSecret()
      });
    } catch {
      throw new UnauthorizedException("Token de finalizacion OAuth invalido o expirado");
    }

    if (payload.provider !== provider.id) {
      throw new UnauthorizedException("Proveedor OAuth no coincide con el token de finalizacion");
    }

    const existingSocial = await this.prisma.socialAccount.findUnique({
      where: {
        provider_providerAccountId: {
          provider: provider.prismaProvider,
          providerAccountId: payload.providerAccountId
        }
      },
      include: { user: true }
    });

    if (existingSocial) {
      return this.issueTokensWithSession(
        existingSocial.user.id,
        existingSocial.user.email,
        existingSocial.user.role,
        existingSocial.user.fullName
      );
    }

    let user = await this.prisma.user.findUnique({ where: { email: payload.email } });
    if (!user) {
      const socialPasswordHash = await hash(`social:${provider.id}:${randomUUID()}`, 10);
      user = await this.prisma.user.create({
        data: {
          email: payload.email,
          fullName,
          passwordHash: socialPasswordHash,
          role: "CLIENT"
        }
      });
    }

    await this.prisma.socialAccount.create({
      data: {
        userId: user.id,
        provider: provider.prismaProvider,
        providerAccountId: payload.providerAccountId
      }
    });

    metricsStore.incrementBusinessMetric(AuthService.SERVICE_NAME, "auth_social_login_success", {
      provider: provider.id,
      mode: "completed_profile"
    });

    return this.issueTokensWithSession(user.id, user.email, user.role, user.fullName);
  }

  private async issueTokensWithSession(
    userId: string,
    email: string,
    role: "CLIENT" | "VETERINARY" | "ADMIN",
    fullName: string
  ) {
    const sid = randomUUID();
    const tokens = await this.signTokens(userId, email, role, fullName, sid);
    await this.persistRefreshSession(userId, sid, tokens.refreshToken);
    return tokens;
  }

  private async signTokens(
    userId: string,
    email: string,
    role: "CLIENT" | "VETERINARY" | "ADMIN",
    fullName: string,
    sid: string
  ) {
    const accessExpiresIn = (process.env.JWT_ACCESS_EXPIRES_IN ?? "15m") as StringValue;
    const refreshExpiresIn = (process.env.JWT_REFRESH_EXPIRES_IN ?? "7d") as StringValue;

    const [accessToken, refreshToken] = await Promise.all([
      this.jwt.signAsync(
        { sub: userId, email, role, fullName },
        {
          secret: process.env.JWT_ACCESS_SECRET,
          expiresIn: accessExpiresIn
        }
      ),
      this.jwt.signAsync(
        { sub: userId, email, role, fullName, sid },
        {
          secret: process.env.JWT_REFRESH_SECRET,
          expiresIn: refreshExpiresIn
        }
      )
    ]);

    return {
      accessToken,
      refreshToken,
      tokenType: "Bearer",
      role
    };
  }

  private async persistRefreshSession(userId: string, sid: string, refreshToken: string) {
    const decoded = this.jwt.decode(refreshToken) as { exp?: number } | null;

    if (!decoded?.exp) {
      throw new UnauthorizedException("No se pudo calcular la expiración del refresh token");
    }

    const tokenHash = await hash(refreshToken, 10);

    await this.prisma.refreshSession.create({
      data: {
        userId,
        sid,
        tokenHash,
        expiresAt: new Date(decoded.exp * 1000)
      }
    });
  }

  private getOAuthConfigs(): OAuthConfig[] {
    return [
      {
        id: "google",
        prismaProvider: SocialProvider.GOOGLE,
        displayName: "Google",
        enabled: Boolean(process.env.OAUTH_GOOGLE_CLIENT_ID && process.env.OAUTH_GOOGLE_CLIENT_SECRET),
        clientId: process.env.OAUTH_GOOGLE_CLIENT_ID ?? "",
        clientSecret: process.env.OAUTH_GOOGLE_CLIENT_SECRET ?? "",
        authorizationEndpoint: "https://accounts.google.com/o/oauth2/v2/auth",
        tokenEndpoint: "https://oauth2.googleapis.com/token",
        scope: "openid email profile"
      },
      {
        id: "facebook",
        prismaProvider: SocialProvider.FACEBOOK,
        displayName: "Facebook",
        enabled: Boolean(process.env.OAUTH_FACEBOOK_CLIENT_ID && process.env.OAUTH_FACEBOOK_CLIENT_SECRET),
        clientId: process.env.OAUTH_FACEBOOK_CLIENT_ID ?? "",
        clientSecret: process.env.OAUTH_FACEBOOK_CLIENT_SECRET ?? "",
        authorizationEndpoint: "https://www.facebook.com/v20.0/dialog/oauth",
        tokenEndpoint: "https://graph.facebook.com/v20.0/oauth/access_token",
        scope: process.env.OAUTH_FACEBOOK_SCOPE ?? "public_profile"
      },
      {
        id: "github",
        prismaProvider: SocialProvider.GITHUB,
        displayName: "GitHub",
        enabled: Boolean(process.env.OAUTH_GITHUB_CLIENT_ID && process.env.OAUTH_GITHUB_CLIENT_SECRET),
        clientId: process.env.OAUTH_GITHUB_CLIENT_ID ?? "",
        clientSecret: process.env.OAUTH_GITHUB_CLIENT_SECRET ?? "",
        authorizationEndpoint: "https://github.com/login/oauth/authorize",
        tokenEndpoint: "https://github.com/login/oauth/access_token",
        scope: "read:user user:email"
      },
      {
        id: "microsoft",
        prismaProvider: SocialProvider.MICROSOFT,
        displayName: "Microsoft",
        enabled: Boolean(process.env.OAUTH_MICROSOFT_CLIENT_ID && process.env.OAUTH_MICROSOFT_CLIENT_SECRET),
        clientId: process.env.OAUTH_MICROSOFT_CLIENT_ID ?? "",
        clientSecret: process.env.OAUTH_MICROSOFT_CLIENT_SECRET ?? "",
        authorizationEndpoint: "https://login.microsoftonline.com/common/oauth2/v2.0/authorize",
        tokenEndpoint: "https://login.microsoftonline.com/common/oauth2/v2.0/token",
        scope: "openid profile email User.Read"
      }
    ];
  }

  private requireOAuthProvider(providerRaw: string): OAuthConfig {
    const provider = this.getOAuthConfigs().find((item) => item.id === providerRaw);
    if (!provider) {
      throw new BadRequestException("Proveedor OAuth no soportado");
    }

    if (!provider.enabled) {
      throw new BadRequestException(`Proveedor OAuth no configurado: ${provider.displayName}`);
    }

    return provider;
  }

  private getOAuthStateSecret() {
    const secret = process.env.OAUTH_STATE_SECRET ?? process.env.JWT_REFRESH_SECRET;
    if (!secret) {
      throw new BadRequestException("Falta configurar OAUTH_STATE_SECRET o JWT_REFRESH_SECRET");
    }

    return secret;
  }

  private async fetchOAuthProfile(provider: SupportedOAuthProvider, accessToken: string): Promise<OAuthProfile> {
    if (provider === "google") {
      const response = await fetch("https://openidconnect.googleapis.com/v1/userinfo", {
        headers: { Authorization: `Bearer ${accessToken}` }
      });

      if (!response.ok) {
        throw new UnauthorizedException("No se pudo obtener perfil de Google");
      }

      const payload = (await response.json()) as { sub?: string; email?: string; name?: string };
      if (!payload.sub || !payload.email) {
        throw new UnauthorizedException("Google no devolvió identidad suficiente");
      }

      return {
        providerAccountId: payload.sub,
        email: payload.email,
        fullName: payload.name ?? "Usuario Google"
      };
    }

    if (provider === "facebook") {
      const response = await fetch(
        `https://graph.facebook.com/me?fields=id,name,email&access_token=${encodeURIComponent(accessToken)}`
      );

      if (!response.ok) {
        throw new UnauthorizedException("No se pudo obtener perfil de Facebook");
      }

      const payload = (await response.json()) as { id?: string; email?: string; name?: string };
      if (!payload.id) {
        throw new UnauthorizedException("Facebook no devolvió identidad suficiente");
      }

      const syntheticEmail = `facebook_${payload.id}@users.petquotes.local`;

      return {
        providerAccountId: payload.id,
        email: payload.email ?? syntheticEmail,
        fullName: payload.name ?? "Usuario Facebook"
      };
    }

    if (provider === "github") {
      const userResponse = await fetch("https://api.github.com/user", {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          Accept: "application/vnd.github+json",
          "User-Agent": "petquotes-auth"
        }
      });

      if (!userResponse.ok) {
        throw new UnauthorizedException("No se pudo obtener perfil de GitHub");
      }

      const userPayload = (await userResponse.json()) as { id?: number; email?: string | null; name?: string; login?: string };
      let email = userPayload.email ?? undefined;

      if (!email) {
        const emailsResponse = await fetch("https://api.github.com/user/emails", {
          headers: {
            Authorization: `Bearer ${accessToken}`,
            Accept: "application/vnd.github+json",
            "User-Agent": "petquotes-auth"
          }
        });

        if (!emailsResponse.ok) {
          throw new UnauthorizedException("GitHub no devolvió correo utilizable");
        }

        const emailsPayload = (await emailsResponse.json()) as Array<{ email: string; primary: boolean; verified: boolean }>;
        const primaryVerified = emailsPayload.find((item) => item.primary && item.verified);
        email = primaryVerified?.email;
      }

      if (!userPayload.id || !email) {
        throw new UnauthorizedException("GitHub no devolvió identidad suficiente");
      }

      return {
        providerAccountId: String(userPayload.id),
        email,
        fullName: userPayload.name ?? userPayload.login ?? "Usuario GitHub"
      };
    }

    const msResponse = await fetch("https://graph.microsoft.com/v1.0/me", {
      headers: { Authorization: `Bearer ${accessToken}` }
    });

    if (!msResponse.ok) {
      throw new UnauthorizedException("No se pudo obtener perfil de Microsoft");
    }

    const msPayload = (await msResponse.json()) as {
      id?: string;
      displayName?: string;
      mail?: string | null;
      userPrincipalName?: string;
    };

    const email = msPayload.mail ?? msPayload.userPrincipalName;
    if (!msPayload.id || !email) {
      throw new UnauthorizedException("Microsoft no devolvió identidad suficiente");
    }

    return {
      providerAccountId: msPayload.id,
      email,
      fullName: msPayload.displayName ?? "Usuario Microsoft"
    };
  }
}
