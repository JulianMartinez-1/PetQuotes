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
    const config = this.oauthConfigs[provider];
    if (!config.clientId || !config.clientSecret) {
      throw new BadRequestException(`OAuth provider ${provider} is not configured`);
    }

    try {
      // Exchange code for access token
      const tokenResponse = await this.getAccessToken(provider, code, redirectUri, config);
      const accessToken = tokenResponse.access_token;

      // Get user info
      const userInfo = await this.getUserInfo(provider, accessToken, config);

      // Generate completion token (JWT-like token for profile completion)
      const completionToken = this.generateCompletionToken(provider, userInfo);

      return {
        completionToken,
        provider,
        email: userInfo.email,
        name: userInfo.name,
        profilePicture: userInfo.picture,
      };
    } catch (error) {
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
    // Verify completion token
    const oauthData = this.verifyCompletionToken(completionToken);

    if (oauthData.provider !== provider) {
      throw new BadRequestException('Provider mismatch');
    }

    // Check if user exists
    let user = await this.userRepository.findByEmail(oauthData.email);

    if (!user) {
      // Create new user
      const generatedPassword = crypto.randomBytes(16).toString('hex');
      const passwordHash = await bcrypt.hash(generatedPassword, 10);

      user = await this.userRepository.create({
        email: oauthData.email,
        passwordHash,
        fullName: fullName || oauthData.name,
        role: 'CLIENT',
      });

      // Create social account link
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
    } else {
      // Update existing user with OAuth info if not already linked
      const existingSocialAccount = await this.prisma.socialAccount.findFirst({
        where: {
          userId: user.id,
          provider: provider.toUpperCase() as any,
        },
      });

      if (!existingSocialAccount) {
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
      }
    }

    // Generate tokens
    const tokens = this.jwtManager.generateTokens(user.id, user.email, user.role);

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
