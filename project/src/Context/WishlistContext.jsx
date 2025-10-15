import { createContext, useState, useContext, useEffect } from "react";
import { AuthContext } from "./AuthContext";

export const WishlistContext = createContext();

export function WishlistProvider({ children }) {
  const [wishlist, setWishlist] = useState([]);
  const { user, isLoggedIn } = useContext(AuthContext);

  // Load wishlist from localStorage when user changes
  useEffect(() => {
    if (isLoggedIn && user) {
      const userWishlist = JSON.parse(localStorage.getItem(`wishlist_${user.id}`)) || [];
      setWishlist(userWishlist);
    } else {
      setWishlist([]);
    }
  }, [user, isLoggedIn]);

  const addToWishlist = async (product) => {
    if (!isLoggedIn || !user) return false;

    const exists = wishlist.some((p) => p.id === product.id);
    if (exists) return false;

    const updatedWishlist = [...wishlist, product];
    setWishlist(updatedWishlist);
    localStorage.setItem(`wishlist_${user.id}`, JSON.stringify(updatedWishlist));

    // Save to API
    try {
      const response = await fetch(`http://localhost:5000/users/${user.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ wishlist: updatedWishlist })
      });
      if (!response.ok) throw new Error('Failed to update wishlist in API');
    } catch (error) {
      console.error("Error updating wishlist in API:", error);
    }

    window.dispatchEvent(new Event("wishlistUpdated"));
    return true;
  };

  const removeFromWishlist = async (productId) => {
    if (!isLoggedIn || !user) return false;

    const updatedWishlist = wishlist.filter((p) => p.id !== productId);
    setWishlist(updatedWishlist);
    localStorage.setItem(`wishlist_${user.id}`, JSON.stringify(updatedWishlist));

    // Save to API
    try {
      const response = await fetch(`http://localhost:5000/users/${user.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ wishlist: updatedWishlist })
      });
      if (!response.ok) throw new Error('Failed to update wishlist in API');
    } catch (error) {
      console.error("Error updating wishlist in API:", error);
    }

    window.dispatchEvent(new Event("wishlistUpdated"));
    return true;
  };

  const clearWishlist = async () => {
    if (!isLoggedIn || !user) return false;

    setWishlist([]);
    localStorage.setItem(`wishlist_${user.id}`, JSON.stringify([]));

    // Save to API
    try {
      const response = await fetch(`http://localhost:5000/users/${user.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ wishlist: [] })
      });
      if (!response.ok) throw new Error('Failed to update wishlist in API');
    } catch (error) {
      console.error("Error updating wishlist in API:", error);
    }

    window.dispatchEvent(new Event("wishlistUpdated"));
    return true;
  };

  const isInWishlist = (productId) => {
    return wishlist.some(p => p.id === productId);
  };

  const value = {
    wishlist,
    addToWishlist,
    removeFromWishlist,
    clearWishlist,
    isInWishlist,
    getWishlistCount: () => wishlist.length
  };

  return (
    <WishlistContext.Provider value={value}>
      {children}
    </WishlistContext.Provider>
  );
}