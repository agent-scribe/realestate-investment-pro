# Real Estate Investment Pro

Professional real estate investment analysis with AI-powered insights.

Analyze any property with institutional-grade cash flow modeling, market
comparables, risk assessment, and an AI-powered Investment Score — all in
minutes, not hours.

---

## AI Image-Based Property Valuation

Upload a photo of a property (house, building, or land) and get an automated
market-value estimate with a confidence score, location map, comparable
properties, market data, and an AI-generated report.

The feature lives in the `#valuation` section of the home page and is powered by
a staged pipeline. **Every stage degrades gracefully** — if an external provider
is not configured, that stage falls back to an algorithmic/synthetic
implementation, so the whole flow always returns a result.

### Pipeline stages

| Stage | Module | With key | Without key (fallback) |
|-------|--------|----------|------------------------|
| 1. Storage & validation | `src/lib/valuation/imageStorage.ts` | — | MIME allow-list + magic-byte sniffing + size cap; `sharp` re-encodes/resizes to WebP when installed |
| 2. Vision analysis | `src/lib/valuation/vision.ts` | OpenAI GPT-4o (property type, condition, size, features, **location clues**) | Neutral baseline profile |
| 3. Geolocation | `src/lib/valuation/geocode.ts` | Google Geocoding + Street View landmark check | Coarse US-state centroid, or `null` (→ graceful error) |
| 4. Comparables + market | `src/lib/valuation/comparables.ts` | RentCast AVM (live comps + market) | Synthetic comps from regional $/sqft table |
| 5. Value estimate | `src/lib/valuation/valuation.ts` | — (pure math) | distance/recency-weighted blend + 0–100 confidence |
| 6. AI report | `src/lib/valuation/report.ts` | OpenAI narrative | Structured algorithmic report |

`src/lib/valuation/pipeline.ts` orchestrates the stages and collects non-fatal
warnings (vision fallback, approximate location, synthetic comps, etc.).

### API

- `POST /api/valuation/analyze` — `multipart/form-data` with an `image` field.
  Validates + stores the image, runs the pipeline, returns a `ValuationResult`
  (or a structured `{ error: { code, message } }` for bad uploads).
- `GET /api/valuation/image/[id]` — serves a stored image. Files live in the
  private, git-ignored `.uploads/` directory (outside `public/`) and are only
  reachable through this route. Ids are content hashes, so the route is immune to
  path traversal and responses are cached immutably.

### Configuration

All keys are **optional** — see `.env.example`. Without any keys the feature
still works end-to-end using fallbacks; the UI tags every value with its data
source (`Live data` / `Google` / `AI vision` / `Estimated`).

- `OPENAI_API_KEY` — image vision analysis + AI report (`OPENAI_VISION_MODEL`,
  `OPENAI_REPORT_MODEL` optionally override the models).
- `GOOGLE_MAPS_API_KEY` (server) — Geocoding + Street View. Enable the
  Geocoding API and Street View Static API.
- `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY` (browser) — interactive results map (Maps
  Embed API). Falls back to OpenStreetMap when absent.
- `RENTCAST_API_KEY` — comparable listings + market stats via
  [RentCast](https://rentcast.io). Swappable for ATTOM/Zillow by editing
  `comparables.ts`.

### Image optimization

`sharp` is an **optional dependency**. When present, uploads are auto-rotated
(EXIF), resized to a max 1600px, and re-encoded to compressed WebP. If `sharp`
fails to install on your platform, the feature still works — the validated
original is stored instead.

### Error handling

The pipeline never throws to the client for provider failures. It returns a
complete `ValuationResult` with `warnings`, and surfaces clear guidance when the
**location cannot be determined** (`LOCATION_UNDETERMINED`) or there is
**insufficient market data** (`INSUFFICIENT_DATA`). Upload problems return
`INVALID_UPLOAD`, `UNSUPPORTED_TYPE` (magic-byte verified), or `FILE_TOO_LARGE`.

---

## Getting Started

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

Copy `.env.example` to `.env.local` and fill in your API keys (all optional).
