// src/db/schema.ts
import { mysqlTable, char, varchar, timestamp } from "drizzle-orm/mysql-core";

// Example: Define a users table
export const users = mysqlTable("users", {
  // Use UUID instead of auto-incrementing integer
  id: char("id", { length: 36 })
    .$defaultFn(() => crypto.randomUUID())
    .primaryKey(),
  name: varchar("name", { length: 256 }).notNull(), // varchar requires a length
  email: varchar("email", { length: 256 }).notNull().unique(),
  password: varchar("password", { length: 256 }).notNull(), // hashed password
  role: varchar("role", { length: 50 }).notNull().default("user"), // user role: 'user', 'admin', 'super_admin'
  // MySQL has different timestamp/datetime types than Postgres
  createdAt: timestamp("created_at", { mode: "string" }).defaultNow().notNull(),
});
