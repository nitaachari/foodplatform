import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getMyOrdersRequest } from "../api/order.api";
import Spinner from "../components/ui/Spinner";
import EmptyState from "../components/ui/EmptyState";
import Button from "../components/ui/Button";
import { formatCurrency } from "../utils/format";

const STATUS_STYLES = {
  placed: "text-ink/70",
  accepted: "text-turmeric",
  preparing: "text-turmeric",
  ready: "text-turmeric",
  out_for_delivery: "text-turmeric",
  delivered: "text-curry",
  cancelled: "text-chili",
  rejected: "text-chili",
};

export default function OrderHistory() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    getMyOrdersRequest()
      .then((data) => setOrders(data.orders || []))
      .catch((err) => setError(err.response?.data?.message || "Couldn't load your orders."))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <Spinner label="Loading orders" />;

  return (
    <div className="mx-auto max-w-2xl px-4 py-10">
      <h1 className="text-4xl">Your orders</h1>

      {error && <p className="mt-6 text-chili">{error}</p>}

      {!error && orders.length === 0 && (
        <EmptyState
          title="No orders yet"
          hint="Once you place an order, it'll show up here."
          action={
            <Link to="/restaurants">
              <Button>Browse restaurants</Button>
            </Link>
          }
        />
      )}

      <div className="mt-6 divide-y divide-ink/10">
        {orders.map((order) => (
          <Link
            key={order._id}
            to={`/orders/${order._id}`}
            className="flex items-center justify-between py-4 hover:text-chili"
          >
            <div>
              <p className="font-mono text-xs text-ink/40">
                #{order._id.slice(-8)} ·{" "}
                {new Date(order.createdAt).toLocaleDateString("en-IN", {
                  day: "numeric",
                  month: "short",
                })}
              </p>
              <p className={`mt-0.5 text-sm capitalize ${STATUS_STYLES[order.orderStatus] || ""}`}>
                {order.orderStatus.replaceAll("_", " ")}
              </p>
            </div>
            <span className="font-mono text-sm">
              {formatCurrency(order.pricing?.total)}
            </span>
          </Link>
        ))}
      </div>
    </div>
  );
}
