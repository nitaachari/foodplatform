import { Link } from "react-router-dom";
import { useCart } from "../context/CartContext";
import CartLine from "../components/cart/CartLine";
import CartSummary from "../components/cart/CartSummary";
import Button from "../components/ui/Button";
import Spinner from "../components/ui/Spinner";
import EmptyState from "../components/ui/EmptyState";

export default function Cart() {
  const { cart, loading, updateItem, removeItem, clearCart } = useCart();

  if (loading) return <Spinner label="Loading cart" />;

  if (!cart || cart.items.length === 0) {
    return (
      <div className="mx-auto max-w-2xl px-4">
        <EmptyState
          title="Your cart is empty"
          hint="Browse restaurants and add a few dishes to get started."
          action={
            <Link to="/">
              <Button>Browse restaurants</Button>
            </Link>
          }
        />
      </div>
    );
  }

  const handleInc = (line) => updateItem(line._id, line.quantity + 1);
  const handleDec = (line) => {
    if (line.quantity <= 1) return removeItem(line._id);
    return updateItem(line._id, line.quantity - 1);
  };

  return (
    <div className="mx-auto max-w-2xl px-4 py-10">
      <div className="flex items-center justify-between">
        <h1 className="text-4xl">Your cart</h1>
        <button onClick={clearCart} className="text-sm text-ink/40 hover:text-chili">
          Clear cart
        </button>
      </div>
      <p className="mt-1 text-sm text-ink/60">
        {cart.restaurant?.name && `From ${cart.restaurant.name}`}
      </p>

      <div className="mt-6 divide-y divide-ink/10">
        {cart.items.map((line) => (
          <CartLine
            key={line._id}
            line={line}
            onInc={handleInc}
            onDec={handleDec}
            onRemove={(l) => removeItem(l._id)}
          />
        ))}
      </div>

      <div className="mt-8">
        <CartSummary subtotal={cart.totalAmount}>
          <Link to="/checkout">
            <Button className="w-full">Proceed to checkout</Button>
          </Link>
        </CartSummary>
      </div>
    </div>
  );
}
