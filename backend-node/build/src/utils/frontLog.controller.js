"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.forwardFrontLog = void 0;
const forwardFrontLog = (req, res) => {
    const { frontLog } = req.body ?? {};
    if (typeof frontLog !== 'string') {
        return res.status(400).json({
            status: false,
            message: 'frontLog must be a string',
        });
    }
    console.log(`FRONT LOG: ${frontLog}`);
    return res.sendStatus(200);
};
exports.forwardFrontLog = forwardFrontLog;
//# sourceMappingURL=frontLog.controller.js.map