import "server-only";

import { Pool } from "pg";
import server_env from "@/utils/env.server";
// import "./runMigrations"; // always comment this out after running migrations. Package is a dev dependency

const pool = new Pool({
  host: server_env.DB_HOST,
  user: server_env.DB_USER,
  password: server_env.DB_PASS,
  database: server_env.DB_NAME,
  port: server_env.DB_PORT,
  ssl: process.env.NODE_ENV === "production", // Use SSL in production if your database requires it
});

export default pool;
