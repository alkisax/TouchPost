import type { Request, Response } from 'express';
import type { AuthRequest } from '../login/types/user.types';
export declare const stripePaymentController: {
    createCheckoutSession: (req: AuthRequest, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
    handleWebhook: (req: Request, res: Response) => Promise<Response<any, Record<string, any>>>;
};
