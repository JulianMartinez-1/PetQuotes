import { IsString, MinLength } from "class-validator";

export class OAuthExchangeDto {
  @IsString()
  @MinLength(8)
  code!: string;

  @IsString()
  @MinLength(16)
  state!: string;

  @IsString()
  @MinLength(10)
  redirectUri!: string;
}
