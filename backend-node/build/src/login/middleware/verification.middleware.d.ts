import type { Response, NextFunction } from 'express';
import type { AuthRequest, GlobalRole, OrganizationRole } from '../types/user.types';
export declare const middleware: {
    verifyToken: (req: AuthRequest, res: Response, next: NextFunction) => void | Response<any, Record<string, any>>;
    checkGlobalRole: (requiredRole: GlobalRole) => (req: AuthRequest, res: Response, next: NextFunction) => void | Response<any, Record<string, any>>;
    checkOrganizationRole: (requiredRole: OrganizationRole) => (req: AuthRequest, res: Response, next: NextFunction) => Promise<void | Response<any, Record<string, any>>>;
    checkOrganizationRoles: (requiredRoles: OrganizationRole[]) => (req: AuthRequest, res: Response, next: NextFunction) => Promise<void | Response<any, Record<string, any>>>;
    checkAdminOrSuperAdmin: (req: AuthRequest, res: Response, next: NextFunction) => Promise<void | Response<any, Record<string, any>>>;
    checkRole: (_requiredRole: string) => (_req: AuthRequest, res: Response, _next: NextFunction) => Response<any, Record<string, any>>;
};
