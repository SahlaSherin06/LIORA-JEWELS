import React, { useState, useEffect, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from 'react-toastify';
import { AuthContext } from "../Context/AuthContext";
import { CartContext } from "../Context/CartContext";
import { WishlistContext } from "../Context/WishlistContext";
import api from "../api/api";
import { FaUserCircle, FaShoppingBag, FaHeart, FaShoppingCart, FaSignOutAlt, FaSave } from "react-icons/fa";

function Profile() {
  const navigate = useNavigate();
  const { user, logout, updateUser, loading: authLoading } = useContext(AuthContext);
  const { getCartCount } = useContext(CartContext);
  const { wishlist } = useContext(WishlistContext);
  
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    address: ""
  });
  
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (user) {
      setFormData({
        firstName: user.firstName || "",
        lastName: user.lastName || "",
        email: user.email || "",
        phone: user.phone || "",
        address: user.address || ""
      });
    }
  }, [user]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const response = await api.put("/auth/profile", {
        firstName: formData.firstName,
        lastName: formData.lastName,
        phone: formData.phone,
        address: formData.address
      });
      
      updateUser(response.data);
      toast.success("Profile updated successfully!");
    } catch (error) {
      console.error("Error saving profile:", error);
      toast.error(error.response?.data?.message || "Failed to update profile");
    } finally {
      setIsSaving(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  if (authLoading || !user) {
    return (
      <div className="min-h-screen bg-[#F5F0E1] flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#7B4B3A]"></div>
      </div>
    );
  }

  const { orders } = useContext(AuthContext);

  return (
    <div className="min-h-screen bg-[#F5F0E1] pt-32 pb-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto space-y-8">
        
        {/* Header Section */}
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
          <div className="bg-gradient-to-r from-[#7B4B3A] to-[#A36A50] h-32"></div>
          <div className="px-8 pb-8">
            <div className="relative flex justify-between items-end -mt-12">
              <div className="flex items-center space-x-6">
                <div className="bg-[#FDF8F3] p-2 rounded-full shadow-lg">
                  <FaUserCircle className="text-8xl text-[#7B4B3A]" />
                </div>
                <div className="mt-12">
                  <h1 className="text-3xl font-bold text-[#5C362C]">
                    {user.firstName} {user.lastName}
                  </h1>
                  <p className="text-[#8B5E3C] font-medium">{user.email}</p>
                </div>
              </div>
              <button
                onClick={handleLogout}
                className="flex items-center gap-2 px-6 py-2.5 bg-red-50 text-red-600 hover:bg-red-100 rounded-lg font-semibold transition-colors shadow-sm"
              >
                <FaSignOutAlt /> Logout
              </button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Left Column - Stats */}
          <div className="lg:col-span-1 space-y-6">
            <h2 className="text-2xl font-bold text-[#7B4B3A] mb-4">My Dashboard</h2>
            
            <div 
              onClick={() => navigate("/orders")}
              className="bg-white p-6 rounded-2xl shadow-md border border-transparent hover:border-[#D2B48C] hover:shadow-lg transition-all cursor-pointer group flex items-center justify-between"
            >
              <div className="flex items-center gap-4">
                <div className="p-4 bg-[#FDF8F3] rounded-xl group-hover:bg-[#EDE4D3] transition-colors">
                  <FaShoppingBag className="text-2xl text-[#7B4B3A]" />
                </div>
                <div>
                  <p className="text-[#8B5E3C] text-sm font-semibold">Total Orders</p>
                  <p className="text-2xl font-bold text-[#5C362C]">{orders?.length || 0}</p>
                </div>
              </div>
            </div>

            <div 
              onClick={() => navigate("/wishlist")}
              className="bg-white p-6 rounded-2xl shadow-md border border-transparent hover:border-[#D2B48C] hover:shadow-lg transition-all cursor-pointer group flex items-center justify-between"
            >
              <div className="flex items-center gap-4">
                <div className="p-4 bg-red-50 rounded-xl group-hover:bg-red-100 transition-colors">
                  <FaHeart className="text-2xl text-red-500" />
                </div>
                <div>
                  <p className="text-[#8B5E3C] text-sm font-semibold">Wishlist</p>
                  <p className="text-2xl font-bold text-[#5C362C]">{wishlist?.length || 0}</p>
                </div>
              </div>
            </div>

            <div 
              onClick={() => navigate("/cart")}
              className="bg-white p-6 rounded-2xl shadow-md border border-transparent hover:border-[#D2B48C] hover:shadow-lg transition-all cursor-pointer group flex items-center justify-between"
            >
              <div className="flex items-center gap-4">
                <div className="p-4 bg-[#FDF8F3] rounded-xl group-hover:bg-[#EDE4D3] transition-colors">
                  <FaShoppingCart className="text-2xl text-[#7B4B3A]" />
                </div>
                <div>
                  <p className="text-[#8B5E3C] text-sm font-semibold">In Cart</p>
                  <p className="text-2xl font-bold text-[#5C362C]">{getCartCount()}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column - Profile Form */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl shadow-md p-8">
              <h2 className="text-2xl font-bold text-[#7B4B3A] mb-6 border-b border-[#EDE4D3] pb-4">
                Account Details
              </h2>
              
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-bold text-[#5C362C] mb-2">First Name</label>
                    <input
                      type="text"
                      name="firstName"
                      value={formData.firstName}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border border-[#D2B48C] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#7B4B3A] bg-[#FAFAFA] text-[#5C362C] transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-[#5C362C] mb-2">Last Name</label>
                    <input
                      type="text"
                      name="lastName"
                      value={formData.lastName}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border border-[#D2B48C] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#7B4B3A] bg-[#FAFAFA] text-[#5C362C] transition-all"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-bold text-[#5C362C] mb-2">Email Address</label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    disabled
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl bg-gray-50 text-gray-500 cursor-not-allowed"
                  />
                  <p className="text-xs text-gray-500 mt-2 font-medium flex items-center">
                    <span className="w-1.5 h-1.5 rounded-full bg-gray-400 mr-2"></span>
                    Email address cannot be changed
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-bold text-[#5C362C] mb-2">Phone Number</label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-[#D2B48C] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#7B4B3A] bg-[#FAFAFA] text-[#5C362C] transition-all"
                    placeholder="+1 (555) 000-0000"
                  />
                </div>

                <div>
                  <label className="block text-sm font-bold text-[#5C362C] mb-2">Delivery Address</label>
                  <textarea
                    name="address"
                    value={formData.address}
                    onChange={handleInputChange}
                    rows="4"
                    className="w-full px-4 py-3 border border-[#D2B48C] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#7B4B3A] bg-[#FAFAFA] text-[#5C362C] transition-all resize-none"
                    placeholder="Enter your full street address, city, and zip code"
                  />
                </div>

                <div className="pt-6 border-t border-[#EDE4D3] flex justify-end">
                  <button
                    onClick={handleSave}
                    disabled={isSaving}
                    className="px-8 py-3 bg-[#7B4B3A] text-white rounded-xl font-bold hover:bg-[#5C362C] transition-colors flex items-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed shadow-md hover:shadow-lg"
                  >
                    {isSaving ? (
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    ) : (
                      <FaSave className="text-lg" />
                    )}
                    {isSaving ? "Saving..." : "Save Changes"}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}

export default Profile;
