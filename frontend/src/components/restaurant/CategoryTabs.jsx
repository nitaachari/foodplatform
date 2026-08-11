export default function CategoryTabs({ categories, active, onChange }) {
  return (
    <div className="flex flex-wrap gap-2">
      <button
        onClick={() => onChange(null)}
        className={`rounded-full border px-4 py-1.5 text-sm transition-colors ${
          active === null
            ? "border-ink bg-ink text-paper"
            : "border-ink/15 text-ink/70 hover:border-ink/40"
        }`}
      >
        All
      </button>

      {categories.map((category) => (
        <button
          key={category._id}
          onClick={() => onChange(category._id)}
          className={`rounded-full border px-4 py-1.5 text-sm transition-colors ${
            active === category._id
              ? "border-ink bg-ink text-paper"
              : "border-ink/15 text-ink/70 hover:border-ink/40"
          }`}
        >
          {category.name}
        </button>
      ))}
    </div>
  );
}
