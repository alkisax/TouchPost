"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// backend\src\server.ts
/* eslint-disable no-console */
require("dotenv/config");
const app_1 = require("./app");
const constants_1 = require("./config/constants");
const mongo_1 = require("./config/mongo");
const http_1 = __importDefault(require("http"));
const socket_1 = require("./socket/socket");
const main = async () => {
    if (!constants_1.consts.env.MONGO_URI) {
        throw new Error("MONGO_URI is not defined");
    }
    // socket
    const server = http_1.default.createServer(app_1.app);
    (0, socket_1.initSocket)(server);
    await (0, mongo_1.connectMongo)(constants_1.consts.env.MONGO_URI);
    server.listen(constants_1.consts.env.PORT, () => {
        console.log(`🚀 Server running on http://localhost:${constants_1.consts.env.PORT}`);
        console.log(`📚 Swagger at http://localhost:${constants_1.consts.env.PORT}/api-docs`);
    });
};
main().catch((err) => {
    console.error("❌ Fatal startup error:", err);
    process.exit(1);
});
//# sourceMappingURL=server.js.map