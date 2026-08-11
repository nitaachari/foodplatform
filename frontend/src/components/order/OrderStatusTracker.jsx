const STEPS = [
  { key: "placed", label: "Placed" },
  { key: "accepted", label: "Accepted" },
  { key: "preparing", label: "Preparing" },
  { key: "ready", label: "Ready" },
  { key: "out_for_delivery", label: "On the way" },
  { key: "delivered", label: "Delivered" },
];

export default function OrderStatusTracker({ status }) {
  if (status === "cancelled" || status === "rejected") {
    return (
      <div className="flex items-center gap-2 rounded-lg bg-chili/10 px-4 py-3 text-sm text-chili">
        <span className="h-3 w-3 rounded-sm border border-chili" />
        Order {status}
      </div>
    );
  }

  const currentIndex = STEPS.findIndex((s) => s.key === status);

  return (
    <ol className="flex items-center">
      {STEPS.map((step, i) => {
        const done = i <= currentIndex;
        return (
          <li key={step.key} className="flex flex-1 items-center last:flex-none">
            <div className="flex flex-col items-center gap-1.5">
              <span
                className={`flex h-5 w-5 items-center justify-center rounded-[3px] border ${
                  done ? "border-curry" : "border-ink/20"
                }`}
              >
                {done && <span className="h-2 w-2 rounded-full bg-curry" />}
              </span>
              <span
                className={`text-[11px] ${
                  done ? "text-ink" : "text-ink/40"
                }`}
              >
                {step.label}
              </span>
            </div>
            {i < STEPS.length - 1 && (
              <span
                className={`mx-1 h-px flex-1 ${
                  i < currentIndex ? "bg-curry" : "bg-ink/15"
                }`}
              />
            )}
          </li>
        );
      })}
    </ol>
  );
}
