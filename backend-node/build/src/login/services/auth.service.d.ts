import type { JwtPayload } from "jsonwebtoken";
import type { Request } from "express";
import type { IUser } from "../types/user.types";
type VerifyAccessTokenResult = {
    verified: true;
    data: JwtPayload;
} | {
    verified: false;
    data: string;
};
export declare const authService: {
    generateAccessToken: (user: IUser) => string;
    verifyPassword: (password: string, hashedPassword: string) => Promise<boolean>;
    verifyAccessToken: (token: string) => VerifyAccessTokenResult;
    getTokenFrom: (req: Request) => string | null;
};
export {};
