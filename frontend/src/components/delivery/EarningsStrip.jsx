import { formatCurrency } from "../../utils/format";

export default function EarningsStrip({ earnings }) {
  const stats = [
    { label: "Today", value: formatCurrency(earnings.todayEarnings) },
    { label: "This week", value: formatCurrency(earnings.weekEarnings) },
    { label: "All time", value: formatCurrency(earnings.totalEarnings) },
    { label: "Deliveries", value: earnings.totalDeliveries ?? 0 },
  ];

  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
      {stats.map((stat) => (
        <div
          key={stat.label}
          className="rounded-xl border border-ink/10 bg-white p-4 text-center"
        >
          <p className="font-mono text-xl">{stat.value}</p>
          <p className="mt-1 text-xs uppercase tracking-wide text-ink/50">
            {stat.label}
          </p>
        </div>
      ))}
    </div>
  );
}
