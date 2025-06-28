"use client";

import { logoutAction } from "@/app/auth/logout/serverAction";
import { LoaderCircle } from "lucide-react";
import { useTransition } from "react";

export default function LogoutButton() {
  const [isPending, startTransition] = useTransition();

  const handleLogout = () => {
    startTransition(async () => {
      await logoutAction();
    });
  };

  return (
    <button
      onClick={handleLogout}
      disabled={isPending}
      className="flex cursor-pointer items-center justify-center gap-2 rounded-lg bg-gray-800 px-5 py-3 text-sm font-medium text-white duration-300 hover:bg-gray-700 disabled:bg-gray-400"
    >
      {isPending ? (
        <>
          <LoaderCircle className="animate-spin" /> Logging out...
        </>
      ) : (
        "Logout"
      )}
    </button>
  );
}
