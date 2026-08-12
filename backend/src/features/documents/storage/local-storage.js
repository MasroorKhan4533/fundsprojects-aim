import crypto from "crypto";
import fs from "fs/promises";
import path from "path";
import { env } from "../../../config/env.js";
import { AppError } from "../../../core/errors/app-error.js";

const storageRoot = path.resolve(process.cwd(), env.storage.localDir);
const safeExtension = (name) => path.extname(name || "").toLowerCase().replace(/[^.a-z0-9]/g, "").slice(0, 12);

export const saveLocalFile = async (file) => {
  await fs.mkdir(storageRoot, { recursive: true, mode: 0o700 });
  const key = `${crypto.randomUUID()}${safeExtension(file.originalname)}`;
  const target = path.join(storageRoot, key);
  await fs.writeFile(target, file.buffer, { mode: 0o600 });
  return key;
};

export const readLocalFile = async (key) => {
  const target = path.join(storageRoot, path.basename(key));
  try { return await fs.readFile(target); }
  catch (error) {
    if (error?.code === "ENOENT") throw new AppError("Stored document file is missing", { statusCode: 404, code: "DOCUMENT_FILE_MISSING" });
    throw error;
  }
};

export const deleteLocalFile = async (key) => {
  const target = path.join(storageRoot, path.basename(key));
  try { await fs.unlink(target); } catch (error) { if (error?.code !== "ENOENT") throw error; }
};
