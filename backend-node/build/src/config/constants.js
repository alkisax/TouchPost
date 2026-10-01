"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.consts = void 0;
// backend\src\config\constants.ts
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
// if (!process.env.OPENAI_API_KEY) {
//   throw new Error("OPENAI_API_KEY missing");
// }
if (!process.env.MONGO_URI) {
    throw new Error("MONGO_URI missing");
}
exports.consts = {
    env: {
        PORT: Number(process.env.PORT || 3010),
        MONGO_URI: process.env.MONGO_URI,
        // OPENAI_API_KEY: process.env.OPENAI_API_KEY,
    },
};
//# sourceMappingURL=constants.js.map