"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteSelfAdminService = void 0;
const bcrypt_1 = __importDefault(require("bcrypt"));
const users_models_1 = require("../models/users.models");
const errors_types_1 = require("../../utils/error/errors.types");
const organizationLifecycle_service_1 = require("./organizationLifecycle.service");
const organizationUser_models_1 = require("../models/organizationUser.models");
const organizationLifecycle_service_2 = require("./organizationLifecycle.service");
const deleteAdminAccountCascade = async (userId, password) => {
    const user = await users_models_1.UserModel.findById(userId).lean();
    if (!user)
        throw new errors_types_1.NotFoundError('User not found');
    if (password !== undefined) {
        const passwordMatches = await bcrypt_1.default.compare(password, user.hashedPassword);
        if (!passwordMatches) {
            throw new errors_types_1.ValidationError('Current password is incorrect');
        }
    }
    await (0, organizationLifecycle_service_1.deleteAdminTenant)(userId);
};
const deleteSelfAccount = async (userId, password) => {
    const user = await users_models_1.UserModel.findById(userId).lean();
    if (!user)
        throw new errors_types_1.NotFoundError('User not found');
    if (!(await bcrypt_1.default.compare(password, user.hashedPassword))) {
        throw new errors_types_1.ValidationError('Current password is incorrect');
    }
    if (user.globalRoles.includes('SUPERADMIN')) {
        const membership = await organizationUser_models_1.OrganizationUserModel.findOne({ userId });
        if (membership) {
            throw new errors_types_1.ValidationError('Global accounts cannot have organization membership');
        }
        await users_models_1.UserModel.deleteOne({ _id: userId });
        return;
    }
    const membership = await organizationUser_models_1.OrganizationUserModel.findOne({ userId });
    if (!membership) {
        await users_models_1.UserModel.deleteOne({ _id: userId });
        return;
    }
    if (membership.role === 'ADMIN') {
        await (0, organizationLifecycle_service_1.deleteAdminTenant)(userId);
        return;
    }
    if (membership.role === 'STAFF') {
        await (0, organizationLifecycle_service_2.deleteStaff)(membership.organizationId.toString(), userId);
        return;
    }
    throw new errors_types_1.ValidationError('Invalid organization membership');
};
exports.deleteSelfAdminService = { deleteAdminAccountCascade, deleteSelfAccount };
//# sourceMappingURL=deleteSelfAdmin.service.js.map