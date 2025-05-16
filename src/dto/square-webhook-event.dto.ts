export interface SquareWebhookEventDto {
  merchant_id?: string;
  type?: string;
  event_id?: string;
  created_at?: string;
  data?: {
    type?: string;
    id?: string;
    object?: {
      order_updated?: {
        state?: string;
      };
      checkout?: {
        status?: string;
        payment_ids?: string[];
        payment?: {
          id?: string;
          totalMoney?: {
            amount?: number;
            currency?: string;
          };
        };
      };
      order?: {
        id?: string;
        location_id?: string;
        customer_id?: string;
        created_at?: string;
        state?: string;
      };
      order_fulfillment_updated?: {
        created_at?: string;
        fulfillment_update?: Array<{
          fulfillment_uid?: string;
          new_state?: string;
          old_state?: string;
        }>;
        location_id?: string;
        order_id?: string;
        state?: string;
        updated_at?: string;
        version?: number;
      };
      payment?: {
        id?: string;
        order_id?: string;
        status?: string;
        amount_money?: {
          amount?: number;
          currency?: string;
        };
        total_money?: {
          amount?: number;
          currency?: string;
        };
        created_at?: string;
        updated_at?: string;
        location_id?: string;
        receipt_number?: string;
        source_type?: string;
        version?: number;
        application_details?: {
          square_product?: string;
          application_id?: string;
        };
      };
    };
  };
}
