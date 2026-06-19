import { Injectable, BadRequestException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as crypto from 'crypto';
import { UserRepository } from '@data/repositories/user.repository';
import { JwtManager } from '@config/auth/jwt.manager';
import { PrismaService } from '@shared/prisma/prisma.service';
import { OAuthProvider, OAuthCallbackResponseDto, OAuthTokenResponseDto } from '@presentation/auth/oauth.dto';
import * as bcrypt from 'bcryptjs';

interface OAuthConfig {
  clientId: string;
  clientSecret: string;
  authorizationUrl: string;
  tokenUrl: string;
  userInfoUrl: string;
}

interface UserInfo {
  email: string;
  name: string;
  picture?: string;
  oauthId: string;
}

@Injectable()
export class OAuthService {
  private oauthConfigs: Record<OAuthProvider, OAuthConfig>;

  constructor(
    private configService: ConfigService,
    private userRepository: UserRepository,
    private jwtManager: JwtManager,
    private prisma: PrismaService,
  ) {
    this.oauthConfigs = {
      google: {
        clientId: this.configService.get('OAUTH_GOOGLE_CLIENT_ID') || '',
        clientSecret: this.configService.get('OAUTH_GOOGLE_CLIENT_SECRET') || '',
        authorizationUrl: 'https://accounts.google.com/o/oauth2/v2/auth',
        tokenUrl: 'https://oauth2.googleapis.com/token',
        userInfoUrl: 'https://www.googleapis.com/oauth2/v2/userinfo',
      },
      facebook: {
        clientId: this.configService.get('OAUTH_FACEBOOK_CLIENT_ID') || '',
        clientSecret: this.configService.get('OAUTH_FACEBOOK_CLIENT_SECRET') || '',
        authorizationUrl: 'https://www.facebook.com/v18.0/dialog/oauth',
        tokenUrl: 'https://graph.facebook.com/v18.0/oauth/access_token',
        userInfoUrl: 'https://graph.facebook.com/me?fields=id,email,name,picture',
      },
      github: {
        clientId: this.configService.get('OAUTH_GITHUB_CLIENT_ID') || '',
        clientSecret: this.configService.get('OAUTH_GITHUB_CLIENT_SECRET') || '',
        authorizationUrl: 'https://github.com/login/oauth/authorize',
        tokenUrl: 'https://github.com/login/oauth/access_token',
        userInfoUrl: 'https://api.github.com/user',
      },
      microsoft: {
        clientId: this.configService.get('OAUTH_MICROSOFT_CLIENT_ID') || '',
        clientSecret: this.configService.get('OAUTH_MICROSOFT_CLIENT_SECRET') || '',
        authorizationUrl: 'https://login.microsoftonline.com/common/oauth2/v2.0/authorize',
        tokenUrl: 'https://login.microsoftonline.com/common/oauth2/v2.0/token',
        userInfoUrl: 'https://graph.microsoft.com/v1.0/me',
      },
    };
  }

  /**
   * Get list of enabled OAuth providers
   */
  getAvailableProviders() {
    const providers: Array<{ id: OAuthProvider; name: string; enabled: boolean; clientId?: string }> = [];

    for (const [key, config] of Object.entries(this.oauthConfigs)) {
      const provider = key as OAuthProvider;
      const isEnabled = !!config.clientId && !!config.clientSecret;

      if (isEnabled) {
        providers.push({
          id: provider,
          name: this.getProviderName(provider),
          enabled: true,
          clientId: config.clientId,
        });
      }
    }

    return providers;
  }

  /**
   * Generate OAuth start URL
   */
  generateOAuthUrl(provider: OAuthProvider, redirectUri: string): { url: string; state: string } {
    const config = this.oauthConfigs[provider];
    if (!config.clientId || !config.clientSecret) {
      throw new BadRequestException(`OAuth provider ${provider} is not configured`);
    }

    const state = this.generateState();
    const scopes = this.getScopes(provider);

    const params = new URLSearchParams({
      client_id: config.clientId,
      redirect_uri: redirectUri,
      response_type: 'code',
      scope: scopes,
      state,
      ...(provider === 'facebook' && { display: 'popup' }),
      ...(provider === 'microsoft' && { prompt: 'select_account' }),
    });

    return {
      url: `${config.authorizationUrl}?${params.toString()}`,
      state,
    };
  }

  /**
   * Exchange OAuth code for tokens and user info
   */
  async exchangeCodeForToken(
    provider: OAuthProvider,
    code: string,
    state: string,
    redirectUri: string,
  ): Promise<OAuthCallbackResponseDto> {
    const startTime = Date.now();
    const config = this.oauthConfigs[provider];
    if (!config.clientId || !config.clientSecret) {
      throw new BadRequestException(`OAuth provider ${provider} is not configured`);
    }

    try {
      // Exchange code for access token
      console.log(`[OAuth] Starting token exchange for ${provider}`);
      const tokenStart = Date.now();
      const tokenResponse = await this.getAccessToken(provider, code, redirectUri, config);
      const accessToken = tokenResponse.access_token;
      console.log(`[OAuth] Token exchange completed in ${Date.now() - tokenStart}ms`);

      // Get user info
      console.log(`[OAuth] Fetching user info...`);
      const userStart = Date.now();
      const userInfo = await this.getUserInfo(provider, accessToken, config);
      console.log(`[OAuth] User info fetched in ${Date.now() - userStart}ms`);

      // Generate completion token (JWT-like token for profile completion)
      console.log(`[OAuth] Generating completion token...`);
      const completionToken = this.generateCompletionToken(provider, userInfo);
      console.log(`[OAuth] OAuth flow completed in ${Date.now() - startTime}ms total`);

      return {
        completionToken,
        provider,
        email: userInfo.email,
        name: userInfo.name,
        profilePicture: userInfo.picture,
        requiresProfileCompletion: true,
      };
    } catch (error) {
      console.error(`[OAuth] Error during exchange: ${(error as Error).message}`);
      throw new BadRequestException(`Failed to exchange OAuth code: ${(error as Error).message}`);
    }
  }

  /**
   * Complete OAuth registration
   */
  async completeOAuthRegistration(
    provider: OAuthProvider,
    completionToken: string,
    fullName: string,
  ): Promise<OAuthTokenResponseDto> {
    const startTime = Date.now();
    console.log(`[OAuth] Starting profile completion for ${provider}`);

    // Verify completion token
    const oauthData = this.verifyCompletionToken(completionToken);

    if (oauthData.provider !== provider) {
      throw new BadRequestException('Provider mismatch');
    }

    // Check if user exists
    console.log(`[OAuth] Checking if user exists: ${oauthData.email}`);
    const userCheckStart = Date.now();
    let user = await this.userRepository.findByEmail(oauthData.email);
    console.log(`[OAuth] User check completed in ${Date.now() - userCheckStart}ms`);

    if (!user) {
      console.log(`[OAuth] Creating new user for ${oauthData.email}`);
      const createStart = Date.now();

      // Create new user - hash password in parallel for speed
      const [passwordHash] = await Promise.all([
        bcrypt.hash(crypto.randomBytes(16).toString('hex'), 10),
      ]);

      user = await this.userRepository.create({
        email: oauthData.email,
        passwordHash,
        fullName: fullName || oauthData.name,
        role: 'CLIENT',
      });
      console.log(`[OAuth] User created in ${Date.now() - createStart}ms`);

      // Create social account link immediately after user creation
      console.log(`[OAuth] Linking social account...`);
      const linkStart = Date.now();
      try {
        await this.prisma.socialAccount.create({
          data: {
            userId: user.id,
            provider: provider.toUpperCase() as any,
            providerAccountId: oauthData.oauthId,
            email: oauthData.email,
            name: oauthData.name,
            image: oauthData.picture,
          },
        });
        console.log(`[OAuth] Social account linked in ${Date.now() - linkStart}ms`);
      } catch (err) {
        // Silently ignore if already exists
        console.log('[OAuth] Social account already exists, skipping');
      }
    } else {
      console.log(`[OAuth] User already exists, checking for social account link`);
      // Update existing user with OAuth info if not already linked
      const existingSocialAccount = await this.prisma.socialAccount.findFirst({
        where: {
          userId: user.id,
          provider: provider.toUpperCase() as any,
        },
      });

      if (!existingSocialAccount) {
        try {
          await this.prisma.socialAccount.create({
            data: {
              userId: user.id,
              provider: provider.toUpperCase() as any,
              providerAccountId: oauthData.oauthId,
              email: oauthData.email,
              name: oauthData.name,
              image: oauthData.picture,
            },
          });
        } catch (err) {
          // Silently ignore if already exists
          console.log('[OAuth] Social account already exists, skipping');
        }
      }
    }

    // Generate tokens
    console.log(`[OAuth] Generating JWT tokens...`);
    const tokenStart = Date.now();
    const tokens = this.jwtManager.generateTokens(user.id, user.email, user.role, user.fullName);
    console.log(`[OAuth] Tokens generated in ${Date.now() - tokenStart}ms`);
    console.log(`[OAuth] Profile completion finished in ${Date.now() - startTime}ms total`);

    return {
      userId: user.id,
      email: user.email,
      fullName: user.fullName,
      role: user.role,
      ...tokens,
    };
  }

  private async getAccessToken(
    provider: OAuthProvider,
    code: string,
    redirectUri: string,
    config: OAuthConfig,
  ): Promise<any> {
    const params = new URLSearchParams({
      client_id: config.clientId,
      client_secret: config.clientSecret,
      code,
      redirect_uri: redirectUri,
      grant_type: 'authorization_code',
    });

    const response = await fetch(config.tokenUrl, {
      method: 'POST',
      headers: { Accept: 'application/json', 'Content-Type': 'application/x-www-form-urlencoded' },
      body: params.toString(),
    });

    if (!response.ok) {
      throw new Error(`Token exchange failed: ${response.statusText}`);
    }

    return response.json();
  }

  private async getUserInfo(provider: OAuthProvider, accessToken: string, config: OAuthConfig): Promise<UserInfo> {
    const headers: Record<string, string> = {
      Authorization: `Bearer ${accessToken}`,
    };

    if (provider === 'github') {
      headers['Accept'] = 'application/vnd.github.v3+json';
    } else if (provider === 'facebook') {
      // Facebook uses query param for token
      const url = `${config.userInfoUrl}&access_token=${accessToken}`;
      const response = await fetch(url);
      if (!response.ok) throw new Error(`User info fetch failed: ${response.statusText}`);
      const data = await response.json();
      return this.mapUserInfo(provider, data);
    }

    const response = await fetch(config.userInfoUrl, { headers });
    if (!response.ok) throw new Error(`User info fetch failed: ${response.statusText}`);
    const data = await response.json();
    return this.mapUserInfo(provider, data);
  }

  private mapUserInfo(provider: OAuthProvider, data: any): UserInfo {
    switch (provider) {
      case 'google':
        return {
          email: data.email,
          name: data.name,
          picture: data.picture,
          oauthId: data.id,
        };
      case 'facebook':
        return {
          email: data.email,
          name: data.name,
          picture: data.picture?.data?.url,
          oauthId: data.id,
        };
      case 'github':
        return {
          email: data.email || data.login,
          name: data.name || data.login,
          picture: data.avatar_url,
          oauthId: data.id.toString(),
        };
      case 'microsoft':
        return {
          email: data.userPrincipalName || data.mail,
          name: data.displayName,
          picture: undefined,
          oauthId: data.id,
        };
      default:
        throw new Error('Unknown provider');
    }
  }

  private generateState(): string {
    return crypto.randomBytes(32).toString('hex');
  }

  private generateCompletionToken(provider: OAuthProvider, userInfo: UserInfo): string {
    const payload = {
      provider,
      email: userInfo.email,
      name: userInfo.name,
      oauthId: userInfo.oauthId,
      iat: Date.now(),
    };
    return Buffer.from(JSON.stringify(payload)).toString('base64');
  }

  private verifyCompletionToken(token: string): any {
    try {
      const payload = JSON.parse(Buffer.from(token, 'base64').toString());
      // Check token is recent (within 10 minutes)
      if (Date.now() - payload.iat > 10 * 60 * 1000) {
        throw new BadRequestException('Completion token expired');
      }
      return payload;
    } catch {
      throw new BadRequestException('Invalid completion token');
    }
  }

  private getScopes(provider: OAuthProvider): string {
    switch (provider) {
      case 'google':
        return 'openid profile email';
      case 'facebook':
        return 'public_profile,email';
      case 'github':
        return 'read:user user:email';
      case 'microsoft':
        return 'openid profile email';
      default:
        return '';
    }
  }

  private getProviderName(provider: OAuthProvider): string {
    switch (provider) {
      case 'google':
        return 'Google';
      case 'facebook':
        return 'Facebook';
      case 'github':
        return 'GitHub';
      case 'microsoft':
        return 'Microsoft';
      default:
        return provider;
    }
  }
}
