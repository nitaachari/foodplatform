import { useEffect, useState } from "react";
import { getMyDeliveriesRequest } from "../../api/order.api";
import { getMyEarningsRequest } from "../../api/deliveryPartner.api";
import Spinner from "../../components/ui/Spinner";
import EmptyState from "../../components/ui/EmptyState";
import EarningsStrip from "../../components/delivery/EarningsStrip";
import { formatCurrency } from "../../utils/format";

export default function DeliveryHistory() {
  const [orders, setOrders] = useState([]);
  const [earnings, setEarnings] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    Promise.all([getMyDeliveriesRequest(), getMyEarningsRequest()])
      .then(([ordersData, earningsData]) => {
        const delivered = (ordersData.orders || []).filter(
          (o) => o.orderStatus === "delivered"
        );
        setOrders(delivered);
        setEarnings(earningsData.earnings);
      })
      .catch((err) =>
        setError(err.response?.data?.message || "Couldn't load your delivery history.")
      )
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <Spinner label="Loading history" />;

  return (
    <div className="mx-auto max-w-2xl px-4 py-10">
      <h1 className="text-4xl">Delivery history</h1>

      {earnings && (
        <div className="mt-6">
          <EarningsStrip earnings={earnings} />
        </div>
      )}

      {error && <p className="mt-6 text-chili">{error}</p>}

      {!error && orders.length === 0 && (
        <EmptyState
          title="No deliveries yet"
          hint="Completed deliveries will show up here along with what you earned."
        />
      )}

      <div className="mt-6 divide-y divide-ink/10">
        {orders.map((order) => (
          <div key={order._id} className="flex items-center justify-between py-4">
            <div>
              <p className="font-mono text-xs text-ink/40">
                #{order._id.slice(-8)} ·{" "}
                {new Date(order.updatedAt).toLocaleDateString("en-IN", {
                  day: "numeric",
                  month: "short",
                })}
              </p>
              <p className="mt-0.5 text-sm">{order.restaurant?.name}</p>
            </div>
            <span className="font-mono text-sm text-curry">
              +{formatCurrency(order.pricing?.deliveryFee)}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
