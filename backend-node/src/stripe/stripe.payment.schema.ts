import { z } from 'zod';

export const paymentCheckoutSchema = z.object({
  amountCents: z.number().int().positive(),
});

export type PaymentCheckoutInput = z.infer<typeof paymentCheckoutSchema>;
