// src/middleware/error.middleware.ts
import { Request, Response, NextFunction } from "express";
import chalk from "chalk";
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
  const divider = chalk.red("─".repeat(60));
  const label = (text: string) => chalk.bold.white(text.padEnd(10));

  // Parse stack: filter to only show app-related frames
  const stackLines = (err.stack || "")
    .split("\n")
    .slice(1) // remove first line (duplicate of message)
    .filter((line) => line.includes("/src/") || line.includes("/services/") || line.includes("/controllers/"))
    .map((line) => chalk.gray("  " + line.trim()))

  const stackOutput =
    stackLines.length > 0
      ? stackLines.join("\n")
      : chalk.gray("  (no app-level frames found)")

  console.error(
    [
      "",
      divider,
      chalk.red.bold("  ✖  UNHANDLED ERROR"),
      divider,
      `  ${label("Method:")}  ${chalk.cyan(req.method)}`,
      `  ${label("Path:")}    ${chalk.cyan(req.path)}`,
      `  ${label("Message:")} ${chalk.yellow(err.message)}`,
      chalk.red("─".repeat(60)),
      chalk.bold.white("  Stack Trace:"),
      stackOutput,
      divider,
      "",
    ].join("\n")
  );

  const response: ApiErrorResponse = {
    success: false,
    error: "Internal server error",
  };

  res.status(500).json(response);
};
