import { formatCurrency } from "../../utils/format";

const STATUS_BADGE = {
  placed: "bg-turmeric/10 text-turmeric",
  accepted: "bg-turmeric/10 text-turmeric",
  preparing: "bg-turmeric/10 text-turmeric",
  ready: "bg-curry/10 text-curry",
  out_for_delivery: "bg-curry/10 text-curry",
  delivered: "bg-curry/10 text-curry",
  cancelled: "bg-chili/10 text-chili",
  rejected: "bg-chili/10 text-chili",
};

export default function OrderCard({ order, onAction, actionPending }) {
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
          <p className="mt-0.5 text-sm">{order.customer?.name}</p>
          {order.customer?.phone && (
            <p className="text-xs text-ink/50">{order.customer.phone}</p>
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

      <ul className="mt-3 space-y-1 border-t border-ink/10 pt-3 text-sm">
        {order.items.map((item, i) => (
          <li key={i} className="flex justify-between">
            <span>
              {item.quantity} × {item.name}
            </span>
            <span className="font-mono text-ink/60">
              {formatCurrency(item.price * item.quantity)}
            </span>
          </li>
        ))}
      </ul>

      <div className="mt-3 flex items-center justify-between border-t border-ink/10 pt-3">
        <span className="font-mono text-sm">
          {formatCurrency(order.pricing?.total)}
        </span>

        <div className="flex gap-2">
          {order.orderStatus === "placed" && (
            <>
              <button
                disabled={actionPending}
                onClick={() => onAction(order, "rejected")}
                className="rounded-full border border-chili/30 px-3 py-1.5 text-xs text-chili hover:bg-chili/5 disabled:opacity-50"
              >
                Reject
              </button>
              <button
                disabled={actionPending}
                onClick={() => onAction(order, "accepted")}
                className="rounded-full bg-curry px-3 py-1.5 text-xs text-paper hover:bg-curry/90 disabled:opacity-50"
              >
                Accept
              </button>
            </>
          )}

          {order.orderStatus === "accepted" && (
            <button
              disabled={actionPending}
              onClick={() => onAction(order, "preparing")}
              className="rounded-full bg-ink px-3 py-1.5 text-xs text-paper hover:bg-ink/90 disabled:opacity-50"
            >
              {actionPending ? "Updating…" : "Start preparing"}
            </button>
          )}

          {order.orderStatus === "preparing" && (
            <button
              disabled={actionPending}
              onClick={() => onAction(order, "ready")}
              className="rounded-full bg-curry px-3 py-1.5 text-xs text-paper hover:bg-curry/90 disabled:opacity-50"
            >
              {actionPending ? "Updating…" : "Mark ready"}
            </button>
          )}

          {order.orderStatus === "ready" && (
            <span className="text-xs text-ink/40">Waiting for pickup</span>
          )}
        </div>
      </div>
    </div>
  );
}
