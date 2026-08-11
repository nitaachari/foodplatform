import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import Spinner from "../ui/Spinner";

export default function ProtectedRoute({ roles }) {
  const { user, checking } = useAuth();
  const location = useLocation();

  if (checking) return <Spinner label="Checking session" />;

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Optional: restrict a route to specific roles (e.g. roles={["restaurant"]}).
  // Omitting the prop keeps the old behavior -- any logged-in user passes.
  if (roles && !roles.includes(user.role)) {
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
}
