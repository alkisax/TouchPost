import type { Request, Response } from "express";
export declare const authController: {
    login: (req: Request, res: Response) => Promise<Response<any, Record<string, any>>>;
    registerAdmin: (req: Request, res: Response) => Promise<Response<any, Record<string, any>>>;
    registerUser: (req: Request, res: Response) => Promise<Response<any, Record<string, any>>>;
    refreshToken: (req: Request, res: Response) => Promise<Response<any, Record<string, any>>>;
};
