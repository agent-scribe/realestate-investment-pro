import {
  Calculator,
  TrendingUp,
  Shield,
  BarChart3,
  Brain,
  PieChart,
} from "lucide-react";

const features = [
  {
    icon: Calculator,
    title: "Cash Flow Modeling",
    description:
      "Detailed 5, 10, and 20-year cash flow projections with mortgage, taxes, insurance, maintenance, and vacancy factored in.",
  },
  {
    icon: TrendingUp,
    title: "Appreciation Forecasting",
    description:
      "Model property value growth and equity buildup over time. Understand your total return including appreciation.",
  },
  {
    icon: Shield,
    title: "Risk Assessment",
    description:
      "Evaluate vacancy risk, debt coverage ratio, and market sensitivity. Know your downside before you invest.",
  },
  {
    icon: BarChart3,
    title: "Investment Score",
    description:
      "Get a weighted 1-10 score combining cash flow, cap rate, cash-on-cash return, DSCR, and appreciation potential.",
  },
  {
    icon: Brain,
    title: "AI-Powered Insights",
    description:
      "Get narrative analysis with strengths, risks, and actionable next steps powered by advanced AI models.",
  },
  {
    icon: PieChart,
    title: "Visual Dashboards",
    description:
      "Interactive charts for cash flow projections, equity growth, and expense breakdowns — presentation ready.",
  },
];

export function Features() {
  return (
    <section id="features" className="py-20 sm:py-28 bg-white">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-xs font-semibold uppercase tracking-widest text-brand-700">
            Powerful Features
          </p>
          <h2 className="mt-3 text-3xl font-bold tracking-tight text-brand-900 sm:text-4xl">
            Everything you need to analyze properties
          </h2>
          <p className="mt-4 text-base text-brand-400 leading-relaxed">
            Institutional-grade analysis tools designed for individual investors,
            agents, and property managers.
          </p>
        </div>

        <div className="mt-16 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((feature) => (
            <div
              key={feature.title}
              className="group rounded-xl border border-border bg-warm-50 p-6 transition-all duration-200 hover:border-brand-200 hover:shadow-md"
            >
              <div className="mb-4 inline-flex h-11 w-11 items-center justify-center rounded-lg bg-brand-50 text-brand-700 transition-transform duration-200 group-hover:scale-110">
                <feature.icon className="h-5 w-5" />
              </div>
              <h3 className="mb-2 text-lg font-semibold text-brand-900">
                {feature.title}
              </h3>
              <p className="text-sm leading-relaxed text-brand-400">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
