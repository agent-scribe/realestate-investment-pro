/**
 * Orchestrator that runs the full image → valuation pipeline and assembles the
 * final ValuationResult. Each stage degrades gracefully; non-fatal issues are
 * collected as warnings rather than thrown, so the user always gets the most
 * complete result the available data allows.
 */

import { analyzeImage } from "./vision";
import { resolveLocation } from "./geocode";
import { findComparables } from "./comparables";
import { estimateValue } from "./valuation";
import { generateReport } from "./report";
import { toDataUrl, type StoredImage } from "./imageStorage";
import type { ValuationResult, ValuationWarning } from "./types";

/**
 * Run the valuation pipeline for an already-stored image.
 * @param stored  Result of imageStorage.storeUpload.
 * @param buffer  Raw bytes of the stored image (for the vision model).
 */
export async function runValuation(
  stored: StoredImage,
  buffer: Buffer
): Promise<ValuationResult> {
  const startedAt = Date.now();
  const warnings: ValuationWarning[] = [];

  const imageUrl = `/api/valuation/image/${stored.id}`;

  // ── Stage 1: Vision ──
  const imageAnalysis = await analyzeImage(toDataUrl(buffer, stored.mimeType));
  if (imageAnalysis.source === "estimated") {
    warnings.push({
      code: "VISION_FALLBACK",
      message:
        "Detailed image analysis was unavailable; a baseline profile was used.",
    });
  }

  // ── Stage 2: Geolocation ──
  const location = await resolveLocation(imageAnalysis);
  if (!location) {
    // Location is required to find comparables — degrade with a clear report.
    warnings.push({
      code: "LOCATION_UNDETERMINED",
      message:
        "The property's location could not be determined from the image. Add a recognizable landmark, street sign, or house number for better results.",
    });
    return {
      imageId: stored.id,
      imageUrl,
      imageAnalysis,
      location: null,
      estimate: null,
      comparables: [],
      market: null,
      report:
        "## Location Could Not Be Determined\n\nWe analyzed the image but could not identify the property's location, so a market valuation cannot be produced. To get an estimate, upload a photo that includes a recognizable landmark, a visible street sign, a house number, or a wider exterior view of the surroundings.",
      warnings,
      elapsedMs: Date.now() - startedAt,
    };
  }
  if (location.approximate) {
    warnings.push({
      code: "LOCATION_APPROXIMATE",
      message: `Location resolved approximately to ${location.formattedAddress}.`,
    });
  }

  // ── Stage 3: Comparables + market data ──
  const { comparables, market } = await findComparables(location, imageAnalysis);
  if (comparables.every((c) => c.source === "estimated")) {
    warnings.push({
      code: "SYNTHETIC_COMPS",
      message:
        "No live real-estate data source returned results; comparables are model-generated estimates.",
    });
  }

  // ── Stage 4: Value estimate ──
  const estimate = estimateValue(comparables, imageAnalysis, location);
  if (!estimate) {
    warnings.push({
      code: "INSUFFICIENT_DATA",
      message:
        "Not enough comparable data was available to compute a reliable value.",
    });
    return {
      imageId: stored.id,
      imageUrl,
      imageAnalysis,
      location,
      estimate: null,
      comparables,
      market,
      report:
        "## Insufficient Market Data\n\nWe located the property but could not find enough comparable sales or listings nearby to produce a reliable valuation. Try a property in a more active market, or supply additional details.",
      warnings,
      elapsedMs: Date.now() - startedAt,
    };
  }

  // ── Stage 5: AI report ──
  const report = await generateReport({
    analysis: imageAnalysis,
    location,
    estimate,
    comparables,
    market,
  });

  return {
    imageId: stored.id,
    imageUrl,
    imageAnalysis,
    location,
    estimate,
    comparables,
    market,
    report,
    warnings,
    elapsedMs: Date.now() - startedAt,
  };
}
