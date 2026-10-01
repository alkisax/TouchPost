"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.paymentCheckoutSchema = void 0;
const zod_1 = require("zod");
exports.paymentCheckoutSchema = zod_1.z.object({
    amountCents: zod_1.z.number().int().positive(),
});
//# sourceMappingURL=stripe.payment.schema.js.map