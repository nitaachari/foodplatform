import api from "./axios";

// POST /api/orders  { deliveryAddress, paymentMethod }
export const createOrderRequest = (deliveryAddress, paymentMethod) =>
  api.post("/orders", { deliveryAddress, paymentMethod }).then((res) => res.data);

// GET /api/orders/my
export const getMyOrdersRequest = () =>
  api.get("/orders/my").then((res) => res.data);

// GET /api/orders/:id
export const getOrderByIdRequest = (id) =>
  api.get(`/orders/${id}`).then((res) => res.data);

// PATCH /api/orders/:id/cancel  { reason }
export const cancelOrderRequest = (id, reason) =>
  api.patch(`/orders/${id}/cancel`, { reason }).then((res) => res.data);

// ---- Restaurant-owner endpoints ----

// GET /api/orders/restaurant (resolves the restaurant from the logged-in owner)
export const getRestaurantOrdersRequest = () =>
  api.get("/orders/restaurant").then((res) => res.data);

// PATCH /api/orders/:id/status  { status }
// Valid transitions (enforced server-side): placed -> accepted | rejected,
// accepted -> preparing, preparing -> ready. Anything past "ready" is handled
// by a delivery partner, not the restaurant.
export const updateOrderStatusRequest = (id, status) =>
  api.patch(`/orders/${id}/status`, { status }).then((res) => res.data);

// ---- Delivery-partner endpoints ----

// GET /api/orders/available
// Orders that are "ready" and have no delivery partner assigned yet.
export const getAvailableOrdersRequest = () =>
  api.get("/orders/available").then((res) => res.data);

// GET /api/orders/delivery/my
// Current + past orders assigned to the logged-in delivery partner.
export const getMyDeliveriesRequest = () =>
  api.get("/orders/delivery/my").then((res) => res.data);

// PATCH /api/orders/:id/assign
// Self-assign: the logged-in delivery partner claims this order. Requires
// the partner to be "online" and the order to be "ready" (enforced server-side).
export const assignDeliveryPartnerRequest = (id) =>
  api.patch(`/orders/${id}/assign`).then((res) => res.data);

// PATCH /api/orders/:id/delivery-status  { status }
// Only "delivered" is meaningful here in practice, since assigning already
// moves the order to "out_for_delivery".
export const updateDeliveryStatusRequest = (id, status) =>
  api.patch(`/orders/${id}/delivery-status`, { status }).then((res) => res.data);
