import { useState } from "react";
import { PaymentElement, useStripe, useElements } from "@stripe/react-stripe-js";
import { confirmPaymentRequest } from "../../api/payment.api";
import Button from "../ui/Button";

// Rendered inside <Elements clientSecret={...}> once Checkout.jsx has
// created the order + PaymentIntent. Confirms the card on Stripe's
// side, then asks our own server to double-check the result before
// treating the order as paid — see chat for why this step exists
// instead of relying on the webhook alone.
export default function StripePaymentStep({ paymentId, onSuccess, onCancel }) {
  const stripe = useStripe();
  const elements = useElements();

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!stripe || !elements) return;

    setSubmitting(true);
    setError("");

    // redirect: "if_required" keeps the flow on this page for card
    // payments that don't need an off-site redirect step, so we can
    // navigate to the order page ourselves on success — same pattern
    // the rest of this app already uses after placing an order.
    const { error: confirmError, paymentIntent } = await stripe.confirmPayment({
      elements,
      redirect: "if_required",
    });

    if (confirmError) {
      setError(confirmError.message || "Payment failed. Please try again.");
      setSubmitting(false);
      return;
    }

    if (paymentIntent?.status === "succeeded") {
      // Stripe confirmed it on the client side — now ask our own
      // server to pull the real status directly from Stripe and
      // update the order. This is what actually marks the order
      // paid; nothing about the client's report alone does that.
      try {
        await confirmPaymentRequest(paymentId);
      } catch (confirmErr) {
        setError(
          confirmErr.response?.data?.message ||
            "Card charged, but confirming the order failed. Contact support if this persists."
        );
        setSubmitting(false);
        return;
      }

      onSuccess();
      return;
    }

    // Any other status (processing, requires_action, etc.) — surface it
    // rather than pretending it succeeded.
    setError("Payment did not complete. Please try again.");
    setSubmitting(false);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <PaymentElement />

      {error && <p className="text-sm text-chili">{error}</p>}

      <div className="flex gap-3">
        <Button type="submit" disabled={!stripe || submitting} className="w-full">
          {submitting ? "Confirming payment…" : "Pay now"}
        </Button>
        <Button
          type="button"
          variant="ghost"
          disabled={submitting}
          onClick={onCancel}
        >
          Back
        </Button>
      </div>
    </form>
  );
}