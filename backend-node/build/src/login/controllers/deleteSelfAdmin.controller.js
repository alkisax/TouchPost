"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteSelfAdminController = void 0;
const deleteSelfAdmin_service_1 = require("../services/deleteSelfAdmin.service");
const errorHandler_1 = require("../../utils/error/errorHandler");
const user_schema_1 = require("../validation/user.schema");
const deleteSelfAdmin = async (req, res) => {
    try {
        const requester = req.user;
        if (!requester) {
            return res.status(401).json({
                status: false,
                message: 'Unauthorized',
            });
        }
        const parsed = user_schema_1.deleteSelfAdminSchema.parse(req.body);
        await deleteSelfAdmin_service_1.deleteSelfAdminService.deleteSelfAccount(requester.id, parsed.password);
        return res.status(200).json({
            status: true,
            message: 'Account deleted successfully',
        });
    }
    catch (err) {
        return (0, errorHandler_1.handleControllerError)(res, err);
    }
};
exports.deleteSelfAdminController = {
    deleteSelfAdmin,
};
//# sourceMappingURL=deleteSelfAdmin.controller.js.map