import { Pool, neonConfig } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/node-postgres';
import ws from "ws";
import * as schema from "@shared/schema";

// We keep these imports to avoid breaking other files, 
// but we will use the standard 'pg' connection for Render.
import pg from 'pg';
const { Pool: PgPool } = pg;

if (!process.env.DATABASE_URL) {
  throw new Error(
    "DATABASE_URL must be set. Did you forget to provision a database?",
  );
}

// Create a standard PostgreSQL connection pool
export const pool = new PgPool({
  connectionString: process.env.DATABASE_URL,
});

// Initialize Drizzle with the standard node-postgres driver
export const db = drizzle(pool, { schema });