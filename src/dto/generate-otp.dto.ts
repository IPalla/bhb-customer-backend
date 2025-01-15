import { IsString, IsPhoneNumber } from 'class-validator';

export class GenerateOtpDto {
  @IsPhoneNumber()
  @IsString()
  phoneNumber: string;
} 