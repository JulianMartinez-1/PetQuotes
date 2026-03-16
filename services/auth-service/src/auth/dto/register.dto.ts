import { IsEmail, IsIn, IsString, MinLength } from "class-validator";

export class RegisterDto {
  @IsEmail()
  email!: string;

  @IsString()
  @MinLength(8)
  password!: string;

  @IsString()
  @MinLength(3)
  fullName!: string;

  @IsIn(["CLIENT", "VETERINARY", "ADMIN"])
  role!: "CLIENT" | "VETERINARY" | "ADMIN";
}
