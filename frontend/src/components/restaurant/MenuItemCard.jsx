import VegDot from "../ui/VegDot";
import Button from "../ui/Button";
import { formatCurrency } from "../../utils/format";

export default function MenuItemCard({ item, cartLine, onAdd, onInc, onDec, disabled }) {
  const price = item.discountPrice || item.price;

  return (
    <div className="flex items-start justify-between gap-4 border-b border-ink/10 py-5 last:border-none">
      <div className="flex flex-1 items-start gap-3">
        <VegDot type={item.foodType} />
        <div>
          <h4 className="leading-snug">{item.name}</h4>
          {item.description && (
            <p className="mt-0.5 text-sm text-ink/60 line-clamp-2">
              {item.description}
            </p>
          )}
          <p className="mt-1 font-mono text-sm">
            {formatCurrency(price)}
            {item.discountPrice && (
              <span className="ml-2 text-ink/40 line-through">
                {formatCurrency(item.price)}
              </span>
            )}
          </p>
          {!item.isAvailable && (
            <p className="mt-1 text-xs text-chili">Currently unavailable</p>
          )}
        </div>
      </div>

      {cartLine ? (
        <div className="flex shrink-0 items-center gap-3 rounded-full border border-ink/15 px-1 py-1">
          <button
            onClick={() => onDec(cartLine)}
            className="h-7 w-7 rounded-full text-chili hover:bg-chili/10"
            aria-label={`Decrease ${item.name} quantity`}
          >
            −
          </button>
          <span className="w-4 text-center font-mono text-sm">
            {cartLine.quantity}
          </span>
          <button
            onClick={() => onInc(cartLine)}
            className="h-7 w-7 rounded-full text-curry hover:bg-curry/10"
            aria-label={`Increase ${item.name} quantity`}
          >
            +
          </button>
        </div>
      ) : (
        <Button
          variant="ghost"
          className="shrink-0"
          disabled={disabled || !item.isAvailable}
          onClick={() => onAdd(item)}
        >
          Add
        </Button>
      )}
    </div>
  );
}
