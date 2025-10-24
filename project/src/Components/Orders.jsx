import React, { useContext, useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { AuthContext } from "../Context/AuthContext";
import { FaBox, FaShippingFast, FaCheckCircle, FaCalendarAlt, FaHome } from "react-icons/fa";

function Orders() {
  const { orders } = useContext(AuthContext);
  const navigate = useNavigate();
  const location = useLocation();
  const [showSuccess, setShowSuccess] = useState(false);
  const [successOrderNumber, setSuccessOrderNumber] = useState("");

  useEffect(() => {
    if (location.state?.recentOrder) {
      setShowSuccess(true);
      setSuccessOrderNumber(location.state.recentOrder);

      window.history.replaceState({}, document.title);

      const timer = setTimeout(() => setShowSuccess(false), 4000);
      return () => clearTimeout(timer);
    }
  }, [location]);

  const getStatusIcon = (status) => {
    switch (status) {
      case "confirmed": return <FaCheckCircle className="text-green-500" />;
      case "shipped": return <FaShippingFast className="text-blue-500" />;
      default: return <FaBox className="text-gray-500" />;
    }
  };

  const formatDate = (dateString) =>
    new Date(dateString).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });

  const sortedOrders = orders?.sort((a, b) => new Date(b.orderDate) - new Date(a.orderDate)) || [];

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#FFF9F2] to-[#F8F1E4] pt-32 pb-12 px-4">
      <div className="max-w-4xl mx-auto">
        {showSuccess && (
          <div className="bg-green-50 border border-green-200 rounded-xl p-6 mb-8 animate-scale-in">
            <div className="flex items-center gap-3">
              <FaCheckCircle className="text-green-500 text-2xl" />
              <div>
                <h3 className="text-green-800 font-semibold text-lg">Order Placed Successfully!</h3>
                <p className="text-green-600">Your order {successOrderNumber} has been confirmed.</p>
              </div>
            </div>
          </div>
        )}

        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-[#8B5E3C] mb-2">My Orders</h1>
          <p className="text-[#6D4C41]">Track your purchases and order history</p>
        </div>

        {!sortedOrders.length ? (
          <div className="text-center py-12">
            <FaBox className="text-[#8B5E3C] text-6xl mx-auto mb-4 opacity-50" />
            <h3 className="text-2xl text-[#8B5E3C] mb-2">No Orders Yet</h3>
            <p className="text-[#6D4C41] mb-6">Start shopping to see your orders here</p>
            <div className="flex gap-4 justify-center">
              <button onClick={() => navigate("/shop")} className="px-6 py-3 bg-[#8B5E3C] text-white rounded-lg hover:bg-[#6D4C41] transition-colors">Start Shopping</button>
              <button onClick={() => navigate("/")} className="px-6 py-3 border border-[#8B5E3C] text-[#8B5E3C] rounded-lg hover:bg-[#8B5E3C] hover:text-white transition-colors flex items-center gap-2">
                <FaHome /> Go Home
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
                      <FaCalendarAlt className="text-sm" /> {formatDate(order.orderDate)}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 bg-green-50 px-3 py-1 rounded-full">
                    {getStatusIcon(order.status)}
                    <span className="text-green-700 font-semibold capitalize">{order.status}</span>
                  </div>
                </div>

                {order.items.map((item, idx) => (
                  <div key={`${order.id}-${item.id || idx}`} className="flex items-center gap-3 p-3 bg-[#FFF9F2] rounded-lg mb-2">
                    <img src={item.image} alt={item.name} className="w-12 h-12 object-cover rounded" />
                    <div className="flex-1">
                      <h4 className="font-semibold text-[#8B5E3C]">{item.name}</h4>
                      <p className="text-[#6D4C41] text-sm">Qty: {item.quantity}</p>
                    </div>
                    <div className="text-[#8B5E3C] font-semibold">${(item.price * (item.quantity || 1)).toFixed(2)}</div>
                  </div>
                ))}

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
