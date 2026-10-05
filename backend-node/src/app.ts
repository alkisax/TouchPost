import express from "express";
import cors from "cors";
import type { Request, Response } from "express";
import path from "path";
import authRoutes from "./login/routes/auth.routes";
import userRoutes from "./login/routes/user.routes";
import { stripePaymentController } from "./stripe/stripe.payment.controller";
import stripePaymentRoutes from "./stripe/stripe.payment.routes";
import stripeConnectRoutes from "./stripe/stripeConnect.routes";
import superadminRoutes from "./login/superadmin/superadmin.routes";
import organizationMonetizationRoutes from "./login/routes/organizationMonetization.routes";
import organizationRoutes from "./login/routes/organization.routes";
import organizationMembershipRoutes from "./login/routes/organizationMembership.routes";
import staffRoutes from "./login/routes/staff.routes";
import { middleware } from "./login/middleware/verification.middleware";
import { deleteSelfAdminController } from "./login/controllers/deleteSelfAdmin.controller";
import { forwardFrontLog } from "./utils/frontLog.controller";
import photoRoutes from "./cloudinary/photo.routes";

export const app = express();

app.get("/", (_req: Request, res: Response) => {
  res.send("Hello World!");
});

app.get("/ping", (_req: Request, res: Response) => {
  console.log("someone pinged here");
  res.send("Pong");
});

app.post("/front-logs/", express.json({ limit: "100kb" }), forwardFrontLog);

// stripe checkout web hook is implemented here and not in usual routes/controller type because it has to be raw and not json so its declared before app.use(express.json())
app.post(
  "/api/stripe/payment/webhook",
  express.raw({ type: "application/json" }),
  stripePaymentController.handleWebhook,
);

console.log("=== APP START ===");

app.use(express.json({ limit: "100kb" }));

app.use(
  cors({
    origin: "*",
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
  }),
);

app.get("/api/ping", (_req: Request, res: Response) => {
  console.log("someone pinged here");
  res.send("pong");
});

app.get("/health", (_req, res) => {
  res.send("ok");
});

app.use("/superadmin", superadminRoutes);
app.use("/auth", authRoutes);
app.delete(
  "/users/self",
  middleware.verifyToken,
  deleteSelfAdminController.deleteSelfAdmin,
);
app.use("/users", staffRoutes);
app.use("/api/users", userRoutes);
app.use("/organizations", organizationMonetizationRoutes);
app.use("/organizations", organizationRoutes);
app.use("/company-users", organizationMembershipRoutes);

app.use("/photos", photoRoutes);
app.use("/api/stripe/payment", stripePaymentRoutes);
app.use("/api/stripe/connect", stripeConnectRoutes);

const publicPath = path.join(__dirname, "../dist");
app.use(express.static(publicPath));

const backendRoot = process.cwd();

app.get("/privacy", (_req: Request, res: Response) => {
  res.sendFile(path.join(backendRoot, "public/privacy.html"));
});

app.get("/delete-account", (_req: Request, res: Response) => {
  res.sendFile(path.join(backendRoot, "public/delete-account.html"));
});

app.get("/app-ads.txt", (_req: Request, res: Response) => {
  res.sendFile(path.join(backendRoot, "public/app-ads.txt"));
});

//αυτο είναι για να σερβίρει το index.html του front όταν ο χρήστης επισκέπτεται το root path ή οποιοδήποτε άλλο path που δεν είναι api ή api-docs
app.get(/^\/(?!api|api-docs).*/, (_req, res) => {
  res.sendFile(path.join(publicPath, "index.html"));
});

export default app;
