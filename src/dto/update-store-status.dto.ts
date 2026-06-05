import { IsBoolean } from "class-validator";

export class UpdateStoreStatusDto {
  @IsBoolean()
  closed: boolean;
}
