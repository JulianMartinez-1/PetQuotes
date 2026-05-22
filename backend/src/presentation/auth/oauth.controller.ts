import { Controller, Get, Post, Body, Query, HttpCode, HttpStatus, Param } from '@nestjs/common';
import { OAuthService } from '@business/auth/oauth.service';
import {
  OAuthStartDto,
  OAuthExchangeDto,
  OAuthCompleteDto,
  OAuthProvidersResponseDto,
  OAuthProvider,
} from './oauth.dto';

@Controller('auth/oauth')
export class OAuthController {
  constructor(private oauthService: OAuthService) {}

  /**
   * Get available OAuth providers
   * GET /api/auth/oauth/providers
   */
  @Get('providers')
  @HttpCode(HttpStatus.OK)
  getProviders(): OAuthProvidersResponseDto {
    const providers = this.oauthService.getAvailableProviders();
    return {
      providers: providers.map((p) => ({
        id: p.id,
        name: p.name,
        enabled: p.enabled,
      })),
    };
  }

  /**
   * Start OAuth flow for a provider
   * GET /api/auth/oauth/:provider/start
   */
  @Get(':provider/start')
  @HttpCode(HttpStatus.OK)
  startOAuth(@Param('provider') provider: string, @Query('redirectUri') redirectUri: string) {
    if (!redirectUri) {
      throw new Error('redirectUri query parameter is required');
    }

    const { url, state } = this.oauthService.generateOAuthUrl(provider as OAuthProvider, redirectUri);

    return {
      authorizationUrl: url,
      state,
    };
  }

  /**
   * Exchange OAuth code for tokens
   * POST /api/auth/oauth/:provider/exchange
   */
  @Post(':provider/exchange')
  @HttpCode(HttpStatus.OK)
  async exchangeCode(@Param('provider') provider: string, @Body() dto: OAuthExchangeDto) {
    return this.oauthService.exchangeCodeForToken(
      provider as OAuthProvider,
      dto.code,
      dto.state,
      dto.redirectUri,
    );
  }

  /**
   * Complete OAuth registration
   * POST /api/auth/oauth/:provider/complete
   */
  @Post(':provider/complete')
  @HttpCode(HttpStatus.OK)
  async completeRegistration(@Param('provider') provider: string, @Body() dto: OAuthCompleteDto) {
    return this.oauthService.completeOAuthRegistration(
      provider as OAuthProvider,
      dto.completionToken,
      dto.fullName,
    );
  }
}
