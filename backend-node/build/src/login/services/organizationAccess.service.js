"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAdminOrganizationId = void 0;
const organizationUser_dao_1 = require("../dao/organizationUser.dao");
const getAdminOrganizationId = async (userId) => {
    const membership = await organizationUser_dao_1.organizationUserDAO.readAdminOrganization(userId);
    return membership?.organizationId ?? null;
};
exports.getAdminOrganizationId = getAdminOrganizationId;
//# sourceMappingURL=organizationAccess.service.js.map