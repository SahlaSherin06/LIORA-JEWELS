
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import ProductCard from "../../src/Components/ProductCard";
import { toast } from 'react-toastify';
import { AuthContext } from "../Context/AuthContext";
import { CartContext } from "../Context/CartContext";
import { WishlistContext } from "../Context/WishlistContext";
import { useContext } from "react";

function Home() {
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const { user, isLoggedIn } = useContext(AuthContext);
  const { addToCart } = useContext(CartContext);
  const { addToWishlist } = useContext(WishlistContext);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  const bannerImages = [
    "https://i.pinimg.com/1200x/33/11/7f/33117f48e9b48defc084490b00381c75.jpg",
    "https://i.pinimg.com/1200x/98/c0/23/98c02301aacaec39c7e1d0e4cffe2431.jpg",
    "https://i.pinimg.com/1200x/f3/5a/de/f35ade4a06011a8b40ade17f1e6cca2c.jpg"
  ];

  // Auto-slide hero images
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentImageIndex(prev => (prev + 1) % bannerImages.length);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  // Fetch products with localStorage fallback
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const res = await fetch("http://localhost:5000/api/products");
        if (!res.ok) throw new Error("Failed to fetch products");
        const data = await res.json();
        setProducts(data);
        localStorage.setItem("products", JSON.stringify(data));
      } catch {
        const cached = localStorage.getItem("products");
        if (cached) {
          setProducts(JSON.parse(cached));
          toast.info("Using cached products");
        }
      }
    };
    fetchProducts();
  }, []);

  // Handle cart/wishlist actions
  const handleProductAction = async (action, product) => {
    if (!isLoggedIn || !user) {
      toast.info("Please login first");
      navigate("/login");
      return;
    }

    if (action === "addToCart") {
      await addToCart(product, 1);
    } else {
      await addToWishlist(product);
    }
  };

  const featuredProducts = products.slice(0, 8);

  return (
    <div className="w-full">
      {/* Animations */}
      <style>{`
        @keyframes fadeInUp {0% {opacity:0; transform:translateY(20px);} 100% {opacity:1; transform:translateY(0);}}
        @keyframes fadeInScale {0% {opacity:0; transform:scale(0.8);} 100% {opacity:1; transform:scale(1);}}
        @keyframes gradientShift {0%,100%{background-position:0% 50%;}50%{background-position:100% 50%;}}
        .animate-fade-in-up{animation:fadeInUp 0.8s ease-out;}
        .animate-fade-in-scale{animation:fadeInScale 1s ease-out;}
        .animate-gradient, .animate-gradient-hero{
          background: linear-gradient(90deg,#7B4B3A,#F5F0E1,#7B4B3A);
          background-size: 200% 200%;
          animation: gradientShift 3s ease infinite;
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
        }
      `}</style>

      {/* Hero Banner */}
      <div className="relative w-full h-[700px] md:h-[900px] lg:h-[700px] overflow-hidden">
        {bannerImages.map((img, i) => (
          <img
            key={i}
            src={img}
            alt={`Banner ${i+1}`}
            className={`absolute w-full h-full object-cover transition-opacity duration-1000 ${i === currentImageIndex ? "opacity-100" : "opacity-0"}`}
          />
        ))}
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-center px-4">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold animate-fade-in-scale" style={{ color: "#F5F0E1" }}>
            Discover <span className="animate-gradient-hero">Liora Jewels</span>
          </h1>
          <p className="mt-4 text-lg md:text-xl" style={{ color: "#F5F0E1" }}>Elegant Accessories for Women</p>
          <button
            onClick={() => navigate("/shop")}
            className="mt-6 px-6 py-3 text-lg font-semibold rounded transition duration-300 hover:bg-[#5C362C]"
            style={{ backgroundColor: "#7B4B3A", color: "#F5F0E1" }}
          >
            Shop Now
          </button>
        </div>
      </div>

      {/* Intro */}
      <div className="text-center mt-16 px-4 md:px-12">
        <h2 className="text-3xl md:text-4xl font-bold mb-4 animate-fade-in-up" style={{ color: "#7B4B3A" }}>
          Welcome to Liora Jewels
        </h2>
        <p className="mt-4 text-lg md:text-xl max-w-3xl mx-auto animate-fade-in-up" style={{ color: "#5C362C" }}>
          Explore our luxurious collection of earrings, necklaces, bracelets, and rings.
        </p>
      </div>

      {/* Featured Products */}
      <div className="mt-16 px-4 md:px-12">
        <h2 className="text-3xl md:text-4xl font-bold text-center mb-8" style={{ color: "#7B4B3A" }}>
          Featured Accessories
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
          {featuredProducts.map(product => (
            <ProductCard
              key={product.id}
              product={product}
              isNewCustomer={true}
              onAddToCart={() => handleProductAction('addToCart', product)}
              onAddToWishlist={() => handleProductAction('addToWishlist', product)}
              user={user}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

export default Home;

