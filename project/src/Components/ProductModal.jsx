import { FaHeart, FaStar, FaShoppingCart, FaBolt } from "react-icons/fa";
import { useState, useEffect, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { CartContext } from "../Context/CartContext";

export default function ProductModal({ product, onClose }) {
  const [visible, setVisible] = useState(false);
  const [quantity, setQuantity] = useState(1);
  const [isInCart, setIsInCart] = useState(false);
  const [isInWishlist, setIsInWishlist] = useState(false);
  const [user, setUser] = useState(null);
  const navigate = useNavigate();
  
  const { addToCart, isInCart: checkInCart, updateQuantity, cart } = useContext(CartContext);

  const price = product.price || "0";
  const rating = product.rating || product.avgRating || 4;

  const priceNumber =
    typeof price === "string"
      ? parseFloat(price.replace(/[^0-9.]/g, "")) || 0
      : typeof price === "number"
      ? price
      : 0;

  useEffect(() => {
    setVisible(true);
    checkIfInCart();
    checkIfInWishlist();
    
    const userLoggedIn = localStorage.getItem("userLoggedIn");
    if (userLoggedIn) {
      setUser(JSON.parse(userLoggedIn));
    }
  }, [product]);

  const checkIfInCart = () => {
    const inCart = checkInCart(product.id);
    setIsInCart(inCart);
    
    // If item is already in cart, set quantity to current cart quantity
    if (inCart) {
      const cartItem = cart.find(item => item.id === product.id);
      if (cartItem) {
        setQuantity(cartItem.quantity || 1);
      }
    }
  };

  const checkIfInWishlist = () => {
    const userLoggedIn = localStorage.getItem("userLoggedIn");
    if (!userLoggedIn) return;
    
    const userData = JSON.parse(userLoggedIn);
    const wishlist = JSON.parse(localStorage.getItem(`wishlist_${userData.id}`)) || [];
    const existing = wishlist.find((p) => p.id === product.id);
    setIsInWishlist(!!existing);
  };

  const closeModal = () => {
    setVisible(false);
    setTimeout(onClose, 300);
  };

  const saveWishlistToDB = async (wishlistItems) => {
    try {
      const userLoggedIn = localStorage.getItem("userLoggedIn");
      if (!userLoggedIn) return false;

      const userData = JSON.parse(userLoggedIn);
      const userId = userData.id;

      localStorage.setItem(`wishlist_${userId}`, JSON.stringify(wishlistItems));

      try {
        const response = await fetch(`http://localhost:5000/users/${userId}`, {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            wishlist: wishlistItems
          })
        });

        if (response.ok) {
          return true;
        } else {
          return true;
        }
      } catch (apiError) {
        return true;
      }

    } catch (error) {
      console.error("Error in saveWishlistToDB:", error);
      return false;
    }
  };

  // Handle quantity increase/decrease - immediately update cart
  const handleQuantityChange = async (newQuantity) => {
    setQuantity(newQuantity);
    
    // If item is already in cart, update the cart quantity immediately
    if (isInCart) {
      await updateQuantity(product.id, newQuantity);
      toast.info(`🛒 Quantity updated to ${newQuantity}`);
    }
  };

  const handleAddToCart = async () => {
    if (!localStorage.getItem("userLoggedIn")) {
      navigate("/login");
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
    if (!localStorage.getItem("userLoggedIn")) {
      navigate("/login");
      return;
    }

    const userLoggedIn = localStorage.getItem("userLoggedIn");
    const userData = JSON.parse(userLoggedIn);
    const userId = userData.id;

    const wishlist = JSON.parse(localStorage.getItem(`wishlist_${userId}`)) || [];
    let updatedWishlist;

    if (isInWishlist) {
      updatedWishlist = wishlist.filter((p) => p.id !== product.id);
      const success = await saveWishlistToDB(updatedWishlist);
      
      if (success) {
        setIsInWishlist(false);
        window.dispatchEvent(new Event("wishlistUpdated"));
        toast.info("💔 Removed from wishlist");
      }
    } else {
      updatedWishlist = [...wishlist, { ...product, addedAt: new Date().toISOString() }];
      const success = await saveWishlistToDB(updatedWishlist);
      
      if (success) {
        setIsInWishlist(true);
        window.dispatchEvent(new Event("wishlistUpdated"));
        toast.success("❤️ Added to wishlist",);
      }
    }
  };

  const handleBuyNow = async () => {
    if (!localStorage.getItem("userLoggedIn")) {
      navigate("/login");
      return;
    }

    // If item is not in cart, add it first
    if (!isInCart) {
      const success = await addToCart(product, quantity);
      if (!success) {
        toast.error("Failed to add to cart");
        return;
      }
    }

    const userLoggedIn = localStorage.getItem("userLoggedIn");
    const userData = JSON.parse(userLoggedIn);
    const userId = userData.id;

    const tempCart = [{ ...product, quantity: quantity }];
    
    localStorage.setItem(`tempCart_${userId}`, JSON.stringify(tempCart));
    
    try {
      const response = await fetch(`http://localhost:5000/users/${userId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          tempCart: tempCart
        })
      });

      if (!response.ok) {
        throw new Error('Failed to save temp cart to API');
      }
    } catch (error) {
      console.error("Error saving temp cart to API:", error);
    }
    
    navigate("/checkout", { state: { immediateCheckout: true } });
  };

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50">
      <div
        className={`bg-[#F5F0E1] rounded-lg p-5 w-full max-w-2xl shadow-lg relative transition-transform duration-300 ${
          visible ? "scale-100" : "scale-95"
        }`}
      >
        {/* Close Button and Wishlist Button */}
        <div className="absolute top-7 right-4 flex gap-3">
          <button
            onClick={toggleWishlist}
            className={`p-2 rounded-full transition-all duration-300 ${
              isInWishlist 
                ? "bg-[#C19A6B] text-[#5C362C]" 
                : "bg-[#EDE4D3] text-[#7B4B3A] hover:bg-[#D2B48C] hover:text-[#5C362C]"
            }`}
            title={isInWishlist ? "Remove from wishlist" : "Add to wishlist"}
          >
            <FaHeart className={isInWishlist ? "fill-current" : ""} />
          </button>
          
          <button
            onClick={closeModal}
            className="text-[#7B4B3A] text-2xl font-bold hover:rotate-90 transition"
          >
            ×
          </button>
        </div>

        <div className="flex flex-col md:flex-row gap-5">
          {/* Product Image */}
          <img
            src={product.image}
            alt={product.name}
            className="w-full md:w-1/2 h-72 object-cover rounded-lg"
          />

          {/* Product Details */}
          <div className="flex-1">
            <h2 className="text-2xl font-semibold text-[#7B4B3A]">{product.name}</h2>

            {/* Rating Section */}
            <div className="flex items-center gap-2 mt-2">
              <div className="flex text-yellow-500">
                {[...Array(5)].map((_, i) => (
                  <FaStar
                    key={i}
                    className={i < Math.round(rating) ? "opacity-100" : "opacity-30"}
                  />
                ))}
              </div>
              <span className="text-sm text-[#5C362C]">{rating.toFixed(1)}</span>
            </div>

            <p className="mt-2 text-lg font-bold text-[#5C362C]">₹{(priceNumber * quantity).toFixed(2)}</p>

            <p className="mt-3 text-sm text-[#5C362C] leading-relaxed">
              {product.description ||
                "This product is crafted with care and elegance to enhance your collection."}
            </p>

            {/* Quantity Selector */}
            <div className="mt-4 flex items-center gap-3">
              <button
                onClick={() => handleQuantityChange(Math.max(1, quantity - 1))}
                className="px-3 py-1 bg-[#D2B48C] text-[#7B4B3A] rounded hover:bg-[#C19A6B] transition"
              >
                −
              </button>
              <span className="text-[#5C362C] font-semibold">{quantity}</span>
              <button
                onClick={() => handleQuantityChange(quantity + 1)}
                className="px-3 py-1 bg-[#D2B48C] text-[#7B4B3A] rounded hover:bg-[#C19A6B] transition"
              >
                +
              </button>
            </div>

            {/* Reviews Section */}
            {product.reviews && product.reviews.length > 0 && (
              <div className="mt-4">
                <h4 className="font-semibold text-[#7B4B3A] mb-2">Customer Reviews:</h4>
                <div className="space-y-2 max-h-32 overflow-y-auto">
                  {product.reviews.map((review, index) => (
                    <div key={index} className="bg-[#EDE4D3] p-2 rounded">
                      <p className="text-sm text-[#5C362C]">
                        {review.comment || review}
                      </p>
                      {review.author && (
                        <p className="text-xs text-[#7B4B3A] mt-1">- {review.author}</p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="mt-4 flex flex-wrap gap-3">
              {isInCart ? (
                // Only show Buy Now if item is already in cart
                <button
                  onClick={handleBuyNow}
                  className="w-full flex items-center justify-center gap-2 px-3 py-2 bg-[#C19A6B] text-[#F5F0E1] rounded hover:bg-[#A67B5B] transition"
                >
                  <FaBolt />
                  Buy Now
                </button>
              ) : (
                // Show both Add to Cart and Buy Now if item is not in cart
                <>
                  <button
                    onClick={handleAddToCart}
                    className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-[#7B4B3A] text-[#F5F0E1] rounded hover:bg-[#5C362C] transition"
                  >
                    <FaShoppingCart /> 
                    Add to Cart
                  </button>
                  <button
                    onClick={handleBuyNow}
                    className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-[#C19A6B] text-[#F5F0E1] rounded hover:bg-[#A67B5B] transition"
                  >
                    <FaBolt />
                    Buy Now
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
