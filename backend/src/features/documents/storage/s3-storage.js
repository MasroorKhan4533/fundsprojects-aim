import crypto from "crypto";
import path from "path";
import { DeleteObjectCommand, GetObjectCommand, PutObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { env } from "../../../config/env.js";
import { AppError } from "../../../core/errors/app-error.js";

let client;

const getClient = () => {
  if (!client) {
    client = new S3Client({ region: env.storage.s3.region });
  }
  return client;
};
const safeExtension = (name) => path.extname(name || "").toLowerCase().replace(/[^.a-z0-9]/g, "").slice(0, 12);
const makeKey = (file) => `${env.storage.s3.prefix}/${crypto.randomUUID()}${safeExtension(file.originalname)}`;

export const saveS3File = async (file) => {
  const key = makeKey(file);
  await getClient().send(new PutObjectCommand({
    Bucket: env.storage.s3.bucket,
    Key: key,
    Body: file.buffer,
    ContentType: file.mimetype || "application/octet-stream",
    ServerSideEncryption: "AES256",
  }));
  return key;
};

const bodyToBuffer = async (body) => {
  if (!body) return Buffer.alloc(0);
  if (typeof body.transformToByteArray === "function") {
    return Buffer.from(await body.transformToByteArray());
  }
  const chunks = [];
  for await (const chunk of body) chunks.push(Buffer.from(chunk));
  return Buffer.concat(chunks);
};

export const readS3File = async (key) => {
  try {
    const result = await getClient().send(new GetObjectCommand({ Bucket: env.storage.s3.bucket, Key: key }));
    return bodyToBuffer(result.Body);
  } catch (error) {
    const status = error?.$metadata?.httpStatusCode;
    if (status === 404 || error?.name === "NoSuchKey") {
      throw new AppError("Stored document file is missing", { statusCode: 404, code: "DOCUMENT_FILE_MISSING" });
    }
    throw error;
  }
};

export const deleteS3File = async (key) => {
  await getClient().send(new DeleteObjectCommand({ Bucket: env.storage.s3.bucket, Key: key }));
};
