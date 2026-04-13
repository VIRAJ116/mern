// src/config/cors.config.ts
import { CorsOptions } from "cors";

/**
 * Parse comma-separated CORS origins from env
 * e.g. CORS_ORIGIN="http://localhost:5173,http://localhost:5174"
 */
const allowedOrigins = (process.env.CORS_ORIGIN || "http://localhost:5173")
  .split(",")
  .map((o) => o.trim());

/**
 * CORS configuration
 * NOTE: credentials:true requires explicit origins — wildcard "*" is not allowed
 * by browsers when cookies are sent (Access-Control-Allow-Credentials: true).
 */
export const corsConfig: CorsOptions = {
  origin: (origin, callback) => {
    // Allow server-to-server (no origin) and whitelisted origins
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error(`CORS: origin '${origin}' not allowed`));
    }
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
  allowedHeaders: ["Content-Type", "Authorization"],
};
