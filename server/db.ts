
import { drizzle } from "drizzle-orm/node-postgres";
import pg from "pg";
import * as schema from "@shared/schema";

const { Pool } = pg;

if (!process.env.DATABASE_URL) {
  console.warn("DATABASE_URL is not set. Using in-memory storage fallback. Database-driven features like drizzle-orm will not work.");
}

export const pool = process.env.DATABASE_URL ? new Pool({ connectionString: process.env.DATABASE_URL }) : ({} as any);
export const db = process.env.DATABASE_URL ? drizzle(pool, { schema }) : ({} as any);
