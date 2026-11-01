"use server";

import { requireAdmin } from "@/lib/auth";
import { restoreRevision } from "@/lib/content";

export type RestoreState = { ok?: boolean; error?: string; id?: number };

export async function restoreAction(_prev: RestoreState, formData: FormData): Promise<RestoreState> {
  await requireAdmin();
  const id = Number(formData.get("id"));
  if (!Number.isInteger(id)) return { error: "Revisión inválida" };
  try {
    await restoreRevision(id);
    return { ok: true, id };
  } catch (e) {
    return { error: e instanceof Error ? e.message : "No se pudo restaurar", id };
  }
}
