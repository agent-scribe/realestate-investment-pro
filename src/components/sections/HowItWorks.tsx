import { ClipboardList, Calculator, BarChart3, Brain } from "lucide-react";

const steps = [
  {
    step: "01",
    icon: ClipboardList,
    title: "Enter Property Details",
    description:
      "Input the address, purchase price, financing terms, rental income, and operating expenses.",
  },
  {
    step: "02",
    icon: Calculator,
    title: "Run Analysis",
    description:
      "Our engine calculates mortgage, cash flow, cap rate, cash-on-cash return, DSCR, and 20-year projections.",
  },
  {
    step: "03",
    icon: BarChart3,
    title: "Review Investment Score",
    description:
      "Get a weighted 1-10 score with a detailed breakdown across five key investment dimensions.",
  },
  {
    step: "04",
    icon: Brain,
    title: "Get AI Insights",
    description:
      "Receive a professional narrative assessment with strengths, risks, and actionable next steps.",
  },
];

export function HowItWorks() {
  return (
    <section id="how-it-works" className="py-20 sm:py-28 bg-foreground text-cream">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center mb-16">
          <span className="inline-flex items-center gap-1.5 rounded-full border border-saffron/30 bg-saffron/10 px-3 py-1 text-xs font-medium text-saffron">
            <BarChart3 className="h-3 w-3" />
            Simple Process
          </span>
          <h2 className="mt-4 font-heading text-3xl font-bold tracking-tight sm:text-4xl">
            How It <span className="text-saffron">Works</span>
          </h2>
          <p className="mt-4 text-base text-cream-dark/60 leading-relaxed">
            From property address to professional investment analysis in under
            two minutes.
          </p>
        </div>

        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {steps.map((item, idx) => (
            <div key={item.step} className="relative group">
              {/* Connector line */}
              {idx < steps.length - 1 && (
                <div className="hidden lg:block absolute top-12 left-full w-full h-px bg-gradient-to-r from-saffron/30 to-transparent -translate-x-4" />
              )}

              <div className="rounded-2xl border border-white/10 bg-white/5 p-6 transition-all duration-200 group-hover:border-saffron/20 group-hover:bg-white/[0.08]">
                <div className="flex items-center gap-3 mb-4">
                  <span className="text-3xl font-bold font-heading text-saffron/30">
                    {item.step}
                  </span>
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-saffron/10 text-saffron">
                    <item.icon className="h-5 w-5" />
                  </div>
                </div>
                <h3 className="font-heading text-lg font-semibold text-cream mb-2">
                  {item.title}
                </h3>
                <p className="text-sm text-cream-dark/60 leading-relaxed">
                  {item.description}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* CTA */}
        <div className="mt-16 text-center">
          <a
            href="#analyzer"
            className="inline-flex items-center gap-2 rounded-xl bg-saffron px-8 py-3.5 text-sm font-semibold text-white shadow-lg shadow-saffron/20 transition-all duration-200 hover:bg-saffron-dark hover:shadow-xl cursor-pointer"
          >
            <Calculator className="h-4 w-4" />
            Try It Now — Free
          </a>
        </div>
      </div>
    </section>
  );
}
