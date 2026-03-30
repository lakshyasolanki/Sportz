import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";

if (!process.env.DB_CONNECTION_STRING) {
  throw new Error('Database connection string is not defined')
}

export const pool = new Pool({
  connectionString: process.env.DB_CONNECTION_STRING
})

export const db = drizzle(pool)

