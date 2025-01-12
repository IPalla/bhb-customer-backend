export interface DeliverectNewOrder {
  _created: string; // ISO 8601 date-time string with timezone (YYYY-MM-DDTHH:mm:ss.SSSZ)
  _updated: string; // ISO 8601 date-time string with timezone (YYYY-MM-DDTHH:mm:ss.SSSZ)
  _id: string;
  account: string;
  channelOrderId: string;
  channelOrderDisplayId: string;
  posId: string;
  posReceiptId: string;
  posLocationId: string;
  location: string;
  channelLink: string;
  status: number;
  statusHistory: OrderStatusHistoryEntry[];
  packaging: Packaging;
  by: string;
  orderType: number;
  channel: number;
  pos: number;
  rating: any[]; // Array of unknown type (modify if rating structure is known)
  pickupTime: string; // ISO 8601 date-time string with timezone (YYYY-MM-DDTHH:mm:ss.SSSZ)
  deliveryTime: string; // ISO 8601 date-time string with timezone (YYYY-MM-DDTHH:mm:ss.SSSZ)
  deliveryIsAsap: boolean;
  courier: Courier;
  courierUpdateHistory: OrderCourierUpdateEntry[];
  customer: Customer;
  deliveryAddress: DeliveryAddress;
  orderIsAlreadyPaid: boolean;
  taxes: any[]; // Array of unknown type (modify if tax structure is known)
  taxTotal: number;
  payment: Payment;
  note: string;
  items: OrderItem[];
  decimalDigits: number;
  numberOfCustomers: number;
  channelOrderRawId: string;
  channelOrderHistoryRawIds: string[];
  serviceCharge: number;
  deliveryCost: number;
  bagFee: number;
  tip: number;
  driverTip: number;
  discountTotal: number;
  discounts: any[]; // Array of unknown type (modify if discount structure is known)
  capacitiesUsages: any[]; // Array of unknown type (modify if known)
  recent: boolean;
  resolvedBy: string;
  brandId: string;
  timezone: string;
  date: number; // Year-month-day format (YYYYMMDD)
}

interface OrderStatusHistoryEntry {
  timeStamp: string; // ISO 8601 date-time string with timezone (YYYY-MM-DDTHH:mm:ss.SSSZ)
  status: number;
  response: string;
  source: number;
}

interface Packaging {
  includeCutlery: boolean;
}

interface Courier {
  firstName: string;
  lastName: string;
  phoneNumber: string;
  deliveryBy: string;
}

interface OrderCourierUpdateEntry {
  status: number;
  received: string; // ISO 8601 date-time string with timezone (YYYY-MM-DDTHH:mm:ss.SSSZ)
  courier: Courier;
  arrivalTime: string; // ISO 8601 date-time string with timezone (YYYY-MM-DDTHH:mm:ss.SSSZ)
  deliveryTime: string; // ISO 8601 date-time string with timezone (YYYY-MM-DDTHH:mm:ss.SSSZ)
  source: number;
}

interface Customer {
  name: string;
  phoneNumber: string;
  phoneAccessCode: string;
  email: string;
}

interface DeliveryAddress {
  street: string;
  postalCode: string;
  city: string;
  source: string;
  coordinates: {
    coordinates: number[];
  };
}

interface Payment {
  amount: number;
  type: number;
  due: number;
  rebate: number;
}

interface OrderItem {
  plu: string;
  name: string;
  sortOrder: number;
  price: number;
  quantity: number;
  productType: number;
  remark: string;
  subItems: OrderItem[];
}
