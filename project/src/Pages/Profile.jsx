// src/Pages/Profile.jsx
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from 'react-toastify';

function Profile() {
  const navigate = useNavigate();
  const [user, setUser] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    address: ""
  });
  const [stats, setStats] = useState({
    orders: 0,
    wishlistItems: 0,
    cartItems: 0
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    const loadUserData = async () => {
      // Check if user is logged in
      const userLoggedIn = localStorage.getItem("userLoggedIn");
      if (!userLoggedIn) {
        navigate("/login");
        return;
      }

      try {
        const userData = JSON.parse(userLoggedIn);
        
        // Try to load user data from API first
        const response = await fetch(`http://localhost:5000/users/${userData.id}`);
        if (response.ok) {
          const apiUserData = await response.json();
          setUser({
            firstName: apiUserData.firstName || "",
            lastName: apiUserData.lastName || "",
            email: apiUserData.email || "",
            phone: apiUserData.phone || "",
            address: apiUserData.address || ""
          });
        } else {
          // Fallback to localStorage data
          const storedUserData = localStorage.getItem(`userProfile_${userData.id}`);
          if (storedUserData) {
            setUser(JSON.parse(storedUserData));
          } else {
            // Use basic user data from login
            setUser(prev => ({
              ...prev,
              firstName: userData.firstName || "",
              lastName: userData.lastName || "",
              email: userData.email || ""
            }));
          }
        }

        // Load user stats
        loadUserStats(userData.id);
      } catch (error) {
        console.error("Error loading user data:", error);
        toast.error("Error loading profile data");
      } finally {
        setIsLoading(false);
      }
    };

    loadUserData();
  }, [navigate]);

  const loadUserStats = (userId) => {
    try {
      // Load cart count
      const userCart = JSON.parse(localStorage.getItem(`cart_${userId}`) || '[]');
      const cartItems = userCart.reduce((sum, item) => sum + (item.quantity || 1), 0);

      // Load wishlist count
      const userWishlist = JSON.parse(localStorage.getItem(`wishlist_${userId}`) || '[]');
      const wishlistItems = userWishlist.length;

      // Load orders count (you might want to fetch this from API)
      const userOrders = JSON.parse(localStorage.getItem(`orders_${userId}`) || '[]');
      const orders = userOrders.length;

      setStats({
        orders,
        wishlistItems,
        cartItems
      });
    } catch (error) {
      console.error("Error loading user stats:", error);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setUser(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSave = async () => {
    setIsSaving(true);
    
    try {
      const userLoggedIn = localStorage.getItem("userLoggedIn");
      if (!userLoggedIn) {
        toast.error("User not logged in");
        return;
      }

      const userData = JSON.parse(userLoggedIn);
      const userId = userData.id;

      // Save to localStorage
      localStorage.setItem(`userProfile_${userId}`, JSON.stringify(user));

      // Save to API
      const response = await fetch(`http://localhost:5000/users/${userId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          firstName: user.firstName,
          lastName: user.lastName,
          phone: user.phone,
          address: user.address
        })
      });

      if (!response.ok) {
        throw new Error('Failed to update profile');
      }

      // Update user data in localStorage if name changed
      if (user.firstName !== userData.firstName || user.lastName !== userData.lastName) {
        const updatedUserData = {
          ...userData,
          firstName: user.firstName,
          lastName: user.lastName
        };
        localStorage.setItem("userLoggedIn", JSON.stringify(updatedUserData));
        
        // Trigger user data update in other components
        window.dispatchEvent(new Event("userDataUpdated"));
      }

      toast.success("Profile updated successfully!", {
        position: "top-right",
        autoClose: 3000,
      });

    } catch (error) {
      console.error("Error saving profile:", error);
      toast.error("Failed to update profile. Please try again.", {
        position: "top-right",
        autoClose: 5000,
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleLogout = () => {
    // Clear all user-specific data
    const userLoggedIn = localStorage.getItem("userLoggedIn");
    if (userLoggedIn) {
      const userData = JSON.parse(userLoggedIn);
      const userId = userData.id;
      
      // Clear user-specific storage
      localStorage.removeItem(`userProfile_${userId}`);
      localStorage.removeItem(`cart_${userId}`);
      localStorage.removeItem(`wishlist_${userId}`);
    }
    
    localStorage.removeItem("userLoggedIn");
    toast.info("Logged out successfully");
    navigate("/");
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#F5F0E1] pt-32 pb-12 px-4">
        <div className="max-w-2xl mx-auto text-center">
          <div className="animate-pulse text-[#7B4B3A]">Loading profile...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F5F0E1] pt-32 pb-12 px-4">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-4xl font-bold text-[#7B4B3A] text-center mb-8">My Profile</h1>
        
        <div className="bg-white rounded-lg shadow-md p-8">
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-[#7B4B3A] mb-2">First Name</label>
                <input
                  type="text"
                  name="firstName"
                  value={user.firstName}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-[#D2B48C] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#7B4B3A] bg-[#F5F0E1] text-[#5C362C] placeholder-[#7B4B3A]"
                  placeholder="Enter your first name"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-[#7B4B3A] mb-2">Last Name</label>
                <input
                  type="text"
                  name="lastName"
                  value={user.lastName}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-[#D2B48C] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#7B4B3A] bg-[#F5F0E1] text-[#5C362C] placeholder-[#7B4B3A]"
                  placeholder="Enter your last name"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-[#7B4B3A] mb-2">Email Address</label>
              <input
                type="email"
                name="email"
                value={user.email}
                onChange={handleInputChange}
                disabled
                className="w-full px-4 py-2 border border-[#D2B48C] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#7B4B3A] bg-[#EDE4D3] text-[#5C362C] cursor-not-allowed"
                placeholder="Your email address"
              />
              <p className="text-xs text-[#7B4B3A] mt-1">Email cannot be changed</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-[#7B4B3A] mb-2">Phone Number</label>
              <input
                type="tel"
                name="phone"
                value={user.phone}
                onChange={handleInputChange}
                className="w-full px-4 py-2 border border-[#D2B48C] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#7B4B3A] bg-[#F5F0E1] text-[#5C362C] placeholder-[#7B4B3A]"
                placeholder="Enter your phone number"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-[#7B4B3A] mb-2">Address</label>
              <textarea
                name="address"
                value={user.address}
                onChange={handleInputChange}
                rows="3"
                className="w-full px-4 py-2 border border-[#D2B48C] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#7B4B3A] bg-[#F5F0E1] text-[#5C362C] placeholder-[#7B4B3A]"
                placeholder="Enter your address"
              />
            </div>

            <div className="flex gap-4 pt-4">
              <button
                onClick={handleSave}
                disabled={isSaving}
                className="flex-1 bg-[#7B4B3A] text-[#F5F0E1] py-3 rounded-lg font-semibold hover:bg-[#5C362C] transition duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {isSaving ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Saving...
                  </>
                ) : (
                  "Save Changes"
                )}
              </button>
              <button
                onClick={() => navigate("/")}
                className="flex-1 bg-[#D2B48C] text-[#7B4B3A] py-3 rounded-lg font-semibold hover:bg-[#C19A6B] transition duration-300"
              >
                Back to Home
              </button>
              <button
                onClick={handleLogout}
                className="px-6 bg-[#A36A50] text-[#F5F0E1] py-3 rounded-lg font-semibold hover:bg-[#8B5E3C] transition duration-300"
              >
                Logout
              </button>
            </div>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
          <div 
            className="bg-white rounded-lg shadow-md p-6 text-center cursor-pointer hover:shadow-lg transition-shadow duration-300"
            onClick={() => navigate("/orders")}
          >
            <div className="text-2xl font-bold text-[#7B4B3A]">{stats.orders}</div>
            <div className="text-[#5C362C]">Orders</div>
          </div>
          <div 
            className="bg-white rounded-lg shadow-md p-6 text-center cursor-pointer hover:shadow-lg transition-shadow duration-300"
            onClick={() => navigate("/wishlist")}
          >
            <div className="text-2xl font-bold text-[#7B4B3A]">{stats.wishlistItems}</div>
            <div className="text-[#5C362C]">Wishlist Items</div>
          </div>
          <div 
            className="bg-white rounded-lg shadow-md p-6 text-center cursor-pointer hover:shadow-lg transition-shadow duration-300"
            onClick={() => navigate("/cart")}
          >
            <div className="text-2xl font-bold text-[#7B4B3A]">{stats.cartItems}</div>
            <div className="text-[#5C362C]">Cart Items</div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Profile;