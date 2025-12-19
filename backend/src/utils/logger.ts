// src/utils/logger.ts
import winston from "winston";
import chalk from "chalk";

// Custom format for colorized console output
const colorizedFormat = winston.format.printf(
  ({ level, message, timestamp, ...metadata }) => {
    let coloredLevel = level;

    switch (level) {
      case "error":
        coloredLevel = chalk.red.bold(level.toUpperCase());
        break;
      case "warn":
        coloredLevel = chalk.yellow.bold(level.toUpperCase());
        break;
      case "info":
        coloredLevel = chalk.blue.bold(level.toUpperCase());
        break;
      case "debug":
        coloredLevel = chalk.magenta.bold(level.toUpperCase());
        break;
      default:
        coloredLevel = chalk.gray.bold(level.toUpperCase());
    }

    const coloredTimestamp = chalk.gray(`[${timestamp}]`);
    const coloredMessage = chalk.white(message);

    let metadataString = "";
    if (Object.keys(metadata).length > 0) {
      metadataString = "\n" + chalk.cyan(JSON.stringify(metadata, null, 2));
    }

    return `${coloredTimestamp} ${coloredLevel}: ${coloredMessage}${metadataString}`;
  }
);

// Create the logger
export const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || "info",
  format: winston.format.combine(
    winston.format.timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
    winston.format.errors({ stack: true }),
    winston.format.splat(),
    winston.format.json()
  ),
  transports: [
    // Console transport with colors
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
        colorizedFormat
      ),
    }),
    // File transport for errors
    new winston.transports.File({
      filename: "logs/error.log",
      level: "error",
      format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.json()
      ),
    }),
    // File transport for all logs
    new winston.transports.File({
      filename: "logs/combined.log",
      format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.json()
      ),
    }),
  ],
});

// Helper functions for common logging patterns
export const log = {
  info: (message: string, meta?: any) => logger.info(message, meta),
  error: (message: string, meta?: any) => logger.error(message, meta),
  warn: (message: string, meta?: any) => logger.warn(message, meta),
  debug: (message: string, meta?: any) => logger.debug(message, meta),

  // Special formatters
  success: (message: string, meta?: any) =>
    logger.info(chalk.green("✓ ") + message, meta),

  failure: (message: string, meta?: any) =>
    logger.error(chalk.red("✗ ") + message, meta),

  request: (method: string, path: string, meta?: any) =>
    logger.info(`${chalk.cyan(method)} ${chalk.white(path)}`, meta),
};
