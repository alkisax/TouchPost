import type { Response } from 'express';
import type { AuthRequest } from '../types/user.types';
export declare const deleteSelfAdminController: {
    deleteSelfAdmin: (req: AuthRequest, res: Response) => Promise<Response<any, Record<string, any>>>;
};
