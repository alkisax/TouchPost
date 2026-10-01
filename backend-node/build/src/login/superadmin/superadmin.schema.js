"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateUserAdStatusSchema = exports.updateStaffSchema = exports.updateAdminSchema = exports.createStaffSchema = exports.createAdminSchema = void 0;
const zod_1 = require("zod");
const auth_schema_1 = require("../validation/auth.schema");
const identityFields = {
    username: zod_1.z.string().min(1).optional(),
    name: zod_1.z.string().optional(),
    email: zod_1.z.email({ error: 'Invalid email address' }).optional(),
};
exports.createAdminSchema = zod_1.z.object({
    username: zod_1.z.string().min(1),
    password: auth_schema_1.passwordSchema,
    name: zod_1.z.string().optional(),
    email: zod_1.z.email({ error: 'Invalid email address' }).optional(),
    organizationName: zod_1.z.string().min(1),
}).strict();
exports.createStaffSchema = zod_1.z.object({
    username: zod_1.z.string().min(1),
    password: auth_schema_1.passwordSchema,
    name: zod_1.z.string().optional(),
    email: zod_1.z.email({ error: 'Invalid email address' }).optional(),
}).strict();
exports.updateAdminSchema = zod_1.z.object({
    ...identityFields,
    password: auth_schema_1.passwordSchema.optional(),
}).strict();
exports.updateStaffSchema = exports.updateAdminSchema;
exports.updateUserAdStatusSchema = zod_1.z.object({
    hasPaid: zod_1.z.boolean(),
    adFreeUntil: zod_1.z.coerce.date().nullable().optional(),
}).strict();
//# sourceMappingURL=superadmin.schema.js.map