"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Order = void 0;
var Order;
(function (Order) {
    Order.TypeEnum = {
        Delivery: 'Delivery',
        Pickup: 'Pickup',
        Dinein: 'Dinein',
        Unknown: 'Unknown',
    };
    Order.ChannelEnum = {
        Web: 'Web',
        Glovo: 'Glovo',
        JustEat: 'JustEat',
        Uber: 'Uber',
        Waitry: 'Waitry',
        Deliverect: 'Deliverect',
        Unknown: 'Unknown',
    };
})(Order || (exports.Order = Order = {}));
//# sourceMappingURL=order.js.map