import { useEffect, useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { FaTrashAlt } from "react-icons/fa";
import { toast } from "react-toastify";
import { CartContext } from "../Context/CartContext";
import { AuthContext } from "../Context/AuthContext";

export default function CartPage() {
  const { cart, removeFromCart, updateQuantity, getTotalPrice } = useContext(CartContext);
  const { isLoggedIn } = useContext(AuthContext);
  const navigate = useNavigate();
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);

  useEffect(() => {
    // Check both AuthContext and localStorage to ensure user is really logged in
    const checkAuthentication = () => {
      const userLoggedIn = localStorage.getItem("userLoggedIn");
      
      if (!isLoggedIn && !userLoggedIn) {
        // Definitely not logged in
        navigate("/login");
      } else {
        // Either AuthContext says logged in OR localStorage has user data
        setIsCheckingAuth(false);
      }
    };

    // Small delay to allow AuthContext to initialize
    const timer = setTimeout(checkAuthentication, 100);
    
    return () => clearTimeout(timer);
  }, [isLoggedIn, navigate]);

  // Show loading while checking authentication
  if (isCheckingAuth) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F5F0E1]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#7B4B3A] mx-auto mb-4"></div>
          <p className="text-[#7B4B3A]">Loading cart...</p>
        </div>
      </div>
    );
  }

  const handleRemoveItem = async (id) => {
    const success = await removeFromCart(id);
    if (success) {
      toast.info("🗑️ Item removed from cart");
    }
  };

  const handleUpdateQuantity = async (id, qty) => {
    const okay= await updateQuantity(id, qty);
    if (okay){
      toast.success("quantity updated")
    }
  };

  const totalPrice = getTotalPrice();

  if (cart.length === 0) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#F5F0E1] text-[#7B4B3A]">
        <img
          src="https://cdn-icons-png.flaticon.com/512/2038/2038854.png"
          alt="Empty Cart"
          className="w-40 mb-6"
        />
        <h2 className="text-3xl font-semibold mb-2">Your Cart is Empty</h2>
        <p className="text-[#5C362C] mb-6">Looks like you haven't added anything yet!</p>
        <button
          onClick={() => navigate("/shop")}
          className="px-6 py-3 rounded-lg bg-[#7B4B3A] text-[#F5F0E1] hover:bg-[#5C362C] transition"
        >
          🛍️ Continue Shopping
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F5F0E1] pt-32 pb-16 px-4 md:px-12">
      <div className="max-w-6xl mx-auto bg-white rounded-2xl shadow-lg p-6 md:p-10">
        <h1 className="text-3xl font-bold text-[#7B4B3A] mb-8 text-center">
          Your Shopping Cart
        </h1>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
          <div className="md:col-span-2 space-y-6">
            {cart.map((item) => (
              <div
                key={item.id}
                className="flex flex-col sm:flex-row items-center justify-between gap-4 border-b border-[#D2B48C] pb-4"
              >
                <div className="flex items-center gap-4">
                  <img
                    src={item.image}
                    alt={item.name}
                    className="w-24 h-24 object-cover rounded-lg"
                  />
                  <div>
                    <h3 className="font-semibold text-[#7B4B3A] text-lg">{item.name}</h3>
                    <p className="text-[#5C362C] text-sm">{item.category}</p>
                    <p className="text-[#7B4B3A] font-semibold mt-1">
                      ₹{typeof item.price === "number" ? item.price.toFixed(2) : item.price}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <button
                    onClick={() => handleUpdateQuantity(item.id, item.quantity - 1)}
                    className="px-3 py-1 bg-[#D2B48C] text-[#7B4B3A] rounded hover:bg-[#C19A6B]"
                  >
                    −
                  </button>
                  <span className="font-semibold text-[#5C362C]">{item.quantity}</span>
                  <button
                    onClick={() => handleUpdateQuantity(item.id, item.quantity + 1)}
                    className="px-3 py-1 bg-[#D2B48C] text-[#7B4B3A] rounded hover:bg-[#C19A6B]"
                  >
                    +
                  </button>

                  <button
                    onClick={() => handleRemoveItem(item.id)}
                    className="ml-3 text-[#A33E3E] hover:text-red-700"
                  >
                    <FaTrashAlt />
                  </button>
                </div>
              </div>
            ))}
          </div>

          <div className="bg-[#FDF8F3] p-6 rounded-lg shadow-inner">
            <h2 className="text-2xl font-semibold text-[#7B4B3A] mb-4">Order Summary</h2>

            <div className="flex justify-between text-[#5C362C] mb-2">
              <span>Subtotal:</span>
              <span>₹{totalPrice.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-[#7B4B3A] text-lg font-bold border-t border-[#D2B48C] pt-3">
              <span>Total:</span>
              <span>₹{(totalPrice ).toFixed(2)}</span>
            </div>

            <button
              onClick={() => navigate("/checkout")}
              className="w-full mt-6 py-3 rounded-lg bg-[#7B4B3A] text-[#F5F0E1] font-semibold hover:bg-[#5C362C] transition"
            >
              Proceed to Checkout
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}