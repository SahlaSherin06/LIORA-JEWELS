import { createContext, useState, useContext, useEffect } from "react";
import { AuthContext } from "./AuthContext";
import { toast } from "react-toastify";


export const CartContext = createContext();

export function CartProvider({ children }) {
  const [cart, setCart] = useState([]);
  const { user, isLoggedIn } = useContext(AuthContext);

  // Load cart from localStorage when user changes
  useEffect(() => {
    if (isLoggedIn && user) {
      const userCart = JSON.parse(localStorage.getItem(`cart_${user.id}`)) || [];
      setCart(userCart);
    } else {
      setCart([]);
    }
  }, [user, isLoggedIn]);

  const addToCart = async (product, quantity = 1) => {
    if (!isLoggedIn || !user) return false;

    const existing = cart.find((p) => p.id === product.id);
    let updatedCart;
    
    if (existing) {
      updatedCart = cart.map((p) =>
        p.id === product.id ? { ...p, quantity: (p.quantity || 1) + quantity } : p
      );
      toast.info("🛒 Cart Quantity Updated")
    } else {
      updatedCart = [...cart, { ...product, quantity }];
      toast.success("🛒 Added to cart");
    }

    setCart(updatedCart);
    localStorage.setItem(`cart_${user.id}`, JSON.stringify(updatedCart));

    // Save to API
    try {
      const response = await fetch(`http://localhost:5000/users/${user.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ cart: updatedCart })
      });
      if (!response.ok) throw new Error('Failed to update cart in API');
    } catch (error) {
      console.error("Error updating cart in API:", error);
    }

    window.dispatchEvent(new Event("cartUpdated"));
    return true;
  };

  const removeFromCart = async (productId) => {
    if (!isLoggedIn || !user) return false;

    const updatedCart = cart.filter((item) => item.id !== productId);
    setCart(updatedCart);
    localStorage.setItem(`cart_${user.id}`, JSON.stringify(updatedCart));

    // Save to API
    try {
      const response = await fetch(`http://localhost:5000/users/${user.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ cart: updatedCart })
      });
      if (!response.ok) throw new Error('Failed to update cart in API');
    } catch (error) {
      console.error("Error updating cart in API:", error);
    }

    window.dispatchEvent(new Event("cartUpdated"));
    return true;
  };

  const updateQuantity = async (productId, quantity) => {
    if (!isLoggedIn || !user || quantity < 1) return false;

    const updatedCart = cart.map((item) =>
      item.id === productId ? { ...item, quantity } : item
    );
    setCart(updatedCart);
    localStorage.setItem(`cart_${user.id}`, JSON.stringify(updatedCart));

    // Save to API
    try {
      const response = await fetch(`http://localhost:5000/users/${user.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ cart: updatedCart })
      });
      if (!response.ok) throw new Error('Failed to update cart in API');
    } catch (error) {
      console.error("Error updating cart in API:", error);
    }

    window.dispatchEvent(new Event("cartUpdated"));
    return true;
  };

  const clearCart = async () => {
    if (!isLoggedIn || !user) return false;

    setCart([]);
    localStorage.setItem(`cart_${user.id}`, JSON.stringify([]));

    // Save to API
    try {
      const response = await fetch(`http://localhost:5000/users/${user.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ cart: [] })
      });
      if (!response.ok) throw new Error('Failed to update cart in API');
    } catch (error) {
      console.error("Error updating cart in API:", error);
    }

    window.dispatchEvent(new Event("cartUpdated"));
    return true;
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
    isInCart: (productId) => cart.some(item => item.id === productId)
  };

  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  );
}

