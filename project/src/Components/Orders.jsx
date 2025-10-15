// import React, { useState, useEffect, useContext } from "react";
// import { useNavigate } from "react-router-dom";
// import { AuthContext } from "../Context/AuthContext";
// import { FaShoppingBag, FaCalendar, FaDollarSign, FaEye } from "react-icons/fa";

// function Orders() {
//   const { user, isLoggedIn } = useContext(AuthContext);
//   const navigate = useNavigate();
//   const [orders, setOrders] = useState([]);

//   useEffect(() => {
//     if (!isLoggedIn) {
//       navigate("/login");
//       return;
//     }

//     if (user) {
//       const userOrders = JSON.parse(localStorage.getItem(`orders_${user.id}`)) || [];
//       setOrders(userOrders);
//     }
//   }, [user, isLoggedIn, navigate]);

//   const getStatusColor = (status) => {
//     switch (status) {
//       case "confirmed":
//         return "bg-green-100 text-green-800";
//       case "shipped":
//         return "bg-blue-100 text-blue-800";
//       case "delivered":
//         return "bg-purple-100 text-purple-800";
//       default:
//         return "bg-gray-100 text-gray-800";
//     }
//   };

//   if (!isLoggedIn) {
//     return null;
//   }

//   return (
//     <div className="min-h-screen bg-gradient-to-br from-[#FFF9F2] to-[#F8F1E4] pt-24 pb-12 px-4">
//       <div className="max-w-4xl mx-auto">
//         <div className="text-center mb-8">
//           <h1 className="text-3xl font-bold text-[#8B5E3C] mb-2">My Orders</h1>
//           <p className="text-[#6D4C41]">View your order history and track your purchases</p>
//         </div>

//         {orders.length === 0 ? (
//           <div className="bg-white rounded-xl shadow-lg p-8 text-center border border-[#F0E6D8]">
//             <FaShoppingBag className="text-6xl text-[#8B5E3C] mx-auto mb-4" />
//             <h2 className="text-xl font-semibold text-[#8B5E3C] mb-2">No Orders Yet</h2>
//             <p className="text-[#6D4C41] mb-4">You haven't placed any orders yet.</p>
//             <button
//               onClick={() => navigate("/shop")}
//               className="px-6 py-2 bg-[#8B5E3C] text-white rounded-lg hover:bg-[#6D4C41] transition-colors"
//             >
//               Start Shopping
//             </button>
//           </div>
//         ) : (
//           <div className="space-y-4">
//             {orders.map((order) => (
//               <div key={order.id} className="bg-white rounded-xl shadow-lg p-6 border border-[#F0E6D8]">
//                 <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-4">
//                   <div>
//                     <h3 className="font-semibold text-[#8B5E3C]">Order #{order.id}</h3>
//                     <div className="flex items-center gap-2 mt-1 text-sm text-[#6D4C41]">
//                       <FaCalendar className="text-xs" />
//                       <span>{new Date(order.orderDate).toLocaleDateString()}</span>
//                     </div>
//                   </div>
//                   <div className="flex items-center gap-4 mt-2 md:mt-0">
//                     <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}>
//                       {order.status}
//                     </span>
//                     <div className="flex items-center gap-1 text-[#8B5E3C] font-semibold">
//                       <FaDollarSign className="text-sm" />
//                       <span>{order.total.toFixed(2)}</span>
//                     </div>
//                   </div>
//                 </div>

//                 <div className="border-t border-[#F0E6D8] pt-4">
//                   <h4 className="font-medium text-[#8B5E3C] mb-3">Items:</h4>
//                   <div className="space-y-2">
//                     {order.items.map((item, index) => (
//                       <div key={index} className="flex items-center gap-3 p-2 bg-[#FFF9F2] rounded-lg">
//                         <img
//                           src={item.image}
//                           alt={item.name}
//                           className="w-12 h-12 object-cover rounded"
//                         />
//                         <div className="flex-1">
//                           <h5 className="font-medium text-[#8B5E3C] text-sm">{item.name}</h5>
//                           <p className="text-[#6D4C41] text-xs">Qty: {item.quantity || 1}</p>
//                         </div>
//                         <div className="text-[#8B5E3C] font-semibold text-sm">
//                           ${((item.price * (item.quantity || 1)).toFixed(2))}
//                         </div>
//                       </div>
//                     ))}
//                   </div>
//                 </div>

//                 <div className="flex justify-between items-center mt-4 pt-4 border-t border-[#F0E6D8]">
//                   <div className="text-sm text-[#6D4C41]">
//                     <span className="font-medium">Shipping to: </span>
//                     {order.customerInfo.address}
//                   </div>
//                   <button
//                     onClick={() => navigate(`/order-details/${order.id}`)}
//                     className="flex items-center gap-2 px-3 py-1 text-[#8B5E3C] hover:bg-[#8B5E3C] hover:text-white rounded-lg transition-colors text-sm"
//                   >
//                     <FaEye />
//                     View Details
//                   </button>
//                 </div>
//               </div>
//             ))}
//           </div>
//         )}
//       </div>
//     </div>
//   );
// }

// export default Orders;


import React, { useContext, useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { AuthContext } from "../Context/AuthContext";
import { FaBox, FaShippingFast, FaCheckCircle, FaCalendarAlt, FaHome } from "react-icons/fa";

function Orders() {
  const { user, orders } = useContext(AuthContext);
  const navigate = useNavigate();
  const location = useLocation();
  const [showSuccess, setShowSuccess] = useState(false);
  const [successOrderNumber, setSuccessOrderNumber] = useState("");

  useEffect(() => {
    // Check if redirected from successful checkout
    if (location.state?.recentOrder) {
      setShowSuccess(true);
      setSuccessOrderNumber(location.state.recentOrder);
      
      // Clear the location state
      window.history.replaceState({}, document.title);
      
      // Hide success message after 5 seconds
      setTimeout(() => {
        setShowSuccess(false);
      }, 5000);
    }
  }, [location]);

  const getStatusIcon = (status) => {
    switch (status) {
      case "confirmed":
        return <FaCheckCircle className="text-green-500" />;
      case "shipped":
        return <FaShippingFast className="text-blue-500" />;
      default:
        return <FaBox className="text-gray-500" />;
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  // Sort orders by date (newest first)
  const sortedOrders = orders?.sort((a, b) => new Date(b.orderDate) - new Date(a.orderDate)) || [];

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#FFF9F2] to-[#F8F1E4] pt-32 pb-12 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Success Banner */}
        {showSuccess && (
          <div className="bg-green-50 border border-green-200 rounded-xl p-6 mb-8 animate-scale-in">
            <div className="flex items-center gap-3">
              <FaCheckCircle className="text-green-500 text-2xl" />
              <div>
                <h3 className="text-green-800 font-semibold text-lg">Order Placed Successfully!</h3>
                <p className="text-green-600">Your order {successOrderNumber} has been confirmed and is being processed.</p>
              </div>
            </div>
          </div>
        )}

        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-[#8B5E3C] mb-2">My Orders</h1>
          <p className="text-[#6D4C41]">Track your purchases and order history</p>
        </div>

        {/* Orders List */}
        {!sortedOrders || sortedOrders.length === 0 ? (
          <div className="text-center py-12">
            <FaBox className="text-[#8B5E3C] text-6xl mx-auto mb-4 opacity-50" />
            <h3 className="text-2xl text-[#8B5E3C] mb-2">No Orders Yet</h3>
            <p className="text-[#6D4C41] mb-6">Start shopping to see your orders here</p>
            <div className="flex gap-4 justify-center">
              <button
                onClick={() => navigate("/shop")}
                className="px-6 py-3 bg-[#8B5E3C] text-white rounded-lg hover:bg-[#6D4C41] transition-colors"
              >
                Start Shopping
              </button>
              <button
                onClick={() => navigate("/")}
                className="px-6 py-3 border border-[#8B5E3C] text-[#8B5E3C] rounded-lg hover:bg-[#8B5E3C] hover:text-white transition-colors flex items-center gap-2"
              >
                <FaHome />
                Go Home
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            {sortedOrders.map((order) => (
              <div key={order.id} className="bg-white rounded-2xl shadow-lg p-6 border border-[#F0E6D8]">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-xl font-bold text-[#8B5E3C]">Order #{order.id}</h3>
                    <p className="text-[#6D4C41] flex items-center gap-2 mt-1">
                      <FaCalendarAlt className="text-sm" />
                      {formatDate(order.orderDate)}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 bg-green-50 px-3 py-1 rounded-full">
                    {getStatusIcon(order.status)}
                    <span className="text-green-700 font-semibold capitalize">{order.status}</span>
                  </div>
                </div>

                {/* Order Items */}
                <div className="space-y-3 mb-4">
                  {order.items.map((item, index) => (
                    <div key={index} className="flex items-center gap-3 p-3 bg-[#FFF9F2] rounded-lg">
                      <img
                        src={item.image}
                        alt={item.name}
                        className="w-12 h-12 object-cover rounded"
                      />
                      <div className="flex-1">
                        <h4 className="font-semibold text-[#8B5E3C]">{item.name}</h4>
                        <p className="text-[#6D4C41] text-sm">Qty: {item.quantity}</p>
                      </div>
                      <div className="text-[#8B5E3C] font-semibold">
                        ${(item.price * (item.quantity || 1)).toFixed(2)}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Order Footer */}
                <div className="flex justify-between items-center pt-4 border-t border-[#E0CFC1]">
                  <div className="text-[#6D4C41]">
                    <p className="text-sm">Estimated Delivery:</p>
                    <p className="font-semibold">{formatDate(order.estimatedDelivery)}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-[#6D4C41]">Total Amount</p>
                    <p className="text-2xl font-bold text-[#8B5E3C]">${order.total.toFixed(2)}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default Orders;