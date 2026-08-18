import axios from "axios";

// Backend uses an httpOnly cookie ("token") for auth, set by /api/auth/login
// and /api/auth/register. withCredentials is required on every request so
// the browser sends/receives that cookie, and CORS on the server must have
// a matching `credentials: true` + exact origin (already configured in app.js).
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:5000/api",
  withCredentials: true,
});

export default api;
//we do this so that you can very easily change the url for backend instead of changing it for each axios.post 