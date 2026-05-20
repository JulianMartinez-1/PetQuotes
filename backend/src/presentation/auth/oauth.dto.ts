import { IsString, IsEmail, IsOptional } from 'class-validator';

export type OAuthProvider = 'google' | 'facebook' | 'github' | 'microsoft';

export class OAuthStartDto {
  provider: OAuthProvider;
  redirectUri: string;
}

export class OAuthProviderDto {
  id: OAuthProvider;
  name: string;
  enabled: boolean;
  clientId?: string;
}

export class OAuthProvidersResponseDto {
  providers: OAuthProviderDto[];
}

export class OAuthExchangeDto {
  @IsString()
  provider: OAuthProvider;

  @IsString()
  code: string;

  @IsString()
  state: string;

  @IsString()
  redirectUri: string;
}

export class OAuthCompleteDto {
  @IsString()
  provider: OAuthProvider;

  @IsString()
  completionToken: string;

  @IsString()
  fullName: string;

  @IsOptional()
  @IsString()
  phoneNumber?: string;
}

export class OAuthTokenResponseDto {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
  userId: string;
  email: string;
  fullName: string;
  role: string;
}

export class OAuthCallbackResponseDto {
  completionToken: string;
  provider: OAuthProvider;
  email: string;
  name: string;
  profilePicture?: string;
}
