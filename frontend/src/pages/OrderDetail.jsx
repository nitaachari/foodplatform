import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { cancelOrderRequest, getOrderByIdRequest } from "../api/order.api";
import OrderStatusTracker from "../components/order/OrderStatusTracker";
import Button from "../components/ui/Button";
import Spinner from "../components/ui/Spinner";
import { formatCurrency } from "../utils/format";

const CANCELLABLE = ["placed", "accepted"];

export default function OrderDetail() {
  const { id } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [cancelling, setCancelling] = useState(false);

  const load = () => {
    setLoading(true);
    getOrderByIdRequest(id)
      .then((data) => setOrder(data.order))
      .catch((err) => setError(err.response?.data?.message || "Couldn't load this order."))
      .finally(() => setLoading(false));
  };

  useEffect(load, [id]);

  const handleCancel = async () => {
    const reason = window.prompt("Reason for cancelling (optional):", "") || undefined;
    setCancelling(true);
    try {
      await cancelOrderRequest(id, reason);
      load();
    } catch (err) {
      setError(err.response?.data?.message || "Couldn't cancel this order.");
    } finally {
      setCancelling(false);
    }
  };

  if (loading) return <Spinner label="Loading order" />;
  if (error) return <p className="mx-auto max-w-2xl px-4 py-16 text-chili">{error}</p>;
  if (!order) return null;

  return (
    <div className="mx-auto max-w-2xl px-4 py-10">
      <p className="font-mono text-xs uppercase tracking-wide text-ink/40">
        Order #{order._id.slice(-8)} 
      </p>
      <h1 className="mt-1 text-4xl">
        {order.orderStatus === "placed" ? "Order placed!" : "Order status"}
      </h1>

      <div className="mt-8">
        <OrderStatusTracker status={order.orderStatus} />
      </div>

      <div className="torn-bottom mt-10 bg-white pb-6">
        <div className="border border-dashed border-ink/20 p-6">
          <h3 className="font-display text-lg">Items</h3>
          <div className="mt-3 divide-y divide-dashed divide-ink/15">
            {order.items.map((item, i) => (
              <div key={i} className="flex justify-between py-2 font-mono text-sm">
                <span>
                  {item.quantity} × {item.name}
                </span>
                <span>{formatCurrency(item.price * item.quantity)}</span>
              </div>
            ))}
          </div>

          <dl className="mt-4 space-y-2 border-t border-dashed border-ink/20 pt-4 font-mono text-sm">
            <div className="flex justify-between text-ink/70">
              <dt>Subtotal</dt>
              <dd>{formatCurrency(order.pricing.subtotal)}</dd>
            </div>
            <div className="flex justify-between text-ink/70">
              <dt>Delivery fee</dt>
              <dd>{formatCurrency(order.pricing.deliveryFee)}</dd>
            </div>
            <div className="flex justify-between text-ink/70">
              <dt>Taxes</dt>
              <dd>{formatCurrency(order.pricing.tax)}</dd>
            </div>
            <div className="flex justify-between border-t border-dashed border-ink/20 pt-2 text-base text-ink">
              <dt>Total</dt>
              <dd>{formatCurrency(order.pricing.total)}</dd>
            </div>
          </dl>
        </div>
      </div>

      <div className="mt-6 text-sm text-ink/60">
        <p className="uppercase tracking-wide text-ink/40">Delivering to</p>
        <p className="mt-1">
          {order.deliveryAddress?.street}, {order.deliveryAddress?.city},{" "}
          {order.deliveryAddress?.state} {order.deliveryAddress?.pincode}
        </p>
      </div>

      <div className="mt-8 flex gap-3">
        <Link to="/orders">
          <Button variant="ghost">Back to orders</Button>
        </Link>
        {CANCELLABLE.includes(order.orderStatus) && (
          <Button variant="ghost" onClick={handleCancel} disabled={cancelling}>
            {cancelling ? "Cancelling…" : "Cancel order"}
          </Button>
        )}
      </div>
    </div>
  );
}
