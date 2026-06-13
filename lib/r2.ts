import "server-only";

import { randomUUID } from "node:crypto";
import {
  DeleteObjectCommand,
  GetObjectCommand,
  PutObjectCommand,
  S3Client,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

const accountId = process.env.R2_ACCOUNT_ID;
const accessKeyId = process.env.R2_ACCESS_KEY_ID;
const secretAccessKey = process.env.R2_SECRET_ACCESS_KEY;

export const R2_BUCKET = process.env.R2_BUCKET ?? "dkenang";

const endpoint =
  process.env.R2_ENDPOINT ??
  (accountId ? `https://${accountId}.r2.cloudflarestorage.com` : undefined);

let cachedClient: S3Client | null = null;

export function getR2Client(): S3Client {
  if (cachedClient) {
    return cachedClient;
  }

  if (!accessKeyId || !secretAccessKey || !endpoint) {
    throw new Error(
      "R2 belum dikonfigurasi. Set R2_ACCESS_KEY_ID, R2_SECRET_ACCESS_KEY, dan R2_ACCOUNT_ID di .env.local.",
    );
  }

  cachedClient = new S3Client({
    region: "auto",
    endpoint,
    credentials: { accessKeyId, secretAccessKey },
  });

  return cachedClient;
}

export function isR2Configured(): boolean {
  return Boolean(accessKeyId && secretAccessKey && endpoint);
}

/** Build a collision-free object key while keeping the original file name readable. */
export function buildStorageKey(fileName: string): string {
  const safeName = fileName
    .normalize("NFKD")
    .replace(/[^\w.\-]+/g, "_")
    .replace(/_{2,}/g, "_")
    .replace(/^_+|_+$/g, "")
    .slice(0, 180);

  return `uploads/${randomUUID()}/${safeName || "file"}`;
}

/** Presigned URL the browser uses to PUT the file straight to R2. */
export async function createUploadUrl(key: string, contentType: string) {
  const command = new PutObjectCommand({
    Bucket: R2_BUCKET,
    Key: key,
    ContentType: contentType || "application/octet-stream",
  });

  return getSignedUrl(getR2Client(), command, { expiresIn: 600 });
}

/** Short-lived presigned URL for downloading/viewing a stored object. */
export async function createDownloadUrl(key: string, downloadName?: string) {
  const command = new GetObjectCommand({
    Bucket: R2_BUCKET,
    Key: key,
    ...(downloadName
      ? {
          ResponseContentDisposition: `attachment; filename="${downloadName.replace(/"/g, "")}"`,
        }
      : {}),
  });

  return getSignedUrl(getR2Client(), command, { expiresIn: 600 });
}

export async function deleteObject(key: string) {
  await getR2Client().send(
    new DeleteObjectCommand({ Bucket: R2_BUCKET, Key: key }),
  );
}
