import { NextRequest, NextResponse } from "next/server";
import { getUser } from "@/utils/verifyUserAuth";
import { redisRatelimit } from "@/utils/redis";
import pool from "@/utils/db";
import { randomBytes } from "crypto";
import server_env from "@/utils/env.server";
import { urlShortenSchema } from "@/lib/zodSchemas";

// Check if slug is unique: slug does not exist in db
async function isSlugUnique(slug: string): Promise<boolean> {
  const { rows } = await pool.query<{ slug_exists: boolean }>(
    `SELECT EXISTS (
      SELECT 1 FROM urls WHERE short_slug = $1
    ) AS slug_exists;`,
    [slug],
  );
  return !rows[0].slug_exists; // if slug does not exists, means unique
}

// Generate unique slug with retries
async function generateUniqueSlug(): Promise<string> {
  let attempts = 0;
  const maxAttempts = 10;

  while (attempts < maxAttempts) {
    const slug = randomBytes(4).toString("base64url"); // approx 6 characters
    if (await isSlugUnique(slug)) return slug;
    attempts++;
  }

  throw new Error("Unable to generate unique slug");
}

export async function POST(request: NextRequest) {
  try {
    // Get and validate user
    const user = await getUser();
    if (!user) {
      // redirect user to signin page if not authenticated
      return NextResponse.json(
        { errors: { _errors: ["Authentication required"] } },
        { status: 401 },
      );
    }

    // Parse and validate request body
    const body = await request.json();
    const validatedData = urlShortenSchema.safeParse(body);

    if (!validatedData.success) {
      return NextResponse.json(
        { errors: validatedData.error.format() },
        { status: 400 },
      );
    }

    const { url } = validatedData.data;

    // Check rate limit based on user tier
    const { success } = await redisRatelimit[user.tier].limit(user.id);

    if (!success) {
      const freeTier = user.tier === "free";
      return NextResponse.json(
        {
          errors: {
            _errors: [
              `Rate limit exceeded. ${freeTier ? "20" : "100"} URLs per day allowed. ${freeTier ? "Upgrade your account for increased rates" : ""}`,
            ],
          },
        },
        { status: 429 },
      );
    }

    // Generate unique slug
    const shortSlug = await generateUniqueSlug();

    // Save to database
    const { rows } = await pool.query(
      "INSERT INTO urls (user_id, short_slug, original_url) VALUES ($1, $2, $3) RETURNING short_slug",
      [user.id, shortSlug, url],
    );

    const shortenedUrl = `${server_env.BASE_URL}/${shortSlug}`;

    return NextResponse.json({
      success: true,
      data: {
        shortSlug: rows[0].short_slug,
        originalUrl: url,
        shortenedUrl,
      },
    });
  } catch (error) {
    return NextResponse.json(
      {
        errors: {
          _errors: ["An unexpected error occurred. Please try again."],
        },
      },
      { status: 500 },
    );
  }
}
