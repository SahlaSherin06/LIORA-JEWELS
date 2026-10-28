import { createContext, useState, useEffect } from "react";
import { toast } from "react-toastify";
import api from "../api/api";

export const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [orders, setOrders] = useState([]);

  // On initial load, just verify with the backend using the secure cookie
  useEffect(() => {
    verifyUserStatus();
  }, []);

  const verifyUserStatus = async () => {
    try {
      // The interceptor automatically attaches the token
      const res = await api.get("/auth/profile");
      const dbUser = res.data;

      if (dbUser.isActive === false) {
        toast.warning("Your account has been deactivated.");
        logout();
        return;
      }

      setUser({
        id: dbUser._id,
        firstName: dbUser.firstName,
        lastName: dbUser.lastName,
        email: dbUser.email,
        phone: dbUser.phone,
        address: dbUser.address,
        role: dbUser.role
      });

      // Dispatch event to load cart and wishlist
      window.dispatchEvent(new Event("userStatusVerified"));
      
      // Fetch orders
      fetchOrders();
    } catch (error) {
      console.error("Error verifying user:", error);
      logout();
    } finally {
      setLoading(false);
    }
  };

  const fetchOrders = async () => {
    try {
      const res = await api.get("/orders");
      setOrders(res.data);
    } catch (error) {
      console.error("Error fetching orders:", error);
    }
  };

  // Called from LoginPage after getting the token
  const login = (userData) => {
    setUser(userData);
    toast.success("Login successful");
    window.dispatchEvent(new Event("userStatusVerified"));
    fetchOrders();
  };

  const logout = async () => {
    try {
      await api.post("/auth/logout"); // Tell backend to clear the cookie
    } catch (error) {
      console.error("Logout error", error);
    }
    setUser(null);
    setOrders([]);
    // Clear any leftover legacy localStorage items just in case
    localStorage.removeItem("userLoggedIn");
    localStorage.removeItem("token");
    toast.info("Logged out successfully");
    window.dispatchEvent(new Event("userLoggedOut"));
  };

  const updateUser = (updatedData) => {
    setUser(prev => ({ ...prev, ...updatedData }));
  };

  // Place a new order
  const addOrder = async (orderData) => {
    if (!user) return console.error("No user logged in");

    try {
      const res = await api.post("/orders", orderData);
      setOrders([res.data, ...orders]);
      toast.success("Order placed successfully!");
    } catch (error) {
      console.error("Error adding order:", error);
      toast.error(error.response?.data?.message || "Failed to place order.");
      throw error;
    }
  };

  const isLoggedIn = !!user;

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        logout,
        updateUser,
        isLoggedIn,
        orders,
        addOrder,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}
