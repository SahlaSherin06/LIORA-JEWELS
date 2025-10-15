// src/Pages/Shop.jsx
import { useEffect, useMemo, useState } from "react";
import ProductCard from "../Components/ProductCard";
import ProductModal from "../Components/ProductModal.jsx";
import { toast } from 'react-toastify';

const PAGE_SIZE = 8;

export default function Shop() {
  const [products, setProducts] = useState([]);
  const [filter, setFilter] = useState("All");
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState("newest");
  const [page, setPage] = useState(1);
  const [modalProduct, setModalProduct] = useState(null);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Load user data from localStorage
  useEffect(() => {
    const userLoggedIn = localStorage.getItem("userLoggedIn");
    if (userLoggedIn) {
      setUser(JSON.parse(userLoggedIn));
    }
  }, []);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        const response = await fetch("http://localhost:5000/products");
        if (!response.ok) throw new Error("Failed to fetch products");
        const data = await response.json();
        
        const normalized = data.map((p) => ({
          ...p,
          category: (p.category || "").trim(),
        }));
        setProducts(normalized);
        
        // Store products in localStorage for offline access
        localStorage.setItem("products", JSON.stringify(normalized));
      } catch (err) {
        console.error("Error fetching products:", err);
        // Fallback to localStorage if API fails
        const cachedProducts = localStorage.getItem("products");
        if (cachedProducts) {
          const normalized = JSON.parse(cachedProducts).map((p) => ({
            ...p,
            category: (p.category || "").trim(),
          }));
          setProducts(normalized);
          toast.info("Using cached products data");
        }
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  // Enhanced product action handler that syncs with both localStorage and API
  const handleProductAction = async (action, product) => {
    if (!user) {
      toast.info("Please login to add items to cart or wishlist");
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

  const processed = useMemo(() => {
    let list = [...products];

    if (filter !== "All") {
      list = list.filter(
        (p) => (p.category || "").toLowerCase() === filter.toLowerCase()
      );
    }

    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter((p) => (p.name || "").toLowerCase().includes(q));
    }

    if (sort === "price-asc") {
      list.sort((a, b) => (a.price) - (b.price));
    } else if (sort === "price-desc") {
      list.sort((a, b) => (b.price) - (a.price));
    } else {
      list.sort((a, b) => (b.id) - (a.id));
    }

    return list;
  }, [products, filter, search, sort]);

  // Pagination: show ALL if "All" selected
  const totalPages =
    filter === "All"
      ? 1
      : Math.max(1, Math.ceil(processed.length / PAGE_SIZE));

  const pageProducts =
    filter === "All"
      ? processed
      : processed.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const categories = useMemo(() => {
    const set = new Set(
      products.map((p) => (p.category || "").trim()).filter(Boolean)
    );
    return ["All", ...Array.from(set)];
  }, [products]);

  if (loading) {
    return (
      <div className="w-full px-4 md:px-12 pt-32 pb-12">
        <div className="max-w-7xl mx-auto text-center">
          <div className="animate-pulse text-[#7B4B3A]">Loading products...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full px-4 md:px-12 pt-32 pb-12">
      <div className="max-w-7xl mx-auto">
        <h1
          className="text-4xl font-bold text-center mb-10"
          style={{ color: "#7B4B3A" }}
        >
          Shop All Accessories
        </h1>

        {/* Controls Row */}
        <div className="flex flex-col md:flex-row gap-6 items-center justify-between mb-10">
          {/* Search Box */}
          <input
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            placeholder="🔍 Search for accessories..."
            className="w-full md:w-80 px-4 py-3 rounded-lg shadow-sm border border-[#B88A6F] bg-[#F5F0E1] text-[#5C362C] focus:outline-none focus:ring-2 focus:ring-[#7B4B3A] placeholder-[#7B4B3A]"
          />

          {/* Categories */}
          <div className="flex flex-wrap justify-center gap-3">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => {
                  setFilter(cat);
                  setPage(1);
                }}
                className={`px-5 py-2 rounded-full font-semibold transition duration-200 ${
                  filter === cat
                    ? "bg-[#7B4B3A] text-[#F5F0E1] shadow-md"
                    : "bg-[#B88A6F] text-[#F5F0E1] hover:bg-[#A36A50]"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Sort Dropdown */}
          <select
            value={sort}
            onChange={(e) => setSort(e.target.value)}
            className="px-4 py-3 rounded-lg border border-[#B88A6F] bg-[#F5F0E1] text-[#5C362C] focus:outline-none focus:ring-2 focus:ring-[#7B4B3A]"
          >
            <option value="newest">🆕 Newest</option>
            <option value="price-asc">⬇️ Price: Low → High</option>
            <option value="price-desc">⬆️ Price: High → Low</option>
          </select>
        </div>

        {/* Product Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8">
          {pageProducts.length > 0 ? (
            pageProducts.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                isNewCustomer={true}
                onQuickView={() => setModalProduct(product)}
                onAddToCart={(product) => handleProductAction('addToCart', product)}
                onAddToWishlist={(product) => handleProductAction('addToWishlist', product)}
                user={user}
              />
            ))
          ) : (
            <div className="col-span-full text-center p-8">
              <p className="text-lg text-[#7B4B3A]">No products found.</p>
            </div>
          )}
        </div>

        {/* Pagination */}
        {filter !== "All" && totalPages > 1 && (
          <div className="flex items-center justify-center gap-3 mt-10">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="px-4 py-2 rounded bg-[#F5F0E1] border border-[#B88A6F] disabled:opacity-50 text-[#5C362C] hover:bg-[#E8D9C5] transition-colors"
            >
              Prev
            </button>

            {Array.from({ length: totalPages }).map((_, i) => {
              const num = i + 1;
              return (
                <button
                  key={num}
                  onClick={() => setPage(num)}
                  className={`px-4 py-2 rounded transition-colors ${
                    page === num
                      ? "bg-[#7B4B3A] text-[#F5F0E1]"
                      : "bg-[#F5F0E1] border border-[#B88A6F] text-[#5C362C] hover:bg-[#E8D9C5]"
                  }`}
                >
                  {num}
                </button>
              );
            })}

            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="px-4 py-2 rounded bg-[#F5F0E1] border border-[#B88A6F] disabled:opacity-50 text-[#5C362C] hover:bg-[#E8D9C5] transition-colors"
            >
              Next
            </button>
          </div>
        )}
      </div>

      {modalProduct && (
        <ProductModal
          product={modalProduct}
          onClose={() => setModalProduct(null)}
          onAddToCart={(product) => handleProductAction('addToCart', product)}
          onAddToWishlist={(product) => handleProductAction('addToWishlist', product)}
          user={user}
        />
      )}
    </div>
  );
}