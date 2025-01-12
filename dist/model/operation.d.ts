export interface Operation {
    id?: string;
    createdTs?: number;
    expectedReadyTs?: number;
    expectedDeliveredTs?: number;
    expectedTotalOrderTs?: number;
    kitchenTime?: number;
    inDeliveryTime?: number;
    totalOrderTime?: number;
}
