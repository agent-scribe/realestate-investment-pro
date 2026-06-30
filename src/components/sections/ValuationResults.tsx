"use client";

/**
 * Renders a completed ValuationResult: estimated value, confidence gauge,
 * location map, comparables, market data, and the AI report. Pure presentation
 * — all data comes from the /api/valuation/analyze response.
 */

import { useMemo } from "react";
import {
  MapPin,
  Gauge,
  Home,
  TrendingUp,
  Building2,
  Ruler,
  BedDouble,
  Bath,
  Info,
  ExternalLink,
  Sparkles,
  AlertTriangle,
} from "lucide-react";
import type {
  Comparable,
  DataSource,
  ValuationResult,
} from "@/lib/valuation/types";

interface Props {
  result: ValuationResult;
}

const usd = (n: number | null | undefined) =>
  n === null || n === undefined ? "—" : `$${Math.round(n).toLocaleString()}`;

/** Pick gauge/label color from a 0–100 confidence score. */
function confidenceColor(score: number): string {
  if (score >= 70) return "text-forest";
  if (score >= 45) return "text-saffron";
  return "text-destructive";
}
function confidenceStroke(score: number): string {
  if (score >= 70) return "#408175";
  if (score >= 45) return "#E8913A";
  return "#DC2626";
}
function confidenceLabel(score: number): string {
  if (score >= 80) return "Very High";
  if (score >= 65) return "High";
  if (score >= 45) return "Moderate";
  if (score >= 25) return "Low";
  return "Very Low";
}

/** Small badge showing where a value came from. */
function SourceBadge({ source }: { source: DataSource }) {
  const map: Record<DataSource, { label: string; cls: string }> = {
    google: { label: "Google", cls: "bg-forest/10 text-forest" },
    marketplace: { label: "Live data", cls: "bg-forest/10 text-forest" },
    ai: { label: "AI vision", cls: "bg-saffron/10 text-saffron-dark" },
    estimated: { label: "Estimated", cls: "bg-muted text-muted-foreground" },
  };
  const { label, cls } = map[source];
  return (
    <span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${cls}`}>
      {label}
    </span>
  );
}

/** Circular confidence gauge (SVG). */
function ConfidenceGauge({ score }: { score: number }) {
  const radius = 52;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (score / 100) * circumference;
  return (
    <div className="relative h-32 w-32 shrink-0">
      <svg className="h-32 w-32 -rotate-90" viewBox="0 0 120 120">
        <circle
          cx="60"
          cy="60"
          r={radius}
          fill="none"
          stroke="var(--color-muted)"
          strokeWidth="10"
        />
        <circle
          cx="60"
          cy="60"
          r={radius}
          fill="none"
          stroke={confidenceStroke(score)}
          strokeWidth="10"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          style={{ transition: "stroke-dashoffset 700ms ease" }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className={`text-3xl font-bold font-heading ${confidenceColor(score)}`}>
          {score}
        </span>
        <span className="text-[10px] uppercase tracking-wide text-muted-foreground">
          / 100
        </span>
      </div>
    </div>
  );
}

/** Location map: Google Maps Embed when a public key exists, else OpenStreetMap. */
function LocationMap({
  lat,
  lng,
  label,
}: {
  lat: number;
  lng: number;
  label: string;
}) {
  const googleKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
  const src = googleKey
    ? `https://www.google.com/maps/embed/v1/place?key=${googleKey}&q=${lat},${lng}&zoom=15`
    : `https://www.openstreetmap.org/export/embed.html?bbox=${lng - 0.01}%2C${
        lat - 0.01
      }%2C${lng + 0.01}%2C${lat + 0.01}&layer=mapnik&marker=${lat}%2C${lng}`;

  return (
    <div className="overflow-hidden rounded-xl border border-border">
      <iframe
        title={`Map of ${label}`}
        src={src}
        className="h-64 w-full"
        loading="lazy"
        referrerPolicy="no-referrer-when-downgrade"
      />
    </div>
  );
}

/** Minimal markdown renderer for the report (headings, bold, lists, hr). */
function ReportMarkdown({ markdown }: { markdown: string }) {
  const blocks = useMemo(() => {
    const lines = markdown.split("\n");
    const out: React.ReactNode[] = [];
    let list: string[] = [];

    const renderInline = (text: string, key: string) => {
      // Bold (**…**) only — enough for our report format.
      const parts = text.split(/(\*\*[^*]+\*\*)/g);
      return (
        <>
          {parts.map((p, i) =>
            p.startsWith("**") && p.endsWith("**") ? (
              <strong key={`${key}-${i}`} className="font-semibold text-foreground">
                {p.slice(2, -2)}
              </strong>
            ) : (
              <span key={`${key}-${i}`}>{p}</span>
            )
          )}
        </>
      );
    };

    const flushList = (key: string) => {
      if (list.length === 0) return;
      out.push(
        <ul key={key} className="my-2 list-disc space-y-1 pl-5 text-sm text-foreground/90">
          {list.map((item, i) => (
            <li key={i}>{renderInline(item, `${key}-li-${i}`)}</li>
          ))}
        </ul>
      );
      list = [];
    };

    lines.forEach((rawLine, idx) => {
      const line = rawLine.trimEnd();
      if (line.startsWith("## ")) {
        flushList(`l-${idx}`);
        out.push(
          <h4
            key={`h-${idx}`}
            className="mt-5 mb-2 font-heading text-base font-bold text-foreground first:mt-0"
          >
            {line.slice(3)}
          </h4>
        );
      } else if (line.startsWith("# ")) {
        flushList(`l-${idx}`);
        out.push(
          <h3 key={`h-${idx}`} className="mt-5 mb-2 font-heading text-lg font-bold text-foreground">
            {line.slice(2)}
          </h3>
        );
      } else if (line.startsWith("- ")) {
        list.push(line.slice(2));
      } else if (line.startsWith("---")) {
        flushList(`l-${idx}`);
        out.push(<hr key={`hr-${idx}`} className="my-4 border-border" />);
      } else if (line.trim() === "") {
        flushList(`l-${idx}`);
      } else {
        flushList(`l-${idx}`);
        const italic = line.startsWith("*") && line.endsWith("*") && !line.startsWith("**");
        out.push(
          <p
            key={`p-${idx}`}
            className={`my-2 text-sm leading-relaxed ${
              italic ? "text-xs italic text-muted-foreground" : "text-foreground/90"
            }`}
          >
            {renderInline(italic ? line.slice(1, -1) : line, `p-${idx}`)}
          </p>
        );
      }
    });
    flushList("end");
    return out;
  }, [markdown]);

  return <div>{blocks}</div>;
}

function ComparableCard({ comp }: { comp: Comparable }) {
  return (
    <div className="rounded-xl border border-border bg-card p-4 shadow-sm">
      <div className="mb-2 flex items-start justify-between gap-2">
        <span className="text-sm font-medium text-foreground line-clamp-2">
          {comp.address}
        </span>
        <SourceBadge source={comp.source} />
      </div>
      <div className="text-xl font-bold font-heading text-primary">
        {usd(comp.price)}
      </div>
      <div className="mt-2 flex flex-wrap gap-x-3 gap-y-1 text-xs text-muted-foreground">
        {comp.beds !== null && (
          <span className="inline-flex items-center gap-1">
            <BedDouble className="h-3 w-3" /> {comp.beds}
          </span>
        )}
        {comp.baths !== null && (
          <span className="inline-flex items-center gap-1">
            <Bath className="h-3 w-3" /> {comp.baths}
          </span>
        )}
        {comp.sqft !== null && (
          <span className="inline-flex items-center gap-1">
            <Ruler className="h-3 w-3" /> {comp.sqft.toLocaleString()} sqft
          </span>
        )}
        {comp.pricePerSqft !== null && <span>${comp.pricePerSqft}/sqft</span>}
      </div>
      <div className="mt-2 flex items-center justify-between text-[11px] text-muted-foreground">
        <span className="capitalize">{comp.status}</span>
        {comp.distanceMiles !== null && <span>{comp.distanceMiles} mi away</span>}
      </div>
    </div>
  );
}

export function ValuationResults({ result }: Props) {
  const { imageUrl, imageAnalysis, location, estimate, comparables, market, report, warnings } =
    result;

  const mapsLink = location
    ? `https://www.google.com/maps/search/?api=1&query=${location.lat},${location.lng}`
    : null;

  return (
    <div className="mt-8 space-y-6">
      {/* Warnings */}
      {warnings.length > 0 && (
        <div className="rounded-xl border border-saffron/30 bg-saffron/5 p-4">
          <div className="mb-1 flex items-center gap-2 text-sm font-semibold text-saffron-dark">
            <AlertTriangle className="h-4 w-4" />
            Notes on this estimate
          </div>
          <ul className="space-y-1 text-xs text-foreground/80">
            {warnings.map((w) => (
              <li key={w.code}>• {w.message}</li>
            ))}
          </ul>
        </div>
      )}

      {/* Headline: value + confidence */}
      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 rounded-2xl border border-border bg-card p-6 sm:p-8 shadow-lg shadow-forest/5">
          <div className="grid gap-6 sm:grid-cols-[1fr_auto] sm:items-center">
            <div>
              <span className="inline-flex items-center gap-1.5 rounded-full border border-forest/20 bg-forest/5 px-3 py-1 text-xs font-medium text-forest">
                <Sparkles className="h-3 w-3" />
                Estimated Market Value
              </span>
              {estimate ? (
                <>
                  <div className="mt-3 text-4xl font-bold font-heading text-primary sm:text-5xl">
                    {usd(estimate.estimatedValue)}
                  </div>
                  <div className="mt-1 text-sm text-muted-foreground">
                    Likely range {usd(estimate.valueLow)} – {usd(estimate.valueHigh)}
                    {estimate.pricePerSqft ? ` · $${estimate.pricePerSqft}/sqft` : ""}
                  </div>
                </>
              ) : (
                <div className="mt-3 text-2xl font-bold font-heading text-muted-foreground">
                  Value unavailable
                </div>
              )}
            </div>
            {estimate && (
              <div className="flex flex-col items-center gap-1">
                <ConfidenceGauge score={estimate.confidence} />
                <span
                  className={`flex items-center gap-1 text-xs font-semibold ${confidenceColor(
                    estimate.confidence
                  )}`}
                >
                  <Gauge className="h-3 w-3" />
                  {confidenceLabel(estimate.confidence)} confidence
                </span>
              </div>
            )}
          </div>

          {estimate && estimate.confidenceFactors.length > 0 && (
            <div className="mt-5 border-t border-border pt-4">
              <div className="mb-2 flex items-center gap-1.5 text-xs font-semibold text-muted-foreground">
                <Info className="h-3.5 w-3.5" />
                What drives this confidence
              </div>
              <ul className="grid gap-1 sm:grid-cols-2">
                {estimate.confidenceFactors.map((f, i) => (
                  <li key={i} className="text-xs text-foreground/80">
                    • {f}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        {/* Detected property profile */}
        <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
          <div className="mb-4 flex items-center gap-2">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={imageUrl}
              alt="Uploaded property"
              className="h-14 w-14 rounded-lg border border-border object-cover"
            />
            <div>
              <h3 className="font-heading text-sm font-bold text-foreground">
                Detected Property
              </h3>
              <SourceBadge source={imageAnalysis.source} />
            </div>
          </div>
          <dl className="space-y-2 text-sm">
            <div className="flex items-center justify-between">
              <dt className="flex items-center gap-1.5 text-muted-foreground">
                <Home className="h-3.5 w-3.5" /> Type
              </dt>
              <dd className="font-medium capitalize">
                {imageAnalysis.propertyType.replace("-", " ")}
              </dd>
            </div>
            <div className="flex items-center justify-between">
              <dt className="flex items-center gap-1.5 text-muted-foreground">
                <TrendingUp className="h-3.5 w-3.5" /> Condition
              </dt>
              <dd className="font-medium capitalize">{imageAnalysis.condition}</dd>
            </div>
            {imageAnalysis.estimatedSqft && (
              <div className="flex items-center justify-between">
                <dt className="flex items-center gap-1.5 text-muted-foreground">
                  <Ruler className="h-3.5 w-3.5" /> Size
                </dt>
                <dd className="font-medium">
                  {imageAnalysis.estimatedSqft.toLocaleString()} sqft
                </dd>
              </div>
            )}
            {(imageAnalysis.estimatedBeds || imageAnalysis.estimatedBaths) && (
              <div className="flex items-center justify-between">
                <dt className="flex items-center gap-1.5 text-muted-foreground">
                  <BedDouble className="h-3.5 w-3.5" /> Beds / Baths
                </dt>
                <dd className="font-medium">
                  {imageAnalysis.estimatedBeds ?? "?"} / {imageAnalysis.estimatedBaths ?? "?"}
                </dd>
              </div>
            )}
          </dl>
          {imageAnalysis.features.length > 0 && (
            <div className="mt-3 flex flex-wrap gap-1.5 border-t border-border pt-3">
              {imageAnalysis.features.slice(0, 6).map((f, i) => (
                <span
                  key={i}
                  className="rounded-full bg-muted px-2 py-0.5 text-[11px] text-muted-foreground"
                >
                  {f}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Location */}
      {location && (
        <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
            <h3 className="flex items-center gap-2 font-heading text-lg font-bold text-foreground">
              <MapPin className="h-4 w-4 text-primary" />
              Location
            </h3>
            <div className="flex items-center gap-2">
              <SourceBadge source={location.source} />
              {mapsLink && (
                <a
                  href={mapsLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-xs font-medium text-primary hover:underline"
                >
                  Open in Maps <ExternalLink className="h-3 w-3" />
                </a>
              )}
            </div>
          </div>
          <p className="mb-3 text-sm text-muted-foreground">
            {location.formattedAddress}
            {location.approximate && " (approximate)"}
          </p>
          <LocationMap lat={location.lat} lng={location.lng} label={location.formattedAddress} />
        </div>
      )}

      {/* Market data */}
      {market && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[
            { label: "Median Price", value: usd(market.medianPrice) },
            {
              label: "Median $/sqft",
              value: market.medianPricePerSqft ? `$${market.medianPricePerSqft}` : "—",
            },
            {
              label: "Avg Days on Market",
              value: market.averageDaysOnMarket ? `${market.averageDaysOnMarket}` : "—",
            },
            {
              label: "YoY Price Change",
              value:
                market.yoyPriceChangePercent !== null
                  ? `${market.yoyPriceChangePercent > 0 ? "+" : ""}${market.yoyPriceChangePercent}%`
                  : "—",
            },
          ].map((m) => (
            <div key={m.label} className="rounded-xl border border-border bg-card p-5 shadow-sm">
              <div className="mb-1 text-xs font-medium text-muted-foreground">{m.label}</div>
              <div className="text-2xl font-bold font-heading text-foreground">{m.value}</div>
            </div>
          ))}
        </div>
      )}

      {/* Comparables */}
      {comparables.length > 0 && (
        <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
          <h3 className="mb-4 flex items-center gap-2 font-heading text-lg font-bold text-foreground">
            <Building2 className="h-4 w-4 text-primary" />
            Comparable Properties
            <span className="text-sm font-normal text-muted-foreground">
              ({comparables.length})
            </span>
          </h3>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {comparables.map((c) => (
              <ComparableCard key={c.id} comp={c} />
            ))}
          </div>
        </div>
      )}

      {/* AI Report */}
      <div className="rounded-2xl border border-forest/20 bg-forest/5 p-6 sm:p-8">
        <div className="mb-4 flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-forest" />
          <h3 className="font-heading text-lg font-bold text-foreground">
            AI Valuation Report
          </h3>
        </div>
        <ReportMarkdown markdown={report} />
      </div>
    </div>
  );
}
