export default function Spinner({ label = "Loading" }) {
  return (
    <div
      role="status"
      aria-label={label}
      className="flex items-center justify-center py-12"
    >
      <span className="h-5 w-5 animate-spin rounded-sm border-2 border-ink/15 border-t-chili" />
      <span className="sr-only">{label}</span>
    </div>
  );
}
