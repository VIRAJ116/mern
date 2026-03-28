/**
 * Returns current timestamp in MySQL datetime format: 'YYYY-MM-DD HH:MM:SS'
 * Drizzle's timestamp({ mode: 'string' }) expects this format.
 */
export const nowMysql = (): string =>
  new Date().toISOString().slice(0, 19).replace('T', ' ')
