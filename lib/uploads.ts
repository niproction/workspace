import crypto from "crypto";
import fs from "fs/promises";
import path from "path";

const UPLOADS_DIR = path.join(process.cwd(), "uploads");
const MAX_SIZE_BYTES = 10 * 1024 * 1024; // 10 MB
const ALLOWED_MIMES = new Set([
  "application/pdf",
  "image/jpeg",
  "image/png",
  "image/webp",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
]);

export async function ensureUploadsDir(): Promise<void> {
  await fs.mkdir(UPLOADS_DIR, { recursive: true });
}

/** Generate a safe UUID-based filename with the correct extension */
export function safeName(mimeType: string): string {
  const ext = mimeToExt(mimeType);
  return `${crypto.randomUUID()}${ext}`;
}

function mimeToExt(mimeType: string): string {
  const map: Record<string, string> = {
    "application/pdf": ".pdf",
    "image/jpeg": ".jpg",
    "image/png": ".png",
    "image/webp": ".webp",
    "application/msword": ".doc",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document": ".docx",
  };
  return map[mimeType] ?? "";
}

export function isAllowedMime(mimeType: string): boolean {
  return ALLOWED_MIMES.has(mimeType);
}

export function isAllowedSize(sizeBytes: number): boolean {
  return sizeBytes <= MAX_SIZE_BYTES;
}

export async function saveUpload(buffer: Buffer, filename: string): Promise<void> {
  await ensureUploadsDir();
  await fs.writeFile(path.join(UPLOADS_DIR, filename), buffer);
}

export async function deleteUpload(filename: string): Promise<void> {
  // Validate filename to prevent path traversal: only UUID format + extension
  if (!/^[a-f0-9\-]{36}\.[a-z]{2,4}$/.test(filename)) return;
  try {
    await fs.unlink(path.join(UPLOADS_DIR, filename));
  } catch {
    // File may not exist — ignore
  }
}

export async function readUpload(filename: string): Promise<Buffer | null> {
  // Validate to prevent path traversal
  if (!/^[a-f0-9\-]{36}\.[a-z]{2,4}$/.test(filename)) return null;
  try {
    return await fs.readFile(path.join(UPLOADS_DIR, filename));
  } catch {
    return null;
  }
}

export { MAX_SIZE_BYTES };
