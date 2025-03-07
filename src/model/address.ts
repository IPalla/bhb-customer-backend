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
 * Address information
 */
export interface Address {
  /**
   * City
   */
  locality?: string;
  /**
   * Postal code
   */
  postalCode?: string;
  /**
   * Country
   */
  country?: string;

  /**
   * First line of street address
   */
  address_line_1?: string;
  /**
   * Second line of street address
   */
  address_line_2?: string;
}
