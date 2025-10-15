import { useState, useEffect, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { FaShoppingCart } from "react-icons/fa";
import { WishlistContext } from "../Context/WishlistContext";
import { AuthContext } from "../Context/AuthContext";

export default function Wishlist() {
  const { wishlist, removeFromWishlist, clearWishlist } = useContext(WishlistContext);
  const { isLoggedIn } = useContext(AuthContext);
  const [message, setMessage] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    if (!isLoggedIn) {
      navigate("/login");
    }
  }, [isLoggedIn, navigate]);

  const showMessage = (text) => {
    setMessage(text);
    setTimeout(() => setMessage(""), 1500);
  };

  const handleRemoveItem = async (id) => {
    const success = await removeFromWishlist(id);
    if (success) {
      showMessage("Removed from wishlist ❤️‍🔥");
    }
  };

  const handleRemoveAll = async () => {
    const success = await clearWishlist();
    if (success) {
      showMessage("All items removed from wishlist 💔");
    }
  };

  if (wishlist.length === 0)
    return (
      <div className="pt-32 min-h-screen flex items-center justify-center bg-[#F5F0E1] text-[#7B4B3A] text-xl font-semibold">
        Your wishlist is empty 💔
      </div>
    );

  return (
    <div className="pt-32 min-h-screen bg-[#F5F0E1]">
      {message && (
        <div className="fixed top-24 left-1/2 -translate-x-1/2 bg-[#7B4B3A] text-[#F5F0E1] px-4 py-2 rounded-lg shadow-md">
          {message}
        </div>
      )}
      <div className="max-w-6xl mx-auto px-4 py-12">
        <h2 className="text-4xl font-bold text-center mb-12 text-[#7B4B3A]">My Wishlist</h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8">
          {wishlist.map((product) => (
            <div key={product.id} className="bg-[#EDE4D3] p-5 rounded-lg shadow-lg hover:scale-[1.02] transition">
              <img src={product.image} alt={product.name} className="w-full h-64 object-cover rounded-md" />
              <h3 className="mt-4 text-xl font-semibold text-[#7B4B3A]">{product.name}</h3>
              <p className="mt-2 text-lg font-bold text-[#5C362C]">₹{product.price}</p>

              <div className="mt-4 flex gap-3">
                <button
                  onClick={() => navigate("/cart")}
                  className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-[#7B4B3A] text-[#F5F0E1] rounded hover:bg-[#5C362C]"
                >
                  <FaShoppingCart /> Add to Cart
                </button>

                <button
                  onClick={() => handleRemoveItem(product.id)}
                  className="flex-1 px-3 py-2 bg-[#D2B48C] text-[#7B4B3A] rounded hover:bg-[#C19A6B]"
                >
                  Remove
                </button>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-12 flex justify-center">
          <button
            onClick={handleRemoveAll}
            className="px-6 py-3 bg-[#D2B48C] text-[#7B4B3A] rounded hover:bg-[#C19A6B]"
          >
            Remove All
          </button>
        </div>
      </div>
    </div>
  );
}