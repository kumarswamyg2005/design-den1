import { createContext, useContext, useState, useEffect } from "react";
import { customerAPI } from "../services/api";
import { useAuth } from "./AuthContext";

const CartContext = createContext(null);

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart must be used within CartProvider");
  }
  return context;
};

export const CartProvider = ({ children }) => {
  const { isCustomer } = useAuth();
  const [cart, setCart] = useState(null);
  const [cartCount, setCartCount] = useState(0);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isCustomer) {
      fetchCart();
    } else {
      setCart(null);
      setCartCount(0);
    }
  }, [isCustomer]);

  const fetchCart = async () => {
    try {
      setLoading(true);
      const response = await customerAPI.getCart();
      console.log("Raw API response:", response.data);

      // Backend returns { success: true, cart: { items: [] } }
      const cartData = response.data.cart || { items: [] };
      console.log("Cart data:", cartData);
      console.log("Cart items array:", cartData.items);

      setCart(cartData);

      // Calculate total quantity (sum of all item quantities)
      const items = Array.isArray(cartData.items) ? cartData.items : [];
      console.log("Items is array:", Array.isArray(items));
      console.log("Items length:", items.length);

      const totalCount = items.reduce((sum, item) => {
        console.log(`Item ${item._id}: quantity = ${item.quantity}`);
        return sum + (item.quantity || 0);
      }, 0);

      console.log("=== CART COUNT CALCULATION ===");
      console.log("Total items in array:", items.length);
      console.log("Total quantity sum:", totalCount);
      console.log("==============================");

      setCartCount(totalCount);
    } catch (error) {
      console.error("Failed to fetch cart:", error);
      setCart({ items: [] });
      setCartCount(0);
    } finally {
      setLoading(false);
    }
  };

  const addToCart = async (item) => {
    try {
      const response = await customerAPI.addToCart(item);
      await fetchCart();
      return response.data;
    } catch (error) {
      console.error("Failed to add to cart:", error);
      throw error;
    }
  };

  const updateCartItem = async (itemId, updates) => {
    try {
      const response = await customerAPI.updateCartItem(itemId, updates);
      await fetchCart();
      return response.data;
    } catch (error) {
      console.error("Failed to update cart item:", error);
      throw error;
    }
  };

  const removeFromCart = async (itemId) => {
    try {
      const response = await customerAPI.removeFromCart(itemId);
      await fetchCart();
      return response.data;
    } catch (error) {
      console.error("Failed to remove from cart:", error);
      throw error;
    }
  };

  const clearCart = () => {
    setCart(null);
    setCartCount(0);
  };

  const value = {
    cart,
    cartCount,
    loading,
    addToCart,
    updateCartItem,
    removeFromCart,
    clearCart,
    refreshCart: fetchCart,
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};
