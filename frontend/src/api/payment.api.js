import api from "./axios";

// POST /api/payments/create  { orderId, paymentMethod }
export const createPaymentRequest = (orderId, paymentMethod) =>
  api
    .post("/payments/create", { orderId, paymentMethod })
    .then((res) => res.data);

// POST /api/payments/confirm  { paymentId }
// Dev/local alternative to the webhook: asks the server to pull the
// PaymentIntent's real status from Stripe rather than waiting for a
// pushed event. See chat for the trade-off vs. the webhook.
export const confirmPaymentRequest = (paymentId) =>
  api
    .post("/payments/confirm", { paymentId })
    .then((res) => res.data);

// POST /api/payments/verify  { paymentId, transactionId }
export const verifyPaymentRequest = (paymentId, transactionId) =>
  api
    .post("/payments/verify", { paymentId, transactionId })
    .then((res) => res.data);