import type { Request, Response } from 'express';
export declare const limiter: (minutes: number, maxTries: number, message?: string) => (_req: Request, _res: Response, next: () => void) => void;
