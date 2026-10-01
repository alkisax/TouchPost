"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.app = void 0;
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const path_1 = __importDefault(require("path"));
const auth_routes_1 = __importDefault(require("./login/routes/auth.routes"));
const user_routes_1 = __importDefault(require("./login/routes/user.routes"));
const stripe_payment_controller_1 = require("./stripe/stripe.payment.controller");
const stripe_payment_routes_1 = __importDefault(require("./stripe/stripe.payment.routes"));
const stripeConnect_routes_1 = __importDefault(require("./stripe/stripeConnect.routes"));
const superadmin_routes_1 = __importDefault(require("./login/superadmin/superadmin.routes"));
const organizationMonetization_routes_1 = __importDefault(require("./login/routes/organizationMonetization.routes"));
const organization_routes_1 = __importDefault(require("./login/routes/organization.routes"));
const organizationMembership_routes_1 = __importDefault(require("./login/routes/organizationMembership.routes"));
const staff_routes_1 = __importDefault(require("./login/routes/staff.routes"));
const verification_middleware_1 = require("./login/middleware/verification.middleware");
const deleteSelfAdmin_controller_1 = require("./login/controllers/deleteSelfAdmin.controller");
const frontLog_controller_1 = require("./utils/frontLog.controller");
exports.app = (0, express_1.default)();
exports.app.get('/', (_req, res) => {
    res.send('Hello World!');
});
exports.app.get('/ping', (_req, res) => {
    console.log('someone pinged here');
    res.send('Pong');
});
exports.app.post('/front-logs/', express_1.default.json({ limit: '100kb' }), frontLog_controller_1.forwardFrontLog);
// stripe checkout web hook is implemented here and not in usual routes/controller type because it has to be raw and not json so its declared before app.use(express.json())
exports.app.post("/api/stripe/payment/webhook", express_1.default.raw({ type: "application/json" }), stripe_payment_controller_1.stripePaymentController.handleWebhook);
console.log("=== APP START ===");
exports.app.use(express_1.default.json({ limit: "100kb" }));
exports.app.use((0, cors_1.default)({
    origin: "*",
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
}));
exports.app.get("/api/ping", (_req, res) => {
    console.log("someone pinged here");
    res.send("pong");
});
exports.app.get("/health", (_req, res) => {
    res.send("ok");
});
exports.app.use("/superadmin", superadmin_routes_1.default);
exports.app.use("/auth", auth_routes_1.default);
exports.app.delete("/users/self", verification_middleware_1.middleware.verifyToken, deleteSelfAdmin_controller_1.deleteSelfAdminController.deleteSelfAdmin);
exports.app.use("/users", staff_routes_1.default);
exports.app.use("/api/users", user_routes_1.default);
exports.app.use("/organizations", organizationMonetization_routes_1.default);
exports.app.use("/organizations", organization_routes_1.default);
exports.app.use("/company-users", organizationMembership_routes_1.default);
exports.app.use("/api/stripe/payment", stripe_payment_routes_1.default);
exports.app.use("/api/stripe/connect", stripeConnect_routes_1.default);
const publicPath = path_1.default.join(__dirname, "../dist");
exports.app.use(express_1.default.static(publicPath));
const backendRoot = process.cwd();
exports.app.get("/privacy", (_req, res) => {
    res.sendFile(path_1.default.join(backendRoot, "public/privacy.html"));
});
exports.app.get("/delete-account", (_req, res) => {
    res.sendFile(path_1.default.join(backendRoot, "public/delete-account.html"));
});
exports.app.get("/app-ads.txt", (_req, res) => {
    res.sendFile(path_1.default.join(backendRoot, "public/app-ads.txt"));
});
//αυτο είναι για να σερβίρει το index.html του front όταν ο χρήστης επισκέπτεται το root path ή οποιοδήποτε άλλο path που δεν είναι api ή api-docs
exports.app.get(/^\/(?!api|api-docs).*/, (_req, res) => {
    res.sendFile(path_1.default.join(publicPath, "index.html"));
});
exports.default = exports.app;
//# sourceMappingURL=app.js.map