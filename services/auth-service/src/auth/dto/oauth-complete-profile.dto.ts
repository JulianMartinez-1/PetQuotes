import { IsString, MinLength } from "class-validator";

export class OAuthCompleteProfileDto {
  @IsString()
  @MinLength(16)
  completionToken!: string;

  @IsString()
  @MinLength(3)
  fullName!: string;
}
