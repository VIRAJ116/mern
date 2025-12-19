import { verifyToken } from "@/utils/jwt.ts";
import { NextFunction, Request, Response } from "express";

export const authenticate = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  let token: string | undefined;
  token = req.cookies?.access_token;
  if (!token) {
    return res.status(401).json({
      success: false,
      error: "Authentication required",
    });
  }
  try {
    const decoded = verifyToken(token);
    req.user = decoded;
    next();
  } catch {
    return res.status(401).json({
      success: false,
      error: "Invalid or expired token",
    });
  }
};
