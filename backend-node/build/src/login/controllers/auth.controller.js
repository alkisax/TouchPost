"use strict";
// backend/src/login/controllers/auth.controller.ts
Object.defineProperty(exports, "__esModule", { value: true });
exports.authController = void 0;
const auth_schema_1 = require("../validation/auth.schema");
const user_dao_1 = require("../dao/user.dao");
const organization_dao_1 = require("../dao/organization.dao");
const organizationUser_dao_1 = require("../dao/organizationUser.dao");
const auth_service_1 = require("../services/auth.service");
const organizationLifecycle_service_1 = require("../services/organizationLifecycle.service");
const errorHandler_1 = require("../../utils/error/errorHandler");
// TYPE GUARD JWT PAYLOAD
const hasUserPayload = (payload) => {
    return typeof payload.username === "string";
};
const addOrganizationName = async (membership) => {
    if (!membership)
        return null;
    const organization = await organization_dao_1.organizationDAO.readById(membership.organizationId);
    return {
        id: membership.id,
        userId: membership.userId,
        organizationId: membership.organizationId,
        role: membership.role,
        createdAt: membership.createdAt,
        organizationName: organization.name,
    };
};
const toUserResponse = (user) => ({
    id: user.id ?? user._id?.toString(),
    username: user.username,
    name: user.name,
    email: user.email,
    globalRoles: user.globalRoles,
});
// LOGIN
const login = async (req, res) => {
    try {
        const parsed = auth_schema_1.loginSchema.parse(req.body);
        const user = await user_dao_1.userDAO.readByUsername(parsed.username);
        if (!user) {
            return res.status(401).json({
                status: false,
                message: "Invalid username or password",
            });
        }
        const isMatch = await auth_service_1.authService.verifyPassword(parsed.password, user.hashedPassword);
        if (!isMatch) {
            return res.status(401).json({
                status: false,
                message: "Invalid username or password",
            });
        }
        const membership = await organizationUser_dao_1.organizationUserDAO.readByUserId(user._id.toString());
        const token = auth_service_1.authService.generateAccessToken(user);
        const organization = await addOrganizationName(membership);
        return res.status(200).json({
            status: true,
            data: {
                token,
                user: { ...toUserResponse(user), organization },
            },
        });
    }
    catch (err) {
        return (0, errorHandler_1.handleControllerError)(res, err);
    }
};
// REGISTER (PUBLIC)
// Δημιουργεί νέο ADMIN μαζί με το πρώτο organization του.
const registerAdmin = async (req, res) => {
    try {
        const parsed = auth_schema_1.registerAdminSchema.parse(req.body);
        const existing = await user_dao_1.userDAO.readByUsername(parsed.username);
        if (existing) {
            return res.status(409).json({
                status: false,
                message: "Username already taken",
            });
        }
        const result = await (0, organizationLifecycle_service_1.createAdminWithOrganization)({
            username: parsed.username,
            name: parsed.name,
            email: parsed.email,
            password: parsed.password,
            organizationName: parsed.organizationName,
        });
        return res.status(201).json({
            status: true,
            data: {
                user: toUserResponse(result.user),
                organization: {
                    id: result.organization.id,
                    name: result.organization.name,
                    slug: result.organization.slug,
                    createdAt: result.organization.createdAt,
                    updatedAt: result.organization.updatedAt,
                },
                membership: {
                    id: result.membership.id,
                    userId: result.membership.userId,
                    organizationId: result.membership.organizationId,
                    role: result.membership.role,
                    createdAt: result.membership.createdAt,
                },
            },
        });
    }
    catch (err) {
        return (0, errorHandler_1.handleControllerError)(res, err);
    }
};
const registerUser = async (req, res) => {
    try {
        const parsed = auth_schema_1.registerUserSchema.parse(req.body);
        const existing = await user_dao_1.userDAO.readByUsername(parsed.username);
        if (existing) {
            return res.status(409).json({
                status: false,
                message: 'Username already taken',
            });
        }
        const user = await (0, organizationLifecycle_service_1.createUser)(parsed);
        return res.status(201).json({
            status: true,
            data: {
                user: toUserResponse(user),
                organization: null,
                membership: null,
            },
        });
    }
    catch (err) {
        return (0, errorHandler_1.handleControllerError)(res, err);
    }
};
// REFRESH TOKEN
const refreshToken = async (req, res) => {
    try {
        const token = auth_service_1.authService.getTokenFrom(req);
        if (!token) {
            return res.status(401).json({
                status: false,
                message: "No token provided",
            });
        }
        const verification = auth_service_1.authService.verifyAccessToken(token);
        if (!verification.verified) {
            return res.status(401).json({
                status: false,
                message: "Invalid token",
            });
        }
        if (!hasUserPayload(verification.data)) {
            return res.status(401).json({
                status: false,
                message: "Invalid token payload",
            });
        }
        const dbUser = await user_dao_1.userDAO.readByUsername(verification.data.username);
        if (!dbUser) {
            return res.status(401).json({
                status: false,
                message: "User not found",
            });
        }
        const newToken = auth_service_1.authService.generateAccessToken(dbUser);
        const membership = await organizationUser_dao_1.organizationUserDAO.readByUserId(dbUser._id.toString());
        const organization = await addOrganizationName(membership);
        return res.status(200).json({
            status: true,
            data: {
                token: newToken,
                user: { ...toUserResponse(dbUser), organization },
            },
        });
    }
    catch (err) {
        return (0, errorHandler_1.handleControllerError)(res, err);
    }
};
exports.authController = {
    login,
    registerAdmin,
    registerUser,
    refreshToken,
};
//# sourceMappingURL=auth.controller.js.map