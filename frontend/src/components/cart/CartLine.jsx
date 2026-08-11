import { formatCurrency } from "../../utils/format";

export default function CartLine({ line, onInc, onDec, onRemove }) {
  const customizationTotal =
    line.customizations?.reduce((sum, c) => sum + (c.price || 0), 0) || 0;
  const lineTotal = (line.price + customizationTotal) * line.quantity;

  return (
    <div className="flex items-start justify-between gap-4 py-4">
      <div>
        <p className="leading-snug">{line.name}</p>
        {line.customizations?.length > 0 && (
          <p className="text-xs text-ink/50">
            {line.customizations.map((c) => c.choice).join(", ")}
          </p>
        )}
        <p className="mt-1 font-mono text-xs text-ink/50">
          {formatCurrency(line.price)} each
        </p>
      </div>

      <div className="flex flex-col items-end gap-2">
        <span className="font-mono text-sm">{formatCurrency(lineTotal)}</span>
        <div className="flex items-center gap-2 rounded-full border border-ink/15 px-1 py-0.5">
          <button
            onClick={() => onDec(line)}
            className="h-6 w-6 rounded-full text-chili hover:bg-chili/10"
            aria-label="Decrease quantity"
          >
            −
          </button>
          <span className="w-4 text-center font-mono text-xs">
            {line.quantity}
          </span>
          <button
            onClick={() => onInc(line)}
            className="h-6 w-6 rounded-full text-curry hover:bg-curry/10"
            aria-label="Increase quantity"
          >
            +
          </button>
        </div>
        <button
          onClick={() => onRemove(line)}
          className="text-xs text-ink/40 hover:text-chili"
        >
          Remove
        </button>
      </div>
    </div>
  );
}
