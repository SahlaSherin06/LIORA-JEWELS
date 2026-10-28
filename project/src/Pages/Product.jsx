import { useEffect, useState, useContext } from "react";
import ProductCard from "../Components/ProductCard";
import ProductModal from "../Components/ProductModal.jsx";
import { toast } from 'react-toastify';
import { AuthContext } from "../Context/AuthContext";
import { CartContext } from "../Context/CartContext";
import { WishlistContext } from "../Context/WishlistContext";

const PAGE_SIZE = 8;

export default function Shop() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState(["All"]);
  const [filter, setFilter] = useState("All");
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState("newest");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [modalProduct, setModalProduct] = useState(null);
  const { user, isLoggedIn } = useContext(AuthContext);
  const { addToCart } = useContext(CartContext);
  const { addToWishlist } = useContext(WishlistContext);
  const [loading, setLoading] = useState(false);

  // Fetch Categories on Mount
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await fetch("http://localhost:5000/api/products/categories");
        if (res.ok) {
          const data = await res.json();
          setCategories(["All", ...data]);
        }
      } catch (err) {
        console.error("Failed to fetch categories");
      }
    };
    fetchCategories();
  }, []);

  // Fetch Products from Backend
  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      try {
        const queryParams = new URLSearchParams({
          page,
          limit: PAGE_SIZE,
          sort,
          category: filter === "All" ? "" : filter,
          search
        }).toString();
        
        const res = await fetch(`http://localhost:5000/api/products?${queryParams}`);
        if (!res.ok) throw new Error("Failed to fetch products");
        
        const data = await res.json();
        
        // Handle both paginated object and flat array responses
        const productsList = Array.isArray(data) ? data : (data.products || []);
        const newProductsArray = productsList.map(p => ({ ...p, category: (p.category || "").trim() }));
        
        // ALWAYS replace products on page change, do not append!
        setProducts(newProductsArray);
        setTotalPages(data.totalPages || 1);
        
        // Scroll to top of products gracefully
        window.scrollTo({ top: 0, behavior: 'smooth' });
      } catch (err) {
        console.error(err);
        toast.error("Failed to load products");
      } finally {
        setLoading(false);
      }
    };
    
    const delayDebounceFn = setTimeout(() => {
      fetchProducts();
    }, 300);
    
    return () => clearTimeout(delayDebounceFn);
  }, [page, filter, sort, search]);

  // Handle Input Changes (Reset to page 1)
  const handleSearchChange = (e) => {
    setSearch(e.target.value);
    setPage(1);
  };
  
  const handleFilterChange = (cat) => {
    setFilter(cat);
    setPage(1);
  };

  const handleSortChange = (e) => {
    setSort(e.target.value);
    setPage(1);
  };

  // Cart/Wishlist handler
  const handleProductAction = async (action, product) => {
    if (!isLoggedIn || !user) {
      toast.info("Please login to add items to cart or wishlist");
      return;
    }

    if (action === "addToCart") {
      await addToCart(product, 1);
    } else {
      await addToWishlist(product);
    }
  };

  return (
    <div className="w-full px-4 md:px-12 pt-32 pb-12">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-4xl font-bold text-center mb-10" style={{ color: "#7B4B3A" }}>Shop All Accessories</h1>

        {/* Controls */}
        <div className="flex flex-col md:flex-row gap-6 items-center justify-between mb-10">
          <input
            value={search}
            onChange={handleSearchChange}
            placeholder="🔍 Search for accessories..."
            className="w-full md:w-80 px-4 py-3 rounded-lg shadow-sm border border-[#B88A6F] bg-[#F5F0E1] text-[#5C362C] focus:outline-none focus:ring-2 focus:ring-[#7B4B3A] placeholder-[#7B4B3A]"
          />
          <div className="flex flex-wrap justify-center gap-3">
            {categories.map(cat => (
              <button
                key={cat}
                onClick={() => handleFilterChange(cat)}
                className={`px-5 py-2 rounded-full font-semibold transition duration-200 ${filter === cat ? "bg-[#7B4B3A] text-[#F5F0E1] shadow-md" : "bg-[#B88A6F] text-[#F5F0E1] hover:bg-[#A36A50]"}`}
              >
                {cat}
              </button>
            ))}
          </div>
          <select
            value={sort}
            onChange={handleSortChange}
            className="px-4 py-3 rounded-lg border border-[#B88A6F] bg-[#F5F0E1] text-[#5C362C] focus:outline-none focus:ring-2 focus:ring-[#7B4B3A]"
          >
            <option value="newest">🆕 Newest</option>
            <option value="price-asc">⬇️ Price: Low → High</option>
            <option value="price-desc">⬆️ Price: High → Low</option>
          </select>
        </div>

        {/* Product Grid */}
        {loading ? (
          <div className="text-center p-8 text-[#7B4B3A] animate-pulse h-96 flex items-center justify-center">Loading products...</div>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8">
              {products.map(product => (
                <ProductCard
                  key={product.id}
                  product={product}
                  isNewCustomer={true}
                  onQuickView={() => setModalProduct(product)}
                  onAddToCart={() => handleProductAction('addToCart', product)}
                  onAddToWishlist={() => handleProductAction('addToWishlist', product)}
                  user={user}
                />
              ))}
            </div>
            
            {products.length === 0 && (
              <div className="text-center p-8 text-[#7B4B3A]">No products found.</div>
            )}
          </>
        )}

        {/* Traditional Pagination Buttons */}
        {!loading && totalPages > 1 && (
          <div className="flex items-center justify-center gap-4 mt-12">
            <button 
              onClick={() => setPage(p => Math.max(1, p - 1))} 
              disabled={page === 1} 
              className="px-6 py-2 font-semibold rounded-lg bg-[#F5F0E1] border-2 border-[#B88A6F] disabled:opacity-40 disabled:cursor-not-allowed text-[#5C362C] hover:bg-[#E8D9C5] transition-colors"
            >
              ← Previous
            </button>
            <span className="text-[#5C362C] font-semibold">
              Page {page} of {totalPages}
            </span>
            <button 
              onClick={() => setPage(p => Math.min(totalPages, p + 1))} 
              disabled={page === totalPages} 
              className="px-6 py-2 font-semibold rounded-lg bg-[#F5F0E1] border-2 border-[#B88A6F] disabled:opacity-40 disabled:cursor-not-allowed text-[#5C362C] hover:bg-[#E8D9C5] transition-colors"
            >
              Next →
            </button>
          </div>
        )}
      </div>

      {modalProduct && (
        <ProductModal
          product={modalProduct}
          onClose={() => setModalProduct(null)}
          onAddToCart={(p) => handleProductAction('addToCart', p)}
          onAddToWishlist={(p) => handleProductAction('addToWishlist', p)}
          user={user}
        />
      )}
    </div>
  );
}
