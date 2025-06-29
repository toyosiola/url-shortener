// ====== THIS DYNAMIC API ROUTE HANDLES SLUG REDIRECTION TO ORIGINAL URL =======

import { NextRequest, NextResponse } from "next/server";
import pool from "@/utils/db";
import { UAParser } from "ua-parser-js";
import server_env from "@/utils/env.server";
import { after } from "next/server";

function parseUserAgent(userAgent: string) {
  const parser = new UAParser(userAgent);
  const result = parser.getResult();

  return {
    device: result.device.type || result.device.model || "unknown",
    browser: result.browser.name || "unknown",
    operation_system: result.os.name || "unknown",
  };
}

interface GeoData {
  country_name?: string;
  country_code?: string;
  continent_name?: string;
  continent_code?: string;
  region_name?: string;
  region_code?: string;
  city?: string;
}

async function getGeoData(ip: string): Promise<GeoData> {
  try {
    // Skip localhost, private and unknown IPs
    if (
      ip === "::1" || // localhost
      ip === "127.0.0.1" || // localhost
      ip.startsWith("192.168.") ||
      ip.startsWith("10.") ||
      ip === "unknown"
    ) {
      return {};
    }

    const response = await fetch(
      `https://api.ipstack.com/${ip}?access_key=${server_env.IPSTACK_ACCESS_KEY}`,
    );
    const data = await response.json();

    return {
      country_name: data.country_name,
      country_code: data.country_code,
      continent_name: data.continent_name,
      continent_code: data.continent_code,
      region_name: data.region_name,
      region_code: data.region_code,
      city: data.city,
    };
  } catch (error) {
    console.error("Error fetching geo data:", error);
    return {};
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ short_slug: string }> },
) {
  let { short_slug } = await params;

  // if short_slug is not present, redirect to home page
  if (!short_slug) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  short_slug = short_slug.trim(); // remove possible whitespace

  try {
    // Get the original URL from database
    const { rows } = await pool.query(
      "SELECT id, original_url FROM urls WHERE short_slug = $1",
      [short_slug],
    );

    if (rows.length === 0) {
      // if url does not exist in db, redirect to home
      return NextResponse.redirect(new URL("/", request.url));
    }

    const { id: url_id, original_url } = rows[0];

    // Get user agent from headers
    const userAgent = request.headers.get("user-agent") || "";

    // Parse user agent for device info
    const deviceInfo = parseUserAgent(userAgent);

    // Get client IP from headers
    const ip =
      request.headers.get("x-forwarded-for")?.split(",")[0] ||
      request.headers.get("x-real-ip") ||
      request.headers.get("x-client-ip") ||
      "unknown";

    // Schedule analytics tracking after the user has been redirected to their destination
    after(async () => {
      try {
        // Get geo data from ipstack
        const geoData = await getGeoData(ip);

        // Insert click data into database
        await pool.query(
          `INSERT INTO url_clicks (
            url_id, ip_address, country_name, country_code, continent_name, continent_code, 
            region_name, region_code, city, device, browser, operation_system
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)`,
          [
            url_id,
            ip,
            geoData.country_name || "unknown",
            geoData.country_code || "unknown",
            geoData.continent_name || "unknown",
            geoData.continent_code || "unknown",
            geoData.region_name || "unknown",
            geoData.region_code || "unknown",
            geoData.city || "unknown",
            deviceInfo.device,
            deviceInfo.browser,
            deviceInfo.operation_system,
          ],
        );
      } catch (error) {
        console.error("Error tracking analytics:", error);
      }
    });

    // Return the redirect response
    return NextResponse.redirect(original_url);
  } catch (error) {
    console.error("Error in short slug route:", error);
    return NextResponse.redirect(new URL("/", request.url));
  }
}
