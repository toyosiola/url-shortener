import { cookies } from "next/headers";
import server_env from "./env.server";
import { jwtVerify } from "jose";
import pool from "./db";

interface SessionUser {
  user_id: string;
  iat: number;
  exp: number;
}

// function to check if user is authenticated
export async function isAuthenticated(): Promise<SessionUser | false> {
  const sessionToken = (await cookies()).get("session")?.value;

  if (!sessionToken) return false;

  try {
    const secret = new TextEncoder().encode(server_env.JWT_SECRET);
    const { payload } = await jwtVerify(sessionToken, secret);
    return payload as unknown as SessionUser;
  } catch {
    return false;
  }
}

interface User {
  id: string;
  full_name: string;
  email: string;
  tier: "free" | "pro";
}

// function to get authenticated user data from database
export async function getUser(): Promise<User | null> {
  const session = await isAuthenticated();

  if (!session) return null;

  try {
    const { rows } = await pool.query<User>(
      "SELECT id, full_name, email, tier FROM users WHERE id = $1",
      [session.user_id],
    );

    return rows.length === 0 ? null : rows[0];
  } catch {
    return null;
  }
}
