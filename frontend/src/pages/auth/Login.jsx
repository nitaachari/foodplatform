import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import Button from "../../components/ui/Button";

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleChange = (e) =>
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSubmitting(true);

    try {
      // 1. Send login credentials to backend
      const res = await login(form);

      // 2. Extract user role from backend response or AuthContext state
      const userRole = res?.user?.role || res?.role;

      // 3. Dynamic role-based routing
      // If user was redirected here from a protected page, honor location.state.from unless role overrides it
      const redirectedFrom = location.state?.from?.pathname;

      switch (userRole) {
        case "restaurant":
          navigate("/restaurant/dashboard", { replace: true });
          break;
        case "delivery":
          navigate("/delivery/dashboard", { replace: true });
          break;
        case "customer":
        default:
          // Customers go back to where they were trying to go, or home '/'
          navigate(redirectedFrom || "/", { replace: true });
          break;
      }
    } catch (err) {
      setError(err.response?.data?.message || "Couldn't log in.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="mx-auto max-w-sm px-4 py-16">
      <h1 className="text-3xl font-bold">Welcome back</h1>
      <p className="mt-1 text-sm text-ink/60">
        Log in to continue to your account.
      </p>

      <form onSubmit={handleSubmit} className="mt-8 space-y-4">
        <div>
          <label className="text-sm text-ink/70">Email</label>
          <input
            type="email"
            name="email"
            required
            value={form.email}
            onChange={handleChange}
            className="mt-1 w-full rounded-lg border border-ink/15 bg-white px-3 py-2 text-sm outline-none focus:border-chili"
          />
        </div>

        <div>
          <label className="text-sm text-ink/70">Password</label>
          <input
            type="password"
            name="password"
            required
            value={form.password}
            onChange={handleChange}
            className="mt-1 w-full rounded-lg border border-ink/15 bg-white px-3 py-2 text-sm outline-none focus:border-chili"
          />
        </div>

        {error && <p className="text-sm text-chili">{error}</p>}

        <Button type="submit" disabled={submitting} className="w-full">
          {submitting ? "Logging in…" : "Log in"}
        </Button>
      </form>

      <p className="mt-6 text-center text-sm text-ink/60">
        New here?{" "}
        <Link to="/register" className="text-chili hover:underline">
          Create an account
        </Link>
      </p>
    </div>
  );
}