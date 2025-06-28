import Link from "next/link";

export default function Home() {
  return (
    <main className="flex min-h-[calc(100vh-4rem)] flex-col items-center justify-center bg-gray-100 p-4">
      <div className="w-full max-w-md space-y-8 text-center">
        <h1 className="text-4xl font-bold text-gray-800">
          Make Your Url Easy to Remember
        </h1>
        <div className="mt-8 flex flex-col space-y-4 xs:flex-row xs:justify-center xs:space-y-0 xs:space-x-4">
          <Link
            href="/auth/signin"
            className="w-full rounded-lg bg-white px-6 py-3 text-lg font-semibold text-gray-800 shadow-md ring-1 ring-gray-200 duration-300 hover:bg-gray-100 xs:w-auto"
          >
            Sign In
          </Link>
          <Link
            href="/auth/signup"
            className="w-full rounded-lg bg-gray-800 px-6 py-3 text-lg font-semibold text-white shadow-md duration-300 hover:bg-gray-600 xs:w-auto"
          >
            Sign Up
          </Link>
        </div>
      </div>
    </main>
  );
}
