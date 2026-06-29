export interface PropertyInput {
  address: string;
  city: string;
  state: string;
  zipCode: string;
  purchasePrice: number;
  downPaymentPercent: number;
  interestRate: number;
  loanTermYears: number;
  propertyType: "single-family" | "multi-unit" | "commercial" | "condo";
  monthlyRent: number;
  vacancyRatePercent: number;
  annualPropertyTax: number;
  annualInsurance: number;
  monthlyHOA: number;
  annualMaintenance: number;
  annualAppreciationPercent: number;
  annualRentGrowthPercent: number;
  closingCostPercent: number;
}

export interface AnalysisResult {
  loanAmount: number;
  downPayment: number;
  monthlyMortgage: number;
  closingCosts: number;
  totalCashNeeded: number;
  grossMonthlyIncome: number;
  effectiveMonthlyIncome: number;
  totalMonthlyExpenses: number;
  monthlyNetCashFlow: number;
  annualNetCashFlow: number;
  capRate: number;
  cashOnCashReturn: number;
  grossRentMultiplier: number;
  debtServiceCoverageRatio: number;
  projections: YearProjection[];
  investmentScore: number;
  scoreBreakdown: ScoreBreakdown;
}

export interface YearProjection {
  year: number;
  annualRent: number;
  annualExpenses: number;
  annualCashFlow: number;
  propertyValue: number;
  equity: number;
  totalReturn: number;
  cumulativeCashFlow: number;
}

export interface ScoreBreakdown {
  cashFlowScore: number;
  capRateScore: number;
  cashOnCashScore: number;
  dscScore: number;
  appreciationScore: number;
}

function calculateMonthlyMortgage(
  principal: number,
  annualRate: number,
  years: number
): number {
  if (annualRate === 0) return principal / (years * 12);
  const monthlyRate = annualRate / 100 / 12;
  const numPayments = years * 12;
  return (
    (principal * monthlyRate * Math.pow(1 + monthlyRate, numPayments)) /
    (Math.pow(1 + monthlyRate, numPayments) - 1)
  );
}

function remainingBalance(
  principal: number,
  annualRate: number,
  totalYears: number,
  yearsPaid: number
): number {
  if (annualRate === 0) return principal * (1 - yearsPaid / totalYears);
  const monthlyRate = annualRate / 100 / 12;
  const totalPayments = totalYears * 12;
  const paymentsMade = yearsPaid * 12;
  const balance =
    principal *
    ((Math.pow(1 + monthlyRate, totalPayments) -
      Math.pow(1 + monthlyRate, paymentsMade)) /
      (Math.pow(1 + monthlyRate, totalPayments) - 1));
  return Math.max(0, balance);
}

function calculateInvestmentScore(
  monthlyNetCashFlow: number,
  capRate: number,
  cashOnCashReturn: number,
  dscr: number,
  appreciationRate: number
): ScoreBreakdown {
  let cashFlowScore: number;
  if (monthlyNetCashFlow >= 500) cashFlowScore = 10;
  else if (monthlyNetCashFlow >= 300) cashFlowScore = 8;
  else if (monthlyNetCashFlow >= 100) cashFlowScore = 6;
  else if (monthlyNetCashFlow >= 0) cashFlowScore = 4;
  else if (monthlyNetCashFlow >= -200) cashFlowScore = 2;
  else cashFlowScore = 1;

  let capRateScore: number;
  if (capRate >= 10) capRateScore = 10;
  else if (capRate >= 8) capRateScore = 9;
  else if (capRate >= 6) capRateScore = 7;
  else if (capRate >= 5) capRateScore = 6;
  else if (capRate >= 4) capRateScore = 5;
  else if (capRate >= 3) capRateScore = 3;
  else capRateScore = 1;

  let cashOnCashScore: number;
  if (cashOnCashReturn >= 15) cashOnCashScore = 10;
  else if (cashOnCashReturn >= 12) cashOnCashScore = 9;
  else if (cashOnCashReturn >= 10) cashOnCashScore = 8;
  else if (cashOnCashReturn >= 8) cashOnCashScore = 7;
  else if (cashOnCashReturn >= 5) cashOnCashScore = 5;
  else if (cashOnCashReturn >= 2) cashOnCashScore = 3;
  else cashOnCashScore = 1;

  let dscScore: number;
  if (dscr >= 1.5) dscScore = 10;
  else if (dscr >= 1.3) dscScore = 8;
  else if (dscr >= 1.2) dscScore = 7;
  else if (dscr >= 1.0) dscScore = 5;
  else if (dscr >= 0.8) dscScore = 3;
  else dscScore = 1;

  let appreciationScore: number;
  if (appreciationRate >= 5) appreciationScore = 10;
  else if (appreciationRate >= 4) appreciationScore = 8;
  else if (appreciationRate >= 3) appreciationScore = 7;
  else if (appreciationRate >= 2) appreciationScore = 5;
  else if (appreciationRate >= 1) appreciationScore = 3;
  else appreciationScore = 1;

  return {
    cashFlowScore,
    capRateScore,
    cashOnCashScore,
    dscScore,
    appreciationScore,
  };
}

export function analyzeProperty(input: PropertyInput): AnalysisResult {
  const downPayment = (input.purchasePrice * input.downPaymentPercent) / 100;
  const loanAmount = input.purchasePrice - downPayment;
  const monthlyMortgage = calculateMonthlyMortgage(
    loanAmount,
    input.interestRate,
    input.loanTermYears
  );
  const closingCosts = (input.purchasePrice * input.closingCostPercent) / 100;
  const totalCashNeeded = downPayment + closingCosts;

  const grossMonthlyIncome = input.monthlyRent;
  const vacancyLoss = grossMonthlyIncome * (input.vacancyRatePercent / 100);
  const effectiveMonthlyIncome = grossMonthlyIncome - vacancyLoss;

  const monthlyPropertyTax = input.annualPropertyTax / 12;
  const monthlyInsurance = input.annualInsurance / 12;
  const monthlyMaintenance = input.annualMaintenance / 12;

  const totalMonthlyExpenses =
    monthlyMortgage +
    monthlyPropertyTax +
    monthlyInsurance +
    input.monthlyHOA +
    monthlyMaintenance;

  const monthlyNetCashFlow = effectiveMonthlyIncome - totalMonthlyExpenses;
  const annualNetCashFlow = monthlyNetCashFlow * 12;

  const annualNOI =
    effectiveMonthlyIncome * 12 -
    (input.annualPropertyTax +
      input.annualInsurance +
      input.monthlyHOA * 12 +
      input.annualMaintenance);
  const capRate = (annualNOI / input.purchasePrice) * 100;
  const cashOnCashReturn =
    totalCashNeeded > 0 ? (annualNetCashFlow / totalCashNeeded) * 100 : 0;
  const grossRentMultiplier =
    grossMonthlyIncome > 0
      ? input.purchasePrice / (grossMonthlyIncome * 12)
      : 0;
  const annualDebtService = monthlyMortgage * 12;
  const debtServiceCoverageRatio =
    annualDebtService > 0 ? annualNOI / annualDebtService : 999;

  const projections: YearProjection[] = [];
  let cumulativeCashFlow = 0;

  for (let year = 1; year <= 20; year++) {
    const rentMultiplier = Math.pow(
      1 + input.annualRentGrowthPercent / 100,
      year - 1
    );
    const annualRent = effectiveMonthlyIncome * 12 * rentMultiplier;
    const expenseGrowth = Math.pow(1.02, year - 1);
    const annualExpenses =
      (totalMonthlyExpenses - monthlyMortgage) * 12 * expenseGrowth +
      monthlyMortgage * 12;
    const annualCashFlow = annualRent - annualExpenses;
    cumulativeCashFlow += annualCashFlow;

    const propertyValue =
      input.purchasePrice *
      Math.pow(1 + input.annualAppreciationPercent / 100, year);
    const loanBalance = remainingBalance(
      loanAmount,
      input.interestRate,
      input.loanTermYears,
      year
    );
    const equity = propertyValue - loanBalance;
    const totalReturn = equity - totalCashNeeded + cumulativeCashFlow;

    projections.push({
      year,
      annualRent: Math.round(annualRent),
      annualExpenses: Math.round(annualExpenses),
      annualCashFlow: Math.round(annualCashFlow),
      propertyValue: Math.round(propertyValue),
      equity: Math.round(equity),
      totalReturn: Math.round(totalReturn),
      cumulativeCashFlow: Math.round(cumulativeCashFlow),
    });
  }

  const scoreBreakdown = calculateInvestmentScore(
    monthlyNetCashFlow,
    capRate,
    cashOnCashReturn,
    debtServiceCoverageRatio,
    input.annualAppreciationPercent
  );

  const investmentScore =
    Math.round(
      (scoreBreakdown.cashFlowScore * 0.3 +
        scoreBreakdown.capRateScore * 0.2 +
        scoreBreakdown.cashOnCashScore * 0.25 +
        scoreBreakdown.dscScore * 0.15 +
        scoreBreakdown.appreciationScore * 0.1) *
        10
    ) / 10;

  return {
    loanAmount: Math.round(loanAmount),
    downPayment: Math.round(downPayment),
    monthlyMortgage: Math.round(monthlyMortgage * 100) / 100,
    closingCosts: Math.round(closingCosts),
    totalCashNeeded: Math.round(totalCashNeeded),
    grossMonthlyIncome: Math.round(grossMonthlyIncome),
    effectiveMonthlyIncome: Math.round(effectiveMonthlyIncome * 100) / 100,
    totalMonthlyExpenses: Math.round(totalMonthlyExpenses * 100) / 100,
    monthlyNetCashFlow: Math.round(monthlyNetCashFlow * 100) / 100,
    annualNetCashFlow: Math.round(annualNetCashFlow),
    capRate: Math.round(capRate * 100) / 100,
    cashOnCashReturn: Math.round(cashOnCashReturn * 100) / 100,
    grossRentMultiplier: Math.round(grossRentMultiplier * 100) / 100,
    debtServiceCoverageRatio:
      Math.round(debtServiceCoverageRatio * 100) / 100,
    projections,
    investmentScore,
    scoreBreakdown,
  };
}
