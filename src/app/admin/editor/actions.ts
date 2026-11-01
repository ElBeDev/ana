"use server";

import { updateTag } from "next/cache";
import { requireAdmin } from "@/lib/auth";
import { LANDING_TAG, publishLanding, saveDraft } from "@/lib/content";
import { InvalidContentError } from "@/lib/validate";

export type ActionResult = { ok: true; at: string } | { ok: false; error: string };

function failure(error: unknown): ActionResult {
  if (error instanceof InvalidContentError) return { ok: false, error: error.message };
  console.error(error);
  return { ok: false, error: "No se pudo guardar. Intenta de nuevo." };
}

export async function saveDraftAction(data: unknown): Promise<ActionResult> {
  await requireAdmin();
  try {
    await saveDraft(data);
    return { ok: true, at: new Date().toISOString() };
  } catch (error) {
    return failure(error);
  }
}

export async function publishAction(data: unknown): Promise<ActionResult> {
  await requireAdmin();
  try {
    await publishLanding(data);
    updateTag(LANDING_TAG);
    return { ok: true, at: new Date().toISOString() };
  } catch (error) {
    return failure(error);
  }
}
