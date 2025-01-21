import { IsString, IsNotEmpty } from "class-validator";

export class ValidateOtpDto {
  @IsString()
  @IsNotEmpty()
  phoneNumber: string;

  @IsString()
  @IsNotEmpty()
  code: string;
}
