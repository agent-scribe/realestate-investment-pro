/**
 * Geolocation stage: turn the vision model's textual location clues into a
 * concrete address + GPS coordinates.
 *
 * Strategy:
 *   1. If GOOGLE_MAPS_API_KEY is set, query the Google Geocoding API with the
 *      best available place string / location hints.
 *   2. Optionally confirm Street-View imagery exists at the resolved point
 *      (helps validate a real, photographable location).
 *   3. If geocoding is unavailable or yields nothing, fall back to a coarse
 *      regional centroid when a US state can be inferred; otherwise signal that
 *      the location is undetermined so the caller can degrade gracefully.
 */

import type { GeoLocation, ImageAnalysis } from "./types";

/** Server-side Google key (NOT the NEXT_PUBLIC one used by the browser map). */
const GOOGLE_KEY = process.env.GOOGLE_MAPS_API_KEY || "";

/** Coarse centroids for US states — last-resort approximate fallback. */
const STATE_CENTROIDS: Record<string, { lat: number; lng: number; name: string }> = {
  AL: { lat: 32.8, lng: -86.8, name: "Alabama" },
  AK: { lat: 64.2, lng: -149.5, name: "Alaska" },
  AZ: { lat: 34.2, lng: -111.7, name: "Arizona" },
  AR: { lat: 34.9, lng: -92.4, name: "Arkansas" },
  CA: { lat: 36.8, lng: -119.4, name: "California" },
  CO: { lat: 39.0, lng: -105.5, name: "Colorado" },
  CT: { lat: 41.6, lng: -72.7, name: "Connecticut" },
  DE: { lat: 39.0, lng: -75.5, name: "Delaware" },
  FL: { lat: 27.8, lng: -81.7, name: "Florida" },
  GA: { lat: 32.6, lng: -83.4, name: "Georgia" },
  HI: { lat: 20.8, lng: -156.3, name: "Hawaii" },
  ID: { lat: 44.1, lng: -114.7, name: "Idaho" },
  IL: { lat: 40.0, lng: -89.2, name: "Illinois" },
  IN: { lat: 39.9, lng: -86.3, name: "Indiana" },
  IA: { lat: 42.0, lng: -93.5, name: "Iowa" },
  KS: { lat: 38.5, lng: -98.4, name: "Kansas" },
  KY: { lat: 37.5, lng: -85.3, name: "Kentucky" },
  LA: { lat: 31.1, lng: -92.0, name: "Louisiana" },
  ME: { lat: 45.4, lng: -69.2, name: "Maine" },
  MD: { lat: 39.0, lng: -76.8, name: "Maryland" },
  MA: { lat: 42.3, lng: -71.8, name: "Massachusetts" },
  MI: { lat: 44.3, lng: -85.6, name: "Michigan" },
  MN: { lat: 46.3, lng: -94.3, name: "Minnesota" },
  MS: { lat: 32.7, lng: -89.7, name: "Mississippi" },
  MO: { lat: 38.4, lng: -92.5, name: "Missouri" },
  MT: { lat: 46.9, lng: -110.5, name: "Montana" },
  NE: { lat: 41.5, lng: -99.8, name: "Nebraska" },
  NV: { lat: 39.3, lng: -116.6, name: "Nevada" },
  NH: { lat: 43.4, lng: -71.6, name: "New Hampshire" },
  NJ: { lat: 40.1, lng: -74.7, name: "New Jersey" },
  NM: { lat: 34.4, lng: -106.1, name: "New Mexico" },
  NY: { lat: 42.9, lng: -75.5, name: "New York" },
  NC: { lat: 35.6, lng: -79.4, name: "North Carolina" },
  ND: { lat: 47.5, lng: -100.5, name: "North Dakota" },
  OH: { lat: 40.4, lng: -82.8, name: "Ohio" },
  OK: { lat: 35.6, lng: -97.5, name: "Oklahoma" },
  OR: { lat: 44.0, lng: -120.5, name: "Oregon" },
  PA: { lat: 40.9, lng: -77.8, name: "Pennsylvania" },
  RI: { lat: 41.7, lng: -71.5, name: "Rhode Island" },
  SC: { lat: 33.9, lng: -80.9, name: "South Carolina" },
  SD: { lat: 44.4, lng: -100.2, name: "South Dakota" },
  TN: { lat: 35.9, lng: -86.4, name: "Tennessee" },
  TX: { lat: 31.5, lng: -99.3, name: "Texas" },
  UT: { lat: 39.3, lng: -111.7, name: "Utah" },
  VT: { lat: 44.1, lng: -72.7, name: "Vermont" },
  VA: { lat: 37.5, lng: -78.9, name: "Virginia" },
  WA: { lat: 47.4, lng: -120.5, name: "Washington" },
  WV: { lat: 38.6, lng: -80.6, name: "West Virginia" },
  WI: { lat: 44.6, lng: -89.9, name: "Wisconsin" },
  WY: { lat: 43.0, lng: -107.6, name: "Wyoming" },
};

interface GoogleAddressComponent {
  long_name: string;
  short_name: string;
  types: string[];
}

interface GoogleGeocodeResult {
  formatted_address: string;
  geometry: { location: { lat: number; lng: number }; location_type?: string };
  address_components: GoogleAddressComponent[];
}

function pickComponent(
  components: GoogleAddressComponent[],
  type: string,
  short = false
): string | null {
  const c = components.find((comp) => comp.types.includes(type));
  if (!c) return null;
  return short ? c.short_name : c.long_name;
}

/** Build the strongest possible query string from the vision output. */
function buildQuery(analysis: ImageAnalysis): string | null {
  if (analysis.inferredPlace) return analysis.inferredPlace;
  if (analysis.locationHints.length > 0) {
    return analysis.locationHints.join(", ");
  }
  return null;
}

/** Try to extract a 2-letter US state code from free text. */
function inferStateCode(analysis: ImageAnalysis): string | null {
  const haystack = [
    analysis.inferredPlace ?? "",
    ...analysis.locationHints,
  ]
    .join(" ")
    .toUpperCase();
  for (const code of Object.keys(STATE_CENTROIDS)) {
    // Word-boundary match on the abbreviation, or the full state name.
    const name = STATE_CENTROIDS[code].name.toUpperCase();
    if (new RegExp(`\\b${code}\\b`).test(haystack) || haystack.includes(name)) {
      return code;
    }
  }
  return null;
}

/** Optional Street-View presence check — boosts confidence when imagery exists. */
async function hasStreetView(lat: number, lng: number): Promise<boolean> {
  if (!GOOGLE_KEY) return false;
  try {
    const url = `https://maps.googleapis.com/maps/api/streetview/metadata?location=${lat},${lng}&key=${GOOGLE_KEY}`;
    const res = await fetch(url, { signal: AbortSignal.timeout(8_000) });
    if (!res.ok) return false;
    const data = await res.json();
    return data?.status === "OK";
  } catch {
    return false;
  }
}

/**
 * Resolve the property's location from the vision analysis.
 * Returns `null` only when no location can be determined at all.
 */
export async function resolveLocation(
  analysis: ImageAnalysis
): Promise<GeoLocation | null> {
  const query = buildQuery(analysis);

  // ── Primary path: Google Geocoding ──
  if (GOOGLE_KEY && query) {
    try {
      const url = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(
        query
      )}&key=${GOOGLE_KEY}`;
      const res = await fetch(url, { signal: AbortSignal.timeout(10_000) });
      if (res.ok) {
        const data = await res.json();
        const result: GoogleGeocodeResult | undefined = data?.results?.[0];
        if (data?.status === "OK" && result) {
          const { lat, lng } = result.geometry.location;
          // Precise rooftop matches and Street-View availability raise confidence.
          const precise = result.geometry.location_type === "ROOFTOP";
          const streetView = await hasStreetView(lat, lng);
          let confidence = 0.55;
          if (precise) confidence += 0.2;
          if (streetView) confidence += 0.15;
          confidence = Math.min(0.95, confidence + analysis.confidence * 0.1);

          return {
            lat,
            lng,
            formattedAddress: result.formatted_address,
            city:
              pickComponent(result.address_components, "locality") ??
              pickComponent(result.address_components, "postal_town"),
            state: pickComponent(
              result.address_components,
              "administrative_area_level_1",
              true
            ),
            postalCode: pickComponent(result.address_components, "postal_code"),
            country: pickComponent(result.address_components, "country", true),
            confidence,
            source: "google",
            approximate: !precise,
          };
        }
      }
    } catch {
      // fall through to regional fallback
    }
  }

  // ── Fallback: coarse state centroid ──
  const stateCode = inferStateCode(analysis);
  if (stateCode) {
    const c = STATE_CENTROIDS[stateCode];
    return {
      lat: c.lat,
      lng: c.lng,
      formattedAddress: `${c.name}, USA (approximate region)`,
      city: null,
      state: stateCode,
      postalCode: null,
      country: "US",
      confidence: 0.25,
      source: "estimated",
      approximate: true,
    };
  }

  // No usable location at all.
  return null;
}
