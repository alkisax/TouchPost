"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.limiter = void 0;
const express_rate_limit_1 = __importDefault(require("express-rate-limit"));
// Strict limiter: max 5 per 15 min per IP
// η βιβλιοθήκη Ratelimit λειτουργεί σαν Middleware, με προστατεύει απο DDOS και brute force σπασιμο των κωδικών
const limiter = (minutes, maxTries, message = 'Too many requests, please try again later.') => {
    // console.log('limiter loaded with NODE_ENV:', process.env.NODE_ENV);
    if (process.env.NODE_ENV?.toLowerCase() === 'test') {
        // no limiting in tests
        return (_req, _res, next) => next();
    }
    const limit = (0, express_rate_limit_1.default)({
        windowMs: minutes * 60 * 1000, // how long the time window is
        max: maxTries, // how many requests allowed
        handler: (_req, res) => {
            res.status(429).json({
                status: false,
                message,
            });
        },
        standardHeaders: true, // add `RateLimit-*` headers
        legacyHeaders: false, // disable `X-RateLimit-*` headers
    });
    return limit;
};
exports.limiter = limiter;
/* now used in
Auth (auth.routes.ts)

POST /api/auth/ → login (15 min / 5 tries)
POST /api/auth/refresh → refresh token (15 min / 5 tries)
GET /api/auth/google/url/signup → get Google signup URL (15 min / 5 tries)

Transactions (transaction.routes.ts)
POST /api/transaction/ → create a new transaction (15 min / 5 tries)
*/
//# sourceMappingURL=limiter.js.map