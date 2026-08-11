import { useMemo, useState } from "react";
import {
  getRestaurantOrdersRequest,
  updateOrderStatusRequest,
} from "../../api/order.api";
import { usePolling } from "../../hooks/usePolling";
import OrderCard from "../../components/restaurant-owner/OrderCard";
import Spinner from "../../components/ui/Spinner";
import EmptyState from "../../components/ui/EmptyState";

// Terminal / out-of-the-restaurant's-hands statuses, grouped into one tab.
const HISTORY_STATUSES = ["out_for_delivery", "delivered", "cancelled", "rejected"];

const TABS = [
  { key: "placed", label: "New" },
  { key: "accepted", label: "Accepted" },
  { key: "preparing", label: "Preparing" },
  { key: "ready", label: "Ready" },
  { key: "history", label: "History" },
];

const POLL_INTERVAL_MS = 8000;

export default function RestaurantOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState("placed");
  const [pendingId, setPendingId] = useState(null);

  const loadOrders = async () => {
    try {
      const data = await getRestaurantOrdersRequest();
      setOrders(data.orders || []);
      setError("");
    } catch (err) {
      setError(err.response?.data?.message || "Couldn't load orders.");
    } finally {
      setLoading(false);
    }
  };

  // No websocket layer yet (that's a later phase per the project roadmap),
  // so this polls every few seconds to approximate real-time updates.
  usePolling(loadOrders, POLL_INTERVAL_MS);

  const handleAction = async (order, status) => {
    setPendingId(order._id);
    setError("");
    try {
      await updateOrderStatusRequest(order._id, status);
      await loadOrders();
    } catch (err) {
      setError(err.response?.data?.message || "Couldn't update that order.");
    } finally {
      setPendingId(null);
    }
  };

  const grouped = useMemo(() => {
    const groups = {
      placed: [],
      accepted: [],
      preparing: [],
      ready: [],
      history: [],
    };
    orders.forEach((order) => {
      if (HISTORY_STATUSES.includes(order.orderStatus)) {
        groups.history.push(order);
      } else if (groups[order.orderStatus]) {
        groups[order.orderStatus].push(order);
      }
    });
    return groups;
  }, [orders]);

  const visibleOrders = grouped[activeTab] || [];

  if (loading) return <Spinner label="Loading orders" />;

  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <h1 className="text-4xl">Orders</h1>
      <p className="mt-1 text-sm text-ink/60">
        Updates automatically every few seconds.
      </p>

      <div className="mt-6 flex flex-wrap gap-2 border-b border-ink/10 pb-3">
        {TABS.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`rounded-full border px-4 py-1.5 text-sm transition-colors ${
              activeTab === tab.key
                ? "border-ink bg-ink text-paper"
                : "border-ink/15 text-ink/70 hover:border-ink/40"
            }`}
          >
            {tab.label}
            {tab.key !== "history" && grouped[tab.key]?.length > 0 && (
              <span className="ml-1.5 font-mono text-xs">
                {grouped[tab.key].length}
              </span>
            )}
          </button>
        ))}
      </div>

      {error && <p className="mt-4 text-sm text-chili">{error}</p>}

      {visibleOrders.length === 0 ? (
        <div className="mt-6">
          <EmptyState
            title="Nothing here"
            hint="Orders will show up here as they come in."
          />
        </div>
      ) : (
        <div className="mt-6 space-y-4">
          {visibleOrders.map((order) => (
            <OrderCard
              key={order._id}
              order={order}
              onAction={handleAction}
              actionPending={pendingId === order._id}
            />
          ))}
        </div>
      )}
    </div>
  );
}
