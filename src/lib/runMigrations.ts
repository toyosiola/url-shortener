import "server-only";

import path from "path";
import migrate from "node-pg-migrate";
import server_env from "@/utils/env.server";

const MIGRATION_DIR = path.resolve(process.cwd(), "migrations");
console.log("MIGRATION DIR", MIGRATION_DIR);

export default async function runMigrations() {
  console.log("Running migrations...");
  await migrate({
    dir: MIGRATION_DIR,
    direction: "up",
    log: () => {},
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
