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
    verdict = "Hold / Negotiate";
    verdictDetail = `At ${score}/10, this ${propType} shows moderate potential but falls short of ideal thresholds in certain areas. Consider negotiating the purchase price down 5-8% or exploring ways to increase rental income to improve the investment thesis.`;
  } else {
    verdict = "Pass";
    verdictDetail = `With a score of ${score}/10, this ${propType} carries more risk than reward in its current configuration. The numbers suggest the asking price of $${price.toLocaleString()} is likely above fair market value relative to achievable returns.`;
  }

  // Strengths
  const strengths: string[] = [];
  if (cf > 300) {
    strengths.push(
      `Generates $${cf.toFixed(0)}/month in net cash flow ($${(cf * 12).toFixed(0)}/year), providing strong passive income from day one`
    );
  } else if (cf > 0) {
    strengths.push(
      `Positive cash flow of $${cf.toFixed(0)}/month establishes a foundation for returns while tenants pay down mortgage principal`
    );
  }
  if (cap >= 6) {
    strengths.push(
      `Cap rate of ${cap}% exceeds the national average of 4.5-5.5%, indicating favorable price-to-income ratio`
    );
  } else if (cap >= 4) {
    strengths.push(
      `Cap rate of ${cap}% is within the acceptable range for a stable ${propType} in an established market`
    );
  }
  if (coc >= 10) {
    strengths.push(
      `Cash-on-cash return of ${coc}% significantly outperforms typical savings and bond yields, maximizing the leverage of your $${result.downPayment.toLocaleString()} down payment`
    );
  } else if (coc >= 5) {
    strengths.push(
      `Cash-on-cash return of ${coc}% provides a reasonable return on your initial $${result.totalCashNeeded.toLocaleString()} investment`
    );
  }
  if (dscr >= 1.25) {
    strengths.push(
      `DSCR of ${dscr} demonstrates comfortable debt coverage — lenders typically require 1.20+, and this exceeds that benchmark`
    );
  }
  if (p10) {
    strengths.push(
      `10-year projected equity of $${p10.equity.toLocaleString()} with cumulative cash flow of $${p10.cumulativeCashFlow.toLocaleString()} builds substantial long-term wealth`
    );
  }

  // Risks
  const risks: string[] = [];
  if (cf < 0) {
    risks.push(
      `Negative cash flow of $${Math.abs(cf).toFixed(0)}/month means the property costs you money each month — budget at least $${(Math.abs(cf) * 12).toFixed(0)}/year in reserves`
    );
  } else if (cf < 150) {
    risks.push(
      `Thin cash flow margin of $${cf.toFixed(0)}/month leaves little buffer for unexpected repairs or extended vacancy periods`
    );
  }
  if (dscr < 1.2) {
    risks.push(
      `DSCR of ${dscr} is below the 1.20 threshold preferred by lenders — a 1-2% interest rate increase or rent reduction could push this into negative territory`
    );
  }
  if (input.vacancyRatePercent < 5) {
    risks.push(
      `Vacancy assumption of ${input.vacancyRatePercent}% may be optimistic — national averages range from 5-10% depending on market and property type`
    );
  } else {
    risks.push(
      `At ${input.vacancyRatePercent}% assumed vacancy, verify this aligns with actual market conditions in ${input.city}, ${input.state} using local rental data`
    );
  }
  if (cap < 4) {
    risks.push(
      `Below-average cap rate of ${cap}% suggests premium pricing relative to income — appreciation assumptions become critical to total returns`
    );
  }
  risks.push(
    `Property insurance and tax rates can increase annually — model a 2-3% expense growth to stress-test your hold strategy`
  );

  // Projections summary
  let projectionSummary = "";
  if (p5 && p10 && p20) {
    projectionSummary = `\n\n**Projection Highlights:**\n- **Year 5:** Property value reaches $${p5.propertyValue.toLocaleString()} with $${p5.equity.toLocaleString()} in equity and $${p5.cumulativeCashFlow.toLocaleString()} cumulative cash flow\n- **Year 10:** Equity grows to $${p10.equity.toLocaleString()} with total returns of $${p10.totalReturn.toLocaleString()}\n- **Year 20:** Full projection shows $${p20.propertyValue.toLocaleString()} property value, $${p20.equity.toLocaleString()} equity, and $${p20.totalReturn.toLocaleString()} total return`;
  }

  // Next steps
  const steps: string[] = [];
  if (score >= 6) {
    steps.push(
      "Order a professional property inspection and request seller disclosures to validate condition assumptions"
    );
    steps.push(
      `Pull comparable sales data within 0.5 miles for the past 6 months to confirm the $${price.toLocaleString()} asking price is at or below market value`
    );
    steps.push(
      `Contact 2-3 local property managers to verify the $${input.monthlyRent.toLocaleString()}/month rent estimate and current vacancy rates in ${input.city}`
    );
  } else {
    steps.push(
      `Negotiate the purchase price down to $${Math.round(price * 0.92).toLocaleString()}-$${Math.round(price * 0.95).toLocaleString()} to bring returns into acceptable range`
    );
    steps.push(
      `Explore value-add opportunities (cosmetic upgrades, additional units, rent optimization) that could increase monthly income by $200-400`
    );
    steps.push(
      "Compare this property against 3-5 alternative listings in the same market before committing"
    );
  }

  return `**${verdict}** — ${verdictDetail}

**Strengths:**
${strengths
  .slice(0, 4)
  .map((s) => `- ${s}`)
  .join("\n")}

**Risks:**
${risks
  .slice(0, 3)
  .map((r) => `- ${r}`)
  .join("\n")}${projectionSummary}

**Recommended Next Steps:**
${steps.map((s, i) => `${i + 1}. ${s}`).join("\n")}

---
*Analysis generated by REIPro Investment Engine v2.0 — based on ${result.projections.length}-year amortization modeling with ${input.annualAppreciationPercent}% annual appreciation and ${input.annualRentGrowthPercent}% rent growth assumptions.*`;
}
