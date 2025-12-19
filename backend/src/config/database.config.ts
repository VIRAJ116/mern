// src/config/database.config.ts

/**
 * Database configuration
 */
export const databaseConfig = {
  url: process.env.DATABASE_URL!,
  poolMin: 2,
  poolMax: 10,
};
