import { getUser } from "@/utils/verifyUserAuth";
import { redirect } from "next/navigation";
import UrlShortenForm from "@/components/forms/UrlShortenForm";
import UrlTable, { UrlData } from "@/components/UrlTable";
import pool from "@/utils/db";

export default async function DashboardPage() {
  const user = await getUser();

  if (!user) {
    redirect("/auth/signin");
  }

  // Fetch user's URLs ordered by most recent first
  const { rows } = await pool.query<UrlData>(
    `SELECT id, short_slug, original_url, created_at FROM urls 
     WHERE user_id = $1 
     ORDER BY created_at DESC;`,
    [user.id],
  );

  return (
    <main className="flex min-h-screen flex-col items-center bg-gray-100 p-4">
      <div className="w-full max-w-4xl space-y-8">
        {/* Welcome Section */}
        <div className="rounded-xl bg-white p-8 shadow-md">
          <h1 className="text-2xl font-bold text-gray-800">
            Welcome {user.full_name}!
          </h1>
          <p className="mt-1 font-medium text-gray-600">
            Create short, memorable links for your URLs.
          </p>

          <h2 className="mt-6 text-xl font-semibold text-gray-800">
            Shorten Your URL
          </h2>

          <UrlShortenForm />
        </div>

        {/* URL Table */}
        <UrlTable urls={rows} />
      </div>
    </main>
  );
}
