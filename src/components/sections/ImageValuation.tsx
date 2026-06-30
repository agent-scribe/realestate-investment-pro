"use client";

/**
 * AI Image-Based Property Valuation — upload section.
 *
 * Lets a user drop or pick a property photo, validates it client-side, posts it
 * to /api/valuation/analyze, shows staged progress while the pipeline runs, and
 * renders the result (or a friendly error). Mirrors the look & interaction
 * patterns of the existing PropertyAnalyzer section.
 */

import { useCallback, useEffect, useRef, useState } from "react";
import {
  Camera,
  UploadCloud,
  Loader2,
  ImageIcon,
  X,
  AlertCircle,
  ScanSearch,
  MapPin,
  Building2,
  Calculator,
  FileText,
} from "lucide-react";
import { ValuationResults } from "./ValuationResults";
import type { ValuationResult } from "@/lib/valuation/types";

const MAX_BYTES = 10 * 1024 * 1024; // keep in sync with server
const ACCEPTED = ["image/jpeg", "image/png", "image/webp"];

/** Progress stages shown while the (single) request is in flight. */
const STAGES = [
  { icon: UploadCloud, label: "Uploading & securing image" },
  { icon: ScanSearch, label: "Analyzing image with AI vision" },
  { icon: MapPin, label: "Identifying location & landmarks" },
  { icon: Building2, label: "Searching comparable properties" },
  { icon: Calculator, label: "Estimating market value" },
  { icon: FileText, label: "Generating valuation report" },
];

export function ImageValuation() {
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [stage, setStage] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<ValuationResult | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  // Revoke object URLs to avoid memory leaks.
  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    };
  }, [previewUrl]);

  // Advance the progress stepper while loading (visual only). Stage is reset to
  // 0 by handleAnalyze before loading flips on, so the effect only schedules the
  // interval — no synchronous setState in the effect body.
  useEffect(() => {
    if (!loading) return;
    const timer = setInterval(() => {
      setStage((s) => Math.min(s + 1, STAGES.length - 1));
    }, 1600);
    return () => clearInterval(timer);
  }, [loading]);

  const selectFile = useCallback(
    (f: File) => {
      setError(null);
      setResult(null);
      if (!ACCEPTED.includes(f.type)) {
        setError("Please upload a JPEG, PNG, or WebP image.");
        return;
      }
      if (f.size > MAX_BYTES) {
        setError("Image is too large (max 10MB).");
        return;
      }
      if (previewUrl) URL.revokeObjectURL(previewUrl);
      setFile(f);
      setPreviewUrl(URL.createObjectURL(f));
    },
    [previewUrl]
  );

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const f = e.dataTransfer.files?.[0];
    if (f) selectFile(f);
  };

  const reset = () => {
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setFile(null);
    setPreviewUrl(null);
    setResult(null);
    setError(null);
  };

  const handleAnalyze = async () => {
    if (!file) return;
    setStage(0);
    setLoading(true);
    setError(null);
    setResult(null);
    try {
      const formData = new FormData();
      formData.append("image", file);
      const res = await fetch("/api/valuation/analyze", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      if (!res.ok) {
        setError(
          data?.error?.message ||
            "We couldn't analyze this image. Please try another photo."
        );
        return;
      }
      setStage(STAGES.length - 1);
      setResult(data as ValuationResult);
    } catch {
      setError("Network error. Please check your connection and try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <section id="valuation" className="py-20 sm:py-28">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mx-auto mb-12 max-w-2xl text-center">
          <span className="inline-flex items-center gap-1.5 rounded-full border border-saffron/20 bg-saffron/5 px-3 py-1 text-xs font-medium text-saffron-dark">
            <Camera className="h-3 w-3" />
            Image Valuation
          </span>
          <h2 className="mt-4 font-heading text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            Value a Property from a <span className="text-primary">Photo</span>
          </h2>
          <p className="mt-4 text-base text-muted-foreground">
            Upload an image of any house, building, or lot. Our AI identifies the
            property, locates it on the map, pulls comparable listings, and
            estimates its current market value — with a confidence score and full
            report.
          </p>
        </div>

        <div className="mx-auto max-w-4xl">
          <div className="rounded-2xl border border-border bg-card p-6 shadow-lg shadow-forest/5 sm:p-8">
            {/* Dropzone / preview */}
            {!previewUrl ? (
              <div
                onClick={() => inputRef.current?.click()}
                onDragOver={(e) => {
                  e.preventDefault();
                  setDragOver(true);
                }}
                onDragLeave={() => setDragOver(false)}
                onDrop={handleDrop}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") inputRef.current?.click();
                }}
                aria-label="Upload a property image"
                className={`flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed px-6 py-14 text-center transition-colors ${
                  dragOver
                    ? "border-primary bg-forest/5"
                    : "border-border hover:border-forest/40 hover:bg-muted/40"
                }`}
              >
                <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-forest/10">
                  <ImageIcon className="h-7 w-7 text-primary" />
                </div>
                <p className="text-sm font-semibold text-foreground">
                  Drop a property photo here, or click to browse
                </p>
                <p className="mt-1 text-xs text-muted-foreground">
                  JPEG, PNG, or WebP · up to 10MB
                </p>
              </div>
            ) : (
              <div className="relative overflow-hidden rounded-xl border border-border">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={previewUrl}
                  alt="Property preview"
                  className="max-h-96 w-full object-contain bg-muted/30"
                />
                {!loading && (
                  <button
                    onClick={reset}
                    aria-label="Remove image"
                    className="absolute right-3 top-3 inline-flex h-8 w-8 items-center justify-center rounded-full bg-foreground/70 text-white transition-colors hover:bg-foreground"
                  >
                    <X className="h-4 w-4" />
                  </button>
                )}
              </div>
            )}

            <input
              ref={inputRef}
              type="file"
              accept={ACCEPTED.join(",")}
              className="hidden"
              onChange={(e) => {
                const f = e.target.files?.[0];
                if (f) selectFile(f);
                e.target.value = ""; // allow re-selecting the same file
              }}
            />

            {/* Error */}
            {error && (
              <div className="mt-4 flex items-start gap-2 rounded-lg border border-destructive/30 bg-destructive/5 p-3 text-sm text-destructive">
                <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {/* Progress stepper */}
            {loading && (
              <div className="mt-6 space-y-2.5">
                {STAGES.map((s, i) => {
                  const StageIcon = s.icon;
                  const active = i === stage;
                  const done = i < stage;
                  return (
                    <div
                      key={s.label}
                      className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors ${
                        active
                          ? "bg-forest/5 text-foreground"
                          : done
                          ? "text-muted-foreground"
                          : "text-muted-foreground/50"
                      }`}
                    >
                      {active ? (
                        <Loader2 className="h-4 w-4 animate-spin text-primary" />
                      ) : (
                        <StageIcon
                          className={`h-4 w-4 ${done ? "text-forest" : ""}`}
                        />
                      )}
                      <span className={active ? "font-medium" : ""}>{s.label}</span>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Actions */}
            {previewUrl && !loading && (
              <button
                onClick={handleAnalyze}
                className="mt-6 flex w-full cursor-pointer items-center justify-center gap-2 rounded-xl bg-primary py-3.5 text-sm font-semibold text-primary-foreground shadow-lg shadow-forest/20 transition-all duration-200 hover:bg-forest-dark hover:shadow-xl"
              >
                <ScanSearch className="h-4 w-4" />
                {result ? "Re-analyze Image" : "Estimate Value from Image"}
              </button>
            )}

            <p className="mt-4 text-center text-xs text-muted-foreground">
              Automated estimate for informational purposes only — not a formal
              appraisal.
            </p>
          </div>

          {/* Results */}
          {result && <ValuationResults result={result} />}
        </div>
      </div>
    </section>
  );
}
