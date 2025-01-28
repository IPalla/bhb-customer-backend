import { IsNotEmpty, IsString } from "class-validator";

export class CreatePaymentDto {
  @IsNotEmpty()
  @IsString()
  sourceId: string;
}
