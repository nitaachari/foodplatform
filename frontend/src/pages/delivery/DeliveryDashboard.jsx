import { useEffect, useMemo, useState } from "react";
import {
  createDeliveryProfileRequest,
  getMyDeliveryProfileRequest,
  updateAvailabilityRequest,
  getMyEarningsRequest,
} from "../../api/deliveryPartner.api";
import {
  getAvailableOrdersRequest,
  getMyDeliveriesRequest,
  assignDeliveryPartnerRequest,
  updateDeliveryStatusRequest,
} from "../../api/order.api";
import { usePolling } from "../../hooks/usePolling";
import AvailabilityToggle from "../../components/delivery/AvailabilityToggle";
import EarningsStrip from "../../components/delivery/EarningsStrip";
import DeliveryOrderCard from "../../components/delivery/DeliveryOrderCard";
import Button from "../../components/ui/Button";
import Spinner from "../../components/ui/Spinner";
import EmptyState from "../../components/ui/EmptyState";

const POLL_INTERVAL_MS = 8000;
const VEHICLE_TYPES = ["bike", "scooter", "car"];

// Shown once, the first time a "delivery" user lands on the dashboard, since
// DeliveryPartner is a separate profile from the User account (same pattern
// RestaurantDashboard uses for the Restaurant profile).
function ProfileSetupForm({ onCreated }) {
  const [form, setForm] = useState({
    phone: "",
    licenseNumber: "",
    vehicleType: "bike",
    vehicleNumber: "",
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError("");
    try {
      await createDeliveryProfileRequest({
        phone: form.phone,
        licenseNumber: form.licenseNumber,
        vehicleDetails: {
          type: form.vehicleType,
          vehicleNumber: form.vehicleNumber,
        },
      });
      onCreated();
    } catch (err) {
      setError(err.response?.data?.message || "Couldn't create your profile.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="mx-auto max-w-md px-4 py-10">
      <h1 className="text-3xl">Set up your delivery profile</h1>
      <p className="mt-1 text-sm text-ink/60">
        A few details are needed before you can start accepting deliveries.
      </p>

      <form
        onSubmit={handleSubmit}
        className="mt-6 space-y-4 rounded-xl border border-ink/10 bg-white p-5"
      >
        <div>
          <label className="text-sm text-ink/70">Phone *</label>
          <input
            required
            value={form.phone}
            onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))}
            className="mt-1 w-full rounded-lg border border-ink/15 px-3 py-2 text-sm outline-none focus:border-chili"
          />
        </div>

        <div>
          <label className="text-sm text-ink/70">License number *</label>
          <input
            required
            value={form.licenseNumber}
            onChange={(e) =>
              setForm((f) => ({ ...f, licenseNumber: e.target.value }))
            }
            className="mt-1 w-full rounded-lg border border-ink/15 px-3 py-2 text-sm outline-none focus:border-chili"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-sm text-ink/70">Vehicle type *</label>
            <select
              value={form.vehicleType}
              onChange={(e) =>
                setForm((f) => ({ ...f, vehicleType: e.target.value }))
              }
              className="mt-1 w-full rounded-lg border border-ink/15 px-3 py-2 text-sm outline-none focus:border-chili"
            >
              {VEHICLE_TYPES.map((v) => (
                <option key={v} value={v} className="capitalize">
                  {v}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-sm text-ink/70">Vehicle number *</label>
            <input
              required
              value={form.vehicleNumber}
              onChange={(e) =>
                setForm((f) => ({ ...f, vehicleNumber: e.target.value }))
              }
              className="mt-1 w-full rounded-lg border border-ink/15 px-3 py-2 text-sm outline-none focus:border-chili"
            />
          </div>
        </div>

        {error && <p className="text-sm text-chili">{error}</p>}

        <Button type="submit" disabled={submitting} className="w-full">
          {submitting ? "Saving…" : "Create profile"}
        </Button>
      </form>
    </div>
  );
}

export default function DeliveryDashboard() {
  const [profile, setProfile] = useState(null);
  const [needsSetup, setNeedsSetup] = useState(false);
  const [loading, setLoading] = useState(true);

  const [availableOrders, setAvailableOrders] = useState([]);
  const [myDeliveries, setMyDeliveries] = useState([]);
  const [earnings, setEarnings] = useState(null);

  const [error, setError] = useState("");
  const [pendingId, setPendingId] = useState(null);
  const [togglePending, setTogglePending] = useState(false);

  const loadProfile = async () => {
    try {
      const data = await getMyDeliveryProfileRequest();
      setProfile(data.profile);
      setNeedsSetup(false);
    } catch (err) {
      if (err.response?.status === 404) {
        setNeedsSetup(true);
      } else {
        setError(err.response?.data?.message || "Couldn't load your profile.");
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProfile();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const loadOrders = async () => {
    if (needsSetup) return;
    try {
      const [availableData, myData] = await Promise.all([
        getAvailableOrdersRequest(),
        getMyDeliveriesRequest(),
      ]);
      setAvailableOrders(availableData.orders || []);
      setMyDeliveries(myData.orders || []);
      setError("");
    } catch (err) {
      setError(err.response?.data?.message || "Couldn't load orders.");
    }
  };

  // Same reasoning as RestaurantOrders: no websocket layer yet, so this
  // polls every few seconds to approximate real-time updates.
  usePolling(loadOrders, POLL_INTERVAL_MS);

  const loadEarnings = async () => {
    if (needsSetup) return;
    try {
      const data = await getMyEarningsRequest();
      setEarnings(data.earnings);
    } catch {
      // Non-critical for this view — the browse/accept flow still works
      // even if the earnings strip fails to load.
    }
  };

  useEffect(() => {
    if (profile) loadEarnings();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [profile?.status]);

  const activeDeliveries = useMemo(
    () => myDeliveries.filter((o) => o.orderStatus === "out_for_delivery"),
    [myDeliveries]
  );

  const handleToggle = async (status) => {
    setTogglePending(true);
    setError("");
    try {
      const data = await updateAvailabilityRequest(status);
      setProfile(data.profile);
    } catch (err) {
      setError(err.response?.data?.message || "Couldn't update your availability.");
    } finally {
      setTogglePending(false);
    }
  };

  const handleAccept = async (order) => {
    setPendingId(order._id);
    setError("");
    try {
      await assignDeliveryPartnerRequest(order._id);
      await loadProfile();
      await loadOrders();
    } catch (err) {
      setError(err.response?.data?.message || "Couldn't accept this order.");
    } finally {
      setPendingId(null);
    }
  };

  const handleDeliver = async (order) => {
    setPendingId(order._id);
    setError("");
    try {
      await updateDeliveryStatusRequest(order._id, "delivered");
      await loadProfile();
      await loadOrders();
      await loadEarnings();
    } catch (err) {
      setError(err.response?.data?.message || "Couldn't update this delivery.");
    } finally {
      setPendingId(null);
    }
  };

  if (loading) return <Spinner label="Loading dashboard" />;
  if (needsSetup) return <ProfileSetupForm onCreated={loadProfile} />;

  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <h1 className="text-4xl">Available orders</h1>
      <p className="mt-1 text-sm text-ink/60">
        Updates automatically every few seconds.
      </p>

      <div className="mt-6">
        <AvailabilityToggle
          status={profile?.status}
          onToggle={handleToggle}
          updating={togglePending}
        />
      </div>

      {earnings && (
        <div className="mt-6">
          <EarningsStrip earnings={earnings} />
        </div>
      )}

      {error && <p className="mt-4 text-sm text-chili">{error}</p>}

      {activeDeliveries.length > 0 && (
        <div className="mt-8">
          <h2 className="text-2xl">Your active delivery</h2>
          <div className="mt-4 space-y-4">
            {activeDeliveries.map((order) => (
              <DeliveryOrderCard
                key={order._id}
                order={order}
                variant="active"
                onDeliver={handleDeliver}
                actionPending={pendingId === order._id}
              />
            ))}
          </div>
        </div>
      )}

      <div className="mt-8">
        <h2 className="text-2xl">Ready for pickup</h2>

        {profile?.status !== "online" && (
          <p className="mt-2 text-sm text-ink/50">
            Go online above to start accepting new orders.
          </p>
        )}

        {availableOrders.length === 0 ? (
          <div className="mt-4">
            <EmptyState
              title="Nothing available right now"
              hint="New orders will show up here as restaurants mark them ready for pickup."
            />
          </div>
        ) : (
          <div className="mt-4 space-y-4">
            {availableOrders.map((order) => (
              <DeliveryOrderCard
                key={order._id}
                order={order}
                variant="available"
                onAccept={handleAccept}
                actionPending={pendingId === order._id}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
