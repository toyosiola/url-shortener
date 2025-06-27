import "server-only";

import { z } from "zod";

const envSchema = z.object({
  //  main site url
  BASE_URL: z.string().url(),

  // Database
  DB_HOST: z.string().min(1),
  DB_USER: z.string().min(1),
  DB_PASS: z.string().min(1),
  DB_NAME: z.string().min(1),
  DB_PORT: z.coerce.number().positive(),

  // Email
  SMTP_HOST: z.string().min(1),
  SMTP_USER: z.string().email(),
  SMTP_PASSWORD: z.string().min(1),
});

function validateEnv() {
  try {
    return envSchema.parse(process.env);
  } catch (error) {
    if (error instanceof z.ZodError) {
      const missingVars = error.errors
        .map((err) => err.path.join("."))
        .join(", ");
      throw new Error(`Invalid environment variables: ${missingVars}`);
    }
    throw error;
  }
}

const server_env = validateEnv();

export default server_env;
