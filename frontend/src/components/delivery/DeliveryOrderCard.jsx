import { formatCurrency } from "../../utils/format";

const STATUS_BADGE = {
  ready: "bg-turmeric/10 text-turmeric",
  out_for_delivery: "bg-curry/10 text-curry",
  delivered: "bg-curry/10 text-curry",
};

// variant: "available" (browse & accept) | "active" (assigned to me, mark delivered) | "history" (read-only)
export default function DeliveryOrderCard({
  order,
  variant,
  onAccept,
  onDeliver,
  actionPending,
}) {
  return (
    <div className="rounded-xl border border-ink/10 bg-white p-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="font-mono text-xs text-ink/40">
            #{order._id.slice(-8)} ·{" "}
            {new Date(order.createdAt).toLocaleTimeString("en-IN", {
              hour: "2-digit",
              minute: "2-digit",
            })}
          </p>
          <p className="mt-0.5 text-sm font-medium">{order.restaurant?.name}</p>
          {order.restaurant?.address?.street && (
            <p className="text-xs text-ink/50">
              {order.restaurant.address.street}, {order.restaurant.address.city}
            </p>
          )}
        </div>
        <span
          className={`shrink-0 rounded-full px-2 py-0.5 text-xs capitalize ${
            STATUS_BADGE[order.orderStatus] || ""
          }`}
        >
          {order.orderStatus.replaceAll("_", " ")}
        </span>
      </div>

      <div className="mt-3 border-t border-ink/10 pt-3 text-sm">
        <p className="text-xs uppercase tracking-wide text-ink/40">Deliver to</p>
        <p className="mt-0.5">{order.customer?.name}</p>
        <p className="text-xs text-ink/60">
          {order.deliveryAddress?.street}, {order.deliveryAddress?.city}{" "}
          {order.deliveryAddress?.pincode}
        </p>
      </div>

      <div className="mt-3 flex items-center justify-between border-t border-ink/10 pt-3">
        <span className="font-mono text-sm">
          Delivery fee {formatCurrency(order.pricing?.deliveryFee)}
        </span>

        <div className="flex gap-2">
          {variant === "available" && (
            <button
              disabled={actionPending}
              onClick={() => onAccept(order)}
              className="rounded-full bg-curry px-3 py-1.5 text-xs text-paper hover:bg-curry/90 disabled:opacity-50"
            >
              {actionPending ? "Accepting…" : "Accept"}
            </button>
          )}

          {variant === "active" && (
            <button
              disabled={actionPending}
              onClick={() => onDeliver(order)}
              className="rounded-full bg-ink px-3 py-1.5 text-xs text-paper hover:bg-ink/90 disabled:opacity-50"
            >
              {actionPending ? "Updating…" : "Mark delivered"}
            </button>
          )}

          {variant === "history" && (
            <span className="text-xs text-ink/40">Delivered</span>
          )}
        </div>
      </div>
    </div>
  );
}
