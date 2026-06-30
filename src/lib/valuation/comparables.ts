/**
 * Comparable-search stage: find recent comparable properties and aggregate
 * market statistics for the subject location.
 *
 * Primary provider: RentCast (https://rentcast.io) via RENTCAST_API_KEY — its
 * AVM endpoint returns both a set of comparables and local market context. The
 * provider is intentionally isolated behind this module so it can be swapped
 * for ATTOM, Zillow, etc. without touching the rest of the pipeline.
 *
 * Fallback: when no real-estate API key is configured (or the call fails), a
 * synthetic comparable set is generated from a state-level price-per-square-foot
 * table so the valuation still has something to anchor on. Synthetic data is
 * clearly tagged with `source: "estimated"` end-to-end.
 */

import type {
  Comparable,
  DetectedPropertyType,
  GeoLocation,
  ImageAnalysis,
  MarketData,
} from "./types";

const RENTCAST_KEY = process.env.RENTCAST_API_KEY || "";
const RENTCAST_BASE = "https://api.rentcast.io/v1";

/** Approx. median residential price per square foot by US state (USD). */
const STATE_PPSF: Record<string, number> = {
  AL: 160, AK: 300, AZ: 290, AR: 150, CA: 560, CO: 350, CT: 270, DE: 240,
  FL: 290, GA: 220, HI: 720, ID: 320, IL: 200, IN: 165, IA: 165, KS: 165,
  KY: 165, LA: 165, ME: 290, MD: 280, MA: 470, MI: 185, MN: 230, MS: 145,
  MO: 175, MT: 360, NE: 185, NV: 290, NH: 320, NJ: 330, NM: 230, NY: 360,
  NC: 240, ND: 175, OH: 165, OK: 150, OR: 360, PA: 200, RI: 340, SC: 230,
  SD: 200, TN: 250, TX: 200, UT: 330, VT: 300, VA: 280, WA: 410, WV: 130,
  WI: 215, WY: 290,
};
const DEFAULT_PPSF = 230;

/** Condition multipliers applied to baseline value. */
const CONDITION_FACTOR: Record<string, number> = {
  excellent: 1.12,
  good: 1.0,
  fair: 0.9,
  poor: 0.78,
  unknown: 1.0,
};

/** Map our internal property type to RentCast's vocabulary. */
function toRentCastType(t: DetectedPropertyType): string {
  switch (t) {
    case "single-family":
      return "Single Family";
    case "condo":
      return "Condo";
    case "multi-unit":
      return "Multi-Family";
    case "land":
      return "Land";
    case "commercial":
      return "Single Family"; // RentCast has no commercial AVM; use closest residential anchor
    default:
      return "Single Family";
  }
}

/** Haversine distance in miles between two coordinates. */
function distanceMiles(
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number
): number {
  const R = 3958.8;
  const toRad = (d: number) => (d * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2;
  return Math.round(R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a)) * 100) / 100;
}

export interface ComparablesResult {
  comparables: Comparable[];
  market: MarketData | null;
}

interface RentCastComp {
  id?: string;
  formattedAddress?: string;
  latitude?: number;
  longitude?: number;
  price?: number;
  bedrooms?: number;
  bathrooms?: number;
  squareFootage?: number;
  listedDate?: string;
  removedDate?: string;
  distance?: number;
}

/** Fetch comparables + market data from RentCast's AVM endpoint. */
async function fetchRentCast(
  location: GeoLocation,
  analysis: ImageAnalysis
): Promise<ComparablesResult | null> {
  try {
    const params = new URLSearchParams({
      latitude: String(location.lat),
      longitude: String(location.lng),
      propertyType: toRentCastType(analysis.propertyType),
      compCount: "8",
    });
    if (analysis.estimatedBeds) params.set("bedrooms", String(analysis.estimatedBeds));
    if (analysis.estimatedBaths) params.set("bathrooms", String(analysis.estimatedBaths));
    if (analysis.estimatedSqft) params.set("squareFootage", String(analysis.estimatedSqft));

    const res = await fetch(`${RENTCAST_BASE}/avm/value?${params.toString()}`, {
      headers: { "X-Api-Key": RENTCAST_KEY, Accept: "application/json" },
      signal: AbortSignal.timeout(15_000),
    });
    if (!res.ok) return null;

    const data = await res.json();
    const rawComps: RentCastComp[] = Array.isArray(data?.comparables)
      ? data.comparables
      : [];
    if (rawComps.length === 0) return null;

    const comparables: Comparable[] = rawComps
      .filter((c) => typeof c.price === "number" && c.price > 0)
      .map((c, i) => {
        const sqft = c.squareFootage ?? null;
        return {
          id: c.id || `rc-${i}`,
          address: c.formattedAddress || "Address withheld",
          lat: c.latitude ?? null,
          lng: c.longitude ?? null,
          price: Math.round(c.price as number),
          beds: c.bedrooms ?? null,
          baths: c.bathrooms ?? null,
          sqft,
          pricePerSqft: sqft ? Math.round((c.price as number) / sqft) : null,
          distanceMiles:
            c.distance ??
            (c.latitude && c.longitude
              ? distanceMiles(location.lat, location.lng, c.latitude, c.longitude)
              : null),
          status: c.removedDate ? "sold" : "for-sale",
          date: c.listedDate || c.removedDate || null,
          source: "marketplace" as const,
        };
      });

    if (comparables.length === 0) return null;

    const prices = comparables.map((c) => c.price).sort((a, b) => a - b);
    const ppsfValues = comparables
      .map((c) => c.pricePerSqft)
      .filter((v): v is number => v !== null);
    const median = (arr: number[]) =>
      arr.length ? arr[Math.floor(arr.length / 2)] : null;

    const market: MarketData = {
      medianPrice: median(prices),
      medianPricePerSqft: median(ppsfValues.sort((a, b) => a - b)),
      averageDaysOnMarket: typeof data?.daysOnMarket === "number" ? data.daysOnMarket : null,
      yoyPriceChangePercent: null,
      inventoryCount: comparables.length,
      source: "marketplace",
    };

    return { comparables, market };
  } catch {
    return null;
  }
}

/** Deterministic pseudo-random in [0,1) from a seed — keeps synthetic data
 *  stable for a given location so repeated analyses don't jump around. */
function seeded(seed: number): () => number {
  let s = seed % 2147483647;
  if (s <= 0) s += 2147483646;
  return () => {
    s = (s * 16807) % 2147483647;
    return (s - 1) / 2147483646;
  };
}

/** Generate a synthetic comparable set anchored to state price-per-sqft. */
function syntheticComparables(
  location: GeoLocation,
  analysis: ImageAnalysis
): ComparablesResult {
  const ppsf =
    (location.state && STATE_PPSF[location.state]) || DEFAULT_PPSF;
  const baseSqft = analysis.estimatedSqft ?? 1800;
  const conditionFactor = CONDITION_FACTOR[analysis.condition] ?? 1.0;
  const rand = seeded(Math.round((location.lat + location.lng) * 1000) || 1);

  const today = Date.now();
  const comparables: Comparable[] = Array.from({ length: 6 }, (_, i) => {
    const sqftJitter = 1 + (rand() - 0.5) * 0.3; // ±15%
    const priceJitter = 1 + (rand() - 0.5) * 0.2; // ±10%
    const sqft = Math.round(baseSqft * sqftJitter);
    const price = Math.round(sqft * ppsf * conditionFactor * priceJitter);
    const daysAgo = Math.round(rand() * 150);
    return {
      id: `syn-${i}`,
      address: `Comparable ${i + 1} near ${
        location.city || location.state || "subject area"
      }`,
      lat: location.lat + (rand() - 0.5) * 0.03,
      lng: location.lng + (rand() - 0.5) * 0.03,
      price,
      beds: analysis.estimatedBeds ?? 3,
      baths: analysis.estimatedBaths ?? 2,
      sqft,
      pricePerSqft: Math.round(price / sqft),
      distanceMiles: Math.round(rand() * 200) / 100,
      status: rand() > 0.5 ? "sold" : "for-sale",
      date: new Date(today - daysAgo * 86_400_000).toISOString().slice(0, 10),
      source: "estimated" as const,
    };
  }).sort((a, b) => (a.distanceMiles ?? 0) - (b.distanceMiles ?? 0));

  const prices = comparables.map((c) => c.price).sort((a, b) => a - b);
  const market: MarketData = {
    medianPrice: prices[Math.floor(prices.length / 2)],
    medianPricePerSqft: Math.round(ppsf * conditionFactor),
    averageDaysOnMarket: 30 + Math.round(rand() * 40),
    yoyPriceChangePercent: Math.round((2 + rand() * 5) * 10) / 10,
    inventoryCount: comparables.length,
    source: "estimated",
  };

  return { comparables, market };
}

/**
 * Find comparables + market data for the subject property.
 * Always returns a result (real data when available, synthetic otherwise).
 */
export async function findComparables(
  location: GeoLocation,
  analysis: ImageAnalysis
): Promise<ComparablesResult> {
  if (RENTCAST_KEY) {
    const real = await fetchRentCast(location, analysis);
    if (real) return real;
  }
  return syntheticComparables(location, analysis);
}
