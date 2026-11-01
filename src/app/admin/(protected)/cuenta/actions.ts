"use server";

import { changePassword, requireAdmin } from "@/lib/auth";

export type PasswordState = { ok?: boolean; error?: string };

export async function changePasswordAction(_prev: PasswordState, formData: FormData): Promise<PasswordState> {
  const admin = await requireAdmin();
  const current = String(formData.get("current") ?? "");
  const next = String(formData.get("next") ?? "");
  const confirm = String(formData.get("confirm") ?? "");
  if (next !== confirm) return { error: "La confirmación no coincide." };
  const result = await changePassword(admin.id, current, next);
  return result.ok ? { ok: true } : { error: result.error };
}
