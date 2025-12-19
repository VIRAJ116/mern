// src/config/cors.config.ts
import { CorsOptions } from "cors";

/**
 * CORS configuration
 */
export const corsConfig: CorsOptions = {
  origin: process.env.CORS_ORIGIN,
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
  allowedHeaders: ["Content-Type", "Authorization"],
};
