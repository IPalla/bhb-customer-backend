import { SetMetadata } from "@nestjs/common";

export const IS_ADMIN_OR_JWT_KEY = "isAdminOrJwt";
/** Allows `x-api-key` (admin) or Bearer JWT (customer app). */
export const AdminOrJwt = () => SetMetadata(IS_ADMIN_OR_JWT_KEY, true);
