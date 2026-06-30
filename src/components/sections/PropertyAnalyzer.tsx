"use client";

import { useState } from "react";
import {
  Calculator,
  MapPin,
  DollarSign,
  Percent,
  Home,
  Loader2,
  TrendingUp,
  AlertTriangle,
  CheckCircle2,
  Brain,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { analyzeProperty, type PropertyInput, type AnalysisResult } from "@/lib/calculations";
import { ResultsDashboard } from "./ResultsDashboard";

const defaultInput: PropertyInput = {
  address: "",
  city: "",
  state: "",
  zipCode: "",
  purchasePrice: 325000,
  downPaymentPercent: 20,
  interestRate: 6.5,
  loanTermYears: 30,
  propertyType: "single-family",
  monthlyRent: 2200,
  vacancyRatePercent: 5,
  annualPropertyTax: 3900,
  annualInsurance: 1800,
  monthlyHOA: 0,
  annualMaintenance: 3250,
  annualAppreciationPercent: 3,
  annualRentGrowthPercent: 2,
  closingCostPercent: 3,
};

function InputField({
  label,
  name,
  value,
  onChange,
  type = "number",
  prefix,
  suffix,
  placeholder,
  helpText,
}: {
  label: string;
  name: string;
  value: string | number;
  onChange: (name: string, value: string | number) => void;
  type?: string;
  prefix?: string;
  suffix?: string;
  placeholder?: string;
  helpText?: string;
}) {
  return (
    <div className="space-y-1.5">
      <label
        htmlFor={name}
        className="block text-sm font-medium text-foreground"
      >
        {label}
      </label>
      <div className="relative">
        {prefix && (
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
            {prefix}
          </span>
        )}
        <input
          id={name}
          name={name}
          type={type}
          value={value}
          onChange={(e) =>
            onChange(name, type === "number" ? Number(e.target.value) : e.target.value)
          }
          placeholder={placeholder}
          className={`w-full rounded-lg border border-border bg-card px-3 py-2.5 text-sm text-foreground transition-colors focus:border-primary focus:ring-1 focus:ring-primary ${
            prefix ? "pl-7" : ""
          } ${suffix ? "pr-8" : ""}`}
        />
        {suffix && (
          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
            {suffix}
          </span>
        )}
      </div>
      {helpText && (
        <p className="text-xs text-muted-foreground">{helpText}</p>
      )}
    </div>
  );
}

export function PropertyAnalyzer() {
  const [input, setInput] = useState<PropertyInput>(defaultInput);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [aiInsight, setAiInsight] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);
  const [showAdvanced, setShowAdvanced] = useState(false);

  const handleChange = (name: string, value: string | number) => {
    setInput((prev) => ({ ...prev, [name]: value }));
  };

  const handleAnalyze = async () => {
    setLoading(true);
    setAiInsight("");

    // Small delay for perceived effort
    await new Promise((r) => setTimeout(r, 400));

    const analysisResult = analyzeProperty(input);
    setResult(analysisResult);
    setLoading(false);

    // Fetch AI insight in background
    setAiLoading(true);
    try {
      const res = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ input, result: analysisResult }),
      });
      const data = await res.json();
      setAiInsight(data.insight || data.error || "");
    } catch {
      setAiInsight("AI analysis unavailable. See the calculated metrics above for your investment assessment.");
    } finally {
      setAiLoading(false);
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 7) return "text-brand-700";
    if (score >= 5) return "text-brand-500";
    return "text-destructive";
  };

  const getScoreLabel = (score: number) => {
    if (score >= 9) return "Excellent Deal";
    if (score >= 7) return "Strong Buy";
    if (score >= 5) return "Moderate Opportunity";
    if (score >= 3) return "Proceed with Caution";
    return "High Risk";
  };

  const getScoreIcon = (score: number) => {
    if (score >= 7) return CheckCircle2;
    if (score >= 5) return TrendingUp;
    return AlertTriangle;
  };

  return (
    <section id="analyzer" className="py-20 sm:py-28 bg-white">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="mx-auto max-w-2xl text-center mb-12">
          <p className="text-xs font-semibold uppercase tracking-widest text-brand-700">
            Property Analyzer
          </p>
          <h2 className="mt-3 text-3xl font-bold tracking-tight text-brand-900 sm:text-4xl">
            Analyze your investment
          </h2>
          <p className="mt-4 text-base text-brand-400">
            Enter property details to get a comprehensive analysis with cash flow
            projections, risk assessment, and AI-powered insights.
          </p>
        </div>

        {/* Form */}
        <div className="mx-auto max-w-4xl">
          <div className="rounded-xl border border-border bg-card p-6 sm:p-8 shadow-sm">
            {/* Property Location */}
            <div className="mb-8">
              <h3 className="flex items-center gap-2 text-base font-semibold text-foreground mb-4">
                <MapPin className="h-4 w-4 text-primary" />
                Property Location
              </h3>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <InputField
                  label="Address"
                  name="address"
                  value={input.address}
                  onChange={handleChange}
                  type="text"
                  placeholder="456 Park Ave"
                />
                <InputField
                  label="City"
                  name="city"
                  value={input.city}
                  onChange={handleChange}
                  type="text"
                  placeholder="Denver"
                />
                <InputField
                  label="State"
                  name="state"
                  value={input.state}
                  onChange={handleChange}
                  type="text"
                  placeholder="CO"
                />
                <InputField
                  label="ZIP Code"
                  name="zipCode"
                  value={input.zipCode}
                  onChange={handleChange}
                  type="text"
                  placeholder="80210"
                />
              </div>
            </div>

            {/* Purchase Details */}
            <div className="mb-8">
              <h3 className="flex items-center gap-2 text-base font-semibold text-foreground mb-4">
                <DollarSign className="h-4 w-4 text-primary" />
                Purchase Details
              </h3>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                <InputField
                  label="Purchase Price"
                  name="purchasePrice"
                  value={input.purchasePrice}
                  onChange={handleChange}
                  prefix="$"
                />
                <InputField
                  label="Down Payment"
                  name="downPaymentPercent"
                  value={input.downPaymentPercent}
                  onChange={handleChange}
                  suffix="%"
                />
                <InputField
                  label="Interest Rate"
                  name="interestRate"
                  value={input.interestRate}
                  onChange={handleChange}
                  suffix="%"
                />
                <InputField
                  label="Loan Term"
                  name="loanTermYears"
                  value={input.loanTermYears}
                  onChange={handleChange}
                  suffix="yrs"
                />
                <div className="space-y-1.5">
                  <label
                    htmlFor="propertyType"
                    className="block text-sm font-medium text-foreground"
                  >
                    Property Type
                  </label>
                  <select
                    id="propertyType"
                    name="propertyType"
                    value={input.propertyType}
                    onChange={(e) => handleChange("propertyType", e.target.value)}
                    className="w-full rounded-lg border border-border bg-card px-3 py-2.5 text-sm text-foreground transition-colors focus:border-primary focus:ring-1 focus:ring-primary cursor-pointer"
                  >
                    <option value="single-family">Single Family</option>
                    <option value="multi-unit">Multi-Unit</option>
                    <option value="commercial">Commercial</option>
                    <option value="condo">Condo/Townhouse</option>
                  </select>
                </div>
                <InputField
                  label="Closing Costs"
                  name="closingCostPercent"
                  value={input.closingCostPercent}
                  onChange={handleChange}
                  suffix="%"
                  helpText="Typical: 2-5%"
                />
              </div>
            </div>

            {/* Income */}
            <div className="mb-8">
              <h3 className="flex items-center gap-2 text-base font-semibold text-foreground mb-4">
                <Home className="h-4 w-4 text-primary" />
                Income & Expenses
              </h3>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                <InputField
                  label="Monthly Rent"
                  name="monthlyRent"
                  value={input.monthlyRent}
                  onChange={handleChange}
                  prefix="$"
                />
                <InputField
                  label="Vacancy Rate"
                  name="vacancyRatePercent"
                  value={input.vacancyRatePercent}
                  onChange={handleChange}
                  suffix="%"
                  helpText="Typical: 5-10%"
                />
                <InputField
                  label="Annual Property Tax"
                  name="annualPropertyTax"
                  value={input.annualPropertyTax}
                  onChange={handleChange}
                  prefix="$"
                />
                <InputField
                  label="Annual Insurance"
                  name="annualInsurance"
                  value={input.annualInsurance}
                  onChange={handleChange}
                  prefix="$"
                />
                <InputField
                  label="Monthly HOA"
                  name="monthlyHOA"
                  value={input.monthlyHOA}
                  onChange={handleChange}
                  prefix="$"
                />
                <InputField
                  label="Annual Maintenance"
                  name="annualMaintenance"
                  value={input.annualMaintenance}
                  onChange={handleChange}
                  prefix="$"
                  helpText="~1% of purchase price"
                />
              </div>
            </div>

            {/* Advanced Settings (collapsible) */}
            <div className="mb-8">
              <button
                onClick={() => setShowAdvanced(!showAdvanced)}
                className="flex items-center gap-2 text-sm font-medium text-primary hover:text-brand-700-dark transition-colors cursor-pointer"
              >
                <Percent className="h-4 w-4" />
                Advanced Projections
                {showAdvanced ? (
                  <ChevronUp className="h-4 w-4" />
                ) : (
                  <ChevronDown className="h-4 w-4" />
                )}
              </button>

              {showAdvanced && (
                <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3 border-t border-border pt-4">
                  <InputField
                    label="Annual Appreciation"
                    name="annualAppreciationPercent"
                    value={input.annualAppreciationPercent}
                    onChange={handleChange}
                    suffix="%"
                    helpText="US avg: 3-4%"
                  />
                  <InputField
                    label="Annual Rent Growth"
                    name="annualRentGrowthPercent"
                    value={input.annualRentGrowthPercent}
                    onChange={handleChange}
                    suffix="%"
                    helpText="US avg: 2-3%"
                  />
                </div>
              )}
            </div>

            {/* Analyze Button */}
            <button
              onClick={handleAnalyze}
              disabled={loading}
              className="w-full rounded-xl bg-primary py-3.5 text-sm font-semibold text-primary-foreground shadow-lg shadow-brand-700/20 transition-all duration-200 hover:bg-brand-700-dark hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Analyzing Property...
                </>
              ) : (
                <>
                  <Calculator className="h-4 w-4" />
                  Analyze Investment
                </>
              )}
            </button>
          </div>

          {/* Results */}
          {result && (
            <div className="mt-8 space-y-6">
              {/* Investment Score Card */}
              <div className="rounded-xl border border-border bg-card p-6 sm:p-8 shadow-sm">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
                  <div>
                    <h3 className="text-xl font-bold text-foreground">
                      Investment Score
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      Weighted analysis of key investment metrics
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    {(() => {
                      const ScoreIcon = getScoreIcon(result.investmentScore);
                      return (
                        <ScoreIcon
                          className={`h-8 w-8 ${getScoreColor(result.investmentScore)}`}
                        />
                      );
                    })()}
                    <div className="text-right">
                      <div
                        className={`text-4xl font-bold ${getScoreColor(result.investmentScore)}`}
                      >
                        {result.investmentScore}
                        <span className="text-lg text-muted-foreground">/10</span>
                      </div>
                      <div
                        className={`text-sm font-medium ${getScoreColor(result.investmentScore)}`}
                      >
                        {getScoreLabel(result.investmentScore)}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Score Breakdown */}
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
                  {[
                    { label: "Cash Flow", value: result.scoreBreakdown.cashFlowScore, weight: "30%" },
                    { label: "Cap Rate", value: result.scoreBreakdown.capRateScore, weight: "20%" },
                    { label: "Cash-on-Cash", value: result.scoreBreakdown.cashOnCashScore, weight: "25%" },
                    { label: "DSCR", value: result.scoreBreakdown.dscScore, weight: "15%" },
                    { label: "Appreciation", value: result.scoreBreakdown.appreciationScore, weight: "10%" },
                  ].map((item) => (
                    <div key={item.label} className="rounded-lg bg-muted/50 p-3 text-center">
                      <div className="text-xs text-muted-foreground mb-1">
                        {item.label} <span className="text-[10px]">({item.weight})</span>
                      </div>
                      <div
                        className={`text-xl font-bold ${
                          item.value >= 7
                            ? "text-brand-700"
                            : item.value >= 5
                            ? "text-brand-500"
                            : "text-destructive"
                        }`}
                      >
                        {item.value}
                      </div>
                      {/* Progress bar */}
                      <div className="mt-1 h-1.5 w-full rounded-full bg-muted">
                        <div
                          className={`h-1.5 rounded-full transition-all duration-500 ${
                            item.value >= 7
                              ? "bg-brand-700"
                              : item.value >= 5
                              ? "bg-brand-500"
                              : "bg-destructive"
                          }`}
                          style={{ width: `${item.value * 10}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Key Metrics */}
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                {[
                  {
                    label: "Monthly Cash Flow",
                    value: `$${result.monthlyNetCashFlow.toFixed(0)}`,
                    sub: `$${result.annualNetCashFlow.toLocaleString()}/yr`,
                    positive: result.monthlyNetCashFlow >= 0,
                  },
                  {
                    label: "Cap Rate",
                    value: `${result.capRate}%`,
                    sub: "NOI / Purchase Price",
                    positive: result.capRate >= 5,
                  },
                  {
                    label: "Cash-on-Cash Return",
                    value: `${result.cashOnCashReturn}%`,
                    sub: `On $${result.totalCashNeeded.toLocaleString()} invested`,
                    positive: result.cashOnCashReturn >= 8,
                  },
                  {
                    label: "DSCR",
                    value: `${result.debtServiceCoverageRatio}`,
                    sub: result.debtServiceCoverageRatio >= 1.2 ? "Healthy" : "Below threshold",
                    positive: result.debtServiceCoverageRatio >= 1.2,
                  },
                ].map((metric) => (
                  <div
                    key={metric.label}
                    className="rounded-xl border border-border bg-card p-5 shadow-sm"
                  >
                    <div className="text-xs font-medium text-muted-foreground mb-1">
                      {metric.label}
                    </div>
                    <div
                      className={`text-2xl font-bold ${
                        metric.positive ? "text-brand-700" : "text-destructive"
                      }`}
                    >
                      {metric.value}
                    </div>
                    <div className="text-xs text-muted-foreground mt-0.5">
                      {metric.sub}
                    </div>
                  </div>
                ))}
              </div>

              {/* Monthly Breakdown */}
              <div className="rounded-xl border border-border bg-card p-6 sm:p-8 shadow-sm">
                <h3 className="text-lg font-bold text-foreground mb-4">
                  Monthly Breakdown
                </h3>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <h4 className="text-sm font-semibold text-brand-700 mb-3">Income</h4>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Gross Rent</span>
                        <span className="font-medium">${result.grossMonthlyIncome.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Vacancy Loss ({input.vacancyRatePercent}%)</span>
                        <span className="font-medium text-destructive">
                          -${(result.grossMonthlyIncome - result.effectiveMonthlyIncome).toFixed(0)}
                        </span>
                      </div>
                      <div className="flex justify-between text-sm border-t border-border pt-2 font-semibold">
                        <span>Effective Income</span>
                        <span className="text-brand-700">${result.effectiveMonthlyIncome.toFixed(0)}</span>
                      </div>
                    </div>
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold text-destructive mb-3">Expenses</h4>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Mortgage (P&I)</span>
                        <span className="font-medium">${result.monthlyMortgage.toFixed(0)}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Property Tax</span>
                        <span className="font-medium">${(input.annualPropertyTax / 12).toFixed(0)}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Insurance</span>
                        <span className="font-medium">${(input.annualInsurance / 12).toFixed(0)}</span>
                      </div>
                      {input.monthlyHOA > 0 && (
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">HOA</span>
                          <span className="font-medium">${input.monthlyHOA}</span>
                        </div>
                      )}
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Maintenance</span>
                        <span className="font-medium">${(input.annualMaintenance / 12).toFixed(0)}</span>
                      </div>
                      <div className="flex justify-between text-sm border-t border-border pt-2 font-semibold">
                        <span>Total Expenses</span>
                        <span className="text-destructive">${result.totalMonthlyExpenses.toFixed(0)}</span>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="mt-6 rounded-lg bg-muted/50 p-4 flex justify-between items-center">
                  <span className="font-semibold text-foreground">Net Monthly Cash Flow</span>
                  <span
                    className={`text-2xl font-bold ${
                      result.monthlyNetCashFlow >= 0 ? "text-brand-700" : "text-destructive"
                    }`}
                  >
                    ${result.monthlyNetCashFlow.toFixed(0)}/mo
                  </span>
                </div>
              </div>

              {/* Charts */}
              <ResultsDashboard result={result} />

              {/* AI Insight */}
              <div className="rounded-xl border border-brand-200 bg-brand-50 p-6 sm:p-8">
                <div className="flex items-center gap-2 mb-4">
                  <Brain className="h-5 w-5 text-brand-700" />
                  <h3 className="text-lg font-bold text-foreground">
                    AI Investment Insight
                  </h3>
                </div>
                {aiLoading ? (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Generating AI analysis...
                  </div>
                ) : aiInsight ? (
                  <div className="prose prose-sm max-w-none text-foreground/90 whitespace-pre-line leading-relaxed">
                    {aiInsight}
                  </div>
                ) : null}
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
