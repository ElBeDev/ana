"use server";

import { requireAdmin } from "@/lib/auth";
import {
  deleteMedia,
  listMedia,
  mediaUsage,
  registerMedia,
  saveLocalUpload,
  updateAlt,
  type MediaItem,
} from "@/lib/media";

export type MediaResult<T = undefined> = { ok: true; data: T } | { ok: false; error: string };

const fail = (error: unknown): { ok: false; error: string } => ({
  ok: false,
  error: error instanceof Error ? error.message : "Algo salió mal",
});

export async function listMediaAction(): Promise<MediaResult<MediaItem[]>> {
  await requireAdmin();
  try {
    return { ok: true, data: await listMedia() };
  } catch (e) {
    return fail(e);
  }
}

type Uploaded = {
  url: string;
  pathname: string;
  filename: string;
  contentType: string;
  size: number;
  width: number | null;
  height: number | null;
};

/** Registra un archivo que el navegador ya subió a Vercel Blob. */
export async function registerMediaAction(item: Uploaded): Promise<MediaResult<MediaItem | undefined>> {
  await requireAdmin();
  try {
    return { ok: true, data: await registerMedia(item) };
  } catch (e) {
    return fail(e);
  }
}

/** Solo en desarrollo, sin token de Blob: guarda en public/uploads. */
export async function uploadLocalAction(formData: FormData): Promise<MediaResult<MediaItem | undefined>> {
  await requireAdmin();
  try {
    const file = formData.get("file");
    if (!(file instanceof File)) throw new Error("No llegó ningún archivo");
    const saved = await saveLocalUpload(file);
    const item = await registerMedia({
      ...saved,
      filename: file.name,
      contentType: file.type,
      size: file.size,
      width: Number(formData.get("width")) || null,
      height: Number(formData.get("height")) || null,
    });
    return { ok: true, data: item };
  } catch (e) {
    return fail(e);
  }
}

export async function updateAltAction(id: number, alt: string): Promise<MediaResult> {
  await requireAdmin();
  try {
    await updateAlt(id, alt);
    return { ok: true, data: undefined };
  } catch (e) {
    return fail(e);
  }
}

export async function mediaUsageAction(url: string): Promise<MediaResult<{ draft: boolean; published: boolean }>> {
  await requireAdmin();
  try {
    return { ok: true, data: await mediaUsage(url) };
  } catch (e) {
    return fail(e);
  }
}

export async function deleteMediaAction(id: number): Promise<MediaResult> {
  await requireAdmin();
  try {
    await deleteMedia(id);
    return { ok: true, data: undefined };
  } catch (e) {
    return fail(e);
  }
}
