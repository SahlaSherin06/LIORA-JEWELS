import { createContext, useState, useContext, useEffect } from "react";
import { AuthContext } from "./AuthContext";
import { toast } from "react-toastify";
import api from "../api/api";

export const CartContext = createContext();

export function CartProvider({ children }) {
  const [cart, setCart] = useState([]);
  const { user, isLoggedIn } = useContext(AuthContext);

  const fetchCart = async () => {
    if (isLoggedIn) {
      try {
        const res = await api.get("/users/cart");
        setCart(res.data || []);
      } catch (error) {
        console.error("Error fetching cart:", error);
      }
    } else {
      setCart([]);
    }
  };

  useEffect(() => {
    fetchCart();
    
    const handleAuthChange = () => fetchCart();
    window.addEventListener("userStatusVerified", handleAuthChange);
    window.addEventListener("userLoggedOut", () => setCart([]));
    
    return () => {
      window.removeEventListener("userStatusVerified", handleAuthChange);
      window.removeEventListener("userLoggedOut", () => setCart([]));
    };
  }, [isLoggedIn]);

  const addToCart = async (product, quantity = 1) => {
    if (!isLoggedIn || !user) {
      toast.warning("Please login to add to cart");
      return false;
    }

    try {
      // Backend expects productId
      const productId = product._id || product.id;
      await api.post("/users/cart", { productId, quantity });
      
      // Fetch fully populated cart with latest stock/images
      await fetchCart();
      toast.success("🛒 Added to cart");
      return true;
    } catch (error) {
      console.error("Error adding to cart:", error);
      toast.error(error.response?.data?.message || "Failed to add to cart");
      return false;
    }
  };

  const removeFromCart = async (productId) => {
    if (!isLoggedIn) return;
    try {
      await api.delete(`/users/cart/${productId}`);
      await fetchCart();
    } catch (error) {
      console.error("Error removing from cart:", error);
    }
  };

  const updateQuantity = async (productId, quantity) => {
    if (!isLoggedIn) return;
    try {
      await api.put(`/users/cart/${productId}`, { quantity });
      await fetchCart();
    } catch (error) {
      console.error("Error updating quantity:", error);
    }
  };

  const clearCart = async () => {
    if (!isLoggedIn) return;
    try {
      await api.delete("/users/cart");
      await fetchCart();
    } catch (error) {
      console.error("Error clearing cart:", error);
    }
  };

  const getCartCount = () => {
    return cart.reduce((sum, item) => sum + (item.quantity || 1), 0);
  };

  const getTotalPrice = () => {
    return cart.reduce((sum, item) => {
      let priceValue = 0;
      if (typeof item.price === "string") {
        priceValue = parseFloat(item.price.replace(/[^0-9.]/g, "")) || 0;
      } else if (typeof item.price === "number") {
        priceValue = item.price;
      }
      return sum + priceValue * (item.quantity || 1);
    }, 0);
  };

  const value = {
    cart,
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    getCartCount,
    getTotalPrice,
    isInCart: (productId) => cart.some(item => (item.product || item.id) === productId)
  };

  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  );
}
