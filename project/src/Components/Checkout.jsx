import React, { useState, useEffect, useContext } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { FaLock, FaUser, FaShoppingBag, FaArrowLeft, FaCheck, FaBox } from "react-icons/fa";
import { CartContext } from "../Context/CartContext";
import { AuthContext } from "../Context/AuthContext";

function Checkout() {
  const navigate = useNavigate();
  const location = useLocation();
  const { cart, clearCart, getTotalPrice } = useContext(CartContext);
  const { user, isLoggedIn, addOrder } = useContext(AuthContext);

  const [cartItems, setCartItems] = useState([]);
  const [isImmediateCheckout, setIsImmediateCheckout] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [orderNumber, setOrderNumber] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    address: ""
  });

  useEffect(() => {
    if (!isLoggedIn || !user) {
      navigate("/login");
      return;
    }

    const immediateCheckout = location.state?.immediateCheckout || false;
    setIsImmediateCheckout(immediateCheckout);

    let items = [];
    
    if (immediateCheckout) {
      // ✅ FIXED: Check localStorage first for immediate checkout data
      const userLoggedIn = localStorage.getItem("userLoggedIn");
      if (userLoggedIn) {
        const userData = JSON.parse(userLoggedIn);
        const userId = userData.id;
        const immediateCheckoutData = localStorage.getItem(`immediateCheckout_${userId}`);
        
        if (immediateCheckoutData) {
          try {
            items = JSON.parse(immediateCheckoutData);
            console.log("Immediate checkout items from localStorage:", items);
            
            // Clear the immediate checkout data after reading
            localStorage.removeItem(`immediateCheckout_${userId}`);
          } catch (error) {
            console.error("Error parsing immediate checkout data:", error);
            // Fallback to location.state if localStorage fails
            const product = location.state?.product;
            if (product) {
              items = [{ ...product, quantity: location.state?.quantity || 1 }];
            }
          }
        } else {
          // Fallback to location.state if no localStorage data
          const product = location.state?.product;
          if (product) {
            items = [{ ...product, quantity: location.state?.quantity || 1 }];
          }
        }
      }
    } else {
      // Normal cart checkout
      items = cart;
    }

    setCartItems(items);

    // Pre-fill form with user data
    setFormData(prev => ({
      ...prev,
      firstName: user.firstName || "",
      lastName: user.lastName || "",
      email: user.email || "",
    }));

    if (items.length === 0 && !immediateCheckout) {
      navigate("/cart");
    }
  }, [navigate, location, isLoggedIn, user, cart]);

  // Generate a unique order number
  const generateOrderNumber = () => {
    return `LIORA-${Date.now()}`;
  };

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const getSubtotal = () => {
    if (isImmediateCheckout) {
      return cartItems.reduce((total, item) => {
        const price = typeof item.price === 'string' 
          ? parseFloat(item.price.replace(/[^0-9.]/g, '')) 
          : item.price;
        return total + (price * (item.quantity || 1));
      }, 0);
    } else {
      return getTotalPrice();
    }
  };

  const handleBack = () => {
    navigate(isImmediateCheckout ? -1 : "/cart");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isLoggedIn || !user || isSubmitting) return;

    setIsSubmitting(true);
    try {
      const newOrderNumber = generateOrderNumber();
      setOrderNumber(newOrderNumber);

      const order = {
        id: newOrderNumber,
        items: cartItems.map(item => ({
          id: item.id,
          name: item.name,
          price: item.price,
          quantity: item.quantity,
          image: item.image,
          category: item.category
        })),
        total: getSubtotal(),
        shippingInfo: { ...formData },
        userId: user.id,
        userName: `${user.firstName} ${user.lastName}`,
        orderDate: new Date().toISOString(),
        status: "confirmed",
        estimatedDelivery: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
        paymentStatus: "paid"
      };

      console.log("Submitting order:", order); // Debug log

      await addOrder(order);
      if (!isImmediateCheckout) await clearCart();

      setShowSuccess(true);

      setTimeout(() => {
        navigate("/order", { state: { recentOrder: newOrderNumber } });
      }, 3000);

    } catch (error) {
      console.error("Error processing order:", error);
      alert("There was an error processing your order. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const SuccessAnimation = () => (
    <div className="fixed inset-0 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl p-8 max-w-md w-full mx-4 text-center animate-scale-in">
        <div className="w-20 h-20 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-6 animate-bounce">
          <FaCheck className="text-white text-3xl" />
        </div>
        <h2 className="text-3xl font-bold text-[#8B5E3C] mb-4">Order Confirmed!</h2>
        <div className="bg-[#FFF9F2] rounded-lg p-4 mb-6">
          <p className="text-[#6D4C41] mb-2">Order Number:</p>
          <p className="text-xl font-bold text-[#8B5E3C]">{orderNumber}</p>
        </div>
        <div className="flex items-center justify-center gap-3 text-green-600 mb-6">
          <FaBox className="animate-pulse" />
          <span className="font-semibold">Preparing your shipment</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2 mb-4">
          <div className="bg-gradient-to-r from-[#8B5E3C] to-[#C19A6B] h-2 rounded-full animate-progress"></div>
        </div>
        <p className="text-[#6D4C41]">Redirecting to orders page...</p>
      </div>
    </div>
  );

  if (showSuccess) return <SuccessAnimation />;
  if (cartItems.length === 0 && !isImmediateCheckout) return (
    <div className="min-h-screen bg-gradient-to-br from-[#FFF9F2] to-[#F8F1E4] pt-32 flex items-center justify-center">
      <div className="text-center">
        <div className="text-2xl text-[#8B5E3C]">Your cart is empty</div>
        <button onClick={() => navigate("/shop")} className="mt-4 px-6 py-2 bg-[#8B5E3C] text-white rounded-lg hover:bg-[#6D4C41] transition-colors">
          Continue Shopping
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#FFF9F2] to-[#F8F1E4] pt-32 pb-12 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <button onClick={handleBack} className="flex items-center gap-2 text-[#8B5E3C] hover:text-[#6D4C41] transition-colors mb-4">
            <FaArrowLeft /> {isImmediateCheckout ? "Back to Product" : "Back to Cart"}
          </button>
          <h1 className="text-4xl font-bold text-[#8B5E3C] mb-2">{isImmediateCheckout ? "Quick Checkout" : "Checkout"}</h1>
          <p className="text-[#6D4C41]">{isImmediateCheckout ? "Complete your purchase for this item" : "Complete your purchase with confidence"}</p>
        </div>

        {/* Form + Order Summary */}
        <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left Column - Shipping Info */}
          <div className="space-y-8">
            <div className="bg-white rounded-2xl shadow-lg p-6 border border-[#F0E6D8]">
              <div className="flex items-center gap-3 mb-6">
                <div className="bg-gradient-to-br from-[#8B5E3C] to-[#C19A6B] p-2 rounded-full">
                  <FaUser className="text-white text-sm" />
                </div>
                <h2 className="text-2xl font-bold text-[#8B5E3C]">Shipping Information</h2>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <input type="text" name="firstName" value={formData.firstName} onChange={handleInputChange} required placeholder="First Name" className="w-full px-4 py-3 border rounded-xl" />
                <input type="text" name="lastName" value={formData.lastName} onChange={handleInputChange} required placeholder="Last Name" className="w-full px-4 py-3 border rounded-xl" />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                <input type="email" name="email" value={formData.email} onChange={handleInputChange} required placeholder="Email" className="w-full px-4 py-3 border rounded-xl" />
                <input type="tel" name="phone" value={formData.phone} onChange={handleInputChange} required placeholder="Phone" className="w-full px-4 py-3 border rounded-xl" />
              </div>
              <div className="mt-4">
                <input type="text" name="address" value={formData.address} onChange={handleInputChange} required placeholder="Address" className="w-full px-4 py-3 border rounded-xl" />
              </div>
            </div>
          </div>

          {/* Right Column - Order Summary */}
          <div className="space-y-6">
            <div className="bg-white rounded-2xl shadow-lg p-6 border border-[#F0E6D8] sticky top-32">
              <div className="flex items-center gap-3 mb-6">
                <div className="bg-gradient-to-br from-[#8B5E3C] to-[#C19A6B] p-2 rounded-full">
                  <FaShoppingBag className="text-white text-sm" />
                </div>
                <h2 className="text-2xl font-bold text-[#8B5E3C]">{isImmediateCheckout ? "Quick Order" : "Order Summary"}</h2>
              </div>

              {/* Cart Items */}
              <div className="space-y-4 mb-6 max-h-64 overflow-y-auto">
                {cartItems.map(item => (
                  <div key={item.id} className="flex items-center gap-3 p-3 bg-[#FFF9F2] rounded-lg">
                    <img src={item.image} alt={item.name} className="w-12 h-12 object-cover rounded" />
                    <div className="flex-1">
                      <h4 className="font-semibold text-[#8B5E3C] text-sm">{item.name}</h4>
                      <p className="text-[#6D4C41] text-sm">Qty: {item.quantity}</p>
                    </div>
                    <div className="text-[#8B5E3C] font-semibold">₹{(item.price * (item.quantity || 1)).toFixed(2)}</div>
                  </div>
                ))}
              </div>

              <div className="space-y-3 border-t border-[#E0CFC1] pt-4 flex justify-between text-[#6D4C41]">
                <span>Subtotal</span>
                <span>₹{getSubtotal().toFixed(2)}</span>
              </div>

              <div className="flex items-center gap-2 mt-6 p-3 bg-green-50 rounded-lg border border-green-200">
                <FaLock className="text-green-600" />
                <span className="text-sm text-green-700">Your payment information is secure and encrypted</span>
              </div>

              <button type="submit" disabled={isSubmitting} className={`w-full bg-gradient-to-r from-[#8B5E3C] to-[#C19A6B] text-white py-4 rounded-xl font-semibold mt-6 ${isSubmitting ? 'opacity-50 cursor-not-allowed' : 'hover:shadow-lg transform hover:scale-105'}`}>
                {isSubmitting ? "Processing..." : `${isImmediateCheckout ? "Complete Purchase" : "Place Order"} - ₹${getSubtotal().toFixed(2)}`}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}

export default Checkout;