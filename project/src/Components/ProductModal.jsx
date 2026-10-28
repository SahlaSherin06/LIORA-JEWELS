import { FaHeart, FaStar, FaShoppingCart, FaBolt } from "react-icons/fa";
import { useState, useEffect, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { CartContext } from "../Context/CartContext";
import { AuthContext } from "../Context/AuthContext";

export default function ProductModal({ product, onClose }) {
  const [visible, setVisible] = useState(false);
  const [quantity, setQuantity] = useState(1);
  const [isInCart, setIsInCart] = useState(false);
  const [isInWishlist, setIsInWishlist] = useState(false);
  const [currentStock, setCurrentStock] = useState(product.stock || product.quantity || 0);
  const navigate = useNavigate();
  const { addToCart, isInCart: checkInCart, updateQuantity, cart } = useContext(CartContext);
  const { user } = useContext(AuthContext);

  const priceNumber = parseFloat((product.price || 0).toString().replace(/[^0-9.]/g, "")) || 0;
  const rating = product.rating || product.avgRating || 4;

  useEffect(() => {
    setVisible(true);
    checkCartWishlist();
    
    // Fetch latest stock from API
    fetchLatestStock();
  }, [product]);

  const fetchLatestStock = async () => {
    try {
      const response = await fetch(`http://localhost:5000/api/products/${product.id}`);
      if (response.ok) {
        const latestProduct = await response.json();
        setCurrentStock(latestProduct.stock || latestProduct.quantity || 0);
      }
    } catch (error) {
      console.error("Error fetching stock:", error);
    }
  };

  const checkCartWishlist = () => {
    const inCart = checkInCart(product.id);
    setIsInCart(inCart);
    if (inCart) {
      const cartItem = cart.find((item) => item.id === product.id);
      if (cartItem) setQuantity(cartItem.quantity || 1);
    }

    if (!user) return;
    const wishlist = JSON.parse(localStorage.getItem(`wishlist_${user.id}`) || "[]");
    setIsInWishlist(!!wishlist.find((p) => p.id === product.id));
  };

  const closeModal = () => {
    setVisible(false);
    setTimeout(onClose, 300);
  };

  const handleQuantityChange = async (newQuantity) => {
    // Check if new quantity exceeds available stock
    if (newQuantity > currentStock) {
      toast.error(`Only ${currentStock} items available in stock`);
      return;
    }
    
    setQuantity(newQuantity);
    if (isInCart) {
      await updateQuantity(product.id, newQuantity);
      toast.info(`🛒 Quantity updated to ${newQuantity}`);
    }
  };

  const handleAddToCart = async () => {
    if (!user) return navigate("/login");
    
    // Check stock before adding to cart
    if (currentStock <= 0) {
      toast.error("❌ Product is out of stock");
      return;
    }

    const success = await addToCart(product, quantity);
    if (success) {
      setIsInCart(true);
      toast.success("🛒 Added to cart");
    } else {
      toast.error("Failed to add to cart");
    }
  };

  const toggleWishlist = async () => {
    if (!user) return navigate("/login");
    const wishlistKey = `wishlist_${user.id}`;
    const wishlist = JSON.parse(localStorage.getItem(wishlistKey) || "[]");

    let updatedWishlist;
    if (isInWishlist) {
      updatedWishlist = wishlist.filter((p) => p.id !== product.id);
      setIsInWishlist(false);
      toast.info("💔 Removed from wishlist");
    } else {
      updatedWishlist = [...wishlist, { ...product, addedAt: new Date().toISOString() }];
      setIsInWishlist(true);
      toast.success("❤️ Added to wishlist");
    }

    localStorage.setItem(wishlistKey, JSON.stringify(updatedWishlist));
    window.dispatchEvent(new Event("wishlistUpdated"));
  };

  const handleBuyNow = async () => {
    if (!user) return navigate("/login");
    
    // Check stock before proceeding to checkout
    if (currentStock <= 0) {
      toast.error("❌ Product is out of stock");
      return;
    }

    try {
      const userId = user.id;

      // ✅ FIXED: Use the current quantity from state, not hardcoded 1
      const tempCartItem = {
        ...product,
        quantity: quantity, // This is the key fix - using the quantity state
        price: priceNumber,
        total: priceNumber * quantity
      };

      console.log("Buy Now - Quantity:", quantity); // Debug log
      console.log("Buy Now - Product:", tempCartItem); // Debug log

      // Save to localStorage for immediate checkout
      localStorage.setItem(`immediateCheckout_${userId}`, JSON.stringify([tempCartItem]));
      
      // Also save to database if needed
      try {
        const response = await fetch(`http://localhost:5000/api/users/${userId}`, {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            tempCart: [tempCartItem]
          })
        });

        if (!response.ok) {
          console.error('Failed to save temp cart to API');
        }
      } catch (apiError) {
        console.error("API error:", apiError);
        // Continue even if API fails - localStorage should work
      }

      // Close modal first
      closeModal();
      
      // Then navigate to checkout
      setTimeout(() => {
        navigate("/checkout", { 
          state: { 
            immediateCheckout: true,
            product: tempCartItem,
            quantity: quantity // Also pass quantity separately for extra safety
          } 
        });
      }, 350);

    } catch (error) {
      console.error("Error in handleBuyNow:", error);
      toast.error("Failed to proceed with purchase");
    }
  };

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div
        className={`bg-[#F5F0E1] rounded-lg shadow-lg w-full max-w-md sm:max-w-2xl transition-transform duration-300 ${
          visible ? "scale-100" : "scale-95"
        }`}
      >
        {/* Stock Badge */}
        {currentStock > 0 && currentStock < 10 && (
          <div className="absolute top-4 left-4 bg-orange-500 text-white px-3 py-1 rounded-full text-sm font-semibold z-10">
            Only {currentStock} Left
          </div>
        )}
        {currentStock <= 0 && (
          <div className="absolute top-4 left-4 bg-red-600 text-white px-3 py-1 rounded-full text-sm font-semibold z-10">
            Out of Stock
          </div>
        )}

        {/* Close & Wishlist Buttons */}
        <div className="absolute top-4 right-4 flex gap-2 sm:gap-3 z-10">
          <button
            onClick={toggleWishlist}
            className={`p-2 rounded-full transition-all duration-300 ${
              isInWishlist ? "bg-[#C19A6B] text-[#5C362C]" : "bg-[#EDE4D3] text-[#7B4B3A] hover:bg-[#D2B48C]"
            }`}
            title={isInWishlist ? "Remove from wishlist" : "Add to wishlist"}
          >
            <FaHeart />
          </button>
          <button onClick={closeModal} className="text-[#7B4B3A] text-2xl font-bold hover:rotate-90 transition">×</button>
        </div>

        {/* Modal Content - scrollable */}
        <div className="max-h-[80vh] overflow-y-auto p-5 flex flex-col md:flex-row gap-4 sm:gap-5 relative">
          {/* Product Image */}
          <img
            src={product.image}
            alt={product.name}
            className={`w-full md:w-1/2 h-60 sm:h-72 object-cover rounded-lg flex-shrink-0 ${
              currentStock <= 0 ? "opacity-70 grayscale" : ""
            }`}
          />

          {/* Product Details */}
          <div className="flex-1 flex flex-col">
            <h2 className="text-xl sm:text-2xl font-semibold text-[#7B4B3A]">{product.name}</h2>

            {/* Rating */}
            <div className="flex items-center gap-2 mt-1">
              <div className="flex text-yellow-500">
                {[...Array(5)].map((_, i) => (
                  <FaStar key={i} className={i < Math.round(rating) ? "opacity-100" : "opacity-30"} />
                ))}
              </div>
              <span className="text-sm sm:text-base text-[#5C362C]">{rating.toFixed(1)}</span>
            </div>

            {/* Price */}
            <p className="mt-2 text-lg sm:text-xl font-bold text-[#5C362C]">
              ₹{(priceNumber * quantity).toFixed(2)}
            </p>

            {/* Stock Status */}
            <div className="mt-1">
              {currentStock > 0 ? (
                <span className="text-green-600 text-sm font-medium">In Stock ({currentStock} available)</span>
              ) : (
                <span className="text-red-600 text-sm font-medium">Out of Stock</span>
              )}
            </div>

            {/* Description */}
            <p className="mt-2 text-sm sm:text-base text-[#5C362C]">{product.description || "Elegant product description."}</p>

            {/* Quantity Selector */}
            <div className="mt-3 flex items-center gap-2">
              <button
                onClick={() => handleQuantityChange(Math.max(1, quantity - 1))}
                disabled={quantity <= 1}
                className={`px-3 py-1 rounded transition ${
                  quantity <= 1 ? "bg-gray-300 cursor-not-allowed" : "bg-[#D2B48C] text-[#7B4B3A] hover:bg-[#C19A6B]"
                }`}
              >
                −
              </button>
              <span className="text-[#5C362C] font-semibold">{quantity}</span>
              <button
                onClick={() => handleQuantityChange(quantity + 1)}
                disabled={quantity >= currentStock}
                className={`px-3 py-1 rounded transition ${
                  quantity >= currentStock ? "bg-gray-300 cursor-not-allowed" : "bg-[#D2B48C] text-[#7B4B3A] hover:bg-[#C19A6B]"
                }`}
              >
                +
              </button>
            </div>

            {/* Reviews Section */}
            {product.reviews && product.reviews.length > 0 && (
              <div className="mt-4">
                <h4 className="font-semibold text-[#7B4B3A] mb-2">Customer Reviews:</h4>
                <div className="space-y-2 max-h-32 overflow-y-auto pr-2">
                  {product.reviews.map((review, index) => (
                    <div key={index} className="bg-[#EDE4D3] p-2 rounded">
                      <p className="text-sm text-[#5C362C]">{review.comment || review}</p>
                      {review.author && <p className="text-xs text-[#7B4B3A] mt-1">- {review.author}</p>}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="mt-4 flex flex-col sm:flex-row gap-2 sm:gap-3">
              {/* Add to Cart Button */}
              <button
                onClick={handleAddToCart}
                disabled={currentStock <= 0}
                className={`flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded transition ${
                  currentStock <= 0 
                    ? "bg-gray-400 cursor-not-allowed" 
                    : "bg-[#7B4B3A] text-[#F5F0E1] hover:bg-[#5C362C]"
                }`}
              >
                <FaShoppingCart /> 
                {currentStock <= 0 ? "Out of Stock" : isInCart ? "Update Cart" : "Add to Cart"}
              </button>

              {/* Buy Now Button - FIXED */}
              <button
                onClick={handleBuyNow}
                disabled={currentStock <= 0}
                className={`flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded transition ${
                  currentStock <= 0 
                    ? "bg-gray-400 cursor-not-allowed" 
                    : "bg-[#C19A6B] text-[#F5F0E1] hover:bg-[#A67B5B]"
                }`}
              >
                <FaBolt /> 
                Buy Now ({quantity})
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}