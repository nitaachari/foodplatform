import api from "./axios";

// GET /api/menu/restaurant/:restaurantId
export const getMenuByRestaurant = (restaurantId) =>
  api.get(`/menu/restaurant/${restaurantId}`).then((res) => res.data);

// GET /api/menu/category/:categoryId
export const getMenuByCategory = (categoryId) =>
  api.get(`/menu/category/${categoryId}`).then((res) => res.data);
