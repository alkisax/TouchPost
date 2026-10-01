import type { Response } from 'express';
import type { AuthRequest } from '../login/types/user.types';
export declare const stripeConnectController: {
    createConnectedAccount: (req: AuthRequest, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
    createOnboardingLink: (req: AuthRequest, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
    getConnectedAccountStatus: (req: AuthRequest, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
};
