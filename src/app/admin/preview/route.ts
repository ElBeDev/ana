import { draftMode } from "next/headers";
import { redirect } from "next/navigation";
import { getAdmin } from "@/lib/auth";

// Vista previa del borrador: /admin/preview activa Draft Mode; /admin/preview?off la apaga.
export async function GET(request: Request) {
  const off = new URL(request.url).searchParams.has("off");
  const draft = await draftMode();
  if (off) {
    draft.disable();
    redirect("/");
  }
  if (!(await getAdmin())) redirect("/admin/login");
  draft.enable();
  redirect("/");
}
