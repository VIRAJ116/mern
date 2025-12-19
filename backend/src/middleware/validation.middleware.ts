// src/middleware/validation.middleware.ts
import { Request, Response, NextFunction } from "express";
import { ApiErrorResponse } from "../types/response.types.ts";

/**
 * Validate user creation request
 */
export const validateCreateUser = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const { name, email, password } = req.body;

  if (!name || !email || !password) {
    const response: ApiErrorResponse = {
      success: false,
      error: "Name, email, and password are required",
    };

    res.status(400).json(response);
    return;
  }

  // Basic email validation
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    const response: ApiErrorResponse = {
      success: false,
      error: "Invalid email format",
    };

    res.status(400).json(response);
    return;
  }

  // Password length validation
  if (password.length < 6) {
    const response: ApiErrorResponse = {
      success: false,
      error: "Password must be at least 6 characters long",
    };

    res.status(400).json(response);
    return;
  }

  next();
};
