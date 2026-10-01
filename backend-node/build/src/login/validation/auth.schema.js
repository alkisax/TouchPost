"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.registerUserSchema = exports.registerAdminSchema = exports.registerSchema = exports.passwordSchema = exports.loginSchema = void 0;
// backend/src/login/validation/auth.schema.ts
const zod_1 = require("zod");
// LOGIN
exports.loginSchema = zod_1.z.object({
    username: zod_1.z.string().min(3).max(50),
    password: zod_1.z.string().min(6).max(128),
});
// PASSWORD BASE RULE
exports.passwordSchema = zod_1.z
    .string()
    .min(6, 'Password must be at least 6 characters')
    .regex(/[A-Z]/, {
    message: 'Password must contain at least one uppercase letter',
})
    .regex(/[!@#$%^&*(),.?":{}|<>]/, {
    message: 'Password must contain at least one special character',
});
// SELF REGISTER (PUBLIC)
exports.registerSchema = zod_1.z.object({
    username: zod_1.z.string().min(1, 'Username is required'),
    password: exports.passwordSchema,
    name: zod_1.z.string().optional(),
    email: zod_1.z.email({ error: 'Invalid email address' }).optional(),
    organizationName: zod_1.z.string().min(1, 'Organization name is required'),
});
exports.registerAdminSchema = zod_1.z.object({
    username: zod_1.z.string().min(1, 'Username is required'),
    password: zod_1.z.string().min(6, 'Password must be at least 6 characters'),
    name: zod_1.z.string().optional(),
    email: zod_1.z.email({ error: 'Invalid email address' }).optional(),
    organizationName: zod_1.z
        .string()
        .min(1, 'Organization name is required')
        .max(100),
});
exports.registerUserSchema = zod_1.z.object({
    username: zod_1.z.string().min(1, 'Username is required'),
    password: zod_1.z.string().min(6, 'Password must be at least 6 characters'),
    name: zod_1.z.string().optional(),
    email: zod_1.z.email({ error: 'Invalid email address' }).optional(),
});
//# sourceMappingURL=auth.schema.js.map