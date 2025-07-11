import Link from "next/link";
import LogoutButton from "./LogoutButton";
import { isAuthenticated } from "@/utils/verifyUserAuth";

export default async function Navbar() {
  const authenticated = await isAuthenticated();

  return (
    <nav className="border-b border-gray-200 bg-white shadow-sm">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link href="/" className="text-xl font-bold text-gray-800">
          URL Shortener
        </Link>

        {!!authenticated && <LogoutButton />}
      </div>
    </nav>
  );
}
