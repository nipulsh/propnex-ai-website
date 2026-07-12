import { Router } from "express";
import multer from "multer";

import { requireAgentsWrite } from "@/lib/integrations/api-guard";
import {
  parseContactPhoneUpload,
  SERVER_PARSE_EXTENSIONS,
} from "@/lib/contact-phone-file-parser";
import { DEFAULT_CONTACT_PHONE_COUNTRY } from "@/lib/country-dial-codes";
import { getContactPhoneUploadExtension } from "@/lib/contact-phone-import";

const MAX_FILE_SIZE_BYTES = 50 * 1024 * 1024;
const SERVER_EXTENSION_SET = new Set<string>(SERVER_PARSE_EXTENSIONS);
const upload = multer({ limits: { fileSize: MAX_FILE_SIZE_BYTES } });

export const contactPhonesRouter = Router();

contactPhonesRouter.post(
  "/parse-upload",
  requireAgentsWrite(),
  upload.single("file"),
  async (req, res) => {
    const file = req.file;
    if (!file) {
      res.status(400).json({ error: "A file is required." });
      return;
    }

    const extension = getContactPhoneUploadExtension(file.originalname);
    if (!extension || !SERVER_EXTENSION_SET.has(extension)) {
      res.status(400).json({
        error:
          "Unsupported file type. Upload Excel (.xlsx/.xls), PDF, or Word (.docx).",
      });
      return;
    }

    const defaultCountryRaw = req.body?.defaultCountry;
    const defaultCountry =
      typeof defaultCountryRaw === "string" && defaultCountryRaw.trim()
        ? defaultCountryRaw.trim()
        : DEFAULT_CONTACT_PHONE_COUNTRY;

    try {
      const result = await parseContactPhoneUpload(file.buffer, file.originalname, {
        defaultCountry,
      });

      if (result.contacts.length === 0) {
        res.status(400).json({
          error:
            result.invalid > 0
              ? "No valid phone numbers found. Use country (ISO code) and a 10-digit phone column, or a supported default country for unstructured files."
              : "No phone numbers found in the uploaded file.",
        });
        return;
      }

      res.json(result);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Unable to parse the uploaded file.";
      res.status(400).json({ error: message });
    }
  },
);
