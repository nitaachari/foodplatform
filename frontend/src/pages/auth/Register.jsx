import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import Button from "../../components/ui/Button";
//i had one doubt that if the name in dropdown will affect role but that is handled by value

export default function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    phone: "",
    role: "customer", // Default selection
  });
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleChange = (e) =>
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSubmitting(true);

    try {
      // Pass the complete form object (includes name, email, password, phone, and role)
      const res = await register(form);

      // Extract user role from response or state fallback
      const userRole = res?.user?.role || res?.role || form.role;

      // Role-based routing logic
      switch (userRole) {
        case "restaurant":
          navigate("/restaurant/dashboard", { replace: true }); // UI for creating/managing restaurant
          break;
        case "delivery":
          navigate("/delivery/dashboard", { replace: true }); // UI for delivery partner
          break;
        case "customer":
        default:
          navigate("/", { replace: true }); // Homepage & restaurant list
          break;
      }
    } catch (err) {
      setError(err.response?.data?.message || "Couldn't create your account.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="mx-auto max-w-sm px-4 py-16">
      <h1 className="text-3xl font-bold">Create your account</h1>
      <p className="mt-1 text-sm text-ink/60">
        Join us as a customer, restaurant, or delivery partner.
      </p>

      <form onSubmit={handleSubmit} className="mt-8 space-y-4">
        <div>
          <label className="text-sm text-ink/70">Full name</label>
          <input
            name="name"
            required
            minLength={2}
            value={form.name}
            onChange={handleChange}
            className="mt-1 w-full rounded-lg border border-ink/15 bg-white px-3 py-2 text-sm outline-none focus:border-chili"
          />
        </div>

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
          <label className="text-sm text-ink/70">Phone</label>
          <input
            name="phone"
            required
            value={form.phone}
            onChange={handleChange}
            className="mt-1 w-full rounded-lg border border-ink/15 bg-white px-3 py-2 text-sm outline-none focus:border-chili"
          />
        </div>

        {/* Role Selection Dropdown */}
        <div>
          <label className="text-sm text-ink/70">I want to register as</label>
          <select
            name="role"
            value={form.role}
            onChange={handleChange}
            className="mt-1 w-full rounded-lg border border-ink/15 bg-white px-3 py-2 text-sm outline-none focus:border-chili"
          >
            <option value="customer">Customer</option>
            <option value="restaurant">Restaurant Partner</option>
            <option value="delivery">Delivery Partner</option>
          </select>
        </div>

        <div>
          <label className="text-sm text-ink/70">Password</label>
          <input
            type="password"
            name="password"
            required
            minLength={8}
            value={form.password}
            onChange={handleChange}
            className="mt-1 w-full rounded-lg border border-ink/15 bg-white px-3 py-2 text-sm outline-none focus:border-chili"
          />
          <p className="mt-1 text-xs text-ink/40">At least 8 characters.</p>
        </div>

        {error && <p className="text-sm text-chili">{error}</p>}

        <Button type="submit" disabled={submitting} className="w-full">
          {submitting ? "Creating account…" : "Create account"}
        </Button>
      </form>

      <p className="mt-6 text-center text-sm text-ink/60">
        Already have an account?{" "}
        <Link to="/login" className="text-chili hover:underline">
          Log in
        </Link>
      </p>
    </div>
  );
}