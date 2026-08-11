import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { useCart } from "../../context/CartContext";

export default function Navbar() {
  const { user, logout } = useAuth();
  const { itemCount } = useCart();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  return (
    <header className="sticky top-0 z-30 border-b border-ink/10 bg-paper/95 backdrop-blur">
      <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-4">
        {/* Brand Link dynamically points to home or dashboard based on role */}
        <Link
          to={
            user?.role === "restaurant"
              ? "/restaurant/dashboard"
              : user?.role === "delivery"
              ? "/delivery/dashboard"
              : "/"
          }
          className="font-display text-2xl tracking-tight"
        >
          Bussin
        </Link>

        <nav className="flex items-center gap-5 text-sm">
          {user ? (
            <>
              {/* RESTAURANT OWNER LINKS */}
              {user.role === "restaurant" && (
                <>
                  <Link to="/restaurant/dashboard" className="hover:text-chili">
                    Dashboard
                  </Link>
                  <Link to="/restaurant/dashboard/orders" className="hover:text-chili">
                    Orders
                  </Link>
                  <Link to="/restaurant/dashboard/reviews" className="hover:text-chili">
                    Reviews
                  </Link>
                </>
              )}

              {/* DELIVERY PARTNER LINKS */}
              {user.role === "delivery" && (
                <>
                  <Link to="/delivery/dashboard" className="hover:text-chili">
                    Available Orders
                  </Link>
                  <Link to="/delivery/history" className="hover:text-chili">
                    Delivery History
                  </Link>
                </>
              )}

              {/* DEFAULT / CUSTOMER LINKS */}
              {user.role === "customer" && (
                <>
                  <Link to="/restaurants" className="hover:text-chili">
                    Restaurants
                  </Link>

                  <Link to="/orders" className="hover:text-chili">
                    Orders
                  </Link>

                  <Link to="/cart" className="relative hover:text-chili">
                    Cart
                    {itemCount > 0 && (
                      <span className="absolute -right-3 -top-2 flex h-4 min-w-4 items-center justify-center rounded-full bg-chili px-1 font-mono text-[10px] text-paper">
                        {itemCount}
                      </span>
                    )}
                  </Link>
                </>
              )}

              {/* SHARED LOG OUT BUTTON FOR ALL ROLES */}
              <button onClick={handleLogout} className="hover:text-chili">
                Log out
              </button>
            </>
          ) : (
            /* IF LOGGED OUT -> SHOW ONLY LOGIN & REGISTER */
            <div className="flex items-center gap-4">
              <Link to="/login" className="hover:text-chili">
                Log in
              </Link>
              <Link
                to="/register"
                className="rounded-lg bg-chili px-3 py-1.5 text-paper hover:opacity-90 transition"
              >
                Register
              </Link>
            </div>
          )}
        </nav>
      </div>
    </header>
  );
}