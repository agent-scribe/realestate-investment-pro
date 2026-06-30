/**
 * Secure image storage for the valuation pipeline.
 *
 * Uploaded images are validated (MIME allow-list + magic-byte sniffing + size
 * cap), optionally optimized (re-encoded/resized when the optional `sharp`
 * dependency is installed), and written to a NON-public directory outside
 * `public/` so files can only be retrieved through the access-controlled
 * `/api/valuation/image/[id]` route. Filenames are content hashes, which
 * deduplicates identical uploads and removes any user-controlled path segment
 * (defeats path-traversal).
 */

import { createHash } from "node:crypto";
import { mkdir, readFile, writeFile, access } from "node:fs/promises";
import path from "node:path";

/** Max accepted upload size (bytes). */
export const MAX_UPLOAD_BYTES = 10 * 1024 * 1024; // 10 MB

/** Allowed MIME types mapped to canonical file extensions. */
const ALLOWED_TYPES: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
};

/** Absolute path to the private upload directory (gitignored, never served). */
const UPLOAD_DIR = path.join(process.cwd(), ".uploads");

export interface StoredImage {
  /** Content-hash id, also the on-disk filename stem. */
  id: string;
  /** Absolute path on disk. */
  filePath: string;
  mimeType: string;
  ext: string;
  bytes: number;
}

export class UploadValidationError extends Error {
  constructor(
    public readonly code: "FILE_TOO_LARGE" | "UNSUPPORTED_TYPE" | "INVALID_UPLOAD",
    message: string
  ) {
    super(message);
    this.name = "UploadValidationError";
  }
}

/**
 * Sniff the real image type from the leading bytes. Prevents a renamed/forged
 * file from slipping past the declared MIME type.
 */
function sniffMimeType(buf: Buffer): string | null {
  if (buf.length < 12) return null;
  // JPEG: FF D8 FF
  if (buf[0] === 0xff && buf[1] === 0xd8 && buf[2] === 0xff) return "image/jpeg";
  // PNG: 89 50 4E 47 0D 0A 1A 0A
  if (
    buf[0] === 0x89 &&
    buf[1] === 0x50 &&
    buf[2] === 0x4e &&
    buf[3] === 0x47
  ) {
    return "image/png";
  }
  // WEBP: "RIFF"...."WEBP"
  if (
    buf[0] === 0x52 &&
    buf[1] === 0x49 &&
    buf[2] === 0x46 &&
    buf[3] === 0x46 &&
    buf[8] === 0x57 &&
    buf[9] === 0x45 &&
    buf[10] === 0x42 &&
    buf[11] === 0x50
  ) {
    return "image/webp";
  }
  return null;
}

/**
 * Optionally optimize the image with `sharp` if it is installed. Resizes to a
 * sane max dimension and re-encodes to compressed WebP. If `sharp` is absent
 * (it is an optional dependency), the original buffer is returned untouched so
 * the pipeline still works.
 */
async function optimize(
  buf: Buffer,
  mimeType: string
): Promise<{ buffer: Buffer; mimeType: string; ext: string }> {
  try {
    // Dynamic import so the module is only required when present.
    const mod = (await import("sharp").catch(() => null)) as
      | { default: (input: Buffer) => SharpLike }
      | null;
    if (!mod?.default) {
      return { buffer: buf, mimeType, ext: ALLOWED_TYPES[mimeType] };
    }
    const optimized = await mod
      .default(buf)
      .rotate() // honor EXIF orientation
      .resize({ width: 1600, height: 1600, fit: "inside", withoutEnlargement: true })
      .webp({ quality: 82 })
      .toBuffer();
    return { buffer: optimized, mimeType: "image/webp", ext: "webp" };
  } catch {
    // Any optimization failure is non-fatal — keep the validated original.
    return { buffer: buf, mimeType, ext: ALLOWED_TYPES[mimeType] };
  }
}

/** Minimal structural type for the bits of `sharp` we use. */
interface SharpLike {
  rotate: () => SharpLike;
  resize: (opts: Record<string, unknown>) => SharpLike;
  webp: (opts: Record<string, unknown>) => SharpLike;
  toBuffer: () => Promise<Buffer>;
}

/**
 * Validate, optimize, and persist an uploaded image.
 * @throws UploadValidationError on invalid input.
 */
export async function storeUpload(file: File): Promise<StoredImage> {
  if (!file || typeof file.arrayBuffer !== "function") {
    throw new UploadValidationError("INVALID_UPLOAD", "No image file provided.");
  }
  if (file.size === 0) {
    throw new UploadValidationError("INVALID_UPLOAD", "Uploaded file is empty.");
  }
  if (file.size > MAX_UPLOAD_BYTES) {
    throw new UploadValidationError(
      "FILE_TOO_LARGE",
      `Image exceeds the ${Math.round(MAX_UPLOAD_BYTES / 1024 / 1024)}MB limit.`
    );
  }

  const raw = Buffer.from(await file.arrayBuffer());
  const sniffed = sniffMimeType(raw);
  if (!sniffed || !ALLOWED_TYPES[sniffed]) {
    throw new UploadValidationError(
      "UNSUPPORTED_TYPE",
      "Only JPEG, PNG, and WebP images are supported."
    );
  }

  const { buffer, mimeType, ext } = await optimize(raw, sniffed);

  // Content hash = stable, collision-resistant, path-safe id.
  const id = createHash("sha256").update(buffer).digest("hex").slice(0, 32);
  const fileName = `${id}.${ext}`;
  const filePath = path.join(UPLOAD_DIR, fileName);

  await mkdir(UPLOAD_DIR, { recursive: true });

  // Skip the write if an identical image already exists.
  const exists = await access(filePath).then(
    () => true,
    () => false
  );
  if (!exists) {
    await writeFile(filePath, buffer);
  }

  return { id, filePath, mimeType, ext, bytes: buffer.length };
}

/**
 * Resolve a stored image by id for serving. The id is sanitized to a hash-safe
 * charset, so it can never escape the upload directory.
 */
export async function readStoredImage(
  id: string
): Promise<{ buffer: Buffer; mimeType: string } | null> {
  const safeId = id.replace(/[^a-f0-9]/gi, "");
  if (!safeId || safeId.length > 64) return null;

  for (const [mime, ext] of Object.entries(ALLOWED_TYPES)) {
    const candidate = path.join(UPLOAD_DIR, `${safeId}.${ext}`);
    // Defense-in-depth: ensure the resolved path stays inside UPLOAD_DIR.
    if (!candidate.startsWith(UPLOAD_DIR)) continue;
    const buf = await readFile(candidate).catch(() => null);
    if (buf) return { buffer: buf, mimeType: mime };
  }
  return null;
}

/** Convert a stored image to a data URL for inline use by vision providers. */
export function toDataUrl(buffer: Buffer, mimeType: string): string {
  return `data:${mimeType};base64,${buffer.toString("base64")}`;
}
