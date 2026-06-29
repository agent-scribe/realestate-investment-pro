import { NextRequest, NextResponse } from "next/server";
import type { AnalysisResult, PropertyInput } from "@/lib/calculations";

export async function POST(request: NextRequest) {
  try {
    const { input, result }: { input: PropertyInput; result: AnalysisResult } =
      await request.json();

    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { insight: getFallbackInsight(input, result) },
        { status: 200 }
      );
    }

    const prompt = buildPrompt(input, result);

    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [
          {
            role: "system",
            content:
              "You are a professional real estate investment analyst with 15+ years of experience. Provide concise, data-driven insights. Be specific with numbers. Use a professional but approachable tone. Structure your response with clear sections.",
          },
          { role: "user", content: prompt },
        ],
        max_tokens: 800,
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      return NextResponse.json(
        { insight: getFallbackInsight(input, result) },
        { status: 200 }
      );
    }

    const data = await response.json();
    const insight = data.choices?.[0]?.message?.content || getFallbackInsight(input, result);

    return NextResponse.json({ insight });
  } catch {
    return NextResponse.json(
      { error: "Analysis failed" },
      { status: 500 }
    );
  }
}

function buildPrompt(input: PropertyInput, result: AnalysisResult): string {
  return `Analyze this real estate investment and provide a professional assessment:

PROPERTY DETAILS:
- Address: ${input.address}, ${input.city}, ${input.state} ${input.zipCode}
- Type: ${input.propertyType}
- Purchase Price: $${input.purchasePrice.toLocaleString()}
- Down Payment: ${input.downPaymentPercent}%

KEY METRICS:
- Monthly Cash Flow: $${result.monthlyNetCashFlow.toFixed(2)}
- Cap Rate: ${result.capRate}%
- Cash-on-Cash Return: ${result.cashOnCashReturn}%
- DSCR: ${result.debtServiceCoverageRatio}
- Investment Score: ${result.investmentScore}/10
- Monthly Rent: $${input.monthlyRent.toLocaleString()}
- Vacancy Rate: ${input.vacancyRatePercent}%

5-YEAR PROJECTION:
- Property Value: $${result.projections[4]?.propertyValue.toLocaleString()}
- Total Equity: $${result.projections[4]?.equity.toLocaleString()}
- Cumulative Cash Flow: $${result.projections[4]?.cumulativeCashFlow.toLocaleString()}

Provide:
1. VERDICT (2 sentences: buy/hold/pass and why)
2. STRENGTHS (2-3 bullet points)
3. RISKS (2-3 bullet points)
4. RECOMMENDATION (1-2 actionable next steps)

Keep total response under 300 words.`;
}

function getFallbackInsight(input: PropertyInput, result: AnalysisResult): string {
  const verdict =
    result.investmentScore >= 7
      ? "Strong Buy"
      : result.investmentScore >= 5
      ? "Moderate Opportunity"
      : "Proceed with Caution";

  const cashFlowStatus =
    result.monthlyNetCashFlow > 0
      ? `generating $${result.monthlyNetCashFlow.toFixed(0)}/month positive cash flow`
      : `showing $${Math.abs(result.monthlyNetCashFlow).toFixed(0)}/month negative cash flow`;

  return `**${verdict}** — This ${input.propertyType} property at $${input.purchasePrice.toLocaleString()} is ${cashFlowStatus} with a ${result.capRate}% cap rate.

**Strengths:**
- Cash-on-cash return of ${result.cashOnCashReturn}% ${result.cashOnCashReturn >= 8 ? "(above market average)" : ""}
- DSCR of ${result.debtServiceCoverageRatio} ${result.debtServiceCoverageRatio >= 1.2 ? "indicates healthy debt coverage" : "— consider improving margins"}
- 5-year projected equity of $${result.projections[4]?.equity.toLocaleString()}

**Risks:**
- ${result.monthlyNetCashFlow < 0 ? "Negative cash flow requires reserves or additional income strategy" : "Cash flow margin could tighten with rate increases"}
- Vacancy rate assumption of ${input.vacancyRatePercent}% — verify against local market data
- ${result.capRate < 5 ? "Below-average cap rate suggests premium pricing" : "Market conditions may shift appreciation forecasts"}

**Next Steps:**
1. Verify comparable sales within 0.5 miles for the past 6 months
2. ${result.investmentScore >= 6 ? "Schedule property inspection and request seller disclosures" : "Consider negotiating price down 5-10% to improve returns"}`;
}
