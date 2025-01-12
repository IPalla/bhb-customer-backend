export interface DeliverectNewOrder {
    _created: string;
    _updated: string;
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
    rating: any[];
    pickupTime: string;
    deliveryTime: string;
    deliveryIsAsap: boolean;
    courier: Courier;
    courierUpdateHistory: OrderCourierUpdateEntry[];
    customer: Customer;
    deliveryAddress: DeliveryAddress;
    orderIsAlreadyPaid: boolean;
    taxes: any[];
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
    discounts: any[];
    capacitiesUsages: any[];
    recent: boolean;
    resolvedBy: string;
    brandId: string;
    timezone: string;
    date: number;
}
interface OrderStatusHistoryEntry {
    timeStamp: string;
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
    received: string;
    courier: Courier;
    arrivalTime: string;
    deliveryTime: string;
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
export {};
