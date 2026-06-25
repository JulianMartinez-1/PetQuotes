import { IsEmail, IsString, MinLength, MaxLength } from 'class-validator';

export class ContactDto {
  @IsString()
  @MinLength(2)
  @MaxLength(100)
  name: string;

  @IsEmail()
  @MaxLength(150)
  email: string;

  @IsString()
  @MinLength(10)
  @MaxLength(1000)
  message: string;
}
