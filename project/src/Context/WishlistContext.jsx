import { createContext, useState, useContext, useEffect } from "react";
import { AuthContext } from "./AuthContext";
import { toast } from "react-toastify";
import api from "../api/api";

export const WishlistContext = createContext();

export function WishlistProvider({ children }) {
  const [wishlist, setWishlist] = useState([]);
  const { user, isLoggedIn } = useContext(AuthContext);

  const fetchWishlist = async () => {
    if (isLoggedIn) {
      try {
        const res = await api.get("/auth/profile");
        setWishlist(res.data.wishlist || []);
      } catch (error) {
        console.error("Error fetching wishlist:", error);
      }
    } else {
      setWishlist([]);
    }
  };

  useEffect(() => {
    fetchWishlist();
    
    const handleAuthChange = () => fetchWishlist();
    window.addEventListener("userStatusVerified", handleAuthChange);
    window.addEventListener("userLoggedOut", () => setWishlist([]));
    
    return () => {
      window.removeEventListener("userStatusVerified", handleAuthChange);
      window.removeEventListener("userLoggedOut", () => setWishlist([]));
    };
  }, [isLoggedIn]);

  const addToWishlist = async (product) => {
    if (!isLoggedIn || !user) {
      toast.warning("Please login to add to wishlist");
      return false;
    }

    try {
      const productId = product._id || product.id;
      const response = await api.post("/users/wishlist", { productId });
      
      setWishlist(response.data);
      return true;
    } catch (error) {
      console.error("Error adding to wishlist:", error);
      toast.error(error.response?.data?.message || "Failed to add to wishlist");
      return false;
    }
  };

  const removeFromWishlist = async (productId) => {
    if (!isLoggedIn) return;
    try {
      const res = await api.delete(`/users/wishlist/${productId}`);
      setWishlist(res.data);
    } catch (error) {
      console.error("Error removing from wishlist:", error);
    }
  };

  const clearWishlist = () => {
    setWishlist([]);
  };

  const isInWishlist = (productId) => {
    return wishlist.some(p => (p.product || p.id) === productId);
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