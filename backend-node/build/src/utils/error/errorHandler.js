"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.handleControllerError = handleControllerError;
const zod_1 = require("zod");
const errors_types_1 = require("./errors.types");
function handleControllerError(res, error) {
    if (error instanceof zod_1.ZodError) {
        return res.status(400).json({
            status: false,
            message: 'Validation failed',
            details: error.issues,
        });
    }
    if (error instanceof errors_types_1.NotFoundError) {
        return res.status(404).json({
            status: false,
            message: error.message,
        });
    }
    if (error instanceof errors_types_1.ValidationError) {
        return res.status(400).json({
            status: false,
            message: error.message,
        });
    }
    if (error instanceof errors_types_1.DatabaseError) {
        return res.status(500).json({
            status: false,
            message: error.message || 'Database error',
        });
    }
    if (error instanceof Error) {
        console.error(error);
        const httpError = error;
        const statusCode = httpError.status ?? 500;
        return res
            .status(statusCode)
            .json({ status: false, message: error.message });
    }
    if (error instanceof errors_types_1.BadRequestError) {
        return res.status(error.statusCode).json({
            status: false,
            message: error.message,
        });
    }
    return res.status(500).json({ status: false, message: 'Unknown error' });
}
//# sourceMappingURL=errorHandler.js.map