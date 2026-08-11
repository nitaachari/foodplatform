import api from "./axios";

// POST /api/delivery-partners  { phone, licenseNumber, vehicleDetails: { type, vehicleNumber } }
export const createDeliveryProfileRequest = (data) =>
  api.post("/delivery-partners", data).then((res) => res.data);

// GET /api/delivery-partners/me
export const getMyDeliveryProfileRequest = () =>
  api.get("/delivery-partners/me").then((res) => res.data);

// PATCH /api/delivery-partners/me/status  { status: "online" | "offline" | "busy" }
export const updateAvailabilityRequest = (status) =>
  api.patch("/delivery-partners/me/status", { status }).then((res) => res.data);

// PATCH /api/delivery-partners/me/location  { coordinates: [lng, lat] }
export const updateMyLocationRequest = (coordinates) =>
  api.patch("/delivery-partners/me/location", { coordinates }).then((res) => res.data);

// GET /api/delivery-partners/me/earnings
// Derived from delivered orders server-side (today / this week / all-time + recent deliveries).
export const getMyEarningsRequest = () =>
  api.get("/delivery-partners/me/earnings").then((res) => res.data);
