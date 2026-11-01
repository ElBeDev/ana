"use client";

import { upload } from "@vercel/blob/client";
import { registerMediaAction, uploadLocalAction, type MediaResult } from "@/app/admin/media-actions";
import type { MediaItem } from "@/lib/media";

const ALLOWED = ["image/jpeg", "image/png", "image/webp", "image/avif"];
const MAX_SIDE = 2400;
const MAX_BYTES = 8 * 1024 * 1024;

/**
 * Las fotos de celular suelen pesar varios MB: si la imagen es muy grande o es JPG/PNG pesado,
 * se reduce a 2400 px por lado y se convierte a WebP antes de subirla.
 */
async function prepare(file: File): Promise<{ file: File; width: number; height: number }> {
  if (!ALLOWED.includes(file.type)) throw new Error(`${file.name}: solo JPG, PNG, WebP o AVIF`);
  const bitmap = await createImageBitmap(file);
  const { width, height } = bitmap;
  const scale = Math.min(1, MAX_SIDE / Math.max(width, height));
  const heavy = (file.type === "image/jpeg" || file.type === "image/png") && file.size > 400 * 1024;
  if (scale === 1 && !heavy) {
    bitmap.close();
    return { file, width, height };
  }
  const w = Math.round(width * scale);
  const h = Math.round(height * scale);
  const canvas = new OffscreenCanvas(w, h);
  canvas.getContext("2d")!.drawImage(bitmap, 0, 0, w, h);
  bitmap.close();
  const blob = await canvas.convertToBlob({ type: "image/webp", quality: 0.85 });
  const name = file.name.replace(/\.[^.]+$/, "") + ".webp";
  return { file: new File([blob], name, { type: "image/webp" }), width: w, height: h };
}

export async function uploadImage(original: File, blobEnabled: boolean): Promise<MediaItem> {
  const { file, width, height } = await prepare(original);
  if (file.size > MAX_BYTES) throw new Error(`${original.name}: pesa más de 8 MB`);

  let result: MediaResult<MediaItem | undefined>;
  if (blobEnabled) {
    const blob = await upload(`media/${file.name}`, file, {
      access: "public",
      handleUploadUrl: "/api/upload",
      contentType: file.type,
    });
    result = await registerMediaAction({
      url: blob.url,
      pathname: blob.pathname,
      filename: original.name,
      contentType: file.type,
      size: file.size,
      width,
      height,
    });
  } else {
    const form = new FormData();
    form.set("file", file);
    form.set("width", String(width));
    form.set("height", String(height));
    result = await uploadLocalAction(form);
  }
  if (!result.ok) throw new Error(result.error);
  if (!result.data) throw new Error("La imagen ya estaba en la biblioteca");
  return result.data;
}
