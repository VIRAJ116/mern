// src/middleware/logger.middleware.ts
import { Request, Response, NextFunction } from "express";
import { log } from "../utils/logger.ts";

/**
 * Request logging middleware
 */
export const requestLogger = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  log.request(req.method, req.path, {
    query: req.query,
    ip: req.ip,
  });
  next();
};
