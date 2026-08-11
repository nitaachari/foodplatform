import { createContext, useCallback, useContext, useEffect, useState } from "react";
import {
  addToCartRequest,
  clearCartRequest,
  getCartRequest,
  removeCartItemRequest,
  updateCartItemRequest,
} from "../api/cart.api";
import { useAuth } from "./AuthContext";

const CartContext = createContext(null);

export function CartProvider({ children }) {
  const { user } = useAuth();
  const [cart, setCart] = useState(null);
  const [loading, setLoading] = useState(false);

  const refreshCart = useCallback(async () => {
    if (!user) {
      setCart(null);
      return;
    }
    setLoading(true);
    try {
      const data = await getCartRequest();
      setCart(data.cart);
    } catch {
      // Backend responds 404 with "Cart is empty." before any item is added.
      setCart(null);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    refreshCart();
  }, [refreshCart]);

  const addItem = async (menuItemId, quantity = 1, customizations = []) => {
    const data = await addToCartRequest({ menuItemId, quantity, customizations });
    setCart(data.cart);
  };

  const updateItem = async (itemId, quantity) => {
    const data = await updateCartItemRequest(itemId, quantity);
    setCart(data.cart);
  };

  const removeItem = async (itemId) => {
    const data = await removeCartItemRequest(itemId);
    setCart(data.cart);
  };

  const clearCart = async () => {
    const data = await clearCartRequest();
    setCart(data.cart);
  };

  const itemCount =
    cart?.items?.reduce((sum, item) => sum + item.quantity, 0) || 0;

  return (
    <CartContext.Provider
      value={{
        cart,
        loading,
        itemCount,
        refreshCart,
        addItem,
        updateItem,
        removeItem,
        clearCart,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used inside CartProvider");
  return ctx;
}
