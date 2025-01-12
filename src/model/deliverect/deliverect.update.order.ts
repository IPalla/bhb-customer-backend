export interface DeliverectUpdateOrder {
  orderId?: string;
  status?: number;
  timeStamp?: string;
  reason?: string;
  channelOrderId?: string;
  location?: string;
  isIgnoredPOSStatus?: boolean;
}
