// import { useState, useEffect, useContext } from "react";
// import { useNavigate } from "react-router-dom";
// import { FaHeart, FaShoppingCart, FaStar, FaBolt } from "react-icons/fa";
// import { toast } from "react-toastify";
// import { CartContext } from "../Context/CartContext";
// import { WishlistContext } from "../Context/WishlistContext";
// import { AuthContext } from "../Context/AuthContext";

// export default function ProductCard({ product, onQuickView }) {
//   const navigate = useNavigate();
//   const [isInWishlist, setIsInWishlist] = useState(false);
  
//   const { addToCart, isInCart } = useContext(CartContext);
//   const { addToWishlist, removeFromWishlist, isInWishlist: checkWishlist } = useContext(WishlistContext);
//   const { isLoggedIn } = useContext(AuthContext);

//   const priceDisplay = product.price ? product.price : "₹0";
//   const rating = product.rating || product.avgRating || 4;

//   useEffect(() => {
//     setIsInWishlist(checkWishlist(product.id));
//   }, [product.id, checkWishlist]);

//   const handleWishlist = async () => {
//     if (!isLoggedIn) {
//       navigate("/login");
//       return;
//     }

//     if (isInWishlist) {
//       const success = await removeFromWishlist(product.id);
//       if (success) {
//         setIsInWishlist(false);
//         toast.info("💔 Removed from wishlist");
//       }
//     } else {
//       const success = await addToWishlist(product);
//       if (success) {
//         setIsInWishlist(true);
//         toast.success("💖 Added to wishlist");
//       }
//     }
//   };

//   const handleAddToCart = async () => {
//     if (!isLoggedIn) {
//       navigate("/login");
//       return;
//     }

//     const success = await addToCart(product, 1);
//     if (success) {
//       // toast.success("🛒 Added to cart");
//     }
//   };

//   const handleBuyNow = () => {
//     if (!isLoggedIn) {
//       navigate("/login");
//       return;
//     }
    
//     // Simple approach - pass product directly to checkout
//     navigate("/checkout", { 
//       state: { 
//         immediateCheckout: true,
//         product: product,
//         quantity: 1
//       } 
//     });
//   };

//   const handleQuickView = () => {
//     if (onQuickView) onQuickView(product);
//   };

//   return (
//     <div className="relative bg-[#F5F0E1] border border-[#D2B48C] rounded-lg p-3 text-center shadow-md hover:shadow-xl hover:scale-102 transition-transform duration-300">
//       <div className="relative overflow-hidden rounded-md bg-white">
//         <img
//           src={product.image}
//           alt={product.name}
//           className="w-full h-80 object-cover hover:scale-105 transition-transform duration-300 cursor-pointer"
//           onClick={handleQuickView}
//         />
//         <button
//           onClick={handleWishlist}
//           className={`absolute top-3 right-3 p-2 rounded-full shadow-md transition duration-200 ${
//             isInWishlist
//               ? "bg-[#7B4B3A] text-[#F5F0E1]"
//               : "bg-[#F5F0E1] text-[#7B4B3A] hover:bg-[#D2B48C]"
//           }`}
//         >
//           <FaHeart />
//         </button>
//       </div>

//       <h3 className="mt-3 font-semibold text-[#7B4B3A]">{product.name}</h3>

//       <div className="flex items-center justify-center gap-2 mt-1">
//         <div className="flex text-yellow-500">
//           {Array.from({ length: 5 }).map((_, i) => (
//             <FaStar
//               key={i}
//               className={i < Math.round(rating) ? "opacity-100" : "opacity-30"}
//             />
//           ))}
//         </div>
//         <span className="text-sm text-[#5C362C] ml-1">{rating.toFixed(1)}</span>
//         {product.reviews && product.reviews.length > 0 && (
//           <span className="text-sm text-[#5C362C] ml-1">
//             ({product.reviews.length})
//           </span>
//         )}
//       </div>

//       <p className="mt-2 text-lg font-bold text-[#5C362C]">₹{priceDisplay}.00</p>

//       <div className="mt-3 flex flex-wrap items-center justify-center gap-2">
//         <button
//           onClick={handleAddToCart}
//           className="flex items-center gap-2 px-3 py-2 rounded bg-[#7B4B3A] text-[#F5F0E1] hover:bg-[#5C362C] transition duration-200"
//         >
//           <FaShoppingCart /> Add to Cart
//         </button>

//         <button
//           onClick={handleBuyNow}
//           className="flex items-center gap-2 px-3 py-2 rounded bg-[#B88A6F] text-[#F5F0E1] hover:bg-[#A36A50] transition duration-200"
//         >
//           <FaBolt /> Buy Now
//         </button>
//       </div>

//       <div className="mt-3 flex items-center justify-between">
//         <button
//           onClick={handleQuickView}
//           className="text-sm text-[#7B4B3A] underline"
//         >
//           Quick View
//         </button>
//         <span className="text-xs text-[#5C362C]">{product.category}</span>
//       </div>
//     </div>
//   );
// }








import { useState, useEffect, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { FaHeart, FaShoppingCart, FaStar, FaBolt } from "react-icons/fa";
import { toast } from "react-toastify";
import { CartContext } from "../Context/CartContext";
import { WishlistContext } from "../Context/WishlistContext";
import { AuthContext } from "../Context/AuthContext";

export default function ProductCard({ product, onQuickView }) {
  const navigate = useNavigate();
  const [isInWishlist, setIsInWishlist] = useState(false);
  const [currentStock, setCurrentStock] = useState(product.stock || product.quantity || 0);
  
  const { addToCart, isInCart } = useContext(CartContext);
  const { addToWishlist, removeFromWishlist, isInWishlist: checkWishlist } = useContext(WishlistContext);
  const { isLoggedIn } = useContext(AuthContext);

  const priceDisplay = product.price ? product.price : "₹0";
  const rating = product.rating || product.avgRating || 4;

  useEffect(() => {
    setIsInWishlist(checkWishlist(product.id));
    // Fetch latest stock from API
    fetchLatestStock();
  }, [product.id, checkWishlist]);

  const fetchLatestStock = async () => {
    try {
      const response = await fetch(`http://localhost:5000/products/${product.id}`);
      if (response.ok) {
        const latestProduct = await response.json();
        setCurrentStock(latestProduct.stock || latestProduct.quantity || 0);
      }
    } catch (error) {
      console.error("Error fetching stock:", error);
    }
  };

  const handleWishlist = async () => {
    if (!isLoggedIn) {
      navigate("/login");
      return;
    }

    if (isInWishlist) {
      const success = await removeFromWishlist(product.id);
      if (success) {
        setIsInWishlist(false);
        toast.info("💔 Removed from wishlist");
      }
    } else {
      const success = await addToWishlist(product);
      if (success) {
        setIsInWishlist(true);
        toast.success("💖 Added to wishlist");
      }
    }
  };

  const handleAddToCart = async () => {
    if (!isLoggedIn) {
      navigate("/login");
      return;
    }

    // Check if product is out of stock
    if (currentStock <= 0) {
      toast.error("❌ Product is out of stock");
      return;
    }

    const success = await addToCart(product, 1);
    if (success) {
      // Don't update stock here - only show badge based on actual stock
      // toast.success("🛒 Added to cart");
    } else {
      toast.error("Failed to add to cart");
    }
  };

  const handleBuyNow = () => {
    if (!isLoggedIn) {
      navigate("/login");
      return;
    }

    // Check if product is out of stock
    if (currentStock <= 0) {
      toast.error("❌ Product is out of stock");
      return;
    }
    
    navigate("/checkout", { 
      state: { 
        immediateCheckout: true,
        product: product,
        quantity: 1
      } 
    });
  };

  const handleQuickView = () => {
    if (onQuickView) onQuickView(product);
  };

  return (
    <div className="relative bg-[#F5F0E1] border border-[#D2B48C] rounded-lg p-3 text-center shadow-md hover:shadow-xl hover:scale-102 transition-transform duration-300">
      {/* Stock Badge - Only shows when stock is low but not zero */}
      {currentStock > 0 && currentStock < 10 && (
        <div className="absolute top-3 left-3 bg-orange-500 text-white px-2 py-1 rounded-full text-xs font-semibold z-10">
          Only {currentStock} Left
        </div>
      )}
      {currentStock <= 0 && (
        <div className="absolute top-3 left-3 bg-red-600 text-white px-2 py-1 rounded-full text-xs font-semibold z-10">
          Out of Stock
        </div>
      )}
      
      <div className="relative overflow-hidden rounded-md bg-white">
        <img
          src={product.image}
          alt={product.name}
          className={`w-full h-80 object-cover hover:scale-105 transition-transform duration-300 cursor-pointer ${
            currentStock <= 0 ? "opacity-70 grayscale" : ""
          }`}
          onClick={handleQuickView}
        />
        <button
          onClick={handleWishlist}
          className={`absolute top-3 right-3 p-2 rounded-full shadow-md transition duration-200 ${
            isInWishlist
              ? "bg-[#7B4B3A] text-[#F5F0E1]"
              : "bg-[#F5F0E1] text-[#7B4B3A] hover:bg-[#D2B48C]"
          }`}
        >
          <FaHeart />
        </button>
      </div>

      <h3 className="mt-3 font-semibold text-[#7B4B3A]">{product.name}</h3>

      <div className="flex items-center justify-center gap-2 mt-1">
        <div className="flex text-yellow-500">
          {Array.from({ length: 5 }).map((_, i) => (
            <FaStar
              key={i}
              className={i < Math.round(rating) ? "opacity-100" : "opacity-30"}
            />
          ))}
        </div>
        <span className="text-sm text-[#5C362C] ml-1">{rating.toFixed(1)}</span>
        {product.reviews && product.reviews.length > 0 && (
          <span className="text-sm text-[#5C362C] ml-1">
            ({product.reviews.length})
          </span>
        )}
      </div>

      <p className="mt-2 text-lg font-bold text-[#5C362C]">₹{priceDisplay}.00</p>

      {/* Stock Status Text */}
      <div className="mt-1">
        {currentStock > 0 ? (
          <span className="text-green-600 text-sm font-medium">In Stock</span>
        ) : (
          <span className="text-red-600 text-sm font-medium">Out of Stock</span>
        )}
      </div>

      <div className="mt-3 flex flex-wrap items-center justify-center gap-2">
        <button
          onClick={handleAddToCart}
          disabled={currentStock <= 0}
          className={`flex items-center gap-2 px-3 py-2 rounded transition duration-200 ${
            currentStock <= 0 
              ? "bg-gray-400 cursor-not-allowed" 
              : "bg-[#7B4B3A] text-[#F5F0E1] hover:bg-[#5C362C]"
          }`}
        >
          <FaShoppingCart /> 
          {currentStock <= 0 ? "Out of Stock" : "Add to Cart"}
        </button>

        <button
          onClick={handleBuyNow}
          disabled={currentStock <= 0}
          className={`flex items-center gap-2 px-3 py-2 rounded transition duration-200 ${
            currentStock <= 0 
              ? "bg-gray-400 cursor-not-allowed" 
              : "bg-[#B88A6F] text-[#F5F0E1] hover:bg-[#A36A50]"
          }`}
        >
          <FaBolt /> 
          {currentStock <= 0 ? "Unavailable" : "Buy Now"}
        </button>
      </div>

      <div className="mt-3 flex items-center justify-between">
        <button
          onClick={handleQuickView}
          className="text-sm text-[#7B4B3A] underline"
        >
          Quick View
        </button>
        <span className="text-xs text-[#5C362C]">{product.category}</span>
      </div>
    </div>
  );
}