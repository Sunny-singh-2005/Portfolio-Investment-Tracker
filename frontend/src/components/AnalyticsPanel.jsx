import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";
import { StatBlock, EmptyState } from "./Bits";

const pct = (n) => (n == null ? "—" : `${Number(n) >= 0 ? "+" : ""}${Number(n).toFixed(2)}%`);
const num = (n, d = 2) => (n == null ? "—" : Number(n).toFixed(d));

export default function AnalyticsPanel({ analytics }) {
  const series =
    analytics?.valueSeries ?? analytics?.dailyValues ?? analytics?.history ?? null;

  return (
    <section className="mb-10">
      <h2 className="font-display text-sm font-semibold text-ink mb-3">
        Analytics &mdash; 90 day lookback
      </h2>

      {!analytics ? (
        <EmptyState
          title="Analytics not available yet"
          hint="Record at least one BUY transaction so there's a position to measure."
        />
      ) : (
        <>
          <div className="grid sm:grid-cols-3 gap-5 mb-5">
            <StatBlock
              label="Total return"
              value={pct(analytics.totalReturnPercent ?? analytics.totalReturn)}
              tone={(analytics.totalReturnPercent ?? analytics.totalReturn) >= 0 ? "gain" : "loss"}
            />
            <StatBlock
              label="Annualized volatility"
              value={`${num(analytics.annualizedVolatility ?? analytics.volatility)}%`}
            />
            <StatBlock
              label="Sharpe ratio"
              value={num(analytics.sharpeRatio, 2)}
              sub="risk-free 2.00%"
            />
          </div>

          {series && series.length > 0 && (
            <div className="stub-card rounded-sm px-4 py-4 h-56">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={series} margin={{ top: 8, right: 12, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="valueFill" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#2F6F4F" stopOpacity={0.35} />
                      <stop offset="100%" stopColor="#2F6F4F" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid stroke="#C4CCB8" strokeDasharray="2 4" vertical={false} />
                  <XAxis
                    dataKey="date"
                    tick={{ fontFamily: "IBM Plex Mono", fontSize: 10, fill: "#8A9A8B" }}
                    tickLine={false}
                    axisLine={{ stroke: "#C4CCB8" }}
                    minTickGap={40}
                  />
                  <YAxis
                    tick={{ fontFamily: "IBM Plex Mono", fontSize: 10, fill: "#8A9A8B" }}
                    tickLine={false}
                    axisLine={false}
                    width={60}
                    tickFormatter={(v) => `$${Number(v).toLocaleString()}`}
                  />
                  <Tooltip
                    contentStyle={{
                      fontFamily: "IBM Plex Mono",
                      fontSize: 12,
                      border: "1px solid #9AA88F",
                      borderRadius: 2,
                      background: "#FBFDF8",
                    }}
                    formatter={(v) => [`$${Number(v).toLocaleString()}`, "Value"]}
                  />
                  <Area
                    type="monotone"
                    dataKey="value"
                    stroke="#2F6F4F"
                    strokeWidth={2}
                    fill="url(#valueFill)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          )}
        </>
      )}
    </section>
  );
}
