import { env } from "../../../config/env.js";
import { deleteLocalFile, readLocalFile, saveLocalFile } from "./local-storage.js";
import { deleteS3File, readS3File, saveS3File } from "./s3-storage.js";

const providers = {
  local: { save: saveLocalFile, read: readLocalFile, remove: deleteLocalFile },
  s3: { save: saveS3File, read: readS3File, remove: deleteS3File },
};

export const storageProvider = providers[env.storage.provider];
