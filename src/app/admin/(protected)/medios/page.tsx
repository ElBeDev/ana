import { Suspense } from "react";
import { listMedia, blobEnabled } from "@/lib/media";
import { MediaLibrary, BlobContext } from "@/editor/MediaLibrary";

async function Library() {
  const items = await listMedia();
  return (
    <BlobContext value={blobEnabled()}>
      <MediaLibrary mode="page" initial={items} />
    </BlobContext>
  );
}

export default function MediaPage() {
  return (
    <>
      <header className="adm-head">
        <h1>Medios</h1>
        <span className="adm-muted">JPG, PNG, WebP o AVIF · hasta 8 MB · las fotos grandes se reducen solas</span>
      </header>
      <Suspense fallback={<p className="adm-muted">Cargando…</p>}>
        <Library />
      </Suspense>
    </>
  );
}
