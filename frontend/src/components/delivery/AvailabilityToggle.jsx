// Availability switch for delivery partners. "busy" is a server-driven state
// (set automatically when an order is accepted, cleared on delivery) so it's
// shown but not directly toggleable here.
export default function AvailabilityToggle({ status, onToggle, updating }) {
  const isOnline = status === "online";
  const isBusy = status === "busy";

  return (
    <div className="flex items-center justify-between rounded-xl border border-ink/10 bg-white p-4">
      <div className="flex items-center gap-2.5">
        <span
          className={`h-2.5 w-2.5 rounded-full ${
            isBusy ? "bg-turmeric" : isOnline ? "bg-curry" : "bg-ink/30"
          }`}
        />
        <span className="text-sm">
          {isBusy
            ? "On a delivery — back online once it's complete"
            : isOnline
            ? "You're online and visible to new orders"
            : "You're offline"}
        </span>
      </div>

      <button
        type="button"
        role="switch"
        aria-checked={isOnline}
        disabled={updating || isBusy}
        onClick={() => onToggle(isOnline ? "offline" : "online")}
        className={`relative h-7 w-12 shrink-0 rounded-full transition-colors disabled:cursor-not-allowed disabled:opacity-50 ${
          isOnline ? "bg-curry" : "bg-ink/20"
        }`}
      >
        <span
          className={`absolute top-0.5 h-6 w-6 rounded-full bg-white shadow transition-transform ${
            isOnline ? "translate-x-5" : "translate-x-0.5"
          }`}
        />
      </button>
    </div>
  );
}
