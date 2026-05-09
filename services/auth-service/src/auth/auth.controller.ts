import { Body, Controller, Get, Param, Post, Query } from "@nestjs/common";
import { AuthService } from "./auth.service";
import { ForgotPasswordDto } from "./dto/forgot-password.dto";
import { LoginDto } from "./dto/login.dto";
import { OAuthCompleteProfileDto } from "./dto/oauth-complete-profile.dto";
import { LogoutDto } from "./dto/logout.dto";
import { OAuthExchangeDto } from "./dto/oauth-exchange.dto";
import { RefreshTokenDto } from "./dto/refresh-token.dto";
import { RegisterDto } from "./dto/register.dto";

@Controller("auth")
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post("register")
  register(@Body() dto: RegisterDto) {
    return this.authService.register(dto);
  }

  @Post("login")
  login(@Body() dto: LoginDto) {
    return this.authService.login(dto);
  }

  @Post("refresh")
  refresh(@Body() dto: RefreshTokenDto) {
    return this.authService.refresh(dto.refreshToken);
  }

  @Post("logout")
  logout(@Body() dto: LogoutDto) {
    return this.authService.logout(dto.refreshToken);
  }

  @Post("forgot-password")
  forgotPassword(@Body() dto: ForgotPasswordDto) {
    return this.authService.forgotPassword(dto.email);
  }

  @Get("oauth/providers")
  oauthProviders() {
    return this.authService.listOAuthProviders();
  }

  @Get("oauth/:provider/start")
  oauthStart(@Param("provider") provider: string, @Query("redirectUri") redirectUri: string) {
    return this.authService.buildOAuthAuthorizationUrl(provider, redirectUri);
  }

  @Post("oauth/:provider/exchange")
  oauthExchange(@Param("provider") provider: string, @Body() dto: OAuthExchangeDto) {
    return this.authService.exchangeOAuthCode(provider, dto.code, dto.state, dto.redirectUri);
  }

  @Post("oauth/:provider/complete")
  oauthCompleteProfile(@Param("provider") provider: string, @Body() dto: OAuthCompleteProfileDto) {
    return this.authService.completeOAuthProfile(provider, dto.completionToken, dto.fullName);
  }
}
