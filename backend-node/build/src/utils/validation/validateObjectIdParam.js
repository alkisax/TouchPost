"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateIdParam = void 0;
const validateIdParam = (id, res, entityName = "ID") => {
    if (typeof id !== "string" || !id) {
        res.status(400).json({
            status: false,
            message: `${entityName} is invalid`,
        });
        return false;
    }
    return true;
};
exports.validateIdParam = validateIdParam;
//# sourceMappingURL=validateObjectIdParam.js.map