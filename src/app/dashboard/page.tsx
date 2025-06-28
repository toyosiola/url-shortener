import { FormInput } from "@/components/forms/FormInput";
import SubmitButton from "@/components/forms/SubmitButton";
import { getUser } from "@/utils/verifyUserAuth";
import { redirect } from "next/navigation";

export default async function DashboardPage() {
  const user = await getUser();

  if (!user) {
    redirect("/signin");
  }

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

          {/* URL Shortening Form */}
          <form className="mt-1 flex flex-col gap-4 sm:flex-row sm:items-end">
            <div className="grow">
              <FormInput
                name="url"
                type="url"
                className="mt-0"
                placeholder="https://example.com/very-long-url-that-needs-shortening"
              />
            </div>

            <SubmitButton
              isPending={false}
              defaultText="Shorten URL"
              pendingText="Loading"
              className="mt-0 sm:w-max"
            />
          </form>
        </div>

        {/* URL History Section (placeholder for future) */}
        <div className="rounded-xl bg-white p-8 shadow-md">
          <h2 className="mb-6 text-2xl font-bold text-gray-800">
            Your Shortened URLs
          </h2>
          <p className="text-gray-600">
            Your shortened URLs will appear here once you create them.
          </p>
        </div>
      </div>
    </main>
  );
}
