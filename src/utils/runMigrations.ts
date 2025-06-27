import "server-only";

import path from "path";
import { runner } from "node-pg-migrate";
import server_env from "@/utils/env.server";

const MIGRATION_DIR = path.resolve(process.cwd(), "migrations");

export default async function runMigrations() {
  console.log("Running migrations...");
  await runner({
    dir: MIGRATION_DIR,
    direction: "up",
    log: (msg) => console.log(msg),
    noLock: true,
    migrationsTable: "pgmigrations",
    databaseUrl: {
      host: server_env.DB_HOST,
      user: server_env.DB_USER,
      password: server_env.DB_PASS,
      database: server_env.DB_NAME,
      port: server_env.DB_PORT,
      ssl: process.env.NODE_ENV === "production", // Use SSL in production if your database requires it
    },
  });
  console.log("Migrations completed successfully.");
}

runMigrations();
