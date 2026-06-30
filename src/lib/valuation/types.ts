/**
 * Shared types for the AI Image-Based Property Valuation pipeline.
 *
 * The pipeline runs in stages: image upload/storage → computer-vision analysis →
 * geolocation → comparable search → value estimation → AI report. Every stage is
 * designed to degrade gracefully: if an external provider (OpenAI, Google Maps,
 * a real-estate data API) is not configured, the stage falls back to an
 * algorithmic/synthetic implementation so the whole flow still returns a result.
 */

/** Property categories the vision model is asked to classify into. */
export type DetectedPropertyType =
  | "single-family"
  | "multi-unit"
  | "condo"
  | "commercial"
  | "land"
  | "unknown";

/** Subjective condition assessment from the image. */
export type PropertyCondition =
  | "excellent"
  | "good"
  | "fair"
  | "poor"
  | "unknown";

/** Where a given piece of data ultimately came from — surfaced in the UI so the
 *  user knows whether they are looking at live or estimated data. */
export type DataSource = "ai" | "google" | "marketplace" | "estimated";

/**
 * Structured output of the computer-vision stage.
 */
export interface ImageAnalysis {
  propertyType: DetectedPropertyType;
  condition: PropertyCondition;
  /** 0–1 confidence the model has in its own visual read. */
  confidence: number;
  /** Estimated above-grade living area in square feet, if inferable. */
  estimatedSqft: number | null;
  estimatedBeds: number | null;
  estimatedBaths: number | null;
  /** Notable visual features (e.g. "two-car garage", "new roof", "pool"). */
  features: string[];
  /**
   * Free-text geolocation clues read from the image — visible street signs,
   * business names, license-plate regions, architectural style, terrain,
   * vegetation, etc. Fed to the geocoder.
   */
  locationHints: string[];
  /** Best-guess place string the model can read/infer, if any. */
  inferredPlace: string | null;
  /** Short human-readable summary of what the model saw. */
  summary: string;
  source: DataSource;
}

/** Resolved geolocation for the property. */
export interface GeoLocation {
  lat: number;
  lng: number;
  formattedAddress: string;
  city: string | null;
  state: string | null;
  postalCode: string | null;
  country: string | null;
  /** 0–1 confidence in the resolved location. */
  confidence: number;
  source: DataSource;
  /** True when no location could be determined and a fallback/region was used. */
  approximate: boolean;
}

/** A single comparable property used to anchor the valuation. */
export interface Comparable {
  id: string;
  address: string;
  lat: number | null;
  lng: number | null;
  price: number;
  beds: number | null;
  baths: number | null;
  sqft: number | null;
  pricePerSqft: number | null;
  /** Straight-line distance from the subject in miles. */
  distanceMiles: number | null;
  /** "for-sale", "sold", "rental" etc. */
  status: string;
  /** ISO date of the listing/sale when known. */
  date: string | null;
  source: DataSource;
}

/** Aggregate market statistics for the subject area. */
export interface MarketData {
  medianPrice: number | null;
  medianPricePerSqft: number | null;
  averageDaysOnMarket: number | null;
  /** Year-over-year price change as a percentage (e.g. 4.2 = +4.2%). */
  yoyPriceChangePercent: number | null;
  inventoryCount: number | null;
  source: DataSource;
}

/** The estimated value with a range and confidence. */
export interface ValueEstimate {
  estimatedValue: number;
  valueLow: number;
  valueHigh: number;
  /** 0–100 overall confidence score for the valuation. */
  confidence: number;
  /** Human-readable factors that raised or lowered confidence. */
  confidenceFactors: string[];
  pricePerSqft: number | null;
}

/** Non-fatal warnings accumulated during the pipeline (e.g. fell back to
 *  synthetic comps). Shown to the user for transparency. */
export interface ValuationWarning {
  code: string;
  message: string;
}

/** The complete result returned by POST /api/valuation/analyze. */
export interface ValuationResult {
  imageId: string;
  imageUrl: string;
  imageAnalysis: ImageAnalysis;
  location: GeoLocation | null;
  estimate: ValueEstimate | null;
  comparables: Comparable[];
  market: MarketData | null;
  /** Markdown valuation report. */
  report: string;
  warnings: ValuationWarning[];
  /** Wall-clock time spent in the pipeline, milliseconds. */
  elapsedMs: number;
}

/** Structured error payload for fatal failures. */
export interface ValuationError {
  code:
    | "INVALID_UPLOAD"
    | "FILE_TOO_LARGE"
    | "UNSUPPORTED_TYPE"
    | "LOCATION_UNDETERMINED"
    | "INSUFFICIENT_DATA"
    | "INTERNAL_ERROR";
  message: string;
}
