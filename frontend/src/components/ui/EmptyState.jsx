export default function EmptyState({ title, hint, action }) {
  return (
    <div className="flex flex-col items-center gap-3 py-20 text-center">
      <h3 className="text-xl">{title}</h3>
      {hint && <p className="max-w-sm text-sm text-ink/60">{hint}</p>}
      {action}
    </div>
  );
}
