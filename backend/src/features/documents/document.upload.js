import multer from "multer";
import { AppError } from "../../core/errors/app-error.js";
import { env } from "../../config/env.js";

const allowed = new Set([
  "application/pdf",
  "image/png", "image/jpeg", "image/webp",
  "text/plain", "text/csv",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "application/vnd.ms-excel",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
]);

export const documentUpload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: env.storage.maxUploadBytes, files: 1 },
  fileFilter: (_req, file, callback) => {
    if (!allowed.has(file.mimetype)) return callback(new AppError("Unsupported document type", { statusCode: 415, code: "DOCUMENT_TYPE_UNSUPPORTED" }));
    return callback(null, true);
  },
});
