import { createContext, useState, useEffect } from "react";

// Make sure this line exists with 'export'
export const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [orders, setOrders] = useState([]); 

  // Load logged-in user and orders from localStorage
  useEffect(() => {
    const storedUser = localStorage.getItem("userLoggedIn");
    if (storedUser) {
      const userData = JSON.parse(storedUser);
      setUser(userData);
      
      // Load user-specific data from db.json
      loadUserDataFromDB(userData.id);
      
      // Load orders from localStorage
      const storedOrders = localStorage.getItem(`orders_${userData.id}`);
      if (storedOrders) {
        setOrders(JSON.parse(storedOrders));
      }
    }
  }, []);

  // Save orders to localStorage whenever orders change
  useEffect(() => {
    if (user && orders.length > 0) {
      localStorage.setItem(`orders_${user.id}`, JSON.stringify(orders));
    }
  }, [orders, user]);

  // Function to load user-specific data from db.json
  const loadUserDataFromDB = async (userId) => {
    try {
      const response = await fetch("http://localhost:5000/users");
      if (!response.ok) {
        throw new Error('Failed to fetch users');
      }
      const users = await response.json();
      
      const currentUser = users.find(user => user.id === userId);
      if (currentUser) {
        // Store user-specific data in localStorage with user ID prefix
        if (currentUser.cart) {
          localStorage.setItem(`cart_${userId}`, JSON.stringify(currentUser.cart));
        }
        
        if (currentUser.wishlist) {
          localStorage.setItem(`wishlist_${userId}`, JSON.stringify(currentUser.wishlist));
        }
        
        // Load orders from user data in db.json if available
        if (currentUser.orders && currentUser.orders.length > 0) {
          setOrders(currentUser.orders);
          localStorage.setItem(`orders_${userId}`, JSON.stringify(currentUser.orders));
        }
        
        window.dispatchEvent(new Event("cartUpdated"));
        window.dispatchEvent(new Event("wishlistUpdated"));
      }
    } catch (error) {
      console.error("Error loading user data from DB:", error);
      // Don't throw error, just use localStorage data
    }
  };

  const login = (userData) => {
    setUser(userData);
    localStorage.setItem("userLoggedIn", JSON.stringify(userData));
    // Clear any previous user's data from localStorage
    clearPreviousUserData();
    // Load new user's data
    loadUserDataFromDB(userData.id);
    
    // Load orders for the new user
    const storedOrders = localStorage.getItem(`orders_${userData.id}`);
    if (storedOrders) {
      setOrders(JSON.parse(storedOrders));
    } else {
      setOrders([]); // Reset orders for new user
    }
  };

  const logout = () => {
    // Clear current user's data before logging out
    if (user) {
      clearPreviousUserData();
    }
    setUser(null);
    setOrders([]); // Clear orders on logout
    localStorage.removeItem("userLoggedIn");
    window.dispatchEvent(new Event("cartUpdated"));
    window.dispatchEvent(new Event("wishlistUpdated"));
  };

  // Add order to user's order history and save to db.json
  const addOrder = async (order) => {
    if (!user) {
      console.error("No user logged in");
      return;
    }

    try {
      // Update local state immediately
      const updatedOrders = [order, ...orders];
      setOrders(updatedOrders);
      
      // Save to localStorage
      localStorage.setItem(`orders_${user.id}`, JSON.stringify(updatedOrders));
      
      // Save to db.json
      await saveOrderToDB(order);
      
    } catch (error) {
      console.error("Error adding order:", error);
      // Order is still saved in localStorage even if API fails
    }
  };

  // Save order to db.json
  const saveOrderToDB = async (order) => {
    try {
      // First, get the current user data
      const response = await fetch("http://localhost:5000/users");
      if (!response.ok) {
        throw new Error('Failed to fetch users');
      }
      const users = await response.json();
      
      const currentUser = users.find(u => u.id === user.id);
      if (currentUser) {
        // Update user's orders array
        const updatedUser = {
          ...currentUser,
          orders: [order, ...(currentUser.orders || [])]
        };
        
        // Save updated user back to db.json
        const updateResponse = await fetch(`http://localhost:5000/users/${user.id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(updatedUser),
        });
        
        if (!updateResponse.ok) {
          throw new Error('Failed to update user orders in database');
        }
        
        console.log('Order saved to user in database');
      }
    } catch (error) {
      console.error("Error saving order to database:", error);
      throw error; // Re-throw to handle in addOrder
    }
  };

  // Clear previous user's data from localStorage
  const clearPreviousUserData = () => {
    const keys = Object.keys(localStorage);
    keys.forEach(key => {
      if (key.startsWith('cart_') || key.startsWith('wishlist_') || key.startsWith('orders_')) {
        localStorage.removeItem(key);
      }
    });
  };

  const isLoggedIn = !!user;

  return (
    <AuthContext.Provider value={{ 
      user, 
      login, 
      logout, 
      isLoggedIn, 
      orders, 
      addOrder 
    }}>
      {children}
    </AuthContext.Provider>
  );
}