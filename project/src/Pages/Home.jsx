// src/Pages/Home.jsx
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import ProductCard from "../Components/ProductCard";
import { toast } from 'react-toastify';

function Home() {
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [user, setUser] = useState(null);

  // Hero Banner Images
  const bannerImages = [
    "https://i.pinimg.com/1200x/33/11/7f/33117f48e9b48defc084490b00381c75.jpg",
    "https://i.pinimg.com/1200x/98/c0/23/98c02301aacaec39c7e1d0e4cffe2431.jpg",
    "https://i.pinimg.com/1200x/f3/5a/de/f35ade4a06011a8b40ade17f1e6cca2c.jpg"
  ];

  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  // Load user data from localStorage
  useEffect(() => {
    const userLoggedIn = localStorage.getItem("userLoggedIn");
    if (userLoggedIn) {
      setUser(JSON.parse(userLoggedIn));
    }
  }, []);

  // Auto slide images every 4 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentImageIndex((prevIndex) => (prevIndex + 1) % bannerImages.length);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  // Fetch products from db.json
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await fetch("http://localhost:5000/products");
        if (!response.ok) throw new Error("Failed to fetch products");
        const data = await response.json();
        setProducts(data);
        
        // Store products in localStorage for offline access
        localStorage.setItem("products", JSON.stringify(data));
      } catch (err) {
        console.error("Error fetching products:", err.message);
        // Fallback to localStorage if API fails
        const cachedProducts = localStorage.getItem("products");
        if (cachedProducts) {
          setProducts(JSON.parse(cachedProducts));
          toast.info("Using cached products data");
        }
      }
    };

    fetchProducts();
  }, []);

  // Enhanced ProductCard handler that syncs with both localStorage and API
  const handleProductAction = async (action, product) => {
    if (!user) {
      toast.info("Please login to add items to cart or wishlist");
      navigate("/login");
      return;
    }

    try {
      let updatedData;
      const userKey = `cart_${user.id}`;
      const wishlistKey = `wishlist_${user.id}`;

      if (action === 'addToCart') {
        const currentCart = JSON.parse(localStorage.getItem(userKey) || '[]');
        const existingItem = currentCart.find(item => item.id === product.id);
        
        if (existingItem) {
          updatedData = currentCart.map(item =>
            item.id === product.id 
              ? { ...item, quantity: (item.quantity || 1) + 1 }
              : item
          );
        } else {
          updatedData = [...currentCart, { ...product, quantity: 1 }];
        }
        
        localStorage.setItem(userKey, JSON.stringify(updatedData));
        toast.success("Product added to cart!");
      } 
      else if (action === 'addToWishlist') {
        const currentWishlist = JSON.parse(localStorage.getItem(wishlistKey) || '[]');
        const existsInWishlist = currentWishlist.some(item => item.id === product.id);
        
        if (existsInWishlist) {
          toast.info("Product is already in your wishlist");
          return;
        }
        
        updatedData = [...currentWishlist, product];
        localStorage.setItem(wishlistKey, JSON.stringify(updatedData));
        toast.success("Product added to wishlist!");
      }

      // Sync with API
      if (user && updatedData) {
        const fieldToUpdate = action === 'addToCart' ? 'cart' : 'wishlist';
        
        const response = await fetch(`http://localhost:5000/users/${user.id}`, {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            [fieldToUpdate]: updatedData
          })
        });

        if (!response.ok) {
          throw new Error('Failed to sync with server');
        }
      }

      // Trigger global events for Navbar updates
      window.dispatchEvent(new Event("cartUpdated"));
      window.dispatchEvent(new Event("wishlistUpdated"));

    } catch (error) {
      console.error(`Error in ${action}:`, error);
      toast.error("Failed to update. Please try again.");
    }
  };

  const featuredProducts = products.slice(0, 8);

  return (
    <div className="w-full">
      {/* Add inline styles for animations */}
      <style>
        {`
          @keyframes fadeInUp {
            0% {
              opacity: 0;
              transform: translateY(20px);
            }
            100% {
              opacity: 1;
              transform: translateY(0);
            }
          }
          @keyframes gradientShift {
            0%, 100% {
              background-position: 0% 50%;
            }
            50% {
              background-position: 100% 50%;
            }
          }
          @keyframes fadeInScale {
            0% {
              opacity: 0;
              transform: scale(0.8);
            }
            100% {
              opacity: 1;
              transform: scale(1);
            }
          }
          .animate-fade-in-up {
            animation: fadeInUp 0.8s ease-out;
          }
          .animate-fade-in-scale {
            animation: fadeInScale 1s ease-out;
          }
          .animate-gradient {
            background: linear-gradient(90deg, #7B4B3A, #F5F0E1, #7B4B3A);
            background-size: 200% 200%;
            animation: gradientShift 3s ease infinite;
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            background-clip: text;
          }
          .animate-gradient-hero {
            background: linear-gradient(90deg, #7B4B3A, #F5F0E1, #7B4B3A);
            background-size: 200% 200%;
            animation: gradientShift 3s ease infinite;
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            background-clip: text;
          }
        `}
      </style>

      {/* Hero Banner */}
      <div className="relative w-full h-[700px] md:h-[900px] lg:h-[700px] overflow-hidden">
        {bannerImages.map((img, index) => (
          <img
            key={index}
            src={img}
            alt={`Banner ${index + 1}`}
            className={`absolute w-full h-full object-cover transition-opacity duration-1000 ${
              index === currentImageIndex ? "opacity-100" : "opacity-0"
            }`}
          />
        ))}
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-center px-4">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold animate-fade-in-scale" style={{ color: "#F5F0E1" }}>
            Discover{" "}
            <span className="animate-gradient-hero">
              Liora Jewels
            </span>
          </h1>
          <p className="mt-4 text-lg md:text-xl" style={{ color: "#F5F0E1" }}>
            Elegant Accessories for Women
          </p>
          <button
            onClick={() => navigate("/shop")}
            className="mt-6 px-6 py-3 text-lg font-semibold rounded transition duration-300 hover:bg-[#5C362C]"
            style={{ backgroundColor: "#7B4B3A", color: "#F5F0E1" }}
          >
            Shop Now
          </button>
        </div>
      </div>

      {/* Rest of your Home page content */}
      <div className="text-center mt-16 px-4 md:px-12">
        <h2 className="text-3xl md:text-4xl font-bold mb-4 animate-fade-in-up" style={{ color: "#7B4B3A" }}>
          Welcome to Liora Jewels
        </h2>
        <p className="mt-4 text-lg md:text-xl max-w-3xl mx-auto animate-fade-in-up" style={{ color: "#5C362C" }}>
          Explore our luxurious collection of earrings, necklaces, bracelets, and rings. Each piece is carefully crafted to bring elegance and charm to your style.
        </p>
      </div>

      <div className="mt-16 px-4 md:px-12">
        <h2 className="text-3xl md:text-4xl font-bold text-center mb-8" style={{ color: "#7B4B3A" }}>
          Featured Accessories
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
          {featuredProducts.map((product) => (
            <ProductCard 
              key={product.id} 
              product={product} 
              isNewCustomer={true}
              onAddToCart={(product) => handleProductAction('addToCart', product)}
              onAddToWishlist={(product) => handleProductAction('addToWishlist', product)}
              user={user}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

export default Home;