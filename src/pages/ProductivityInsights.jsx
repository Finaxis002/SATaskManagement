// src/pages/ProductivityInsights.jsx
import { memo, useMemo } from "react";

const GLASS_STYLE =
  "md:backdrop-blur-xl bg-white/80 border border-white/20 shadow-[0_8px_32px_rgba(0,0,0,0.06)]";

const ProgressRing = memo(
  ({ value, maxValue, size = 120, strokeWidth = 8, color = "purple" }) => {
    const { center, radius, circumference, strokeDashoffset } = useMemo(() => {
      const c = size / 2;
      const r = c - strokeWidth;
      const circ = 2 * Math.PI * r;
      const pct = maxValue > 0 ? (value / maxValue) * 100 : 0;
      return {
        center: c,
        radius: r,
        circumference: circ,
        strokeDashoffset: circ - (pct / 100) * circ,
      };
    }, [size, strokeWidth, value, maxValue]);

    const colorClass =
      {
        purple: "stroke-purple-500",
        blue: "stroke-blue-500",
        green: "stroke-emerald-500",
        orange: "stroke-amber-500",
        red: "stroke-rose-500",
      }[color] || "stroke-purple-500";

    return (
      <div className="relative">
        <svg width={size} height={size} className="transform -rotate-90">
          <circle
            cx={center}
            cy={center}
            r={radius}
            stroke="currentColor"
            strokeWidth={strokeWidth}
            fill="none"
            className="text-gray-200"
          />
          <circle
            cx={center}
            cy={center}
            r={radius}
            stroke="currentColor"
            strokeWidth={strokeWidth}
            fill="none"
            className={colorClass}
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-2xl font-bold text-gray-900">{value}</span>
          <span className="text-sm text-gray-600">of {maxValue}</span>
        </div>
      </div>
    );
  }
);

const ProductivityInsights = memo(({ stats }) => {
  const { total, completed, progress, overdue, completionRate } =
    useMemo(() => {
      const t = stats?.TotalTask || 0;
      const c = stats?.Completed || 0;
      const p = stats?.Progress || 0;
      const o = stats?.Overdue || 0;
      const cr = t > 0 ? (c / t) * 100 : 0;
      return {
        total: t,
        completed: c,
        progress: p,
        overdue: o,
        completionRate: cr,
      };
    }, [stats]);

  const insights = useMemo(
    () => [
      {
        title: "Completion Rate",
        value: `${Math.round(completionRate)}%`,
        color:
          completionRate >= 75
            ? "text-green-600"
            : completionRate >= 50
            ? "text-amber-600"
            : "text-red-600",
      },
      {
        title: "Active Tasks",
        value: progress,
        color: progress <= 3 ? "text-blue-600" : "text-amber-600",
      },
      {
        title: "Overdue Items",
        value: overdue,
        color: overdue === 0 ? "text-green-600" : "text-red-600",
      },
    ],
    [completionRate, progress, overdue]
  );

  return (
    <div
      className={`${GLASS_STYLE} rounded-3xl p-6 shadow-xl border-0 ring-1 ring-white/20`}
    >
      <div className="flex items-center gap-3 mb-6">
        <div className="p-3 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600">
          <svg
            className="h-6 w-6 text-white"
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
            />
          </svg>
        </div>
        <div>
          <h3 className="text-lg font-bold text-gray-900">
            Productivity Insights
          </h3>
          <p className="text-sm text-gray-600">Your performance overview</p>
        </div>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        {insights.map(({ title, value, color }) => (
          <div key={title} className="text-center p-4 rounded-xl bg-white/50">
            <div className={`text-2xl font-bold ${color} mb-1`}>{value}</div>
            <div className="text-sm text-gray-600 font-medium">{title}</div>
          </div>
        ))}
      </div>
      <div className="flex justify-center">
        <ProgressRing
          value={completed}
          maxValue={total}
          size={100}
          strokeWidth={6}
          color="green"
        />
      </div>
    </div>
  );
});

export default ProductivityInsights;
