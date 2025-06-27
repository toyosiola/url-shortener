// ======== API ENDPOINT TO VERIFY USER ACCOUNT  ==========

import { NextRequest, NextResponse } from "next/server";
import pool from "@/utils/db";
import jwt from "jsonwebtoken";
import server_env from "@/utils/env.server";
import { PoolClient } from "pg";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const token = searchParams.get("token");

  // If no token: redirect to signup page
  if (!token) {
    return NextResponse.redirect(
      `${server_env.BASE_URL}/signup?error=${encodeURIComponent("Invalid verification credentials")}`,
    );
  }

  let client: PoolClient | null = null;
  try {
    // get dedicated db connection from pool
    client = await pool.connect();
    // Find verification entry
    const { rows } = await client.query(
      `SELECT user_id FROM account_verifications WHERE token = $1 AND expires_at > NOW();`,
      [token],
    );

    // If token does not exist in the: redirect to signup page
    if (rows.length === 0) {
      return NextResponse.redirect(
        `${server_env.BASE_URL}/signup?error=${encodeURIComponent("Invalid or expired verification credentials")}`,
      );
    }

    const { user_id } = rows[0];

    // Transaction: verify user and delete verification token
    await client.query("BEGIN");
    await client.query(
      `UPDATE users SET account_verified = true WHERE id = $1;`,
      [user_id],
    );
    await client.query(
      `DELETE FROM account_verifications WHERE user_id = $1;`,
      [user_id],
    );
    await client.query("COMMIT");

    // Sign in user (issue JWT)
    const jwtSecret = server_env.JWT_SECRET;
    const jwtPayload = { user_id };
    const jwtToken = jwt.sign(jwtPayload, jwtSecret, { expiresIn: "7d" }); // TODO: Refreshing token

    // Set cookie and redirect
    const response = NextResponse.redirect(`${server_env.BASE_URL}/dashboard`);
    response.cookies.set("session", jwtToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 7, // 7 days
    });
    return response;
  } catch (err) {
    await client?.query("ROLLBACK");
    return NextResponse.redirect(
      `${server_env.BASE_URL}/signup?error=${encodeURIComponent("An unexpected error occurred. Please try again.")}`,
    );
  } finally {
    client?.release();
  }
}
