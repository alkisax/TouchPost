"use strict";
// backend/src/login/validation/organization.schema.ts
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateOrganizationSchema = exports.createOrganizationSchema = void 0;
const zod_1 = require("zod");
// CREATE ORGANIZATION
exports.createOrganizationSchema = zod_1.z.object({
    name: zod_1.z.string().min(1, 'Organization name is required'),
});
// UPDATE ORGANIZATION
exports.updateOrganizationSchema = zod_1.z.object({
    name: zod_1.z.string().min(1).optional(),
});
//# sourceMappingURL=organization.schema.js.map