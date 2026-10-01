// backend/src/login/controllers/auth.controller.ts

import type { Request, Response } from "express";
import type { JwtPayload } from "jsonwebtoken";

import {
  loginSchema,
  registerAdminSchema,
  registerUserSchema,
} from "../validation/auth.schema";

import { userDAO } from "../dao/user.dao";
import { organizationDAO } from "../dao/organization.dao";
import { organizationUserDAO } from "../dao/organizationUser.dao";

import { authService } from "../services/auth.service";
import {
  createAdminWithOrganization,
  createUser,
} from "../services/organizationLifecycle.service";
import { handleControllerError } from "../../utils/error/errorHandler";

// TYPE GUARD JWT PAYLOAD
const hasUserPayload = (
  payload: JwtPayload,
): payload is JwtPayload & { username: string } => {
  return typeof payload.username === "string";
};

const addOrganizationName = async (
  membership: Awaited<ReturnType<typeof organizationUserDAO.readByUserId>>,
) => {
  if (!membership) return null;

  const organization = await organizationDAO.readById(membership.organizationId);
  return {
    id: membership.id,
    userId: membership.userId,
    organizationId: membership.organizationId,
    role: membership.role,
    createdAt: membership.createdAt,
    organizationName: organization.name,
  };
};

const toUserResponse = (user: {
  _id?: { toString(): string };
  id?: string;
  username: string;
  name?: string;
  email?: string;
  globalRoles: string[];
}) => ({
  id: user.id ?? user._id?.toString(),
  username: user.username,
  name: user.name,
  email: user.email,
  globalRoles: user.globalRoles,
});

// LOGIN
const login = async (req: Request, res: Response) => {
  try {
    const parsed = loginSchema.parse(req.body);

    const user = await userDAO.readByUsername(parsed.username);

    if (!user) {
      return res.status(401).json({
        status: false,
        message: "Invalid username or password",
      });
    }

    const isMatch = await authService.verifyPassword(
      parsed.password,
      user.hashedPassword,
    );

    if (!isMatch) {
      return res.status(401).json({
        status: false,
        message: "Invalid username or password",
      });
    }

    const membership = await organizationUserDAO.readByUserId(
      user._id.toString(),
    );

    const token = authService.generateAccessToken(user);
    const organization = await addOrganizationName(membership);

    return res.status(200).json({
      status: true,
      data: {
        token,
        user: { ...toUserResponse(user), organization },
      },
    });
  } catch (err) {
    return handleControllerError(res, err);
  }
};

// REGISTER (PUBLIC)
// Δημιουργεί νέο ADMIN μαζί με το πρώτο organization του.
const registerAdmin = async (req: Request, res: Response) => {
  try {
    const parsed = registerAdminSchema.parse(req.body);

    const existing = await userDAO.readByUsername(parsed.username);

    if (existing) {
      return res.status(409).json({
        status: false,
        message: "Username already taken",
      });
    }

    const result = await createAdminWithOrganization({
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
  } catch (err) {
    return handleControllerError(res, err);
  }
};

const registerUser = async (req: Request, res: Response) => {
  try {
    const parsed = registerUserSchema.parse(req.body);
    const existing = await userDAO.readByUsername(parsed.username);

    if (existing) {
      return res.status(409).json({
        status: false,
        message: 'Username already taken',
      });
    }

    const user = await createUser(parsed);
    return res.status(201).json({
      status: true,
      data: {
        user: toUserResponse(user),
        organization: null,
        membership: null,
      },
    });
  } catch (err) {
    return handleControllerError(res, err);
  }
};

// REFRESH TOKEN
const refreshToken = async (req: Request, res: Response) => {
  try {
    const token = authService.getTokenFrom(req);

    if (!token) {
      return res.status(401).json({
        status: false,
        message: "No token provided",
      });
    }

    const verification = authService.verifyAccessToken(token);

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

    const dbUser = await userDAO.readByUsername(verification.data.username);

    if (!dbUser) {
      return res.status(401).json({
        status: false,
        message: "User not found",
      });
    }

    const newToken = authService.generateAccessToken(dbUser);

    const membership = await organizationUserDAO.readByUserId(
      dbUser._id.toString(),
    );
    const organization = await addOrganizationName(membership);

    return res.status(200).json({
      status: true,
      data: {
        token: newToken,
        user: { ...toUserResponse(dbUser), organization },
      },
    });
  } catch (err) {
    return handleControllerError(res, err);
  }
};

export const authController = {
  login,
  registerAdmin,
  registerUser,
  refreshToken,
};
