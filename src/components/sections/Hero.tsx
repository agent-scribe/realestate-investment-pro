import {
  TrendingUp,
  Shield,
  BarChart3,
  ArrowDown,
} from "lucide-react";

const stats = [
  { label: "Properties Analyzed", value: "12,400+" },
  { label: "Avg. ROI Accuracy", value: "94.7%" },
  { label: "Active Investors", value: "3,200+" },
];

export function Hero() {
  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-cream via-background to-cream-dark">
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 h-80 w-80 rounded-full bg-forest/5 blur-3xl" />
        <div className="absolute -bottom-40 -left-40 h-80 w-80 rounded-full bg-saffron/5 blur-3xl" />
      </div>

      <div className="relative mx-auto max-w-7xl px-4 py-20 sm:px-6 sm:py-28 lg:px-8 lg:py-36">
        <div className="grid gap-12 lg:grid-cols-2 lg:items-center">
          {/* Left content */}
          <div className="space-y-8">
            <div className="inline-flex items-center gap-2 rounded-full border border-forest/20 bg-forest/5 px-4 py-1.5 text-xs font-medium text-forest">
              <TrendingUp className="h-3.5 w-3.5" />
              AI-Powered Investment Analysis
            </div>

            <h1 className="font-heading text-4xl font-bold leading-tight tracking-tight text-foreground sm:text-5xl lg:text-6xl">
              Make Smarter{" "}
              <span className="text-primary">Real Estate</span>{" "}
              Investments
            </h1>

            <p className="max-w-lg text-lg leading-relaxed text-muted-foreground">
              Analyze any property with institutional-grade cash flow modeling,
              market comparables, risk assessment, and an AI-powered Investment
              Score — all in minutes, not hours.
            </p>

            <div className="flex flex-col gap-3 sm:flex-row">
              <a
                href="#analyzer"
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-6 py-3.5 text-sm font-semibold text-primary-foreground shadow-lg shadow-forest/20 transition-all duration-200 hover:bg-forest-dark hover:shadow-xl hover:shadow-forest/30 cursor-pointer"
              >
                <BarChart3 className="h-4 w-4" />
                Analyze a Property
              </a>
              <a
                href="#how-it-works"
                className="inline-flex items-center justify-center gap-2 rounded-xl border border-border bg-card px-6 py-3.5 text-sm font-semibold text-foreground transition-all duration-200 hover:border-forest/30 hover:bg-muted cursor-pointer"
              >
                <Shield className="h-4 w-4" />
                See How It Works
              </a>
            </div>

            {/* Stats */}
            <div className="flex gap-8 border-t border-border pt-8">
              {stats.map((stat) => (
                <div key={stat.label}>
                  <div className="text-2xl font-bold text-primary font-heading">
                    {stat.value}
                  </div>
                  <div className="text-xs text-muted-foreground mt-1">
                    {stat.label}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Right — preview card */}
          <div className="relative">
            <div className="rounded-2xl border border-border bg-card p-6 shadow-2xl shadow-forest/5">
              <div className="mb-4 flex items-center justify-between">
                <span className="text-sm font-medium text-muted-foreground">
                  Sample Analysis Preview
                </span>
                <span className="rounded-full bg-forest/10 px-3 py-1 text-xs font-semibold text-forest">
                  Score: 8.2/10
                </span>
              </div>

              <div className="space-y-4">
                <div className="rounded-xl bg-cream p-4">
                  <div className="text-xs text-muted-foreground">Property</div>
                  <div className="font-semibold text-foreground">
                    456 Park Ave, Denver, CO 80210
                  </div>
                  <div className="text-sm text-primary font-medium">
                    $325,000 · Single-Family
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  {[
                    { label: "Monthly Cash Flow", value: "+$487", positive: true },
                    { label: "Cap Rate", value: "6.8%", positive: true },
                    { label: "Cash-on-Cash", value: "11.2%", positive: true },
                    { label: "DSCR", value: "1.35", positive: true },
                  ].map((metric) => (
                    <div
                      key={metric.label}
                      className="rounded-lg bg-muted/50 p-3"
                    >
                      <div className="text-xs text-muted-foreground">
                        {metric.label}
                      </div>
                      <div
                        className={`text-lg font-bold ${
                          metric.positive ? "text-forest" : "text-destructive"
                        }`}
                      >
                        {metric.value}
                      </div>
                    </div>
                  ))}
                </div>

                <div className="rounded-lg bg-forest/5 border border-forest/10 p-3">
                  <p className="text-sm text-forest font-medium">
                    Strong Buy — Positive cash flow with above-average cap rate
                    and healthy debt coverage.
                  </p>
                </div>
              </div>
            </div>

            {/* Floating decoration */}
            <div className="absolute -bottom-4 -right-4 h-24 w-24 rounded-2xl bg-saffron/10 -z-10 blur-sm" />
            <div className="absolute -top-4 -left-4 h-16 w-16 rounded-2xl bg-forest/10 -z-10 blur-sm" />
          </div>
        </div>

        {/* Scroll indicator */}
        <div className="mt-16 flex justify-center">
          <a
            href="#features"
            className="flex flex-col items-center gap-1 text-muted-foreground transition-colors hover:text-primary cursor-pointer"
            aria-label="Scroll to features"
          >
            <span className="text-xs">Explore Features</span>
            <ArrowDown className="h-4 w-4 animate-bounce" />
          </a>
        </div>
      </div>
    </section>
  );
}
