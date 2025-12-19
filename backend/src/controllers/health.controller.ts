// src/controllers/health.controller.ts
import { Request, Response } from "express";
import { HealthCheckResponse } from "../types/response.types.js";

/**
 * Get health status
 * GET /health
 */
export const getHealth = (req: Request, res: Response): void => {
  const response: HealthCheckResponse = {
    status: "ok",
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || "development",
  };

  res.json(response);
};
