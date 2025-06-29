import { isAuthenticated } from "@/utils/verifyUserAuth";
import { redirect } from "next/navigation";
import pool from "@/utils/db";
import { formatDate } from "@/utils/formatDate";
import { QueryResult } from "pg";

interface AnalyticsPageProps {
  params: Promise<{ short_slug: string }>;
}

interface UrlDetails {
  id: string;
  short_slug: string;
  original_url: string;
  created_at: string;
}

interface AnalyticsData {
  total_clicks: number;
  overall_last_clicked_at: string | null;
  click_count: number;
  group_last_clicked_at: string | null;
  country_name: string | null;
  country_code: string | null;
  continent_name: string | null;
  continent_code: string | null;
  region_name: string | null;
  region_code: string | null;
  device: string | null;
  browser: string | null;
  operation_system: string | null;
}

export default async function AnalyticsPage({ params }: AnalyticsPageProps) {
  const authenticated = await isAuthenticated();
  if (!authenticated) redirect("/signin"); // not really necessary. Already done in middleware

  const { short_slug } = await params;
  if (!short_slug) redirect("/dashboard");

  let analyticsResult: QueryResult<AnalyticsData>;
  let urlDetails: UrlDetails;

  try {
    // Get URL details from urls table
    const urlResult = await pool.query<UrlDetails>(
      "SELECT id, short_slug, original_url, created_at FROM urls WHERE short_slug = $1;",
      [short_slug],
    );

    if (urlResult.rows.length === 0) throw new Error("Url does not exist");

    urlDetails = urlResult.rows[0];

    // Get analytics data. Group url_clicks into several categories (grouping sets)
    analyticsResult = await pool.query<AnalyticsData>(
      `
      WITH data_summary AS (
        SELECT
          COUNT(*) AS total_clicks,
          MAX(clicked_at) AS overall_last_clicked_at
        FROM url_clicks
        WHERE url_id = $1
      ),
      grouped_data AS (
        SELECT
          COUNT(*) AS click_count,
          MAX(clicked_at) AS group_last_clicked_at,
          country_name,
          country_code,
          continent_name,
          continent_code,
          region_name,
          region_code,
          device,
          browser,
          operation_system
        FROM url_clicks
        WHERE url_id = $1
        GROUP BY GROUPING SETS (
          (country_name, country_code),
          (continent_name, continent_code),
          (region_name, region_code),
          (device),
          (browser),
          (operation_system)
        )
      )
      SELECT
        data_summary.total_clicks,
        data_summary.overall_last_clicked_at,
        grouped_data.*
      FROM data_summary, grouped_data
    `,
      [urlDetails.id],
    );
  } catch (error) {
    console.error("Error loading analytics:", error);
    redirect("/dashboard");
  }

  const analyticsData = analyticsResult.rows;

  // Filter data for different tables
  const countries = analyticsData
    .filter((row) => row.country_name && row.country_code)
    .sort((a, b) => (b.click_count || 0) - (a.click_count || 0));

  const continents = analyticsData
    .filter((row) => row.continent_name && row.continent_code)
    .sort((a, b) => (b.click_count || 0) - (a.click_count || 0));

  const regions = analyticsData
    .filter((row) => row.region_name && row.region_code)
    .sort((a, b) => (b.click_count || 0) - (a.click_count || 0));

  const devices = analyticsData
    .filter((row) => row.device)
    .sort((a, b) => (b.click_count || 0) - (a.click_count || 0));

  const browsers = analyticsData
    .filter((row) => row.browser)
    .sort((a, b) => (b.click_count || 0) - (a.click_count || 0));

  const operatingSystems = analyticsData
    .filter((row) => row.operation_system)
    .sort((a, b) => (b.click_count || 0) - (a.click_count || 0));

  const totalClicks = analyticsData[0]?.total_clicks || 0;
  const lastClickedAt = analyticsData[0]?.overall_last_clicked_at;

  return (
    <main className="flex min-h-screen flex-col items-center bg-gray-100 p-4">
      <div className="w-full max-w-6xl space-y-8">
        {/* Header Section */}
        <div className="rounded-xl bg-white p-8 shadow-md">
          <h1 className="text-2xl font-bold text-gray-800">
            Analytics for /{short_slug}
          </h1>
          <p className="mt-2 text-gray-600">
            Detailed analytics and insights for your shortened URL.
          </p>

          {/* URL Details */}
          <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div className="rounded-lg bg-gray-50 p-4">
              <h3 className="text-sm font-medium text-gray-600">
                Shortened URL
              </h3>
              <p className="mt-1 text-sm font-semibold text-gray-800">
                {process.env.BASE_URL}/{short_slug}
              </p>
            </div>
            <div className="rounded-lg bg-gray-50 p-4">
              <h3 className="text-sm font-medium text-gray-600">
                Original URL
              </h3>
              <p className="mt-1 truncate text-sm font-semibold text-gray-800">
                {urlDetails.original_url}
              </p>
            </div>
            <div className="rounded-lg bg-gray-50 p-4">
              <h3 className="text-sm font-medium text-gray-600">Created</h3>
              <p className="mt-1 text-sm font-semibold text-gray-800">
                {formatDate(urlDetails.created_at)}
              </p>
            </div>
            <div className="rounded-lg bg-gray-50 p-4">
              <h3 className="text-sm font-medium text-gray-600">
                Total Clicks
              </h3>
              <p className="mt-1 text-2xl font-bold text-blue-600">
                {totalClicks}
              </p>
            </div>
          </div>

          {lastClickedAt && (
            <div className="mt-4 rounded-lg bg-blue-50 p-4">
              <h3 className="text-sm font-medium text-blue-800">
                Last Clicked
              </h3>
              <p className="mt-1 text-sm font-semibold text-blue-900">
                {formatDate(lastClickedAt)}
              </p>
            </div>
          )}
        </div>

        {/* If url doesn't have any data yet */}
        {totalClicks === 0 && (
          <div className="rounded-xl bg-white p-8 text-center shadow-md">
            <h2 className="text-xl font-semibold text-gray-800">
              No Analytics Data
            </h2>
            <p className="mt-2 text-gray-600">
              This URL hasn&apos;t been clicked yet. Analytics will appear here
              once people start using your shortened URL.
            </p>
          </div>
        )}

        {/* Geographic Summary Section */}
        <div className="space-y-6">
          {countries.length > 0 && (
            <h2 className="text-xl font-bold text-gray-800">
              Geographic Summary
            </h2>
          )}

          {/* Countries Table */}
          {countries.length > 0 && (
            <div className="rounded-xl bg-white p-6 shadow-md">
              <h3 className="mb-4 text-lg font-semibold text-gray-800">
                Countries
              </h3>

              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="px-4 py-2 text-left text-sm font-semibold text-gray-800">
                        Country
                      </th>
                      <th className="px-4 py-2 text-left text-sm font-semibold text-gray-800">
                        Code
                      </th>
                      <th className="px-4 py-2 text-left text-sm font-semibold text-gray-800">
                        Clicks
                      </th>
                    </tr>
                  </thead>

                  <tbody>
                    {countries.map((country, index) => (
                      <tr
                        key={index}
                        className={`border-b border-gray-100 ${index % 2 === 0 ? "bg-white" : "bg-gray-50"}`}
                      >
                        <td className="px-4 py-3 text-sm text-gray-800">
                          {country.country_name}
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-600">
                          {country.country_code}
                        </td>
                        <td className="px-4 py-3 text-sm font-semibold text-gray-800">
                          {country.click_count}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Continents Table */}
          {continents.length > 0 && (
            <div className="rounded-xl bg-white p-6 shadow-md">
              <h3 className="mb-4 text-lg font-semibold text-gray-800">
                Continents
              </h3>

              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="px-4 py-2 text-left text-sm font-semibold text-gray-800">
                        Continent
                      </th>
                      <th className="px-4 py-2 text-left text-sm font-semibold text-gray-800">
                        Code
                      </th>
                      <th className="px-4 py-2 text-left text-sm font-semibold text-gray-800">
                        Clicks
                      </th>
                    </tr>
                  </thead>

                  <tbody>
                    {continents.map((continent, index) => (
                      <tr
                        key={index}
                        className={`border-b border-gray-100 ${index % 2 === 0 ? "bg-white" : "bg-gray-50"}`}
                      >
                        <td className="px-4 py-3 text-sm text-gray-800">
                          {continent.continent_name}
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-600">
                          {continent.continent_code}
                        </td>
                        <td className="px-4 py-3 text-sm font-semibold text-gray-800">
                          {continent.click_count}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Regions Table */}
          {regions.length > 0 && (
            <div className="rounded-xl bg-white p-6 shadow-md">
              <h3 className="mb-4 text-lg font-semibold text-gray-800">
                Regions
              </h3>

              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="px-4 py-2 text-left text-sm font-semibold text-gray-800">
                        Region
                      </th>
                      <th className="px-4 py-2 text-left text-sm font-semibold text-gray-800">
                        Code
                      </th>
                      <th className="px-4 py-2 text-left text-sm font-semibold text-gray-800">
                        Clicks
                      </th>
                    </tr>
                  </thead>

                  <tbody>
                    {regions.map((region, index) => (
                      <tr
                        key={index}
                        className={`border-b border-gray-100 ${index % 2 === 0 ? "bg-white" : "bg-gray-50"}`}
                      >
                        <td className="px-4 py-3 text-sm text-gray-800">
                          {region.region_name}
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-600">
                          {region.region_code}
                        </td>
                        <td className="px-4 py-3 text-sm font-semibold text-gray-800">
                          {region.click_count}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>

        {/* Device & Browser Section */}
        <div className="space-y-6">
          {devices.length > 0 && (
            <h2 className="text-xl font-bold text-gray-800">
              Device & Browser Summary
            </h2>
          )}

          {/* Devices Table */}
          {devices.length > 0 && (
            <div className="rounded-xl bg-white p-6 shadow-md">
              <h3 className="mb-4 text-lg font-semibold text-gray-800">
                Devices
              </h3>

              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="px-4 py-2 text-left text-sm font-semibold text-gray-800">
                        Device
                      </th>
                      <th className="px-4 py-2 text-left text-sm font-semibold text-gray-800">
                        Clicks
                      </th>
                    </tr>
                  </thead>

                  <tbody>
                    {devices.map((device, index) => (
                      <tr
                        key={index}
                        className={`border-b border-gray-100 ${index % 2 === 0 ? "bg-white" : "bg-gray-50"}`}
                      >
                        <td className="px-4 py-3 text-sm text-gray-800">
                          {device.device}
                        </td>
                        <td className="px-4 py-3 text-sm font-semibold text-gray-800">
                          {device.click_count}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Browsers Table */}
          {browsers.length > 0 && (
            <div className="rounded-xl bg-white p-6 shadow-md">
              <h3 className="mb-4 text-lg font-semibold text-gray-800">
                Browsers
              </h3>

              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="px-4 py-2 text-left text-sm font-semibold text-gray-800">
                        Browser
                      </th>
                      <th className="px-4 py-2 text-left text-sm font-semibold text-gray-800">
                        Clicks
                      </th>
                    </tr>
                  </thead>

                  <tbody>
                    {browsers.map((browser, index) => (
                      <tr
                        key={index}
                        className={`border-b border-gray-100 ${index % 2 === 0 ? "bg-white" : "bg-gray-50"}`}
                      >
                        <td className="px-4 py-3 text-sm text-gray-800">
                          {browser.browser}
                        </td>
                        <td className="px-4 py-3 text-sm font-semibold text-gray-800">
                          {browser.click_count}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Operating Systems Table */}
          {operatingSystems.length > 0 && (
            <div className="rounded-xl bg-white p-6 shadow-md">
              <h3 className="mb-4 text-lg font-semibold text-gray-800">
                Operating Systems
              </h3>

              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="px-4 py-2 text-left text-sm font-semibold text-gray-800">
                        OS
                      </th>
                      <th className="px-4 py-2 text-left text-sm font-semibold text-gray-800">
                        Clicks
                      </th>
                    </tr>
                  </thead>

                  <tbody>
                    {operatingSystems.map((os, index) => (
                      <tr
                        key={index}
                        className={`border-b border-gray-100 ${index % 2 === 0 ? "bg-white" : "bg-gray-50"}`}
                      >
                        <td className="px-4 py-3 text-sm text-gray-800">
                          {os.operation_system}
                        </td>
                        <td className="px-4 py-3 text-sm font-semibold text-gray-800">
                          {os.click_count}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
