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
    <section className="py-20 sm:py-28 lg:py-36">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-4xl text-center">
          <h1 className="text-5xl font-bold leading-tight text-brand-900 sm:text-6xl lg:text-7xl" style={{ letterSpacing: "-1.5px" }}>
            Make smarter real estate investments.
          </h1>

          <p className="mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-brand-400">
            Analyze any property with institutional-grade cash flow modeling,
            market comparables, risk assessment, and an AI-powered Investment
            Score — all in minutes, not hours.
          </p>

          <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <a
              href="#analyzer"
              className="inline-flex items-center justify-center gap-2 rounded-lg bg-brand-700 px-8 py-4 text-base font-semibold text-white transition-all duration-200 hover:bg-brand-800 cursor-pointer"
            >
              Analyze a Property
            </a>
            <a
              href="#how-it-works"
              className="inline-flex items-center justify-center gap-2 rounded-lg border border-brand-700/30 px-8 py-4 text-base font-semibold text-brand-700 transition-all duration-200 hover:bg-brand-50 cursor-pointer"
            >
              See How It Works
            </a>
          </div>
        </div>

        {/* Stats */}
        <div className="mx-auto mt-20 flex max-w-2xl justify-center gap-12 border-t border-border pt-10">
          {stats.map((stat) => (
            <div key={stat.label} className="text-center">
              <div className="text-2xl font-bold text-brand-900">
                {stat.value}
              </div>
              <div className="mt-1 text-sm text-brand-400">
                {stat.label}
              </div>
            </div>
          ))}
        </div>

        {/* Scroll indicator */}
        <div className="mt-16 flex justify-center">
          <a
            href="#features"
            className="flex flex-col items-center gap-1 text-brand-400 transition-colors hover:text-brand-700 cursor-pointer"
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
