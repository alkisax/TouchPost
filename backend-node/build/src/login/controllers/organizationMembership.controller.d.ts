import type { Response } from 'express';
import type { AuthRequest } from '../types/user.types';
export declare const organizationMembershipController: {
    getMine: (req: AuthRequest, res: Response) => Promise<Response<any, Record<string, any>>>;
    getByUser: (req: AuthRequest, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
    getByOrganization: (req: AuthRequest, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
    getStaffByOrganization: (req: AuthRequest, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
};
