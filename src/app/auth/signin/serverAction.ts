"use server";

import { loginSchema } from "@/lib/zodSchemas";
import pool from "@/utils/db";
import bcrypt from "bcryptjs";
import { SignJWT } from "jose";
import server_env from "@/utils/env.server";
import { z } from "zod";
import { FieldErrors } from "@/components/forms/SignUpForm";
import { redirect } from "next/navigation";
import { cookies } from "next/headers";

type SignInActionResult = {
  errors: Omit<FieldErrors, "full_name" | "confirm_password">;
  data: z.infer<typeof loginSchema>;
};

interface User {
  id: number;
  email: string;
  password_hash: string;
  account_verified: boolean;
}

export async function signInAction(
  rawData: z.infer<typeof loginSchema>,
): Promise<SignInActionResult> {
  // Validate input
  const parsed = loginSchema.safeParse(rawData);
  if (!parsed.success) {
    return { errors: parsed.error.format(), data: rawData };
  }

  const { email, password } = parsed.data;
  let user: User;

  try {
    // Check if user exists
    const { rows } = await pool.query<User>(
      "SELECT id, email, password_hash, account_verified FROM users WHERE email = $1;",
      [email],
    );

    // If no user: return error
    if (rows.length === 0) {
      return {
        errors: { _errors: ["Invalid login credentials."] },
        data: rawData,
      };
    }

    user = rows[0];

    // Compare password
    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) {
      return {
        errors: { _errors: ["Invalid login credentials."] },
        data: rawData,
      };
    }
  } catch {
    return {
      errors: { _errors: ["An error occurred. Please try again."] },
      data: rawData,
    };
  }

  // Check if account is verified
  if (!user.account_verified) {
    redirect(
      `/auth/signup?error=${encodeURIComponent("Please verify your email before signing in.")}`,
    );
  }

  // Issue JWT and set cookie
  const secret = new TextEncoder().encode(server_env.JWT_SECRET);
  const jwtToken = await new SignJWT({ user_id: user.id })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(secret);

  // set session cookie
  (await cookies()).set("session", jwtToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 7, // 7 days
  });

  // redirect to dashboard
  redirect("/dashboard");
}
