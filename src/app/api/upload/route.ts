import { handleUpload, type HandleUploadBody } from "@vercel/blob/client";
import { getAdmin } from "@/lib/auth";
import { ALLOWED_TYPES, MAX_BYTES } from "@/lib/media";

// Emite el token para que el navegador suba directo a Vercel Blob (sin pasar por la función,
// así no aplica el límite de 4.5 MB). El registro en la BD lo hace registerMediaAction.
export async function POST(request: Request) {
  const body = (await request.json()) as HandleUploadBody;
  try {
    const result = await handleUpload({
      body,
      request,
      onBeforeGenerateToken: async () => {
        if (!(await getAdmin())) throw new Error("No autorizado");
        return {
          allowedContentTypes: ALLOWED_TYPES,
          maximumSizeInBytes: MAX_BYTES,
          addRandomSuffix: true,
        };
      },
    });
    return Response.json(result);
  } catch (error) {
    return Response.json({ error: error instanceof Error ? error.message : "Error" }, { status: 400 });
  }
}
