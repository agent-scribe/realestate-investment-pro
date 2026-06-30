"use client";

import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  AreaChart,
  Area,
} from "recharts";
import type { AnalysisResult } from "@/lib/calculations";

interface Props {
  result: AnalysisResult;
}

const formatCurrency = (value: number) =>
  `$${(value / 1000).toFixed(0)}K`;

const formatFullCurrency = (value: number) =>
  `$${value.toLocaleString()}`;

export function ResultsDashboard({ result }: Props) {
  // Prepare chart data for key years
  const chartData = result.projections
    .filter((p) => [1, 2, 3, 5, 7, 10, 15, 20].includes(p.year))
    .map((p) => ({
      year: `Yr ${p.year}`,
      cashFlow: p.annualCashFlow,
      propertyValue: p.propertyValue,
      equity: p.equity,
      totalReturn: p.totalReturn,
      cumulativeCF: p.cumulativeCashFlow,
    }));

  // Full 20yr data for smooth lines
  const fullData = result.projections.map((p) => ({
    year: p.year,
    propertyValue: p.propertyValue,
    equity: p.equity,
    totalReturn: p.totalReturn,
    annualCashFlow: p.annualCashFlow,
    cumulativeCashFlow: p.cumulativeCashFlow,
  }));

  // 5-year summary table
  const summaryYears = [1, 5, 10, 15, 20];
  const summaryData = result.projections.filter((p) =>
    summaryYears.includes(p.year)
  );

  return (
    <div className="space-y-6">
      {/* Charts Grid */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Property Value & Equity */}
        <div className="rounded-xl border border-border bg-card p-5 shadow-sm">
          <h4 className="text-base font-semibold text-foreground mb-4">
            Property Value & Equity Growth
          </h4>
          <ResponsiveContainer width="100%" height={280}>
            <AreaChart data={fullData}>
              <defs>
                <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#1A5F4A" stopOpacity={0.15} />
                  <stop offset="95%" stopColor="#1A5F4A" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="colorEquity" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#2D8B6A" stopOpacity={0.15} />
                  <stop offset="95%" stopColor="#2D8B6A" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#E0E8E4" opacity={0.5} />
              <XAxis
                dataKey="year"
                tick={{ fill: "#5B7A6E", fontSize: 12 }}
                tickLine={false}
                axisLine={{ stroke: "#E0E8E4" }}
                label={{ value: "Year", position: "bottom", fill: "#5B7A6E", fontSize: 12, dy: 10 }}
              />
              <YAxis
                tickFormatter={formatCurrency}
                tick={{ fill: "#5B7A6E", fontSize: 12 }}
                tickLine={false}
                axisLine={{ stroke: "#E0E8E4" }}
              />
              <Tooltip
                formatter={(value: number) => formatFullCurrency(value)}
                contentStyle={{
                  borderRadius: "8px",
                  border: "1px solid #E0E8E4",
                  backgroundColor: "#FAF8F4",
                  fontSize: "13px",
                }}
              />
              <Legend
                wrapperStyle={{ fontSize: "12px", paddingTop: "8px" }}
              />
              <Area
                type="monotone"
                dataKey="propertyValue"
                stroke="#1A5F4A"
                strokeWidth={2}
                fill="url(#colorValue)"
                name="Property Value"
              />
              <Area
                type="monotone"
                dataKey="equity"
                stroke="#2D8B6A"
                strokeWidth={2}
                fill="url(#colorEquity)"
                name="Equity"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Cash Flow Over Time */}
        <div className="rounded-xl border border-border bg-card p-5 shadow-sm">
          <h4 className="text-base font-semibold text-foreground mb-4">
            Annual Cash Flow
          </h4>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E0E8E4" opacity={0.5} />
              <XAxis
                dataKey="year"
                tick={{ fill: "#5B7A6E", fontSize: 12 }}
                tickLine={false}
                axisLine={{ stroke: "#E0E8E4" }}
              />
              <YAxis
                tickFormatter={formatCurrency}
                tick={{ fill: "#5B7A6E", fontSize: 12 }}
                tickLine={false}
                axisLine={{ stroke: "#E0E8E4" }}
              />
              <Tooltip
                formatter={(value: number) => formatFullCurrency(value)}
                contentStyle={{
                  borderRadius: "8px",
                  border: "1px solid #E0E8E4",
                  backgroundColor: "#FAF8F4",
                  fontSize: "13px",
                }}
              />
              <Bar
                dataKey="cashFlow"
                fill="#1A5F4A"
                radius={[4, 4, 0, 0]}
                name="Annual Cash Flow"
              />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Total Return */}
        <div className="rounded-xl border border-border bg-card p-5 shadow-sm lg:col-span-2">
          <h4 className="text-base font-semibold text-foreground mb-4">
            Total Return (Equity + Cumulative Cash Flow - Initial Investment)
          </h4>
          <ResponsiveContainer width="100%" height={280}>
            <LineChart data={fullData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E0E8E4" opacity={0.5} />
              <XAxis
                dataKey="year"
                tick={{ fill: "#5B7A6E", fontSize: 12 }}
                tickLine={false}
                axisLine={{ stroke: "#E0E8E4" }}
                label={{ value: "Year", position: "bottom", fill: "#5B7A6E", fontSize: 12, dy: 10 }}
              />
              <YAxis
                tickFormatter={formatCurrency}
                tick={{ fill: "#5B7A6E", fontSize: 12 }}
                tickLine={false}
                axisLine={{ stroke: "#E0E8E4" }}
              />
              <Tooltip
                formatter={(value: number) => formatFullCurrency(value)}
                contentStyle={{
                  borderRadius: "8px",
                  border: "1px solid #E0E8E4",
                  backgroundColor: "#FAF8F4",
                  fontSize: "13px",
                }}
              />
              <Legend wrapperStyle={{ fontSize: "12px", paddingTop: "8px" }} />
              <Line
                type="monotone"
                dataKey="totalReturn"
                stroke="#1A5F4A"
                strokeWidth={2.5}
                dot={false}
                name="Total Return"
              />
              <Line
                type="monotone"
                dataKey="cumulativeCashFlow"
                stroke="#4DAA86"
                strokeWidth={2}
                strokeDasharray="5 5"
                dot={false}
                name="Cumulative Cash Flow"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Projection Table */}
      <div className="rounded-xl border border-border bg-card p-5 shadow-sm overflow-x-auto">
        <h4 className="text-base font-semibold text-foreground mb-4">
          Projection Summary
        </h4>
        <table className="w-full text-sm" role="table">
          <thead>
            <tr className="border-b border-border">
              <th className="py-2 pr-4 text-left font-medium text-muted-foreground">Year</th>
              <th className="py-2 px-4 text-right font-medium text-muted-foreground">Property Value</th>
              <th className="py-2 px-4 text-right font-medium text-muted-foreground">Annual Cash Flow</th>
              <th className="py-2 px-4 text-right font-medium text-muted-foreground">Cumulative CF</th>
              <th className="py-2 px-4 text-right font-medium text-muted-foreground">Equity</th>
              <th className="py-2 pl-4 text-right font-medium text-muted-foreground">Total Return</th>
            </tr>
          </thead>
          <tbody>
            {summaryData.map((row) => (
              <tr key={row.year} className="border-b border-border/50 last:border-0">
                <td className="py-2.5 pr-4 font-medium">Year {row.year}</td>
                <td className="py-2.5 px-4 text-right tabular-nums">
                  ${row.propertyValue.toLocaleString()}
                </td>
                <td
                  className={`py-2.5 px-4 text-right tabular-nums font-medium ${
                    row.annualCashFlow >= 0 ? "text-brand-700" : "text-destructive"
                  }`}
                >
                  ${row.annualCashFlow.toLocaleString()}
                </td>
                <td className="py-2.5 px-4 text-right tabular-nums">
                  ${row.cumulativeCashFlow.toLocaleString()}
                </td>
                <td className="py-2.5 px-4 text-right tabular-nums text-brand-700 font-medium">
                  ${row.equity.toLocaleString()}
                </td>
                <td className="py-2.5 pl-4 text-right tabular-nums font-bold text-brand-700">
                  ${row.totalReturn.toLocaleString()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
