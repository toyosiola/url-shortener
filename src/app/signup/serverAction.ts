"use server";

// ====== SERVER ACTION HANDLE USER SIGN-UP =========

import { FieldErrors } from "@/components/forms/SignUpForm";
import { signupVerification } from "@/lib/emailTemplates";
import emailTransporter from "@/utils/emailTransporter";
import { signUpSchema } from "@/lib/zodSchemas";
import server_env from "@/utils/env.server";
import { z } from "zod";
import pool from "@/utils/db";
import bcrypt from "bcryptjs";
import { randomBytes } from "crypto";
import { PoolClient } from "pg";

type SignUpActionResult =
  | { success: true; message: string }
  | {
      success: false;
      errors: FieldErrors; // formatted zod error structure
      data: z.infer<typeof signUpSchema>;
    };

export async function signUpAction(
  rawData: z.infer<typeof signUpSchema>,
): Promise<SignUpActionResult> {
  // Validate data from frontend
  const parsed = signUpSchema.safeParse(rawData);
  if (!parsed.success) {
    return {
      success: false,
      errors: parsed.error.format(), // format error from zod to be passed down to client
      data: rawData,
    };
  }
  const { full_name, email, password } = parsed.data;

  // Hash password
  const password_hash = await bcrypt.hash(password, 11);

  // Generate account verification token
  const token = randomBytes(32).toString("hex");
  // const expires_at = new Date(Date.now() + 15 * 60 * 1000); // 15 min

  let client: PoolClient | null = null;
  try {
    // obtain dedicated db connection from pool
    client = await pool.connect();
    // begin transaction
    await client.query("BEGIN;");
    // Check for existing user
    const { rows } = await client.query(
      "SELECT id, account_verified FROM users WHERE email = $1;",
      [email],
    );

    // if user exists
    if (rows.length > 0) {
      const user = rows[0];
      if (user.account_verified) {
        // Already verified
        await client.query("ROLLBACK;");
        return {
          success: false,
          errors: {
            email: {
              _errors: [
                "An account with this email already exists. Please login instead.",
              ],
            },
            _errors: [],
          },
          data: rawData,
        };
      } else {
        // existing user not verified: update user and account_verification tables
        await client.query(
          "UPDATE users SET password_hash = $1, full_name = $2 WHERE email = $3;",
          [password_hash, full_name, email],
        );

        // upsert account_verification entry
        await client.query(
          `INSERT INTO account_verifications (user_id, email, token, expires_at)
          VALUES ($1, $2, $3, NOW() + INTERVAL '15 mins')
          ON CONFLICT (user_id) DO UPDATE
          SET token = EXCLUDED.token,
            created_at = NOW(),
            expires_at = EXCLUDED.expires_at;`,
          [user.id, email, token],
        );

        await client.query("COMMIT;");

        // Send verification email
        await emailTransporter.sendMail({
          from: server_env.SMTP_USER,
          to: email,
          subject: signupVerification.subject,
          text: signupVerification.text({
            confirmLink: `${server_env.BASE_URL}/api/auth/verify-account?token=${token}`,
          }),
          html: signupVerification.html({
            confirmLink: `${server_env.BASE_URL}/api/auth/verify-account?token=${token}`,
          }),
        });

        return {
          success: true,
          message:
            "Account updated. Please check your email to verify your account.",
        };
      }
    } else {
      // No existing user. Create new user and verification
      const { rows } = await client.query(
        `INSERT INTO users (email, password_hash, full_name) VALUES ($1, $2, $3) RETURNING id;`,
        [email, password_hash, full_name],
      );

      const user_id = rows[0].id;
      await client.query(
        `INSERT INTO account_verifications (user_id, email, token, expires_at)
         VALUES ($1, $2, $3, NOW() + INTERVAL '15 mins');`,
        [user_id, email, token],
      );

      await client.query("COMMIT");

      // Send verification email
      await emailTransporter.sendMail({
        from: server_env.SMTP_USER,
        to: email,
        subject: signupVerification.subject,
        text: signupVerification.text({
          confirmLink: `${server_env.BASE_URL}/api/auth/verify-account?token=${token}`,
        }),
        html: signupVerification.html({
          confirmLink: `${server_env.BASE_URL}/api/auth/verify-account?token=${token}`,
        }),
      });

      return {
        success: true,
        message:
          "Account created! Please check your email to verify your account.",
      };
    }
  } catch (err: any) {
    await client?.query("ROLLBACK");
    // Handle unique violation (email). Not expected behavior, just in case
    if (err.code === "23505") {
      return {
        success: false,
        errors: {
          email: { _errors: ["An account with this email already exists."] },
          _errors: [],
        },
        data: rawData,
      };
    }

    // Unexpected error
    return {
      success: false,
      errors: { _errors: ["An unexpected error occurred. Please try again."] },
      data: rawData,
    };
  } finally {
    client?.release();
  }
}
