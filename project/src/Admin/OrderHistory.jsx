import React, { useState, useEffect } from "react";
import Sidebar from "./Sidebar";
import { FaSearch, FaEye, FaBars, FaArrowLeft, FaArrowRight, FaShoppingCart, FaCalendar, FaRupeeSign, FaBox, FaTimes } from "react-icons/fa";

const OrderHistory = () => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [orders, setOrders] = useState([]);
  const [filteredOrders, setFilteredOrders] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [isMobile, setIsMobile] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const ordersPerPage = 10;

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

  // Fetch orders
  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const usersRes = await fetch("http://localhost:5000/users");
        const usersData = await usersRes.json();
        
        // Extract all orders from all users
        const allOrders = usersData.flatMap(user => 
          (user.orders || []).map(order => ({
            ...order,
            customerName: user.firstName,
            customerEmail: user.email,
            userId: user.id,
            date: new Date(order.date || order.orderDate)
          }))
        );

        // Sort by date (newest first)
        allOrders.sort((a, b) => b.date - a.date);
        
        setOrders(allOrders);
        setFilteredOrders(allOrders);
      } catch (err) {
        console.error("Error fetching orders:", err);
      }
    };
    fetchOrders();
  }, []);

  // Filter orders based on search
  useEffect(() => {
    const filtered = orders.filter(order =>
      order.customerName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.id?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.status?.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredOrders(filtered);
    setCurrentPage(1);
  }, [searchTerm, orders]);

  // Pagination calculations
  const indexOfLastOrder = currentPage * ordersPerPage;
  const indexOfFirstOrder = indexOfLastOrder - ordersPerPage;
  const currentOrders = filteredOrders.slice(indexOfFirstOrder, indexOfLastOrder);
  const totalPages = Math.ceil(filteredOrders.length / ordersPerPage);

  // Order status colors - Updated with new status options
  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'confirmed':
        return 'bg-blue-100 text-blue-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'shipping':
        return 'bg-purple-100 text-purple-800';
      case 'delivered':
        return 'bg-green-100 text-green-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  // Format date
  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  };

  // View order details
  const handleViewOrder = (order) => {
    setSelectedOrder(order);
  };

  // Close order details
  const handleCloseOrderDetails = () => {
    setSelectedOrder(null);
  };

  // Update order status
  const updateOrderStatus = async (orderId, newStatus) => {
    try {
      // Find the user who owns this order
      const usersRes = await fetch("http://localhost:5000/users");
      const usersData = await usersRes.json();
      
      let targetUser = null;
      let targetOrderIndex = -1;

      // Find the user and order index
      for (const user of usersData) {
        const orderIndex = (user.orders || []).findIndex(order => order.id === orderId);
        if (orderIndex !== -1) {
          targetUser = user;
          targetOrderIndex = orderIndex;
          break;
        }
      }

      if (targetUser && targetOrderIndex !== -1) {
        // Update the order status
        const updatedOrders = [...targetUser.orders];
        updatedOrders[targetOrderIndex] = {
          ...updatedOrders[targetOrderIndex],
          status: newStatus
        };

        // Update the user with the modified orders
        const updatedUser = {
          ...targetUser,
          orders: updatedOrders
        };

        const res = await fetch(`http://localhost:5000/users/${targetUser.id}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(updatedUser),
        });

        if (res.ok) {
          // Update local state
          setOrders(prev => 
            prev.map(order => 
              order.id === orderId ? { ...order, status: newStatus } : order
            )
          );
        }
      }
    } catch (err) {
      console.error("Error updating order status:", err);
    }
  };

  return (
    <div className="flex min-h-screen bg-[#F5F0E1] w-full overflow-x-hidden">
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
              Order History
            </h1>
          </div>
        )}

        {/* Desktop Header */}
        {!isMobile && (
          <div className="p-4 md:p-6 bg-[#F5F0E1]">
            <h1 className="text-2xl md:text-3xl font-bold text-[#7B4B3A]">
              Order History
            </h1>
            <p className="text-[#5C362C] mt-2">Manage and view all customer orders</p>
          </div>
        )}

        {/* Content Area */}
        <div className="p-4 md:p-6 bg-[#F5F0E1] w-full">
          {/* Search Bar */}
          <div className="bg-white rounded-xl shadow-lg border border-[#7B4B3A]/30 p-4 mb-6 w-full">
            <div className="relative w-full max-w-md">
              <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search orders by customer name, order ID, or status..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#7B4B3A] focus:border-transparent"
              />
            </div>
          </div>

          {/* Orders Summary Cards - Updated with new status counts */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6 w-full">
            <div className="bg-white rounded-xl p-4 shadow-lg border border-[#7B4B3A]/30 w-full">
              <div className="flex items-center justify-between w-full">
                <div className="flex-1">
                  <p className="text-sm font-semibold text-[#5C362C]">Total Orders</p>
                  <h2 className="text-xl md:text-2xl font-bold text-[#7B4B3A] mt-1">{orders.length}</h2>
                </div>
                <div className="p-3 rounded-full bg-[#7B4B3A] flex-shrink-0">
                  <FaShoppingCart className="text-white text-lg" />
                </div>
              </div>
            </div>
            
            <div className="bg-white rounded-xl p-4 shadow-lg border border-[#7B4B3A]/30 w-full">
              <div className="flex items-center justify-between w-full">
                <div className="flex-1">
                  <p className="text-sm font-semibold text-[#5C362C]">Pending</p>
                  <h2 className="text-xl md:text-2xl font-bold text-[#7B4B3A] mt-1">
                    {orders.filter(o => o.status?.toLowerCase() === 'pending').length}
                  </h2>
                </div>
                <div className="p-3 rounded-full bg-yellow-500 flex-shrink-0">
                  <FaCalendar className="text-white text-lg" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl p-4 shadow-lg border border-[#7B4B3A]/30 w-full">
              <div className="flex items-center justify-between w-full">
                <div className="flex-1">
                  <p className="text-sm font-semibold text-[#5C362C]">Shipping</p>
                  <h2 className="text-xl md:text-2xl font-bold text-[#7B4B3A] mt-1">
                    {orders.filter(o => o.status?.toLowerCase() === 'shipping').length}
                  </h2>
                </div>
                <div className="p-3 rounded-full bg-purple-500 flex-shrink-0">
                  <FaBox className="text-white text-lg" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl p-4 shadow-lg border border-[#7B4B3A]/30 w-full">
              <div className="flex items-center justify-between w-full">
                <div className="flex-1">
                  <p className="text-sm font-semibold text-[#5C362C]">Delivered</p>
                  <h2 className="text-xl md:text-2xl font-bold text-[#7B4B3A] mt-1">
                    {orders.filter(o => o.status?.toLowerCase() === 'delivered').length}
                  </h2>
                </div>
                <div className="p-3 rounded-full bg-green-500 flex-shrink-0">
                  <FaRupeeSign className="text-white text-lg" />
                </div>
              </div>
            </div>
          </div>

          {/* Orders Table */}
          <div className="bg-white rounded-xl shadow-lg border border-[#7B4B3A]/30 overflow-hidden w-full">
            <div className="px-4 py-3 font-semibold text-lg bg-[#7B4B3A] text-[#F5F0E1]">
              All Orders ({filteredOrders.length})
            </div>
            
            {currentOrders.length === 0 ? (
              <div className="p-8 text-center w-full">
                <p className="text-gray-500 text-lg font-medium">No orders found</p>
                <p className="text-gray-400 text-sm mt-1">
                  {searchTerm ? "Try adjusting your search terms" : "No orders have been placed yet"}
                </p>
              </div>
            ) : (
              <>
                <div className="overflow-x-auto w-full">
                  <table className="w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-3 py-3 text-left text-xs font-semibold text-[#5C362C] uppercase tracking-wider whitespace-nowrap">
                          Order ID
                        </th>
                        {!isMobile && (
                          <th className="px-3 py-3 text-left text-xs font-semibold text-[#5C362C] uppercase tracking-wider whitespace-nowrap">
                            Customer
                          </th>
                        )}
                        <th className="px-3 py-3 text-left text-xs font-semibold text-[#5C362C] uppercase tracking-wider whitespace-nowrap">
                          Date
                        </th>
                        <th className="px-3 py-3 text-left text-xs font-semibold text-[#5C362C] uppercase tracking-wider whitespace-nowrap">
                          Amount
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
                      {currentOrders.map((order) => (
                        <tr key={order.id} className="hover:bg-gray-50 transition">
                          <td className="px-3 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <FaShoppingCart className="text-gray-400 mr-2 flex-shrink-0" />
                              <span className="text-sm font-medium text-gray-900 truncate max-w-[100px]">
                                {order.id || `ORD-${order.userId}-${Math.random().toString(36).substr(2, 9)}`}
                              </span>
                            </div>
                          </td>
                          {!isMobile && (
                            <td className="px-3 py-4 whitespace-nowrap">
                              <div className="min-w-0">
                                <p className="font-medium text-gray-900 text-sm truncate">{order.customerName}</p>
                                <p className="text-xs text-gray-500 truncate">{order.customerEmail}</p>
                              </div>
                            </td>
                          )}
                          <td className="px-3 py-4 text-sm text-gray-900 whitespace-nowrap">
                            {formatDate(order.date)}
                          </td>
                          <td className="px-3 py-4 text-sm font-semibold text-gray-900 whitespace-nowrap">
                            ₹{(order.total || 0).toLocaleString()}
                          </td>
                          <td className="px-3 py-4 whitespace-nowrap">
                            <select
                              value={order.status || 'pending'}
                              onChange={(e) => updateOrderStatus(order.id, e.target.value)}
                              className={`px-2 py-1 text-xs font-semibold rounded-full border-0 focus:ring-2 focus:ring-[#7B4B3A] ${getStatusColor(order.status)}`}
                            >
                              <option value="pending" className="bg-white text-gray-800">Pending</option>
                              <option value="confirmed" className="bg-white text-gray-800">Confirmed</option>
                              <option value="shipping" className="bg-white text-gray-800">Shipping</option>
                              <option value="delivered" className="bg-white text-gray-800">Delivered</option>
                              <option value="cancelled" className="bg-white text-gray-800">Cancelled</option>
                            </select>
                          </td>
                          <td className="px-3 py-4 whitespace-nowrap">
                            <button
                              onClick={() => handleViewOrder(order)}
                              className="flex items-center gap-1 px-2 py-1 bg-[#7B4B3A] text-white rounded-lg hover:bg-[#5C362C] transition-colors text-xs sm:text-sm"
                            >
                              <FaEye className="text-xs" />
                              View
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="px-3 sm:px-4 py-4 border-t border-gray-200 flex flex-col sm:flex-row items-center justify-between gap-3 sm:gap-4">
                    <div className="text-xs sm:text-sm text-gray-700">
                      Showing {indexOfFirstOrder + 1} to {Math.min(indexOfLastOrder, filteredOrders.length)} of {filteredOrders.length} orders
                    </div>
                    <div className="flex gap-1 sm:gap-2">
                      <button
                        onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                        disabled={currentPage === 1}
                        className="p-1 sm:p-2 rounded-lg border border-gray-300 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors"
                      >
                        <FaArrowLeft className="text-sm" />
                      </button>
                      
                      {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                        <button
                          key={page}
                          onClick={() => setCurrentPage(page)}
                          className={`px-2 py-1 sm:px-3 sm:py-2 rounded-lg border transition-colors text-xs sm:text-sm ${
                            currentPage === page
                              ? 'bg-[#7B4B3A] text-white border-[#7B4B3A]'
                              : 'border-gray-300 hover:bg-gray-50'
                          }`}
                        >
                          {page}
                        </button>
                      ))}
                      
                      <button
                        onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                        disabled={currentPage === totalPages}
                        className="p-1 sm:p-2 rounded-lg border border-gray-300 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors"
                      >
                        <FaArrowRight className="text-sm" />
                      </button>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>

      {/* Order Details Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#F5F0E1] rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b border-[#7B4B3A]">
              <h2 className="text-xl font-bold text-[#7B4B3A]">Order Details</h2>
              <button
                onClick={handleCloseOrderDetails}
                className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
              >
                <FaTimes size={20} />
              </button>
            </div>
            
            <div className="p-6">
              {/* Order Header */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <div>
                  <h3 className="font-semibold text-[#5C362C] mb-2">Order Information</h3>
                  <p><strong>Order ID:</strong> {selectedOrder.id || 'N/A'}</p>
                  <p><strong>Date:</strong> {formatDate(selectedOrder.date)}</p>
                  <p><strong>Status:</strong> 
                    <span className={`ml-2 px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(selectedOrder.status)}`}>
                      {selectedOrder.status || 'Pending'}
                    </span>
                  </p>
                </div>
                <div>
                  <h3 className="font-semibold text-[#5C362C] mb-2">Customer Information</h3>
                  <p><strong>Name:</strong> {selectedOrder.customerName}</p>
                  <p><strong>Email:</strong> {selectedOrder.customerEmail}</p>
                </div>
              </div>

              {/* Order Items */}
              <div className="mb-6">
                <h3 className="font-semibold text-[#5C362C] mb-3">Order Items</h3>
                <div className="border rounded-lg overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-[#bd826c]">
                        <tr>
                          <th className="px-4 py-2 text-left text-xs font-semibold text-[#5C362C]">Product</th>
                          <th className="px-4 py-2 text-left text-xs font-semibold text-[#5C362C]">Price</th>
                          <th className="px-4 py-2 text-left text-xs font-semibold text-[#5C362C]">Quantity</th>
                          <th className="px-4 py-2 text-left text-xs font-semibold text-[#5C362C]">Total</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200">
                        {(selectedOrder.items || []).map((item, index) => (
                          <tr key={index}>
                            <td className="px-4 py-2 text-sm">{item.name}</td>
                            <td className="px-4 py-2 text-sm">₹{item.price}</td>
                            <td className="px-4 py-2 text-sm">{item.quantity}</td>
                            <td className="px-4 py-2 text-sm font-semibold">₹{item.price * item.quantity}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>

              {/* Order Summary */}
              <div className="bg-[#bd826c] rounded-lg p-4">
                <div className="flex justify-between items-center mb-2">
                  <span className="font-semibold">Subtotal:</span>
                  <span>₹{(selectedOrder.total || 0).toLocaleString()}</span>
                </div>
                <div className="flex justify-between items-center border-t border-[#bd826c]  pt-2">
                  <span className="font-bold text-lg">Total:</span>
                  <span className="font-bold text-lg">₹{(selectedOrder.total || 0).toLocaleString()}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default OrderHistory;