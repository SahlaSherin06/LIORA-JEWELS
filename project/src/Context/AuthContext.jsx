import { createContext, useState, useEffect } from "react";
import { toast } from "react-toastify";

export const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [orders, setOrders] = useState([]);

  // Load logged-in user and orders from localStorage
  useEffect(() => {
    const storedUser = localStorage.getItem("userLoggedIn");
    if (storedUser) {
      const userData = JSON.parse(storedUser);
      verifyUserStatus(userData.id); 
    }
  }, []);

  // Save orders to localStorage whenever orders change
  useEffect(() => {
    if (user && orders.length > 0) {
      localStorage.setItem(`orders_${user.id}`, JSON.stringify(orders));
    }
  }, [orders, user]);

  // ✅ Verify user status when loading from localStorage
  const verifyUserStatus = async (userId) => {
    try {
      const res = await fetch(`http://localhost:5000/users/${userId}`);
      if (!res.ok) throw new Error("Failed to verify user");
      const dbUser = await res.json();

      if (dbUser.isActive === false) {
        // alert("Your account has been deactivated by admin.");
        toast.warning("user deactivated")
        logout();
        return;
      }

      setUser(dbUser);
      loadUserDataFromDB(dbUser.id);

      // Load orders from localStorage
      const storedOrders = localStorage.getItem(`orders_${dbUser.id}`);
      if (storedOrders) {
        setOrders(JSON.parse(storedOrders));
      }
    } catch (error) {
      console.error("Error verifying user:", error);
      logout();
    }
  };

  // Function to load user-specific data from db.json
  const loadUserDataFromDB = async (userId) => {
    try {
      const response = await fetch("http://localhost:5000/users");
      if (!response.ok) throw new Error("Failed to fetch users");
      const users = await response.json();

      const currentUser = users.find((u) => u.id === userId);
      if (currentUser) {
        if (currentUser.cart)
          localStorage.setItem(`cart_${userId}`, JSON.stringify(currentUser.cart));
        if (currentUser.wishlist)
          localStorage.setItem(`wishlist_${userId}`, JSON.stringify(currentUser.wishlist));
        if (currentUser.orders && currentUser.orders.length > 0) {
          setOrders(currentUser.orders);
          localStorage.setItem(`orders_${userId}`, JSON.stringify(currentUser.orders));
        }

        window.dispatchEvent(new Event("cartUpdated"));
        window.dispatchEvent(new Event("wishlistUpdated"));
      }
    } catch (error) {
      console.error("Error loading user data:", error);
    }
  };

  // ✅ LOGIN — includes isActive check
  const login = async (userData) => {
    try {
      const response = await fetch(`http://localhost:5000/users/${userData.id}`);
      if (!response.ok) throw new Error("Failed to verify user");

      const dbUser = await response.json();

      if (dbUser.isActive === false) {
        // alert("Your account has been deactivated. Please contact the admin.");
        toast.warning("user deactivated")
        return;
      }

      setUser(dbUser);
      localStorage.setItem("userLoggedIn", JSON.stringify(dbUser));
      clearPreviousUserData();
      loadUserDataFromDB(dbUser.id);

      const storedOrders = localStorage.getItem(`orders_${dbUser.id}`);
      setOrders(storedOrders ? JSON.parse(storedOrders) : []);
      toast.success("login successfull")
    } catch (error) {
      console.error("Error during login:", error);
      alert("Unable to login. Please try again later.");
    }
  };

  const logout = () => {
    if (user) clearPreviousUserData();
    setUser(null);
    setOrders([]);
    localStorage.removeItem("userLoggedIn");
    window.dispatchEvent(new Event("cartUpdated"));
    window.dispatchEvent(new Event("wishlistUpdated"));
  };

  const addOrder = async (order) => {
    if (!user) return console.error("No user logged in");

    try {
      const updatedOrders = [order, ...orders];
      setOrders(updatedOrders);
      localStorage.setItem(`orders_${user.id}`, JSON.stringify(updatedOrders));
      await saveOrderToDB(order);
    } catch (error) {
      console.error("Error adding order:", error);
    }
  };

  const saveOrderToDB = async (order) => {
    try {
      const response = await fetch("http://localhost:5000/users");
      if (!response.ok) throw new Error("Failed to fetch users");

      const users = await response.json();
      const currentUser = users.find((u) => u.id === user.id);

      if (currentUser) {
        const updatedUser = {
          ...currentUser,
          orders: [order, ...(currentUser.orders || [])],
        };

        const updateRes = await fetch(`http://localhost:5000/users/${user.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(updatedUser),
        });

        if (!updateRes.ok) throw new Error("Failed to update user orders");
      }
    } catch (error) {
      console.error("Error saving order to DB:", error);
    }
  };

  const clearPreviousUserData = () => {
    Object.keys(localStorage).forEach((key) => {
      if (key.startsWith("cart_") || key.startsWith("wishlist_") || key.startsWith("orders_")) {
        localStorage.removeItem(key);
      }
    });
  };

  const isLoggedIn = !!user;

  return (
    <AuthContext.Provider
      value={{
        user,
        login,
        logout,
        isLoggedIn,
        orders,
        addOrder,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}
