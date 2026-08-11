import api from "./axios";

// POST /api/auth/register  { name, email, password, phone, role? }
export const registerRequest = (data) =>
  api.post("/auth/register", data).then((res) => res.data);

// POST /api/auth/login  { email, password }
export const loginRequest = (data) =>
  api.post("/auth/login", data).then((res) => res.data);

// POST /api/auth/logout
export const logoutRequest = () =>
  api.post("/auth/logout").then((res) => res.data);

// GET /api/auth/me  (protected)
export const getMeRequest = () =>
  api.get("/auth/me").then((res) => res.data);
