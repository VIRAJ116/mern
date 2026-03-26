// src/db/index.ts
import 'dotenv/config'
// 💥 CHANGE THIS IMPORT 💥
import { drizzle } from 'drizzle-orm/mysql2'
import mysql from 'mysql2/promise'
import * as schema from './schema.ts'

// Create a pool connection using the mysql2 driver
const poolConnection = mysql.createPool(process.env.DATABASE_URL!)

// Initialize the Drizzle client with the connection pool
export const db = drizzle(poolConnection, { schema, mode: 'default' })
