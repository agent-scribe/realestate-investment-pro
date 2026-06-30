/**
 * Value-estimation stage: derive a market value, value range, and a 0–100
 * confidence score from the comparable set, image analysis, and resolved
 * location.
 *
 * The estimate is a distance- and recency-weighted blend of comparable
 * price-per-square-foot (when sqft is known) or raw price, scaled to the
 * subject's estimated size and adjusted for visible condition.
 */

import type {
  Comparable,
  GeoLocation,
  ImageAnalysis,
  ValueEstimate,
} from "./types";

const CONDITION_FACTOR: Record<string, number> = {
  excellent: 1.1,
  good: 1.0,
  fair: 0.92,
  poor: 0.82,
  unknown: 1.0,
};

/** Recency weight: listings within ~6 months count fully, older decays. */
function recencyWeight(date: string | null): number {
  if (!date) return 0.6;
  const ts = Date.parse(date);
  if (Number.isNaN(ts)) return 0.6;
  const ageDays = (Date.now() - ts) / 86_400_000;
  if (ageDays <= 90) return 1;
  if (ageDays >= 365) return 0.4;
  return 1 - ((ageDays - 90) / (365 - 90)) * 0.6;
}

/** Distance weight: nearer comps count more (inverse-ish, capped). */
function distanceWeight(miles: number | null): number {
  if (miles === null) return 0.6;
  if (miles <= 0.5) return 1;
  if (miles >= 10) return 0.25;
  return 1 / (1 + miles / 2);
}

/** Coefficient of variation — lower spread ⇒ tighter, more confident estimate. */
function coefficientOfVariation(values: number[]): number {
  if (values.length < 2) return 0.5;
  const mean = values.reduce((a, b) => a + b, 0) / values.length;
  if (mean === 0) return 0.5;
  const variance =
    values.reduce((a, b) => a + (b - mean) ** 2, 0) / values.length;
  return Math.sqrt(variance) / mean;
}

/**
 * Estimate the subject value. Returns `null` when there are no usable
 * comparables (caller treats this as INSUFFICIENT_DATA).
 */
export function estimateValue(
  comparables: Comparable[],
  analysis: ImageAnalysis,
  location: GeoLocation
): ValueEstimate | null {
  if (comparables.length === 0) return null;

  const subjectSqft = analysis.estimatedSqft;
  const conditionFactor = CONDITION_FACTOR[analysis.condition] ?? 1.0;

  // Build weighted samples. Prefer $/sqft scaling when both subject and comp
  // have sqft; otherwise fall back to the comp's raw price.
  let weightSum = 0;
  let valueAccum = 0;
  const normalizedValues: number[] = [];

  for (const c of comparables) {
    const w = distanceWeight(c.distanceMiles) * recencyWeight(c.date);
    let estFromComp: number;
    if (subjectSqft && c.pricePerSqft) {
      estFromComp = c.pricePerSqft * subjectSqft;
    } else if (subjectSqft && c.sqft && c.sqft > 0) {
      estFromComp = (c.price / c.sqft) * subjectSqft;
    } else {
      estFromComp = c.price;
    }
    valueAccum += estFromComp * w;
    weightSum += w;
    normalizedValues.push(estFromComp);
  }

  if (weightSum === 0) return null;

  const rawEstimate = (valueAccum / weightSum) * conditionFactor;
  const estimatedValue = Math.round(rawEstimate / 1000) * 1000;

  // ── Confidence scoring (0–100) ──
  const cv = coefficientOfVariation(normalizedValues);
  const realDataCount = comparables.filter(
    (c) => c.source === "marketplace"
  ).length;

  const factors: string[] = [];
  let confidence = 40; // baseline

  // Location quality
  confidence += location.confidence * 25;
  if (location.approximate) {
    factors.push("Location is approximate, which widens the value range.");
  } else {
    factors.push("Location resolved to a precise address.");
  }

  // Comparable count
  if (comparables.length >= 5) {
    confidence += 12;
    factors.push(`${comparables.length} comparables available.`);
  } else {
    confidence += comparables.length * 2;
    factors.push(`Only ${comparables.length} comparables found.`);
  }

  // Real vs synthetic data
  if (realDataCount >= 3) {
    confidence += 15;
    factors.push("Backed by live marketplace data.");
  } else if (realDataCount > 0) {
    confidence += 7;
    factors.push("Partially backed by live marketplace data.");
  } else {
    factors.push("Based on synthetic comparables (no live data source).");
  }

  // Price agreement (low spread is good)
  if (cv < 0.1) {
    confidence += 12;
    factors.push("Comparable prices are tightly clustered.");
  } else if (cv < 0.2) {
    confidence += 6;
  } else {
    factors.push("Comparable prices vary widely.");
  }

  // Subject size known
  if (subjectSqft) {
    confidence += 5;
  } else {
    factors.push("Subject square footage unknown — estimate uses raw prices.");
  }

  // Vision confidence nudge
  confidence += analysis.confidence * 6;

  // Hard cap when there is no live market grounding — synthetic comps should
  // never read as high-confidence regardless of internal agreement.
  if (realDataCount === 0) {
    confidence = Math.min(confidence, 70);
  }

  confidence = Math.max(5, Math.min(95, Math.round(confidence)));

  // Range widens as confidence drops (≈ ±8% at high conf, ±25% at low).
  const spread = 0.08 + (1 - confidence / 100) * 0.17;
  const valueLow = Math.round((estimatedValue * (1 - spread)) / 1000) * 1000;
  const valueHigh = Math.round((estimatedValue * (1 + spread)) / 1000) * 1000;

  return {
    estimatedValue,
    valueLow,
    valueHigh,
    confidence,
    confidenceFactors: factors,
    pricePerSqft: subjectSqft
      ? Math.round(estimatedValue / subjectSqft)
      : null,
  };
}
