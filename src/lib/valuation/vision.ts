/**
 * Computer-vision stage: analyze a property image and extract structured
 * attributes plus geolocation clues.
 *
 * Uses OpenAI's vision-capable chat model when `OPENAI_API_KEY` is set; falls
 * back to a deterministic heuristic so the pipeline always returns something.
 * This mirrors the existing /api/analyze route's "real-model-or-fallback"
 * pattern.
 */

import type {
  DetectedPropertyType,
  ImageAnalysis,
  PropertyCondition,
} from "./types";

const VISION_MODEL = process.env.OPENAI_VISION_MODEL || "gpt-4o";

const SYSTEM_PROMPT = `You are an expert real-estate appraiser and computer-vision analyst.
Analyze the property photo and return STRICT JSON only (no prose, no markdown).
Carefully look for any clues that could geolocate the property: street signs,
house numbers, business names, license-plate styles, architectural style,
terrain, vegetation, climate cues, and skyline/landmarks.

Return this exact JSON shape:
{
  "propertyType": "single-family" | "multi-unit" | "condo" | "commercial" | "land" | "unknown",
  "condition": "excellent" | "good" | "fair" | "poor" | "unknown",
  "confidence": number (0-1),
  "estimatedSqft": number | null,
  "estimatedBeds": number | null,
  "estimatedBaths": number | null,
  "features": string[],
  "locationHints": string[],
  "inferredPlace": string | null,
  "summary": string
}`;

const VALID_TYPES: DetectedPropertyType[] = [
  "single-family",
  "multi-unit",
  "condo",
  "commercial",
  "land",
  "unknown",
];
const VALID_CONDITIONS: PropertyCondition[] = [
  "excellent",
  "good",
  "fair",
  "poor",
  "unknown",
];

/** Clamp a number into a range, returning a fallback for non-finite input. */
function clamp(n: unknown, min: number, max: number, fallback: number): number {
  const v = typeof n === "number" && Number.isFinite(n) ? n : fallback;
  return Math.min(max, Math.max(min, v));
}

function asStringArray(v: unknown): string[] {
  if (!Array.isArray(v)) return [];
  return v.filter((x): x is string => typeof x === "string" && x.trim().length > 0).slice(0, 12);
}

function numberOrNull(v: unknown): number | null {
  return typeof v === "number" && Number.isFinite(v) && v > 0 ? v : null;
}

/** Coerce arbitrary model output into a safe, well-typed ImageAnalysis. */
function normalize(raw: Record<string, unknown>): ImageAnalysis {
  const propertyType = VALID_TYPES.includes(raw.propertyType as DetectedPropertyType)
    ? (raw.propertyType as DetectedPropertyType)
    : "unknown";
  const condition = VALID_CONDITIONS.includes(raw.condition as PropertyCondition)
    ? (raw.condition as PropertyCondition)
    : "unknown";

  return {
    propertyType,
    condition,
    confidence: clamp(raw.confidence, 0, 1, 0.5),
    estimatedSqft: numberOrNull(raw.estimatedSqft),
    estimatedBeds: numberOrNull(raw.estimatedBeds),
    estimatedBaths: numberOrNull(raw.estimatedBaths),
    features: asStringArray(raw.features),
    locationHints: asStringArray(raw.locationHints),
    inferredPlace:
      typeof raw.inferredPlace === "string" && raw.inferredPlace.trim()
        ? raw.inferredPlace.trim()
        : null,
    summary:
      typeof raw.summary === "string" && raw.summary.trim()
        ? raw.summary.trim()
        : "Visual analysis completed.",
    source: "ai",
  };
}

/** Deterministic fallback used when no vision model is configured/available. */
function heuristicAnalysis(): ImageAnalysis {
  return {
    propertyType: "single-family",
    condition: "good",
    confidence: 0.35,
    estimatedSqft: 1800,
    estimatedBeds: 3,
    estimatedBaths: 2,
    features: ["residential structure"],
    locationHints: [],
    inferredPlace: null,
    summary:
      "Vision model unavailable — using a neutral baseline profile. Provide an OpenAI API key for detailed image analysis.",
    source: "estimated",
  };
}

function hasOpenAIKey(): boolean {
  const key = process.env.OPENAI_API_KEY;
  return Boolean(key && key !== "demo" && !key.startsWith("sk-demo"));
}

/**
 * Analyze a property image supplied as a data URL.
 * Never throws — returns a heuristic baseline on any failure.
 */
export async function analyzeImage(dataUrl: string): Promise<ImageAnalysis> {
  if (!hasOpenAIKey()) return heuristicAnalysis();

  try {
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: VISION_MODEL,
        // Force valid JSON back from the model.
        response_format: { type: "json_object" },
        max_tokens: 700,
        temperature: 0.2,
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          {
            role: "user",
            content: [
              {
                type: "text",
                text: "Analyze this property image and return the JSON described.",
              },
              { type: "image_url", image_url: { url: dataUrl, detail: "low" } },
            ],
          },
        ],
      }),
      // Guard against a hung upstream call.
      signal: AbortSignal.timeout(30_000),
    });

    if (!response.ok) return heuristicAnalysis();

    const data = await response.json();
    const content: string | undefined = data?.choices?.[0]?.message?.content;
    if (!content) return heuristicAnalysis();

    const parsed = JSON.parse(content) as Record<string, unknown>;
    return normalize(parsed);
  } catch {
    return heuristicAnalysis();
  }
}
