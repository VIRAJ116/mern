// src/middleware/error.middleware.ts
import { Request, Response, NextFunction } from "express";
import { log } from "../utils/logger.ts";
import { ApiErrorResponse } from "../types/response.types.ts";

/**
 * 404 Not Found handler
 */
export const notFoundHandler = (req: Request, res: Response): void => {
  log.warn(`404 - Route not found: ${req.method} ${req.path}`);

  const response: ApiErrorResponse = {
    success: false,
    error: "Route not found",
  };

  res.status(404).json(response);
};

/**
 * Global error handler
 */
export const errorHandler = (
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  log.error("Unhandled error", {
    error: err.message,
    stack: err.stack,
    path: req.path,
  });

  const response: ApiErrorResponse = {
    success: false,
    error: "Internal server error",
  };

  res.status(500).json(response);
};
