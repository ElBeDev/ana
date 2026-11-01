import { Suspense } from "react";
import { requireAdmin } from "@/lib/auth";
import { getEditorState } from "@/lib/content";
import { blobEnabled } from "@/lib/media";
import { Editor } from "@/editor/Editor";

export const instant = false;

async function EditorLoader() {
  await requireAdmin();
  const state = await getEditorState();
  return (
    <Editor
      initialData={state.draft}
      initialUnpublished={state.hasUnpublishedChanges}
      draftUpdatedAt={state.draftUpdatedAt.toISOString()}
      blobEnabled={blobEnabled()}
    />
  );
}

export default function EditorPage() {
  return (
    <Suspense fallback={<div className="adm-loading">Cargando editor…</div>}>
      <EditorLoader />
    </Suspense>
  );
}
