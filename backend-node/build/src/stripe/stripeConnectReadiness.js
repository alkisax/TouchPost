"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isStripePaymentsReady = void 0;
const isStripePaymentsReady = (account) => {
    // Stripe onboarding is complete only when the merchant configuration has
    // been applied and card payments are active for the connected account.
    const merchant = account.configuration?.merchant;
    const merchantApplied = merchant?.applied === true;
    const cardPaymentsStatus = merchant?.capabilities?.card_payments?.status;
    return merchantApplied && cardPaymentsStatus === 'active';
};
exports.isStripePaymentsReady = isStripePaymentsReady;
//# sourceMappingURL=stripeConnectReadiness.js.map