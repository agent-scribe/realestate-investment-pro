import { NextRequest, NextResponse } from "next/server";
import type { AnalysisResult, PropertyInput } from "@/lib/calculations";

export async function POST(request: NextRequest) {
  try {
    const { input, result }: { input: PropertyInput; result: AnalysisResult } =
      await request.json();

    const apiKey = process.env.OPENAI_API_KEY;

    // Try OpenAI if key is available
    if (apiKey && apiKey !== "demo" && !apiKey.startsWith("sk-demo")) {
      try {
        const prompt = buildPrompt(input, result);
        const response = await fetch(
          "https://api.openai.com/v1/chat/completions",
          {
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
          }
        );

        if (response.ok) {
          const data = await response.json();
          const insight = data.choices?.[0]?.message?.content;
          if (insight) {
            return NextResponse.json({ insight });
          }
        }
      } catch {
        // Fall through to built-in engine
      }
    }

    // Built-in AI analysis engine (always works)
    return NextResponse.json(
      { insight: generateAnalysis(input, result) },
      { status: 200 }
    );
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

function generateAnalysis(
  input: PropertyInput,
  result: AnalysisResult
): string {
  const score = result.investmentScore;
  const cf = result.monthlyNetCashFlow;
  const cap = result.capRate;
  const coc = result.cashOnCashReturn;
  const dscr = result.debtServiceCoverageRatio;
  const p5 = result.projections[4];
  const p10 = result.projections[9];
  const p20 = result.projections[19];
  const price = input.purchasePrice;
  const propType =
    input.propertyType === "single-family"
      ? "single-family residence"
      : input.propertyType === "multi-unit"
      ? "multi-unit property"
      : input.propertyType === "condo"
      ? "condominium"
      : "commercial property";

  // Verdict
  let verdict: string;
  let verdictDetail: string;
  if (score >= 8) {
    verdict = "Strong Buy";
    verdictDetail = `This is an exceptional investment opportunity. With an investment score of ${score}/10, this ${propType} demonstrates strong fundamentals across all key metrics and is well-positioned for long-term wealth building.`;
  } else if (score >= 6.5) {
    verdict = "Buy";
    verdictDetail = `This ${propType} represents a solid investment with an overall score of ${score}/10. The property's cash flow profile and return metrics compare favorably to market benchmarks, making it a worthwhile addition to a diversified portfolio.`;
  } else if (score >= 5) {
    verdict = "Hold / Negotia