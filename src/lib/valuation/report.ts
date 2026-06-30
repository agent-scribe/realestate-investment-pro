/**
 * Report stage: produce a professional, markdown valuation narrative.
 *
 * Uses OpenAI (text model) when a key is available; otherwise generates a
 * structured algorithmic report from the same inputs — same graceful-degradation
 * pattern as the existing /api/analyze route.
 */

import type {
  Comparable,
  GeoLocation,
  ImageAnalysis,
  MarketData,
  ValueEstimate,
} from "./types";

const REPORT_MODEL = process.env.OPENAI_REPORT_MODEL || "gpt-4o-mini";

function hasOpenAIKey(): boolean {
  const key = process.env.OPENAI_API_KEY;
  return Boolean(key && key !== "demo" && !key.startsWith("sk-demo"));
}

const usd = (n: number) => `$${Math.round(n).toLocaleString()}`;

interface ReportInputs {
  analysis: ImageAnalysis;
  location: GeoLocation;
  estimate: ValueEstimate;
  comparables: Comparable[];
  market: MarketData | null;
}

function buildPrompt(i: ReportInputs): string {
  const compLines = i.comparables
    .slice(0, 6)
    .map(
      (c) =>
        `- ${c.address}: ${usd(c.price)}${c.sqft ? `, ${c.sqft} sqft` : ""}${
          c.distanceMiles !== null ? `, ${c.distanceMiles} mi away` : ""
        } (${c.status})`
    )
    .join("\n");

  return `Write a concise professional property valuation report (markdown, under 350 words).

SUBJECT (from image analysis):
- Type: ${i.analysis.propertyType}
- Condition: ${i.analysis.condition}
- Approx size: ${i.analysis.estimatedSqft ?? "unknown"} sqft, ${
    i.analysis.estimatedBeds ?? "?"
  } bed / ${i.analysis.estimatedBaths ?? "?"} bath
- Features: ${i.analysis.features.join(", ") || "n/a"}

LOCATION:
- ${i.location.formattedAddress} (${i.location.approximate ? "approximate" : "precise"})

VALUATION:
- Estimated value: ${usd(i.estimate.estimatedValue)} (range ${usd(
    i.estimate.valueLow
  )}–${usd(i.estimate.valueHigh)})
- Confidence: ${i.estimate.confidence}/100

MARKET:
- Median price: ${i.market?.medianPrice ? usd(i.market.medianPrice) : "n/a"}
- Median $/sqft: ${i.market?.medianPricePerSqft ?? "n/a"}
- Avg days on market: ${i.market?.averageDaysOnMarket ?? "n/a"}

COMPARABLES:
${compLines}

Structure: ## Summary, ## Valuation Rationale, ## Comparable Analysis, ## Confidence & Caveats.
Be specific with numbers. Note clearly that this is an automated estimate, not a formal appraisal.`;
}

/** Algorithmic fallback report. */
function fallbackReport(i: ReportInputs): string {
  const { analysis, location, estimate, comparables, market } = i;
  const avgComp =
    comparables.reduce((a, c) => a + c.price, 0) / comparables.length;

  const compLines = comparables
    .slice(0, 6)
    .map(
      (c) =>
        `- **${c.address}** — ${usd(c.price)}${
          c.pricePerSqft ? ` ($${c.pricePerSqft}/sqft)` : ""
        }${c.distanceMiles !== null ? `, ${c.distanceMiles} mi` : ""} · ${c.status}`
    )
    .join("\n");

  return `## Summary

This automated valuation estimates the subject ${analysis.propertyType.replace(
    "-",
    " "
  )} at **${usd(estimate.estimatedValue)}**, within a likely range of ${usd(
    estimate.valueLow
  )}–${usd(estimate.valueHigh)} (confidence ${estimate.confidence}/100). The property appears to be in **${
    analysis.condition
  }** condition${
    analysis.estimatedSqft ? ` at roughly ${analysis.estimatedSqft.toLocaleString()} sqft` : ""
  }. Location: ${location.formattedAddress}${
    location.approximate ? " (approximate)" : ""
  }.

## Valuation Rationale

The estimate is anchored to ${comparables.length} comparable ${
    comparables[0]?.source === "marketplace" ? "marketplace" : "modeled"
  } properties averaging ${usd(avgComp)}, weighted by proximity and recency and adjusted for the property's visible condition${
    estimate.pricePerSqft ? `, implying about $${estimate.pricePerSqft}/sqft` : ""
  }.

## Comparable Analysis

${compLines}
${
  market?.medianPrice
    ? `\nLocal median price is ${usd(market.medianPrice)}${
        market.medianPricePerSqft ? ` ($${market.medianPricePerSqft}/sqft)` : ""
      }${
        market.averageDaysOnMarket
          ? `, with homes averaging ${market.averageDaysOnMarket} days on market`
          : ""
      }.`
    : ""
}

## Confidence & Caveats

${estimate.confidenceFactors.map((f) => `- ${f}`).join("\n")}

---
*This is an automated, image-derived estimate for informational purposes only — not a formal appraisal. Confirm with a licensed appraiser and on-site inspection before transacting.*`;
}

/**
 * Generate the valuation report. Never throws — falls back to the algorithmic
 * report on any failure.
 */
export async function generateReport(i: ReportInputs): Promise<string> {
  if (hasOpenAIKey()) {
    try {
      const res = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
        },
        body: JSON.stringify({
          model: REPORT_MODEL,
          max_tokens: 800,
          temperature: 0.6,
          messages: [
            {
              role: "system",
              content:
                "You are a professional real-estate appraiser writing clear, data-driven automated valuation reports. Always clarify that the output is an estimate, not a formal appraisal.",
            },
            { role: "user", content: buildPrompt(i) },
          ],
        }),
        signal: AbortSignal.timeout(25_000),
      });
      if (res.ok) {
        const data = await res.json();
        const content: string | undefined = data?.choices?.[0]?.message?.content;
        if (content) return content;
      }
    } catch {
      // fall through
    }
  }
  return fallbackReport(i);
}
