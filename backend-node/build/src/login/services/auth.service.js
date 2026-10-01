"use strict";
// backend/src/login/services/auth.service.ts
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.authService = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const bcrypt_1 = __importDefault(require("bcrypt"));
// ΔΗΜΙΟΥΡΓΙΑ ACCESS TOKEN
const generateAccessToken = (user) => {
    const payload = {
        id: user._id.toString(),
        username: user.username,
        name: user.name,
        email: user.email,
        globalRoles: user.globalRoles,
    };
    const secret = process.env.JWT_SECRET;
    if (!secret) {
        throw new Error("JWT_SECRET not defined");
    }
    const options = {
        expiresIn: '23h',
    };
    return jsonwebtoken_1.default.sign(payload, secret, options);
};
// ΕΛΕΓΧΟΣ PASSWORD
const verifyPassword = async (password, hashedPassword) => {
    return bcrypt_1.default.compare(password, hashedPassword);
};
const verifyAccessToken = (token) => {
    const secret = process.env.JWT_SECRET;
    if (!secret) {
        throw new Error("JWT_SECRET not defined");
    }
    try {
        const payload = jsonwebtoken_1.default.verify(token, secret);
        if (typeof payload === "string") {
            return {
                verified: false,
                data: "Invalid token payload",
            };
        }
        return {
            verified: true,
            data: payload,
        };
    }
    catch (err) {
        if (err instanceof Error) {
            return {
                verified: false,
                data: err.message,
            };
        }
        return {
            verified: false,
            data: "Invalid token",
        };
    }
};
// ΕΞΑΓΩΓΗ TOKEN ΑΠΟ REQUEST
const getTokenFrom = (req) => {
    const authorization = req.get("authorization");
    if (authorization && authorization.toLowerCase().startsWith("bearer ")) {
        return authorization.slice(7);
    }
    return null;
};
exports.authService = {
    generateAccessToken,
    verifyPassword,
    verifyAccessToken,
    getTokenFrom,
};
//# sourceMappingURL=auth.service.js.map