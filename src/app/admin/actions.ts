"use server";

import { draftMode } from "next/headers";
import { redirect } from "next/navigation";
import { logout } from "@/lib/auth";

export async function logoutAction() {
  await logout();
  (await draftMode()).disable();
  redirect("/admin/login");
}
