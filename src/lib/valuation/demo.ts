/**
 * Demo-mode fixtures for the valuation pipeline.
 *
 * When DEMO_MODE=true, every pipeline stage returns pre-built, realistic-
 * looking data instead of calling external providers. This lets the full UI
 * (upload → analysis → map → comps → report) work without any API keys so
 * the project can be demoed or sold as-is. Buyers swap in their real keys
 * and remove DEMO_MODE to switch to live data.
 *
 * The demo property is a single-family home in Denver, CO — consistent with
 * the existing PropertyAnalyzer example property.
 */

import type {
  Comparable,
  GeoLocation,
  ImageAnalysis,
  MarketData,
  ValueEstimate,
} from "./types";

export const DEMO_IMAGE_ANALYSIS: ImageAnalysis = {
  propertyType: "single-family",
  condition: "good",
  confidence: 0.82,
  estimatedSqft: 2100,
  estimatedBeds: 4,
  estimatedBaths: 2.5,
  features: [
    "two-car garage",
    "brick exterior",
    "covered front porch",
    "mature landscaping",
    "updated windows",
    "concrete driveway",
  ],
  locationHints: [
    "Colorado mountain backdrop visible",
    "Denver metro area architectural style",
    "Rocky Mountain region",
  ],
  inferredPlace: "Denver, CO",
  summary:
    "Well-maintained single-family brick residence with a two-car garage and covered porch. The property shows good overall condition with updated windows and mature landscaping. Colorado mountain backdrop visible in the background suggests a Denver metro location.",
  source: "ai",
};

export const DEMO_LOCATION: GeoLocation = {
  lat: 39.7149,
  lng: -104.9887,
  formattedAddress: "University Hills, Denver, CO 80210, USA",
  city: "Denver",
  state: "CO",
  postalCode: "80210",
  country: "US",
  confidence: 0.78,
  source: "google",
  approximate: false,
};

export const DEMO_COMPARABLES: Comparable[] = [
  {
    id: "demo-1",
    address: "2847 S Clermont St, Denver, CO 80222",
    lat: 39.6981,
    lng: -104.9412,
    price: 748000,
    beds: 4,
    baths: 2,
    sqft: 2050,
    pricePerSqft: 365,
    distanceMiles: 0.42,
    status: "sold",
    date: "2026-05-14",
    source: "marketplace",
  },
  {
    id: "demo-2",
    address: "3124 S Dahlia St, Denver, CO 80222",
    lat: 39.6944,
    lng: -104.9356,
    price: 712000,
    beds: 3,
    baths: 2,
    sqft: 1980,
    pricePerSqft: 360,
    distanceMiles: 0.68,
    status: "sold",
    date: "2026-04-28",
    source: "marketplace",
  },
  {
    id: "demo-3",
    address: "2219 S Josephine St, Denver, CO 80210",
    lat: 39.7182,
    lng: -104.9701,
    price: 785000,
    beds: 4,
    baths: 3,
    sqft: 2240,
    pricePerSqft: 350,
    distanceMiles: 0.91,
    status: "for-sale",
    date: "2026-06-01",
    source: "marketplace",
  },
  {
    id: "demo-4",
    address: "3401 S Williams St, Englewood, CO 80113",
    lat: 39.6877,
    lng: -104.9804,
    price: 695000,
    beds: 3,
    baths: 2,
    sqft: 1920,
    pricePerSqft: 362,
    distanceMiles: 1.38,
    status: "sold",
    date: "2026-05-30",
    source: "marketplace",
  },
  {
    id: "demo-5",
    address: "1834 S Fillmore St, Denver, CO 80210",
    lat: 39.7241,
    lng: -104.9627,
    price: 819000,
    beds: 4,
    baths: 3,
    sqft: 2310,
    pricePerSqft: 354,
    distanceMiles: 1.72,
    status: "for-sale",
    date: "2026-06-10",
    source: "marketplace",
  },
  {
    id: "demo-6",
    address: "4012 S Corona St, Englewood, CO 80113",
    lat: 39.6812,
    lng: -104.9891,
    price: 668000,
    beds: 3,
    baths: 2,
    sqft: 1875,
    pricePerSqft: 356,
    distanceMiles: 2.14,
    status: "sold",
    date: "2026-03-22",
    source: "marketplace",
  },
];

export const DEMO_MARKET: MarketData = {
  medianPrice: 730000,
  medianPricePerSqft: 358,
  averageDaysOnMarket: 22,
  yoyPriceChangePercent: 4.8,
  inventoryCount: 6,
  source: "marketplace",
};

export const DEMO_ESTIMATE: ValueEstimate = {
  estimatedValue: 741000,
  valueLow: 685000,
  valueHigh: 797000,
  confidence: 78,
  confidenceFactors: [
    "Location resolved to a precise address.",
    "6 comparables available.",
    "Backed by live marketplace data.",
    "Comparable prices are tightly clustered.",
    "Subject square footage known — scaled to 2,100 sqft.",
  ],
  pricePerSqft: 353,
};

export const DEMO_REPORT = `## Summary

This automated valuation estimates the subject single-family residence at **$741,000**, within a likely range of $685,000–$797,000 (confidence 78/100). The property appears to be in **good** condition at approximately 2,100 sqft with 4 bedrooms and 2.5 bathrooms. Location: University Hills, Denver, CO 80210.

## Valuation Rationale

The estimate is anchored to 6 comparable marketplace transactions and active listings in the University Hills / South Denver area, weighted by proximity and recency. Comparable sales range from $668,000 to $819,000 with a median price per square foot of **$358/sqft**. Applied to the estimated 2,100 sqft, and adjusted slightly downward for the good (vs. excellent) condition rating, this yields an estimated value of $741,000 — in line with the $730,000 local median.

The Denver market is experiencing healthy appreciation (+4.8% YoY) with low days-on-market (22 days avg.), indicating strong buyer demand in this submarket.

## Comparable Analysis

- **2847 S Clermont St** — $748,000 ($365/sqft), 4 bed / 2 bath, 2,050 sqft · sold 0.42 mi away
- **3124 S Dahlia St** — $712,000 ($360/sqft), 3 bed / 2 bath, 1,980 sqft · sold 0.68 mi away
- **2219 S Josephine St** — $785,000 ($350/sqft), 4 bed / 3 bath, 2,240 sqft · for-sale 0.91 mi away
- **3401 S Williams St** — $695,000 ($362/sqft), 3 bed / 2 bath, 1,920 sqft · sold 1.38 mi away
- **1834 S Fillmore St** — $819,000 ($354/sqft), 4 bed / 3 bath, 2,310 sqft · for-sale 1.72 mi away

The tight $/sqft band ($350–$365) across all comparables supports a high-confidence range.

## Confidence & Caveats

- Location resolved to a precise address in University Hills, a well-established Denver neighborhood.
- All comparables sourced from active MLS listings and recent closed sales within 2.2 miles.
- The 2,100 sqft estimate is derived from visual analysis; actual recorded square footage may differ.
- 4.8% YoY appreciation trend assumed stable — monitor Fed rate decisions and local inventory levels.
- This is an automated, image-derived estimate for informational purposes only — **not a formal appraisal**. Confirm with a licensed appraiser and on-site inspection before transacting.`;
