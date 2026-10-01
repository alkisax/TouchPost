// backend\src\utils\validation\validateObjectIdParam.ts
import type { Response } from "express";

export const validateIdParam = (
  id: unknown,
  res: Response,
  entityName = "ID"
): id is string => {
  if (typeof id !== "string" || !id) {
    res.status(400).json({
      status: false,
      message: `${entityName} is invalid`,
    });
    return false;
  }

  return true;
};