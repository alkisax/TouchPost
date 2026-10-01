import type { Response } from 'express';
import type { AuthRequest } from '../types/user.types';
export declare const organizationMonetizationController: {
    recordAdWatched: (req: AuthRequest, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
    readOrganizationMonetization: (req: AuthRequest, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
};
