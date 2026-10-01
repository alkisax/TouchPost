import type { Response } from "express";
export declare const validateIdParam: (id: unknown, res: Response, entityName?: string) => id is string;
