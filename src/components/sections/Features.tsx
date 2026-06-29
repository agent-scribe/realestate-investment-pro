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
    color: "bg-forest/10 text-forest",
  },
  {
    icon: TrendingUp,
    title: "Appreciation Forecasting",
    description:
      "Model property value growth and equity buildup over time. Understand your total return including appreciation.",
    color: "bg-saffron/10 text-saffron",
  },
  {
    icon: Shield,
    title: "Risk Assessment",
    description:
      "Evaluate vacancy risk, debt coverage ratio, and market sensitivity. Know your downside before you invest.",
    color: "bg-terracotta/10 text-terracotta",
  },
  {
    icon: BarChart3,
    title: "Investment Score",
    description:
      "Get a weighted 1-10 score combining cash flow, cap rate, cash-on-cash return, DSCR, and appreciation potential.",
    color: "bg-forest/10 text-forest",
  },
  {
    icon: Brain,
    title: "AI-Powered Insights",
    description:
      "Get narrative analysis with strengths, risks, and actionable next steps powered by advanced AI models.",
    color: "bg-saffron/10 text-saffron",
  },
  {
    icon: PieChart,
    title: "Visual Dashboards",
    description:
      "Interactive charts for cash flow projections, equity growth, and expense breakdowns — presentation ready.",
    color: "bg-terracotta/10 text-terracotta",
  },
];

export function Features() {
  return (
    <section id="features" className="py-20 sm:py-28">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <span className="inline-flex items-center gap-1.5 rounded-full border border-forest/20 bg-forest/5 px-3 py-1 text-xs font-medium text-forest">
            <BarChart3 className="h-3 w-3" />
            Powerful Features
          </span>
          <h2 className="mt-4 font-heading text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            Everything You Need to{" "}
            <span className="text-primary">Analyze Properties</span>
          </h2>
          <p className="mt-4 text-base text-muted-foreground leading-relaxed">
            Institutional-grade analysis tools designed for individual investors,
            agents, and property managers.
          </p>
        </div>

        <div className="mt-16 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((feature) => (
            <div
              key={feature.title}
              className="group rounded-2xl border border-border bg-card p-6 transition-all duration-200 hover:border-forest/20 hover:shadow-lg hover:shadow-forest/5"
            >
              <div
                className={`mb-4 inline-flex h-11 w-11 items-center justify-center rounded-xl ${feature.color} transition-transform duration-200 group-hover:scale-110`}
              >
                <feature.icon className="h-5 w-5" />
              </div>
              <h3 className="mb-2 font-heading text-lg font-semibold text-foreground">
                {feature.title}
              </h3>
              <p className="text-sm leading-relaxed text-muted-foreground">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
