# foodly-frontend

React + Vite + Tailwind frontend for the customer flow: auth, browse restaurants,
menu + cart, checkout, and order tracking. Built against the Express/Mongo
backend routes in your `src/` (auth, restaurant, category, menu, cart, order,
payment).

## Setup

```bash
npm install
cp .env.example .env   # adjust VITE_API_URL if your backend isn't on :5000
npm run dev
```

Runs on **http://localhost:5173** — this matches the CORS origin already
configured in your backend's `app.js`.

## How auth works here

The backend sets an **httpOnly cookie** (`token`) on register/login rather than
returning a token in the JSON body, so the frontend never touches the JWT
directly. Every request goes through `src/api/axios.js` with
`withCredentials: true`, and `AuthContext` calls `GET /api/auth/me` on load to
figure out whether a previous session cookie is still valid.

## One backend bug fixed along the way

`src/middleware/auth.middleware.js` was exporting `module.exports = { protect }`
(an object), but every route file imports it as
`const protect = require("../middleware/auth.middleware")` — i.e. expecting the
function itself, not a wrapper object. That mismatch breaks **every protected
route** (`/me`, cart, orders, payments, restaurant management), which is most
of what this frontend calls. Changed the export to `module.exports = protect;`
to match how it's actually imported everywhere. If you already patched this
yourself, this change is a no-op.

## Structure

```
src/
  api/         one file per backend resource, thin wrappers around axios
  context/     AuthContext (session), CartContext (live cart state)
  components/  layout/ ui/ restaurant/ cart/ order/
  pages/       one per route
```

## Pricing note

`CartSummary` and the checkout page compute delivery fee (flat ₹40) and tax
(5% of subtotal) on the frontend purely for **display** before the order is
placed — these mirror `order.service.js`'s constants exactly. The actual
charged amounts always come from the order object the backend returns after
`POST /api/orders`, so a constant change on the backend only requires updating
`DELIVERY_FEE` / `TAX_RATE` in `CartSummary.jsx` to keep the preview in sync.

## Payment flow (currently mocked)

There's no real payment gateway wired in yet. For non-COD methods, checkout
calls `POST /api/payments/create` and then immediately
`POST /api/payments/verify` with a placeholder transaction id
(`MOCK-<orderId>`), just to exercise the flow end-to-end. Swap the verify step
for a real gateway callback (Razorpay, Stripe, etc.) when one exists —
it's isolated to `handlePlaceOrder` in `src/pages/Checkout.jsx`.

## Not built yet (out of scope for this pass)

Restaurant-owner dashboard, delivery-partner app, reviews, sockets/live
tracking, maps, search/recommendations, AI features — per your phased roadmap,
these come after the core customer flow is solid.
