import { loadStripe } from "@stripe/stripe-js";

// loadStripe() caches its promise internally — safe to import this
// singleton anywhere <Elements> is needed.
export const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY);
