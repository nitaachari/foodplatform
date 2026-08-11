import api from "./axios";

// POST /api/cart  { menuItemId, quantity, customizations? }
export const addToCartRequest = (data) =>
  api.post("/cart", data).then((res) => res.data);

// GET /api/cart
export const getCartRequest = () =>
  api.get("/cart").then((res) => res.data);

// PATCH /api/cart/item/:itemId  { quantity }
export const updateCartItemRequest = (itemId, quantity) =>
  api.patch(`/cart/item/${itemId}`, { quantity }).then((res) => res.data);

// DELETE /api/cart/item/:itemId
export const removeCartItemRequest = (itemId) =>
  api.delete(`/cart/item/${itemId}`).then((res) => res.data);

// DELETE /api/cart
export const clearCartRequest = () =>
  api.delete("/cart").then((res) => res.data);
