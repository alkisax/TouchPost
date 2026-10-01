import type { Request, Response } from "express";
import type { AuthRequest } from "../types/user.types";
export declare const userController: {
    create: (req: Request, res: Response) => Promise<Response<any, Record<string, any>>>;
    createStaff: (req: AuthRequest, res: Response) => Promise<Response<any, Record<string, any>>>;
    removeStaffByAdmin: (req: AuthRequest, res: Response) => Promise<Response<any, Record<string, any>>>;
    findAll: (_req: Request, res: Response) => Promise<Response<any, Record<string, any>>>;
    findById: (req: Request, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
    seeCompanyUsers: (req: AuthRequest, res: Response) => Promise<Response<any, Record<string, any>>>;
    seeCompanyStaff: (req: AuthRequest, res: Response) => Promise<Response<any, Record<string, any>>>;
    updateById: (req: AuthRequest, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
    updateRole: (req: AuthRequest, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
    makeSuperAdmin: (req: AuthRequest, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
    remove: (req: AuthRequest, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
};
