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
    <section id="how-it-works" className="py-20 sm:py-28 bg-brand-900 text-white">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center mb-16">
          <p className="text-xs font-semibold uppercase tracking-widest text-brand-400">
            Simple Process
          </p>
          <h2 className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl">
            How it works
          </h2>
          <p className="mt-4 text-base text-brand-300 leading-relaxed">
            From property address to professional investment analysis in under
            two minutes.
          </p>
        </div>

        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {steps.map((item, idx) => (
            <div key={item.step} className="relative group">
              {idx < steps.length - 1 && (
                <div className="hidden lg:block absolute top-12 left-full w-full h-px bg-gradient-to-r from-brand-700/40 to-transparent -translate-x-4" />
              )}

              <div className="rounded-xl border border-white/10 bg-white/5 p-6 transition-all duration-200 group-hover:border-brand-400/20 group-hover:bg-white/[0.08]">
                <div className="flex items-center gap-3 mb-4">
                  <span className="text-3xl font-bold text-brand-700/40">
                    {item.step}
                  </span>
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-brand-700/20 text-brand-400">
                    <item.icon className="h-5 w-5" />
                  </div>
                </div>
                <h3 className="text-lg font-semibold text-white mb-2">
                  {item.title}
                </h3>
                <p className="text-sm text-brand-300 leading-relaxed">
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
            className="inline-flex items-center gap-2 rounded-lg bg-brand-700 px-8 py-3.5 text-sm font-semibold text-white transition-all duration-200 hover:bg-brand-600 cursor-pointer"
          >
            <Calculator className="h-4 w-4" />
            Try It Now — Free
          </a>
        </div>
      </div>
    </section>
  );
}
