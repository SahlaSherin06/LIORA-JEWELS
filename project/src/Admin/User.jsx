import React, { useState, useEffect } from "react";
import Sidebar from "./Sidebar";
import { FaSearch, FaTrash, FaBars, FaUser, FaEnvelope, FaShoppingCart, FaEye, FaTimes, FaCalendar } from "react-icons/fa";
import { toast } from 'react-toastify';
import ConfirmModal from "../Components/ConfirmModal";

const UserManagement = () => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [users, setUsers] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isMobile, setIsMobile] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [showUserDetails, setShowUserDetails] = useState(false);
  const [confirmModalConfig, setConfirmModalConfig] = useState({
    isOpen: false,
    title: "",
    message: "",
    onConfirm: () => {},
    isDanger: true,
    confirmText: "Confirm"
  });

  // Check mobile screen
  useEffect(() => {
    const checkMobile = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
      if (mobile) {
        setSidebarOpen(false);
      }
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Fetch users and orders
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [usersRes, ordersRes] = await Promise.all([
          fetch(`http://localhost:5000/api/admin/users?search=${searchTerm}`, { credentials: "include" }),
          fetch("http://localhost:5000/api/admin/orders", { credentials: "include" })
        ]);
        
        if (!usersRes.ok || !ordersRes.ok) throw new Error("Failed to fetch data");
        
        const usersData = await usersRes.json();
        const ordersData = await ordersRes.json();
        
        // Map orders to users
        const usersWithOrders = usersData.map(user => {
          const userOrders = ordersData.filter(o => String(o.userId) === String(user._id));
          return { ...user, orders: userOrders, id: user._id };
        });

        // Filter out admin users locally for now (could be moved to backend later)
        const regularUsers = usersWithOrders.filter(user => user.role?.toLowerCase() !== "admin");
        
        setUsers(regularUsers);
      } catch (err) {
        console.error("Error fetching data:", err);
      }
    };
    
    const timeoutId = setTimeout(() => fetchData(), 400); // Debounce search
    return () => clearTimeout(timeoutId);
  }, [searchTerm]);

  // Calculate user statistics
  const totalUsers = users.length;
  const activeUsers = users.filter(user => user.isActive !== false).length;
  const totalOrders = users.reduce((sum, user) => sum + (user.orders?.length || 0), 0);
  const totalRevenue = users.reduce((sum, user) => {
    const userOrdersTotal = (user.orders || []).reduce((orderSum, order) => orderSum + (order.total || 0), 0);
    return sum + userOrdersTotal;
  }, 0);

  // Format date
  const formatDate = (date) => {
    if (!date) return 'N/A';
    return new Date(date).toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  };

  // Delete user
  const handleDeleteUser = (userId) => {
    setConfirmModalConfig({
      isOpen: true,
      title: "Delete User",
      message: "Are you sure you want to delete this user? This action cannot be undone.",
      isDanger: true,
      confirmText: "Delete",
      onConfirm: async () => {
        try {
          const res = await fetch(`http://localhost:5000/api/admin/users/${userId}`, {
            method: "DELETE",
            credentials: "include"
          });

          if (res.ok) {
            setUsers(prev => prev.filter(user => user.id !== userId));
            toast.success("User deleted successfully!");
          } else {
            toast.error("Failed to delete user.");
          }
        } catch (err) {
          console.error("Error deleting user:", err);
          toast.error("Error deleting user. Please try again.");
        }
      }
    });
  };

  // Toggle user status
  const toggleUserStatus = async (user) => {
    try {
      const newStatus = !user.isActive;
      const res = await fetch(`http://localhost:5000/api/admin/users/${user.id || user._id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({ isActive: newStatus }),
      });

      if (res.ok) {
        setUsers(prev => 
          prev.map(u => (u.id === user.id || u._id === user._id) ? { ...u, isActive: newStatus } : u)
        );
      }
    } catch (err) {
      console.error("Error updating user status:", err);
    }
  };

  // View user details
  const handleViewUser = (user) => {
    setSelectedUser(user);
    setShowUserDetails(true);
  };

  // Close user details
  const handleCloseUserDetails = () => {
    setSelectedUser(null);
    setShowUserDetails(false);
  };

  // Stats cards data
  const stats = [
    { 
      title: "Total Users", 
      value: totalUsers, 
      icon: FaUser,
      color: "bg-[#7B4B3A]"
    },
    { 
      title: "Active Users", 
      value: activeUsers, 
      icon: FaUser,
      color: "bg-green-500"
    },
    { 
      title: "Total Orders", 
      value: totalOrders, 
      icon: FaShoppingCart,
      color: "bg-blue-500"
    },
    { 
      title: "Total Revenue", 
      value: `₹${totalRevenue.toLocaleString()}`, 
      icon: FaEnvelope,
      color: "bg-purple-500"
    },
  ];

  return (
    <div className="flex min-h-screen bg-[#F5F0E1] w-full overflow-x-hidden">
      <ConfirmModal 
        isOpen={confirmModalConfig.isOpen}
        onClose={() => setConfirmModalConfig(prev => ({ ...prev, isOpen: false }))}
        onConfirm={confirmModalConfig.onConfirm}
        title={confirmModalConfig.title}
        message={confirmModalConfig.message}
        isDanger={confirmModalConfig.isDanger}
        confirmText={confirmModalConfig.confirmText}
      />
      {/* Sidebar */}
      <Sidebar isOpen={sidebarOpen} setIsOpen={setSidebarOpen} />
      
      {/* Mobile Overlay */}
      {isMobile && sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Main Content */}
      <div className={`flex-1 w-full min-h-screen transition-all duration-300 ${sidebarOpen && !isMobile ? 'lg:ml-64' : ''}`}>
        
        {/* Mobile Header with Toggle */}
        {isMobile && (
          <div className="flex items-center p-4 bg-[#F5F0E1] w-full">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="p-2 rounded-lg bg-[#7B4B3A] text-[#F5F0E1] hover:bg-[#5C362C] transition-colors duration-200 mr-4"
            >
              <FaBars size={20} />
            </button>
            <h1 className="text-xl font-bold text-[#7B4B3A]">
              User Management
            </h1>
          </div>
        )}

        {/* Desktop Header */}
        {!isMobile && (
          <div className="p-4 md:p-6 bg-[#F5F0E1]">
            <h1 className="text-2xl md:text-3xl font-bold text-[#7B4B3A]">
              User Management
            </h1>
            <p className="text-[#5C362C] mt-2">Manage and view all registered users</p>
          </div>
        )}

        {/* Content Area */}
        <div className="p-4 md:p-6 bg-[#F5F0E1] w-full">
          {/* Stats Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6 w-full">
            {stats.map((stat, index) => {
              const Icon = stat.icon;
              return (
                <div key={index} className="bg-white rounded-xl p-4 shadow-lg border border-[#7B4B3A]/30 w-full">
                  <div className="flex items-center justify-between w-full">
                    <div className="flex-1">
                      <p className="text-sm font-semibold text-[#5C362C] truncate">{stat.title}</p>
                      <h2 className="text-xl md:text-2xl font-bold mt-1 text-[#7B4B3A] truncate">{stat.value}</h2>
                    </div>
                    <div className={`p-3 rounded-full ${stat.color} flex-shrink-0`}>
                      <Icon className="text-white text-lg" />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Search Bar */}
          <div className="bg-white rounded-xl shadow-lg border border-[#7B4B3A]/30 p-4 mb-6 w-full">
            <div className="relative w-full max-w-md">
              <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search users by name, email, or phone..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#7B4B3A] focus:border-transparent"
              />
            </div>
          </div>

          {/* Users Table */}
          <div className="bg-white rounded-xl shadow-lg border border-[#7B4B3A]/30 overflow-hidden w-full">
            <div className="px-4 py-3 font-semibold text-lg bg-[#7B4B3A] text-[#F5F0E1]">
              Registered Users ({users.length})
            </div>
            
            {users.length === 0 ? (
              <div className="p-8 text-center w-full">
                <p className="text-gray-500 text-lg font-medium">No users found</p>
                <p className="text-gray-400 text-sm mt-1">
                  {searchTerm ? "Try adjusting your search terms" : "No users have registered yet"}
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto w-full">
                <table className="w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-3 py-3 text-left text-xs font-semibold text-[#5C362C] uppercase tracking-wider whitespace-nowrap">
                        User
                      </th>
                      {!isMobile && (
                        <th className="px-3 py-3 text-left text-xs font-semibold text-[#5C362C] uppercase tracking-wider whitespace-nowrap">
                          Contact
                        </th>
                      )}
                      <th className="px-3 py-3 text-left text-xs font-semibold text-[#5C362C] uppercase tracking-wider whitespace-nowrap">
                        Orders
                      </th>
                      <th className="px-3 py-3 text-left text-xs font-semibold text-[#5C362C] uppercase tracking-wider whitespace-nowrap">
                        Status
                      </th>
                      <th className="px-3 py-3 text-left text-xs font-semibold text-[#5C362C] uppercase tracking-wider whitespace-nowrap">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {users.map((user) => (
                      <tr key={user.id} className="hover:bg-gray-50 transition">
                        <td className="px-3 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="flex-shrink-0 h-8 w-8 sm:h-10 sm:w-10 bg-[#7B4B3A] rounded-full flex items-center justify-center">
                              <span className="text-white font-semibold text-xs sm:text-sm">
                                {user.name?.charAt(0).toUpperCase()}
                              </span>
                            </div>
                            <div className="ml-3 min-w-0">
                              <p className="font-medium text-gray-900 text-sm sm:text-base truncate max-w-[100px] sm:max-w-none">
                                {user.name}
                              </p>
                              {isMobile && (
                                <p className="text-xs text-gray-500 truncate max-w-[100px]">
                                  {user.email}
                                </p>
                              )}
                            </div>
                          </div>
                        </td>
                        {!isMobile && (
                          <td className="px-3 py-4 whitespace-nowrap">
                            <div className="min-w-0">
                              <p className="text-sm text-gray-900 flex items-center gap-1 truncate">
                                <FaEnvelope className="text-gray-400 flex-shrink-0" />
                                <span className="truncate">{user.email}</span>
                              </p>
                              {user.phone && (
                                <p className="text-xs text-gray-500 mt-1 truncate">
                                  {user.phone}
                                </p>
                              )}
                            </div>
                          </td>
                        )}
                        <td className="px-3 py-4 whitespace-nowrap">
                          <span className="px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
                            {user.orders?.length || 0} orders
                          </span>
                        </td>
                        <td className="px-3 py-4 whitespace-nowrap">
                          <button
                            onClick={() => toggleUserStatus(user)}
                            className={`px-2 py-1 sm:px-3 sm:py-1 rounded-full text-xs font-semibold transition-colors whitespace-nowrap ${
                              user.isActive !== false 
                                ? 'bg-green-100 text-green-800 hover:bg-green-200' 
                                : 'bg-red-100 text-red-800 hover:bg-red-200'
                            }`}
                          >
                            {user.isActive !== false ? 'Active' : 'Inactive'}
                          </button>
                        </td>
                        <td className="px-3 py-4 whitespace-nowrap">
                          <div className="flex gap-1 sm:gap-2">
                            <button
                              onClick={() => handleViewUser(user)}
                              className="p-1 sm:p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                              title="View Details"
                            >
                              <FaEye className="text-sm sm:text-base" />
                            </button>
                            <button
                              onClick={() => handleDeleteUser(user.id)}
                              className="p-1 sm:p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                              title="Delete User"
                            >
                              <FaTrash className="text-sm sm:text-base" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* User Details Modal */}
      {showUserDetails && selectedUser && (
        <div className="fixed inset-0 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#F5F0E1] rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-4 sm:p-6 border-b border-[#7B4B3A]">
              <h2 className="text-lg sm:text-xl font-bold text-[#7B4B3A]">User Details</h2>
              <button
                onClick={handleCloseUserDetails}
                className="p-1 sm:p-2 text-gray-400 hover:text-gray-600 transition-colors"
              >
                <FaTimes size={18} />
              </button>
            </div>
            
            <div className="p-4 sm:p-6">
              {/* User Header */}
              <div className="flex items-center mb-4 sm:mb-6">
                <div className="h-12 w-12 sm:h-16 sm:w-16 bg-[#7B4B3A] rounded-full flex items-center justify-center mr-3 sm:mr-4">
                  <span className="text-white font-semibold text-lg sm:text-xl">
                    {selectedUser.name?.charAt(0).toUpperCase()}
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-lg sm:text-xl font-bold text-[#7B4B3A] truncate">{selectedUser.name}</h3>
                  <p className="text-gray-600 text-sm sm:text-base truncate">{selectedUser.email}</p>
                </div>
              </div>

              {/* User Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 mb-4 sm:mb-6">
                <div>
                  <h4 className="font-semibold text-[#5C362C] mb-2 sm:mb-3 text-sm sm:text-base">Personal Information</h4>
                  <div className="space-y-1 sm:space-y-2 text-sm">
                    <p><strong>User ID:</strong> <span className="text-xs sm:text-sm break-all">{selectedUser.id}</span></p>
                    <p><strong>Email:</strong> <span className="text-xs sm:text-sm break-all">{selectedUser.email}</span></p>
                    {selectedUser.phone && <p><strong>Phone:</strong> <span className="text-xs sm:text-sm">{selectedUser.phone}</span></p>}
                    <p className="flex items-center gap-2">
                      <strong>Status:</strong> 
                      <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                        selectedUser.isActive !== false 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {selectedUser.isActive !== false ? 'Active' : 'Inactive'}
                      </span>
                    </p>
                  </div>
                </div>

                <div>
                  <h4 className="font-semibold text-[#5C362C] mb-2 sm:mb-3 text-sm sm:text-base">Account Information</h4>
                  <div className="space-y-1 sm:space-y-2 text-sm">
                    <p><strong>Total Orders:</strong> {selectedUser.orders?.length || 0}</p>
                    <p><strong>Total Spent:</strong> 
                      ₹{(selectedUser.orders || []).reduce((sum, order) => sum + (order.total || 0), 0).toLocaleString()}
                    </p>
                  </div>
                </div>
              </div>

              {/* Recent Orders */}
              <div>
                <h4 className="font-semibold text-[#5C362C] mb-2 sm:mb-3 text-sm sm:text-base">Recent Orders</h4>
                {selectedUser.orders && selectedUser.orders.length > 0 ? (
                  <div className="border border-[#7B4B3A]/30 rounded-lg overflow-hidden">
                    <div className="overflow-x-auto">
                      <table className="w-full divide-y divide-[#7B4B3A]/20">
                        <thead className="bg-[#EDE4D3]">
                          <tr>
                            <th className="px-3 py-2 text-left text-xs font-semibold text-[#5C362C] whitespace-nowrap">Order ID</th>
                            <th className="px-3 py-2 text-left text-xs font-semibold text-[#5C362C] whitespace-nowrap">Date</th>
                            <th className="px-3 py-2 text-left text-xs font-semibold text-[#5C362C] whitespace-nowrap">Amount</th>
                            <th className="px-3 py-2 text-left text-xs font-semibold text-[#5C362C] whitespace-nowrap">Status</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-[#7B4B3A]/20 bg-[#F5F0E1]">
                          {selectedUser.orders.slice(0, 5).map((order, index) => (
                            <tr key={index} className="hover:bg-[#EDE4D3]/50 transition-colors">
                              <td className="px-3 py-2 text-xs whitespace-nowrap">{order.id || `ORD-${index + 1}`}</td>
                              <td className="px-3 py-2 text-xs whitespace-nowrap">{formatDate(order.date)}</td>
                              <td className="px-3 py-2 text-xs whitespace-nowrap">₹{(order.total || 0).toLocaleString()}</td>
                              <td className="px-3 py-2 text-xs whitespace-nowrap">
                                <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                                  order.status === 'completed' ? 'bg-green-100 text-green-800' :
                                  order.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                                  'bg-gray-100 text-gray-800'
                                }`}>
                                  {order.status || 'Pending'}
                                </span>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                ) : (
                  <p className="text-gray-500 text-sm">No orders found for this user.</p>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserManagement;