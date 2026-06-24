import { NextResponse } from "next/server";

import { requireTenantContext } from "@/lib/api/tenant-context";
import {
  parseContactPhoneUpload,
  SERVER_PARSE_EXTENSIONS,
} from "@/lib/contact-phone-file-parser";
import { getContactPhoneUploadExtension } from "@/lib/contact-phone-import";

const MAX_FILE_SIZE_BYTES = 50 * 1024 * 1024;

const SERVER_EXTENSION_SET = new Set<string>(SERVER_PARSE_EXTENSIONS);

export async function POST(request: Request) {
  const { error } = await requireTenantContext();
  if (error) return error;

  let formData: FormData;
  try {
    formData = await request.formData();
  } catch {
    return NextResponse.json(
      { error: "Invalid upload payload." },
      { status: 400 },
    );
  }

  const file = formData.get("file");
  if (!(file instanceof File)) {
    return NextResponse.json(
      { error: "A file is required." },
      { status: 400 },
    );
  }

  const extension = getContactPhoneUploadExtension(file.name);
  if (!extension || !SERVER_EXTENSION_SET.has(extension)) {
    return NextResponse.json(
      {
        error:
          "Unsupported file type. Upload Excel (.xlsx/.xls), PDF, or Word (.docx).",
      },
      { status: 400 },
    );
  }

  if (file.size > MAX_FILE_SIZE_BYTES) {
    return NextResponse.json(
      { error: "File exceeds the 50 MB limit." },
      { status: 400 },
    );
  }

  try {
    const buffer = Buffer.from(await file.arrayBuffer());
    const result = await parseContactPhoneUpload(buffer, file.name);

    if (result.phones.length === 0) {
      return NextResponse.json(
        {
          error:
            result.invalid > 0
              ? "No valid phone numbers found. Each number must be exactly 10 digits."
              : "No phone numbers found in the uploaded file.",
        },
        { status: 400 },
      );
    }

    return NextResponse.json(result);
  } catch (err) {
    const message =
      err instanceof Error
        ? err.message
        : "Unable to parse the uploaded file.";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
