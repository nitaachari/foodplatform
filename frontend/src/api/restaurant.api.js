import api from "./axios";

// GET /api/restaurants
export const getAllRestaurants = () =>
  api.get("/restaurants").then((res) => res.data);

// GET /api/restaurants/:id
export const getRestaurantById = (id) =>
  api.get(`/restaurants/${id}`).then((res) => res.data);

// GET /api/restaurants/my-restaurant (restaurant-owner only)
export const getMyRestaurantRequest = () =>
  api.get("/restaurants/my-restaurant").then((res) => res.data);
