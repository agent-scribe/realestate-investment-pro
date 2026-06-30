/**
 * Orchestrator that runs the full image → valuation pipeline and assembles the
 * final ValuationResult. Each stage degrades gracefully; non-fatal issues are
 * collected as warnings rather than thrown, so the user always gets the most
 * complete result the available data allows.
 *
 * When DEMO_MODE=true (set in .env.local), every stage uses pre-built fixture
 * data from demo.ts instead of calling external providers. This makes the full
 * UI functional without any API keys — ideal for demoing or selling the project.
 * Buyers remove DEMO_MODE and add their own keys to switch to live data.
 */

import { analyzeImage } from "./vision";
import { resolveLocation } from "./geocode";
import { findComparables } from "./comparables";
import { estimateValue } from "./valuation";
import { generateReport } from "./report";
import { toDataUrl, type StoredImage } from "./imageStorage";
import type { ValuationResult, ValuationWarning } from "./types";
import {
  DEMO_IMAGE_ANALYSIS,
  DEMO_LOCATION,
  DEMO_COMPARABLES,
  DEMO_MARKET,
  DEMO_ESTIMATE,
  DEMO_REPORT,
} from "./demo";

const IS_DEMO = process.env.DEMO_MODE === "true";

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

  // ── Demo mode: return fixture data, skip all external calls ──
  if (IS_DEMO) {
    warnings.push({
      code: "DEMO_MODE",
      message:
        "Running in demo mode — results use representative sample data. Add your API keys and remove DEMO_MODE to enable live AI analysis.",
    });
    // Small artificial delay so the progress stepper is visible.
    await new Promise((r) => setTimeout(r, 3000));
    return {
      imageId: stored.id,
      imageUrl,
      imageAnalysis: DEMO_IMAGE_ANALYSIS,
      location: DEMO_LOCATION,
      estimate: DEMO_ESTIMATE,
      comparables: DEMO_COMPARABLES,
      market: DEMO_MARKET,
      report: DEMO_REPORT,
      warnings,
      elapsedMs: Date.now() - startedAt,
    };
  }

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
