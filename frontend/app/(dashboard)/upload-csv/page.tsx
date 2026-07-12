import { redirect } from "next/navigation";

import { requirePageAccess } from "@/lib/auth/require-page-permission";

export default async function UploadCsvPage() {
  await requirePageAccess("/call-logs");
  redirect("/call-logs");
}
