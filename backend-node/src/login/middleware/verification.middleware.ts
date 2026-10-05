// backend/src/login/middleware/verification.middleware.ts

import type { Response, NextFunction } from 'express';
import type { JwtPayload } from 'jsonwebtoken';

import { authService } from '../services/auth.service';
import { organizationUserDAO } from '../dao/organizationUser.dao';

import type {
  AuthRequest,
  GlobalRole,
  OrganizationRole,
} from '../types/user.types';

// TYPE GUARD JWT PAYLOAD
const isAuthPayload = (
  payload: JwtPayload,
): payload is JwtPayload & {
  id: string;
  username: string;
  globalRoles: GlobalRole[];
} => {
  return (
    typeof payload.id === 'string' &&
    typeof payload.username === 'string' &&
    Array.isArray(payload.globalRoles) &&
    payload.globalRoles.every(
      (role) => role === 'SUPERADMIN',
    )
  );
};

// VERIFY TOKEN
const verifyToken = (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) => {
  const token = authService.getTokenFrom(req);

  if (!token) {
    return res.status(401).json({
      status: false,
      message: 'No token provided',
    });
  }

  const verification = authService.verifyAccessToken(token);

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
const checkGlobalRole = (requiredRole: GlobalRole) => {
  return (
    req: AuthRequest,
    res: Response,
    next: NextFunction,
  ) => {
    const user = req.user;

    if (
      !user ||
      !user.globalRoles.includes(requiredRole)
    ) {
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
const checkOrganizationRole = (
  requiredRole: OrganizationRole,
) => {
  return async (
    req: AuthRequest,
    res: Response,
    next: NextFunction,
  ) => {
    const user = req.user;

    if (!user) {
      return res.status(401).json({
        status: false,
        message: 'Unauthorized',
      });
    }

    try {
      const membership = await organizationUserDAO.readByUserId(user.id);
      const hasRole = membership?.role === requiredRole;

      if (!hasRole) {
        return res.status(403).json({
          status: false,
          message: 'Forbidden',
        });
      }

      return next();
    } catch (err) {
      return next(err);
    }
  };
};

const checkOrganizationRoles = (requiredRoles: OrganizationRole[]) => {
  return async (
    req: AuthRequest,
    res: Response,
    next: NextFunction,
  ) => {
    const user = req.user;

    if (!user) {
      return res.status(401).json({ status: false, message: 'Unauthorized' });
    }

    try {
      const membership = await organizationUserDAO.readByUserId(user.id);
      const hasRole =
        membership !== null && requiredRoles.includes(membership.role);

      if (!hasRole) {
        return res.status(403).json({ status: false, message: 'Forbidden' });
      }

      return next();
    } catch (err) {
      return next(err);
    }
  };
};

const checkAdminOrSuperAdmin = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) => {
  if (!req.user) {
    return res.status(401).json({ status: false, message: 'Unauthorized' });
  }

  if (req.user.globalRoles.includes('SUPERADMIN')) {
    return next();
  }

  const membership = await organizationUserDAO.readByUserId(req.user.id);
  if (membership?.role !== 'ADMIN') {
    return res.status(403).json({ status: false, message: 'Forbidden' });
  }

  return next();
};

// Προσωρινή συμβατότητα για παλιές διαδρομές: οι έλεγχοι checkRole δεν έχουν ακόμη μεταφερθεί με ασφάλεια και απορρίπτονται.
const checkRole = (_requiredRole: string) => {
  return (
    _req: AuthRequest,
    res: Response,
    _next: NextFunction,
  ) => {
    return res.status(403).json({
      status: false,
      message: 'Forbidden',
    });
  };
};

export const middleware = {
  verifyToken,
  checkGlobalRole,
  checkOrganizationRole,
  checkOrganizationRoles,
  checkAdminOrSuperAdmin,
  checkRole,
};
