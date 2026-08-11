import api from "./axios";

// GET /api/reviews/restaurant/:restaurantId (public, but this is how the
// owner views their own restaurant's reviews too)
export const getReviewsByRestaurantRequest = (restaurantId) =>
  api.get(`/reviews/restaurant/${restaurantId}`).then((res) => res.data);

// PATCH /api/reviews/:id/reply  { comment }  (restaurant-owner only)
export const replyToReviewRequest = (reviewId, comment) =>
  api.patch(`/reviews/${reviewId}/reply`, { comment }).then((res) => res.data);
