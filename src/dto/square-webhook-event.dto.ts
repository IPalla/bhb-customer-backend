export interface SquareWebhookEventDto {
  merchant_id?: string;
  type?: string;
  event_id?: string;
  created_at?: string;
  data?: {
    type?: string;
    id?: string;
    object?: {
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
    };
  };
}
