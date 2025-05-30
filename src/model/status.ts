/**
 * API BHB Customer Backend
 * API BHB Customer Backend
 *
 * OpenAPI spec version: 1.0.0
 *
 *
 * NOTE: This class is auto generated by the swagger code generator program.
 * https://github.com/swagger-api/swagger-codegen.git
 * Do not edit the class manually.
 */

/**
 * Order status information
 */
export interface Status {
  /**
   * Status creation date
   */
  createdAt?: string;
  /**
   * Status creation date timestamp in epoch
   */
  createdAtTs?: number;
  /**
   * Status created by
   */
  createdBy?: string;
  /**
   * Status update latitude
   */
  latitude?: string;
  /**
   * Status update longitude
   */
  longitude?: string;
  /**
   * Status enum
   */
  status?: Status.StatusEnum;
}
export namespace Status {
  export type StatusEnum =
    | "PENDING"
    | "IN_PROGRESS"
    | "PREPARED"
    | "READY"
    | "IN_DELIVERY"
    | "DELIVERED";
  export const StatusEnum = {
    PENDING: "PENDING" as StatusEnum,
    INPROGRESS: "IN_PROGRESS" as StatusEnum,
    PREPARED: "PREPARED" as StatusEnum,
    READY: "READY" as StatusEnum,
    INDELIVERY: "IN_DELIVERY" as StatusEnum,
    DELIVERED: "DELIVERED" as StatusEnum,
  };
}
