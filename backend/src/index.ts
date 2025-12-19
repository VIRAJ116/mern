// src/index.ts
import "dotenv/config";
import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import { log } from "./utils/logger.ts";
import { corsConfig } from "./config/cors.config.ts";
import { requestLogger } from "./middleware/logger.middleware.ts";
import {
  notFoundHandler,
  errorHandler,
} from "./middleware/error.middleware.ts";
import routes from "./routes/index.ts";

const app = express();
const PORT = process.env.PORT || 5000;

/**
 * Middleware
 */
app.use(cors(corsConfig));
app.use(express.json());
app.use(cookieParser());
app.use(express.urlencoded({ extended: true }));
app.use(requestLogger);

/**
 * Routes
 */
app.use(routes);

/**
 * Error Handlers
 */
app.use(notFoundHandler);
app.use(errorHandler);

/**
 * Start Server
 */
app.listen(PORT, () => {
  log.success(`Server is running on port ${PORT}`);
  log.info(`Environment: ${process.env.NODE_ENV || "development"}`);
  log.info(`CORS enabled for: ${process.env.CORS_ORIGIN || "*"}`);
});
