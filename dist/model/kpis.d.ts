export interface Kpis {
    totalOrders: number;
    finishedOrders: number;
    inPreparationOrders: number;
    averagePreparationTime: number;
    minPreparationTime: number;
    maxPreparationTime: number;
    awaitingOrders: number;
    averageAwaitingTime: number;
    minAwaitingTime: number;
    maxAwaitingTime: number;
    inDeliveryOrders: number;
    averageDeliveryTime: number;
    minDeliveryTime: number;
    maxDeliveryTime: number;
    averageEndToEndTime: number;
    minEndToEndTime: number;
    maxEndToEndTime: number;
    pickupOrders: number;
    deliveredOrders: number;
    selledProducts: Array<[string, number]>;
    mostSelledProduct: string;
}
