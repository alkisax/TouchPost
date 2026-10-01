import type { Response } from "express";
import type { AuthRequest } from '../types/user.types';
export declare const organizationController: {
    create: (req: AuthRequest, res: Response) => Promise<Response<any, Record<string, any>>>;
    findAll: (_req: AuthRequest, res: Response) => Promise<Response<any, Record<string, any>>>;
    findMine: (req: AuthRequest, res: Response) => Promise<Response<any, Record<string, any>>>;
    findById: (req: AuthRequest, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
    updateById: (req: AuthRequest, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
    remove: (req: AuthRequest, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
};
