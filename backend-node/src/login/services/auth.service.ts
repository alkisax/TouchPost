// backend/src/login/services/auth.service.ts

import jwt from "jsonwebtoken";
import type { JwtPayload, SignOptions } from "jsonwebtoken";
import bcrypt from "bcrypt";
import type { Request } from "express";
import type { IUser } from "../types/user.types";

// ΔΗΜΙΟΥΡΓΙΑ ACCESS TOKEN
const generateAccessToken = (user: IUser): string => {
  const payload = {
    id: user._id.toString(),
    username: user.username,
    name: user.name,
    email: user.email,
    globalRoles: user.globalRoles,
  };

  const secret = process.env.JWT_SECRET;

  if (!secret) {
    throw new Error("JWT_SECRET not defined");
  }

  const options: SignOptions = {
    expiresIn: '23h',
  };

  return jwt.sign(payload, secret, options);
};

// ΕΛΕΓΧΟΣ PASSWORD
const verifyPassword = async (
  password: string,
  hashedPassword: string,
): Promise<boolean> => {
  return bcrypt.compare(password, hashedPassword);
};

// ΕΛΕΓΧΟΣ ACCESS TOKEN
type VerifyAccessTokenResult =
  | { verified: true; data: JwtPayload }
  | { verified: false; data: string };

const verifyAccessToken = (token: string): VerifyAccessTokenResult => {
  const secret = process.env.JWT_SECRET;

  if (!secret) {
    throw new Error("JWT_SECRET not defined");
  }

  try {
    const payload = jwt.verify(token, secret);

    if (typeof payload === "string") {
      return {
        verified: false,
        data: "Invalid token payload",
      };
    }

    return {
      verified: true,
      data: payload,
    };
  } catch (err) {
    if (err instanceof Error) {
      return {
        verified: false,
        data: err.message,
      };
    }

    return {
      verified: false,
      data: "Invalid token",
    };
  }
};

// ΕΞΑΓΩΓΗ TOKEN ΑΠΟ REQUEST
const getTokenFrom = (req: Request): string | null => {
  const authorization = req.get("authorization");

  if (authorization && authorization.toLowerCase().startsWith("bearer ")) {
    return authorization.slice(7);
  }

  return null;
};

export const authService = {
  generateAccessToken,
  verifyPassword,
  verifyAccessToken,
  getTokenFrom,
};
