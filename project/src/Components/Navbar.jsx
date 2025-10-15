import { Link, useNavigate, useLocation } from "react-router-dom";
import { FaShoppingCart, FaHeart, FaUserCircle, FaBox, FaBars } from "react-icons/fa";
import { useState, useEffect, useRef, useContext } from "react";
import { CartContext } from "../Context/CartContext";
import { WishlistContext } from "../Context/WishlistContext";
import { AuthContext } from "../Context/AuthContext";

function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();
  const [showProfileDropdown, setShowProfileDropdown] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const dropdownRef = useRef(null);
  const mobileMenuRef = useRef(null);

  const { getCartCount } = useContext(CartContext);
  const { getWishlistCount } = useContext(WishlistContext);
  const { user, isLoggedIn, logout } = useContext(AuthContext);

  const [cartCount, setCartCount] = useState(0);
  const [wishlistCount, setWishlistCount] = useState(0);

  // Load cart count from context
  useEffect(() => {
    const loadCartCount = () => {
      setCartCount(getCartCount());
    };
    
    loadCartCount();
    window.addEventListener("cartUpdated", loadCartCount);
    
    return () => window.removeEventListener("cartUpdated", loadCartCount);
  }, [getCartCount]);

  // Load wishlist count from context
  useEffect(() => {
    const loadWishlistCount = () => {
      setWishlistCount(getWishlistCount());
    };
    
    loadWishlistCount();
    window.addEventListener("wishlistUpdated", loadWishlistCount);
    
    return () => window.removeEventListener("wishlistUpdated", loadWishlistCount);
  }, [getWishlistCount]);

  // Close profile dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowProfileDropdown(false);
      }
      if (mobileMenuRef.current && !mobileMenuRef.current.contains(event.target)) {
        setShowMobileMenu(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = () => {
    logout();
    setShowProfileDropdown(false);
    setShowMobileMenu(false);
    navigate("/");
  };

  const handleProfileClick = () => {
    setShowProfileDropdown(false);
    setShowMobileMenu(false);
    navigate("/profile");
  };

  // Navbar links style: normal/semi-bold, underline animation left-to-right
  const linkClass = (path) =>
    `relative pb-1 text-[#7B4B3A] font-semibold text-lg
     after:content-[''] after:absolute after:left-0 after:bottom-0 after:h-[2px]
     after:bg-[#7B4B3A] after:w-0 after:transition-all after:duration-300
     ${location.pathname === path ? "after:w-full" : ""}`;

  const mobileLinkClass = (path) =>
    `block py-3 px-4 text-[#7B4B3A] font-semibold text-lg border-b border-[#D2B48C]
     ${location.pathname === path ? "bg-[#EDE4D3]" : ""}`;

  return (
    <nav
      className="flex justify-between items-center fixed w-full px-4 md:px-12 py-4 shadow-md z-[1000]"
      style={{ backgroundColor: "#F5F0E1" }}
    >
      {/* Mobile menu button and logo */}
      <div className="flex items-center space-x-4">
        <button
          className="md:hidden text-[#7B4B3A] p-2"
          onClick={() => setShowMobileMenu(!showMobileMenu)}
        >
          <FaBars size={20} />
        </button>
        
        <h1
          className="text-xl md:text-2xl font-bold text-[#7B4B3A] cursor-pointer"
          onClick={() => navigate("/")}
        >
          Liora Jewels
        </h1>
      </div>

      {/* Desktop Navbar links */}
      <div className="hidden md:flex space-x-8">
        <Link to="/" className={linkClass("/")}>Home</Link>
        <Link to="/shop" className={linkClass("/shop")}>Shop</Link>
        <Link to="/about" className={linkClass("/about")}>About</Link>
        <Link to="/contact" className={linkClass("/contact")}>Contact</Link>
      </div>

      {/* Wishlist, Cart, Profile/Login */}
      <div className="flex items-center space-x-4 md:space-x-6">
        <div
          className="relative cursor-pointer"
          onClick={() => {
            if (!isLoggedIn) navigate("/login");
            else navigate("/wishlist");
          }}
        >
          <FaHeart size={20} md:size={24} style={{ color: "#7B4B3A" }} />
          {wishlistCount > 0 && (
            <span className="absolute -top-2 -right-2 bg-[#b5755e] text-[#F5F0E1] text-xs font-bold rounded-full px-1 md:px-2 min-w-[18px] text-center">
              {wishlistCount}
            </span>
          )}
        </div>

        <div
          className="relative cursor-pointer"
          onClick={() => {
            if (!isLoggedIn) navigate("/login");
            else navigate("/cart");
          }}
        >
          <FaShoppingCart size={20} md:size={24} style={{ color: "#7B4B3A" }} />
          {cartCount > 0 && (
            <span className="absolute -top-2 -right-2 bg-[#b5755e] text-[#F5F0E1] text-xs font-bold rounded-full px-1 md:px-2 min-w-[18px] text-center">
              {cartCount}
            </span>
          )}
        </div>

        {isLoggedIn ? (
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setShowProfileDropdown(!showProfileDropdown)}
              className="p-1 md:p-2 text-[#7B4B3A] rounded-full transition-colors duration-300"
            >
              <FaUserCircle size={20} md:size={24} />
            </button>

            {showProfileDropdown && (
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-[#D2B48C] overflow-hidden z-50">
                <button
                  onClick={handleProfileClick}
                  className="w-full px-4 py-3 text-left text-[#7B4B3A] hover:bg-[#F5F0E1] transition-colors duration-200 flex items-center space-x-2"
                >
                  <FaUserCircle size={16} />
                  <span>My Profile</span>
                </button>
                <button
                  onClick={() => navigate("/order")}
                  className="w-full px-4 py-3 text-left text-[#7B4B3A] hover:bg-[#F5F0E1] transition-colors duration-200 flex items-center space-x-2"
                >
                  <FaBox size={16} />
                  <span>Orders</span>
                </button>
                <div className="border-t border-[#D2B48C]"></div>
                <button
                  onClick={handleLogout}
                  className="w-full px-4 py-3 text-left text-[#7B4B3A] hover:bg-[#F5F0E1] transition-colors duration-200 flex items-center space-x-2"
                >
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                    ></path>
                  </svg>
                  <span>Logout</span>
                </button>
              </div>
            )}
          </div>
        ) : (
          <Link
            to="/login"
            className="px-3 py-1 md:px-5 md:py-2 bg-[#7B4B3A] text-[#F5F0E1] rounded text-sm md:text-base transition-colors duration-300"
          >
            Login
          </Link>
        )}
      </div>

      {/* Mobile Menu */}
      {showMobileMenu && (
        <div 
          ref={mobileMenuRef}
          className="absolute top-full left-0 w-full bg-[#F5F0E1] shadow-lg border-t border-[#D2B48C] md:hidden z-40"
        >
          <Link 
            to="/" 
            className={mobileLinkClass("/")}
            onClick={() => setShowMobileMenu(false)}
          >
            Home
          </Link>
          <Link 
            to="/shop" 
            className={mobileLinkClass("/shop")}
            onClick={() => setShowMobileMenu(false)}
          >
            Shop
          </Link>
          <Link 
            to="/about" 
            className={mobileLinkClass("/about")}
            onClick={() => setShowMobileMenu(false)}
          >
            About
          </Link>
          <Link 
            to="/contact" 
            className={mobileLinkClass("/contact")}
            onClick={() => setShowMobileMenu(false)}
          >
            Contact
          </Link>
          
          {/* Mobile Profile Links for logged in users */}
          {isLoggedIn && (
            <>
              <div className="border-t border-[#D2B48C] my-2"></div>
              <button
                onClick={handleProfileClick}
                className="w-full text-left py-3 px-4 text-[#7B4B3A] font-semibold border-b border-[#D2B48C] flex items-center space-x-2"
              >
                <FaUserCircle size={16} />
                <span>My Profile</span>
              </button>
              <button
                onClick={() => {
                  navigate("/order");
                  setShowMobileMenu(false);
                }}
                className="w-full text-left py-3 px-4 text-[#7B4B3A] font-semibold border-b border-[#D2B48C] flex items-center space-x-2"
              >
                <FaBox size={16} />
                <span>Orders</span>
              </button>
              <button
                onClick={handleLogout}
                className="w-full text-left py-3 px-4 text-[#7B4B3A] font-semibold border-b border-[#D2B48C] flex items-center space-x-2"
              >
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                  ></path>
                </svg>
                <span>Logout</span>
              </button>
            </>
          )}
        </div>
      )}
    </nav>
  );
}

export default Navbar;