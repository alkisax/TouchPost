"use strict";
// backend/src/login/validation/user.schema.ts
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateRoleSchema = exports.deleteSelfAdminSchema = exports.updateUserSchema = exports.createUserSchema = void 0;
const zod_1 = require("zod");
const auth_schema_1 = require("./auth.schema");
// CREATE USER
exports.createUserSchema = zod_1.z.object({
    username: zod_1.z.string().min(1, 'Username is required'),
    password: auth_schema_1.passwordSchema,
    name: zod_1.z.string().optional(),
    email: zod_1.z.email({ error: 'Invalid email address' }).optional(),
    globalRoles: zod_1.z.array(zod_1.z.enum(['SUPERADMIN'])).optional(),
});
// REGISTER
// export const registerSchema = z.object({
//   username: z.string().min(1, 'Username is required'),
//   password: passwordSchema,
//   name: z.string().optional(),
//   email: z.email({ error: 'Invalid email address' }).optional(),
//   organizationName: z.string().min(1, 'Organization name is required'),
// });
// UPDATE USER
exports.updateUserSchema = zod_1.z.object({
    username: zod_1.z.string().min(1).optional(),
    password: auth_schema_1.passwordSchema.optional(),
    name: zod_1.z.string().optional(),
    email: zod_1.z.email({ error: 'Invalid email address' }).optional(),
    globalRoles: zod_1.z.array(zod_1.z.enum(['SUPERADMIN'])).optional(),
});
exports.deleteSelfAdminSchema = zod_1.z.object({
    password: auth_schema_1.passwordSchema,
}).strict();
exports.updateRoleSchema = zod_1.z.object({
    role: zod_1.z.enum(['ADMIN', 'STAFF', 'USER']),
}).strict();
//# sourceMappingURL=user.schema.js.map