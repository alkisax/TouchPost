import Stripe from 'stripe';

export const isStripePaymentsReady = (account: Stripe.V2.Core.Account) => {
  // Stripe onboarding is complete only when the merchant configuration has
  // been applied and card payments are active for the connected account.
  const merchant = account.configuration?.merchant;
  const merchantApplied = merchant?.applied === true;
  const cardPaymentsStatus = merchant?.capabilities?.card_payments?.status;

  return merchantApplied && cardPaymentsStatus === 'active';
};
