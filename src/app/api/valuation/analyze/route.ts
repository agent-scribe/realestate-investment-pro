/**
 * POST /api/valuation/analyze
 *
 * Accepts a multipart/form-data upload with an `image` field, securely stores
 * and validates it, then runs the full AI valuation pipeline and returns a
 * ValuationResult. All external-provider failures degrade gracefully inside the
 * pipeline; this handler only returns a hard error for invalid uploads or an
 * unexpected internal fault.
 */

import { NextRequest, NextResponse } from "next/server";
import {
  storeUpload,
  readStoredImage,
  UploadValidationError,
} from "@/lib/valuation/imageStorage";
import { runValuation } from "@/lib/valuation/pipeline";
import type { ValuationError } from "@/lib/valuation/types";

// The pipeline does file I/O + outbound HTTP — must run on the Node runtime.
export const runtime = "nodejs";
// Valuation can take a while when calling external models/APIs.
export const maxDuration = 60;

function errorResponse(error: ValuationError, status: number) {
  return NextResponse.json({ error }, { status });
}

export async function POST(request: NextRequest) {
  // ── Parse multipart body ──
  let formData: FormData;
  try {
    formData = await request.formData();
  } catch {
    return errorResponse(
      { code: "INVALID_UPLOAD", message: "Expected multipart/form-data with an image." },
      400
    );
  }

  const file = formData.get("image");
  if (!(file instanceof File)) {
    return errorResponse(
      { code: "INVALID_UPLOAD", message: "Missing 'image' file field." },
      400
    );
  }

  // ── Validate + store ──
  let stored;
  try {
    stored = await storeUpload(file);
  } catch (err) {
    if (err instanceof UploadValidationError) {
      const status = err.code === "FILE_TOO_LARGE" ? 413 : 400;
      return errorResponse({ code: err.code, message: err.message }, status);
    }
    return errorResponse(
      { code: "INTERNAL_ERROR", message: "Failed to store the uploaded image." },
      500
    );
  }

  // ── Run pipeline ──
  try {
    const img = await readStoredImage(stored.id);
    if (!img) {
      return errorResponse(
        { code: "INTERNAL_ERROR", message: "Stored image could not be read back." },
        500
      );
    }
    const result = await runValuation(stored, img.buffer);
    return NextResponse.json(result, { status: 200 });
  } catch {
    return errorResponse(
      { code: "INTERNAL_ERROR", message: "Valuation failed unexpectedly. Please try again." },
      500
    );
  }
}
