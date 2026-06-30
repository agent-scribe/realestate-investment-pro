/**
 * GET /api/valuation/image/[id]
 *
 * Serves a stored valuation image. Images live OUTSIDE `public/` and are only
 * reachable through this route, which sanitizes the id to a hash-safe charset
 * (defeating path traversal) before resolving the file. Responses are cached
 * immutably since ids are content hashes.
 */

import { NextResponse } from "next/server";
import { readStoredImage } from "@/lib/valuation/imageStorage";

export const runtime = "nodejs";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const img = await readStoredImage(id);

  if (!img) {
    return NextResponse.json({ error: "Image not found." }, { status: 404 });
  }

  return new NextResponse(new Uint8Array(img.buffer), {
    status: 200,
    headers: {
      "Content-Type": img.mimeType,
      "Cache-Control": "public, max-age=31536000, immutable",
      "Content-Length": String(img.buffer.length),
      "X-Content-Type-Options": "nosniff",
    },
  });
}
