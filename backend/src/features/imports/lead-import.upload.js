import multer from "multer";
import { AppError } from "../../core/errors/app-error.js";

const MAX_IMPORT_BYTES = 10 * 1024 * 1024;
const allowed = new Set([
  "text/csv",
  "application/csv",
  "application/vnd.ms-excel",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
]);

export const leadImportUpload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: MAX_IMPORT_BYTES, files: 1 },
  fileFilter: (_req, file, callback) => {
    const name = String(file.originalname || "").toLowerCase();
    if (!allowed.has(file.mimetype) && !name.endsWith(".csv") && !name.endsWith(".xlsx")) {
      return callback(new AppError("Upload a CSV or XLSX file", { statusCode: 415, code: "IMPORT_TYPE_UNSUPPORTED" }));
    }
    return callback(null, true);
  },
});
