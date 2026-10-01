import { z } from 'zod';
export declare const paymentCheckoutSchema: z.ZodObject<{
    amountCents: z.ZodNumber;
}, z.core.$strip>;
export type PaymentCheckoutInput = z.infer<typeof paymentCheckoutSchema>;
