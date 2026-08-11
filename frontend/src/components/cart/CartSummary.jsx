import { formatCurrency } from "../../utils/format";

// Mirrors the backend's pricing snapshot logic exactly (order.service.js):
// deliveryFee is a flat Rs 40, tax is 5% of subtotal, discount is currently 0.
const DELIVERY_FEE = 40;
const TAX_RATE = 0.05;

export default function CartSummary({ subtotal, children }) {
  const tax = Math.round(subtotal * TAX_RATE * 100) / 100;
  const total = subtotal + DELIVERY_FEE + tax;

  return (
    <div className="torn-bottom bg-white pb-6">
      <div className="border border-dashed border-ink/20 p-6">
        <h3 className="font-display text-lg">Bill summary</h3>

        <dl className="mt-4 space-y-2 font-mono text-sm">
          <div className="flex justify-between text-ink/70">
            <dt>Subtotal</dt>
            <dd>{formatCurrency(subtotal)}</dd>
          </div>
          <div className="flex justify-between text-ink/70">
            <dt>Delivery fee</dt>
            <dd>{formatCurrency(DELIVERY_FEE)}</dd>
          </div>
          <div className="flex justify-between text-ink/70">
            <dt>Taxes (5%)</dt>
            <dd>{formatCurrency(tax)}</dd>
          </div>
          <div className="flex justify-between border-t border-dashed border-ink/20 pt-2 text-base text-ink">
            <dt>Total</dt>
            <dd>{formatCurrency(total)}</dd>
          </div>
        </dl>

        {children && <div className="mt-5">{children}</div>}
      </div>
    </div>
  );
}
