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

import { Address } from "./address";

/**
 * Customer information
 */
export interface Customer {
  /**
   * Customer id
   */
  id?: string;
  /**
   * Customer name
   */
  firstName?: string;
  /**
   * Customer last name
   */
  lastName?: string;
  /**
   * Customer email
   */
  email?: string;
  /**
   * Customer phone
   */
  phoneNumber?: string;
  /**
   * Customer address
   */
  address?: Address;
}
