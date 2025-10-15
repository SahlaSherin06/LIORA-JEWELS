

// src/App.jsx
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Navbar from "./Components/Navbar.jsx";
import Home from "./Pages/Home.jsx";
import Product from "./Pages/Product.jsx";
import About from "./Pages/About.jsx";
import Contact from "./Pages/Contact.jsx";
import LoginPage from "./Auth/LoginPage.jsx";
import RegisterPage from "./Auth/RegisterPage.jsx";
import WishlistPage from "./Components/WishlistPage.jsx";
import ProductModal from "./Components/ProductModal.jsx";
import CartPage from "./Components/CartPage.jsx"; 
import Profile from "./Pages/Profile.jsx";
import Checkout from "./Components/Checkout.jsx";
import { AuthProvider } from "./Context/AuthContext.jsx";
import { CartProvider } from "./Context/CartContext";
import { WishlistProvider } from "./Context/WishlistContext";
import Orders from "./Components/Orders.jsx";
import Footer from "./Components/Footer.jsx";


// Toastify Imports
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { ProtecterRouter, PublicRouter } from "./Protector/ProtecterRouter.jsx";

function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <WishlistProvider>
          <Router>
            <div className="min-h-screen bg-beige-50 text-brown-900 flex flex-col">
              <Navbar />
              <main className="flex-grow">
                <Routes>
                  <Route path="/" element={<Home />} />
                  <Route path="/shop" element={<Product />} />
                  <Route path="/about" element={<About />} />
                  <Route path="/contact" element={<Contact />} />
                  <Route path="/login" element={ <PublicRouter><LoginPage /> </PublicRouter> } />
                  <Route path="/register" element={<PublicRouter><RegisterPage /> </PublicRouter> } />
                  <Route path="/wishlist" element={ <ProtecterRouter> <WishlistPage /> </ProtecterRouter> } />
                  <Route path="/productmodal" element={<ProductModal />} />
                  <Route path="/cart" element={ <ProtecterRouter> <CartPage /></ProtecterRouter> } />
                  <Route path="/profile" element={<Profile />} />
                  <Route path="/checkout" element={ <ProtecterRouter> <Checkout /></ProtecterRouter> } />
                  <Route path="/order" element={ <ProtecterRouter> <Orders /></ProtecterRouter> } />                </Routes>
              </main>
              
              <Footer />

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
          </Router>
        </WishlistProvider>
      </CartProvider>
    </AuthProvider>
  );
}

export default App;