import { Routes, Route } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import { CartProvider } from "./context/CartContext";
import Navbar from "./components/layout/Navbar";
import ProtectedRoute from "./components/layout/ProtectedRoute";

import Login from "./pages/auth/Login";
import Register from "./pages/auth/Register";
import RestaurantList from "./pages/RestaurantList";
import RestaurantDetail from "./pages/RestaurantDetail";
import Cart from "./pages/Cart";
import Checkout from "./pages/Checkout";
import OrderDetail from "./pages/OrderDetail";
import OrderHistory from "./pages/OrderHistory";
import NotFound from "./pages/NotFound";
import Home from './pages/Home';
import RestaurantDashboard from "./pages/RestaurantDashboard";
import RestaurantOrders from "./pages/restaurant/RestaurantOrders";
import RestaurantReviews from "./pages/restaurant/RestaurantReviews";
import DeliveryDashboard from "./pages/delivery/DeliveryDashboard";
import DeliveryHistory from "./pages/delivery/DeliveryHistory";
//This is a simple lookup table: "if the URL is exactly this, show this component."

function App() {
  return (
    <div className="flex min-h-screen flex-col">
      <AuthProvider>
      <CartProvider>
      <Navbar />
      <main className="flex-1">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/restaurants" element={<RestaurantList />} />
          <Route path="/restaurants/:id" element={<RestaurantDetail />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* Everything past here requires a logged-in user */}
          <Route element={<ProtectedRoute />}>
            <Route path="/cart" element={<Cart />} />
            <Route path="/checkout" element={<Checkout />} />
            <Route path="/orders" element={<OrderHistory />} />
            <Route path="/orders/:id" element={<OrderDetail />} />
          </Route>

          {/* Restaurant-owner only */}
          <Route element={<ProtectedRoute roles={["restaurant"]} />}>
            <Route path="/restaurant/dashboard" element={<RestaurantDashboard />} />
            <Route path="/restaurant/dashboard/orders" element={<RestaurantOrders />} />
            <Route path="/restaurant/dashboard/reviews" element={<RestaurantReviews />} />
          </Route>

          {/* Delivery-partner only */}
          <Route element={<ProtectedRoute roles={["delivery"]} />}>
            <Route path="/delivery/dashboard" element={<DeliveryDashboard />} />
            <Route path="/delivery/history" element={<DeliveryHistory />} />
          </Route>

          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>
      </CartProvider>
    </AuthProvider>

    </div>
  );
}

export default  App;
  

