import React, { useEffect } from "react";
import { Routes, Route, useNavigate, useLocation } from "react-router-dom";
import Navbar from "./Components/Navbar.jsx";
import Footer from "./Components/Footer.jsx";

// User Pages
import Home from "./Pages/Home.jsx";
import Product from "./Pages/Product.jsx";
import About from "./Pages/About.jsx";
import Contact from "./Pages/Contact.jsx";
import Profile from "./Pages/Profile.jsx";

// Auth Pages
import LoginPage from "./Auth/LoginPage.jsx";
import RegisterPage from "./Auth/RegisterPage.jsx";

// Components
import WishlistPage from "./Components/WishlistPage.jsx";
import ProductModal from "./Components/ProductModal.jsx";
import CartPage from "./Components/CartPage.jsx";
import Checkout from "./Components/Checkout.jsx";
import Orders from "./Components/Orders.jsx";

// Context Providers
import { AuthProvider } from "./Context/AuthContext.jsx";
import { CartProvider } from "./Context/CartContext.jsx";
import { WishlistProvider } from "./Context/WishlistContext.jsx";

// Router Protectors
import { ProtecterRouter, PublicRouter } from "./Protector/ProtecterRouter.jsx";

// Admin
import AdminDashboard from "./Admin/AdminDashboard.jsx";
import Sidebar from "./Admin/Sidebar.jsx";
import Orderhistory from "./Admin/Orderhistory.jsx";
import User from "./Admin/User.jsx";
import ManageProduct from "./Admin/ManageProduct.jsx";

// Toastify
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

function App() {
  const location = useLocation();
  const navigate = useNavigate();

  //  Auto redirect admin after refresh
  useEffect(() => {
    const storedUser = localStorage.getItem("userLoggedIn");
    if (storedUser) {
      const user = JSON.parse(storedUser);
      if (
        user.role?.toLowerCase() === "admin" &&
        ["/", "/login", "/signup"].includes(location.pathname)
      ) {
        navigate("/dashboard", { replace: true });
      }
    }
  }, [navigate, location.pathname]);

  //  Hide Navbar/Footer for admin or auth pages
  const hideNavFooterPages = [
    "/login",
    "/signup",
    "/dashboard",
    "/sidebar",
    "/products",
    "/users",
    "/orders"
  ];

  const showNavFooter = !hideNavFooterPages.includes(location.pathname);

  return (
    <AuthProvider>
      <CartProvider>
        <WishlistProvider>
          <div className="min-h-screen bg-beige-50 text-brown-900 flex flex-col">
            
            {showNavFooter && <Navbar />}

            <main className="flex-grow">
              <Routes>
                {/* 🌍 Public Pages */}
                <Route path="/" element={<Home />} />
                <Route path="/shop" element={<Product />} />
                <Route path="/about" element={<About />} />
                <Route path="/contact" element={<Contact />} />
                <Route path="/productmodal" element={<ProductModal />} />

                {/* 🛒 Protected (User Only) */}
                <Route path="/cart" element={<ProtecterRouter><CartPage /></ProtecterRouter>} />
                <Route path="/wishlist" element={<ProtecterRouter><WishlistPage /></ProtecterRouter>} />
                <Route path="/profile" element={<ProtecterRouter><Profile /></ProtecterRouter>} />
                <Route path="/checkout" element={<ProtecterRouter><Checkout /></ProtecterRouter>} />
                <Route path="/order" element={<ProtecterRouter><Orders /></ProtecterRouter>} />

                {/* 🔐 Auth Pages */}
                <Route path="/login" element={<PublicRouter><LoginPage /></PublicRouter>} />
                <Route path="/register" element={<PublicRouter><RegisterPage /></PublicRouter>} />

                {/* 🧑‍💼 Admin Route */}
                <Route path="/sidebar" element={<ProtecterRouter requireAdmin ={true}><Sidebar /></ProtecterRouter>} />
                <Route path="/products" element={<ProtecterRouter requireAdmin ={true}><ManageProduct /></ProtecterRouter>} />
                <Route path="/users" element={<ProtecterRouter requireAdmin ={true}><User /></ProtecterRouter>} />
                <Route path="/orders" element={<ProtecterRouter requireAdmin ={true}><Orderhistory /></ProtecterRouter>} />
                <Route path="/dashboard" element={<ProtecterRouter requireAdmin={true}><AdminDashboard /></ProtecterRouter>}/>

              </Routes>
            </main>

            {showNavFooter && <Footer />}

            {/* 🔔 Toast Container */}
            <ToastContainer
              position="top-center"
              autoClose={2000}
              hideProgressBar={false}
              newestOnTop={false}
              closeOnClick
              pauseOnHover
              draggable
              theme="colored"
            />
          </div>
        </WishlistProvider>
      </CartProvider>
    </AuthProvider>
  );
}

export default App;
