import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Elements } from "@stripe/react-stripe-js";
import { useCart } from "../context/CartContext";
import { createOrderRequest } from "../api/order.api";
import { createPaymentRequest } from "../api/payment.api";
import { stripePromise } from "../utils/stripe";
import StripePaymentStep from "../components/checkout/StripePaymentStep";
import CartSummary from "../components/cart/CartSummary";
import Button from "../components/ui/Button";
import EmptyState from "../components/ui/EmptyState";

const PAYMENT_METHODS = [
  { value: "cod", label: "Cash on delivery" },
  { value: "card", label: "Card" },
];

export default function Checkout() {
  const { cart, refreshCart } = useCart();
  const navigate = useNavigate();

  const [address, setAddress] = useState({
    street: "",
    city: "",
    state: "",
    pincode: "",
    country: "India",
    longitude: "78.4867", // Default fallback longitude
    latitude: "17.3850",  // Default fallback latitude
  });

  const [paymentMethod, setPaymentMethod] = useState("cod");
  const [error, setError] = useState("");
  const [placing, setPlacing] = useState(false);

  // Once an order + Stripe PaymentIntent exist for a "card" checkout,
  // this holds what <Elements> needs to render the payment step in
  // place of the form below. Cleared if the customer backs out.
  const [cardPayment, setCardPayment] = useState(null);

  const handleChange = (e) =>
    setAddress((a) => ({ ...a, [e.target.name]: e.target.value }));

  // Checked before the empty-cart guard below: the backend clears the
  // cart as soon as the order is created (before payment happens), so
  // by the time a card payment is in progress `cart` may already be
  // stale/empty — that must never bounce the customer out of the
  // in-progress payment step.
  if (cardPayment) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-10">
        <h1 className="text-4xl">Checkout</h1>
        <section className="mt-8">
          <h2 className="text-sm uppercase tracking-wide text-ink/40">
            Payment
          </h2>
          <div className="mt-3">
            <Elements stripe={stripePromise} options={{ clientSecret: cardPayment.clientSecret }}>
              <StripePaymentStep
                paymentId={cardPayment.paymentId}
                onSuccess={async () => {
                  await refreshCart();
                  navigate(`/orders/${cardPayment.orderId}`, { replace: true });
                }}
                onCancel={() => setCardPayment(null)}
              />
            </Elements>
          </div>
        </section>
      </div>
    );
  }

  if (!cart || cart.items.length === 0) {
    return (
      <div className="mx-auto max-w-2xl px-4">
        <EmptyState
          title="Nothing to check out"
          hint="Add items to your cart first."
          action={
            <Link to="/">
              <Button>Browse restaurants</Button>
            </Link>
          }
        />
      </div>
    );
  }

  const handlePlaceOrder = async (e) => {
    e.preventDefault();
    setError("");
    setPlacing(true);

    try {
      // 1. Build complete GeoJSON format expected by MongoDB Order model
      const deliveryAddress = {
        street: address.street,
        city: address.city,
        state: address.state,
        pincode: address.pincode,
        country: address.country || "India",
        coordinates: {
          type: "Point",
          coordinates: [
            parseFloat(address.longitude) || 78.4867, // Longitude FIRST
            parseFloat(address.latitude) || 17.3850,   // Latitude SECOND
          ],
        },
      };

      // 2. Submit order payload
      const orderData = await createOrderRequest(deliveryAddress);
      const order = orderData.order;

      const paymentData = await createPaymentRequest(order._id, paymentMethod);

      if (paymentMethod === "card") {
        // Real gateway: hand off to Stripe Elements. The order is
        // already placed at this point — this step only confirms the
        // charge. paymentStatus flips to "paid" server-side, either
        // via the /confirm check or the Stripe webhook, not from
        // anything this page submits directly.
        setCardPayment({
          orderId: order._id,
          paymentId: paymentData.payment._id,
          clientSecret: paymentData.clientSecret,
        });
        setPlacing(false);
        return;
      }

      // Only "cod" remains at this point — nothing further to confirm.
      await refreshCart();
      navigate(`/orders/${order._id}`, { replace: true });
    } catch (err) {
      setError(err.response?.data?.message || "Couldn't place your order.");
    } finally {
      setPlacing(false);
    }
  };

  return (
    <div className="mx-auto max-w-2xl px-4 py-10">
      <h1 className="text-4xl">Checkout</h1>

      <form onSubmit={handlePlaceOrder} className="mt-8 space-y-8">
        <section>
          <h2 className="text-sm uppercase tracking-wide text-ink/40">
            Delivery address
          </h2>
          <div className="mt-3 space-y-3">
            <input
              name="street"
              placeholder="Street address"
              required
              value={address.street}
              onChange={handleChange}
              className="w-full rounded-lg border border-ink/15 bg-white px-3 py-2 text-sm outline-none focus:border-chili"
            />
            <div className="grid grid-cols-2 gap-3">
              <input
                name="city"
                placeholder="City"
                required
                value={address.city}
                onChange={handleChange}
                className="rounded-lg border border-ink/15 bg-white px-3 py-2 text-sm outline-none focus:border-chili"
              />
              <input
                name="state"
                placeholder="State"
                required
                value={address.state}
                onChange={handleChange}
                className="rounded-lg border border-ink/15 bg-white px-3 py-2 text-sm outline-none focus:border-chili"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <input
                name="pincode"
                placeholder="Pincode"
                required
                value={address.pincode}
                onChange={handleChange}
                className="rounded-lg border border-ink/15 bg-white px-3 py-2 text-sm outline-none focus:border-chili"
              />
              <input
                name="country"
                value={address.country}
                onChange={handleChange}
                className="rounded-lg border border-ink/15 bg-white px-3 py-2 text-sm outline-none focus:border-chili"
              />
            </div>

            {/* Geo Coordinates inputs */}
            <div className="grid grid-cols-2 gap-3 pt-1">
              <div>
                <label className="text-xs text-ink/50">Longitude</label>
                <input
                  type="number"
                  step="any"
                  name="longitude"
                  value={address.longitude}
                  onChange={handleChange}
                  className="w-full rounded-lg border border-ink/15 bg-white px-3 py-1.5 text-sm outline-none focus:border-chili"
                />
              </div>
              <div>
                <label className="text-xs text-ink/50">Latitude</label>
                <input
                  type="number"
                  step="any"
                  name="latitude"
                  value={address.latitude}
                  onChange={handleChange}
                  className="w-full rounded-lg border border-ink/15 bg-white px-3 py-1.5 text-sm outline-none focus:border-chili"
                />
              </div>
            </div>
          </div>
        </section>

        <section>
          <h2 className="text-sm uppercase tracking-wide text-ink/40">
            Payment method
          </h2>
          <div className="mt-3 space-y-2">
            {PAYMENT_METHODS.map((method) => (
              <label
                key={method.value}
                className={`flex cursor-pointer items-center gap-3 rounded-lg border px-3 py-2.5 text-sm ${
                  paymentMethod === method.value
                    ? "border-chili bg-chili/5"
                    : "border-ink/15"
                }`}
              >
                <input
                  type="radio"
                  name="paymentMethod"
                  value={method.value}
                  checked={paymentMethod === method.value}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                  className="accent-chili"
                />
                {method.label}
              </label>
            ))}
          </div>
        </section>

        <CartSummary subtotal={cart.totalAmount}>
          {error && <p className="mb-3 text-sm text-chili">{error}</p>}
          <Button type="submit" disabled={placing} className="w-full">
            {placing ? "Placing order…" : "Place order"}
          </Button>
        </CartSummary>
      </form>
    </div>
  );
}