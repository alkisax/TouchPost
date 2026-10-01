"use strict";
// backend/src/login/middleware/verification.middleware.ts
Object.defineProperty(exports, "__esModule", { value: true });
exports.middleware = void 0;
const auth_service_1 = require("../services/auth.service");
const organizationUser_dao_1 = require("../dao/organizationUser.dao");
// TYPE GUARD JWT PAYLOAD
const isAuthPayload = (payload) => {
    return (typeof payload.id === 'string' &&
        typeof payload.username === 'string' &&
        Array.isArray(payload.globalRoles) &&
        payload.globalRoles.every((role) => role === 'SUPERADMIN'));
};
// VERIFY TOKEN
const verifyToken = (req, res, next) => {
    const token = auth_service_1.authService.getTokenFrom(req);
    if (!token) {
        return res.status(401).json({
            status: false,
            message: 'No token provided',
        });
    }
    const verification = auth_service_1.authService.verifyAccessToken(token);
    if (!verification.verified) {
        return res.status(401).json({
            status: false,
            message: 'Invalid token',
        });
    }
    if (!isAuthPayload(verification.data)) {
        return res.status(401).json({
            status: false,
            message: 'Invalid token payload',
        });
    }
    req.user = {
        id: verification.data.id,
        username: verification.data.username,
        globalRoles: verification.data.globalRoles,
    };
    return next();
};
// GLOBAL ROLE CHECK
// Προς το παρόν ο μόνος global role είναι ο SUPERADMIN.
const checkGlobalRole = (requiredRole) => {
    return (req, res, next) => {
        const user = req.user;
        if (!user ||
            !user.globalRoles.includes(requiredRole)) {
            return res.status(403).json({
                status: false,
                message: 'Forbidden',
            });
        }
        return next();
    };
};
// ORGANIZATION ROLE CHECK
// Οι ADMIN, STAFF και USER roles ανήκουν στη σχέση OrganizationUser
// και όχι στον γενικό User.
const checkOrganizationRole = (requiredRole) => {
    return async (req, res, next) => {
        const user = req.user;
        if (!user) {
            return res.status(401).json({
                status: false,
                message: 'Unauthorized',
            });
        }
        try {
            const membership = await organizationUser_dao_1.organizationUserDAO.readByUserId(user.id);
            const hasRole = membership?.role === requiredRole;
            if (!hasRole) {
                return res.status(403).json({
                    status: false,
                    message: 'Forbidden',
                });
            }
            return next();
        }
        catch (err) {
            return next(err);
        }
    };
};
const checkOrganizationRoles = (requiredRoles) => {
    return async (req, res, next) => {
        const user = req.user;
        if (!user) {
            return res.status(401).json({ status: false, message: 'Unauthorized' });
        }
        try {
            const membership = await organizationUser_dao_1.organizationUserDAO.readByUserId(user.id);
            const hasRole = membership !== null && requiredRoles.includes(membership.role);
            if (!hasRole) {
                return res.status(403).json({ status: false, message: 'Forbidden' });
            }
            return next();
        }
        catch (err) {
            return next(err);
        }
    };
};
const checkAdminOrSuperAdmin = async (req, res, next) => {
    if (!req.user) {
        return res.status(401).json({ status: false, message: 'Unauthorized' });
    }
    if (req.user.globalRoles.includes('SUPERADMIN')) {
        return next();
    }
    const membership = await organizationUser_dao_1.organizationUserDAO.readByUserId(req.user.id);
    if (membership?.role !== 'ADMIN') {
        return res.status(403).json({ status: false, message: 'Forbidden' });
    }
    return next();
};
// Προσωρινή συμβατότητα για παλιές διαδρομές: οι έλεγχοι checkRole δεν έχουν ακόμη μεταφερθεί με ασφάλεια και απορρίπτονται.
const checkRole = (_requiredRole) => {
    return (_req, res, _next) => {
        return res.status(403).json({
            status: false,
            message: 'Forbidden',
        });
    };
};
exports.middleware = {
    verifyToken,
    checkGlobalRole,
    checkOrganizationRole,
    checkOrganizationRoles,
    checkAdminOrSuperAdmin,
    checkRole,
};
//# sourceMappingURL=verification.middleware.js.map