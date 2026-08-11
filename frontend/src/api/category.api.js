import api from "./axios";

// GET /api/categories/restaurant/:restaurantId
export const getCategoriesByRestaurant = (restaurantId) =>
  api
    .get(`/categories/restaurant/${restaurantId}`)
    .then((res) => res.data);
