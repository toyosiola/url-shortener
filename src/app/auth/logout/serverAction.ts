"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export async function logoutAction() {
  // Delete the session cookie
  (await cookies()).delete("session");

  // Redirect to home page
  redirect("/");
}
