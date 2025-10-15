import { Link } from "react-router-dom";
import { FaFacebook, FaInstagram, FaTwitter, FaPinterest, FaEnvelope, FaPhone, FaMapMarkerAlt } from "react-icons/fa";

function Footer() {
  return (
  <footer className="bg-[#5C362C] text-[#F5F0E1] pt-12 pb-8">
      <div className="max-w-7xl mx-auto px-4 md:px-8">
        {/* Main Footer Content */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-8">
          
          {/* Brand Column */}
          <div className="lg:col-span-1">
            <h3 className="text-2xl font-bold mb-4">Liora Jewels</h3>
            <p className="text-[#D2B48C] mb-4 leading-relaxed">
              Discover exquisite jewelry pieces crafted with passion and precision. 
              Each piece tells a story of elegance and timeless beauty.
            </p>
            <div className="flex space-x-4">
              <a href="https://instagram.com" className="text-[#F5F0E1] hover:text-[#D2B48C] transition-colors duration-300">
                <FaInstagram size={20} />
              </a>
              <a href="https://facebook.com" className="text-[#F5F0E1] hover:text-[#D2B48C] transition-colors duration-300">
                <FaFacebook size={20} />
              </a>
              <a href="https://twitter.com" className="text-[#F5F0E1] hover:text-[#D2B48C] transition-colors duration-300">
                <FaTwitter size={20} />
              </a>
              <a href="https://pinterest.com" className="text-[#F5F0E1] hover:text-[#D2B48C] transition-colors duration-300">
                <FaPinterest size={20} />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-lg font-semibold mb-4 text-[#D2B48C]">Quick Links</h4>
            <ul className="space-y-2">
              <li>
                <Link to="/" className="hover:text-[#D2B48C] transition-colors duration-300">
                  Home
                </Link>
              </li>
              <li>
                <Link to="/shop" className="hover:text-[#D2B48C] transition-colors duration-300">
                  Shop All
                </Link>
              </li>
              <li>
                <Link to="/about" className="hover:text-[#D2B48C] transition-colors duration-300">
                  About Us
                </Link>
              </li>
              <li>
                <Link to="/contact" className="hover:text-[#D2B48C] transition-colors duration-300">
                  Contact
                </Link>
              </li>
            </ul>
          </div>

          {/* Categories */}
          <div>
            <h4 className="text-lg font-semibold mb-4 text-[#D2B48C]">Categories</h4>
            <ul className="space-y-2">
              <li>
                <Link to="/shop?category=necklaces" className="hover:text-[#D2B48C] transition-colors duration-300">
                  Necklaces
                </Link>
              </li>
              <li>
                <Link to="/shop?category=earrings" className="hover:text-[#D2B48C] transition-colors duration-300">
                  Earrings
                </Link>
              </li>
              <li>
                <Link to="/shop?category=bracelets" className="hover:text-[#D2B48C] transition-colors duration-300">
                  Bracelets
                </Link>
              </li>
              <li>
                <Link to="/shop?category=rings" className="hover:text-[#D2B48C] transition-colors duration-300">
                  Rings
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h4 className="text-lg font-semibold mb-4 text-[#D2B48C]">Contact Us</h4>
            <div className="space-y-3">
              <div className="flex items-center space-x-3">
                <FaMapMarkerAlt className="text-[#D2B48C] flex-shrink-0" />
                <span className="text-sm">123 Jewelry Street, Fashion District, NY 10001</span>
              </div>
              <div className="flex items-center space-x-3">
                <FaPhone className="text-[#D2B48C] flex-shrink-0" />
                <span className="text-sm">+1 (555) 123-4567</span>
              </div>
              <div className="flex items-center space-x-3">
                <FaEnvelope className="text-[#D2B48C] flex-shrink-0" />
                <span className="text-sm">info@liorajewels.com</span>
              </div>
            </div>
          </div>
        </div>

        {/* Newsletter Section */}
        <div className="border-t border-[#D2B48C] border-opacity-30 pt-8 mb-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="mb-4 md:mb-0">
              <h4 className="text-lg font-semibold mb-2 text-[#D2B48C]">Stay Updated</h4>
              <p className="text-sm text-[#D2B48C]">Subscribe to get special offers and exclusive deals</p>
            </div>
            <div className="flex w-full md:w-auto">
              <input
                type="email"
                placeholder="Enter your email"
                className="px-4 py-2 bg-[#F5F0E1] text-[#7B4B3A] rounded-l-lg focus:outline-none focus:ring-2 focus:ring-[#D2B48C] w-full md:w-64"
              />
              <button className="bg-[#D2B48C] text-[#7B4B3A] px-6 py-2 rounded-r-lg font-semibold hover:bg-[#C19A6B] transition-colors duration-300">
                Subscribe
              </button>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-[#D2B48C] border-opacity-30 pt-6">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="text-sm text-[#D2B48C] mb-4 md:mb-0">
              © 2024 Liora Jewels. All rights reserved.
            </div>
            <div className="flex space-x-6 text-sm">
              <Link to="/privacy" className="hover:text-[#D2B48C] transition-colors duration-300">
                Privacy Policy
              </Link>
              <Link to="/terms" className="hover:text-[#D2B48C] transition-colors duration-300">
                Terms of Service
              </Link>
              <Link to="/shipping" className="hover:text-[#D2B48C] transition-colors duration-300">
                Shipping Info
              </Link>
              <Link to="/returns" className="hover:text-[#D2B48C] transition-colors duration-300">
                Returns
              </Link>
            </div>
          </div>
        </div>

        {/* Payment Methods */}
        <div className="mt-6 text-center">
          <p className="text-sm text-[#D2B48C] mb-3">We Accept</p>
          <div className="flex justify-center space-x-4 text-2xl opacity-80">
            <span>💳</span>
            <span>🏦</span>
            <span>📱</span>
            <span>🔒</span>
          </div>
        </div>
      </div>
    </footer>
  );
}

export default Footer;