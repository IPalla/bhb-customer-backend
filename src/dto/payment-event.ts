export class PaymentEvent {
  orderId: string;
  status: string;
  message: string;
  followUp: string;
  static PaymentStatus: any;
}

export enum PaymentStatus {
  PENDING = "PENDING",
  SUCCESS = "SUCCESS",
  FAILED = "FAILED",
}
