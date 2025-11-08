

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
    if (userLoggedIn) setUser(JSON.parse(userLoggedIn));
  }, []);

  // Fetch products
  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      try {
        const res = await fetch("http://localhost:5000/products");
        if (!res.ok) throw new Error("Failed to fetch products");
        const data = (await res.json()).map(p => ({ ...p, category: (p.category || "").trim() }));
        setProducts(data);
        localStorage.setItem("products", JSON.stringify(data));
      } catch {
        const cached = localStorage.getItem("products");
        if (cached) {
          setProducts(JSON.parse(cached).map(p => ({ ...p, category: (p.category || "").trim() })));
          toast.info("Using cached products");
        }
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, []);

  // Cart/Wishlist handler
  const handleProductAction = async (action, product) => {
    if (!user) {
      toast.info("Please login to add items to cart or wishlist");
      return;
    }

    try {
      const key = action === "addToCart" ? `cart_${user.id}` : `wishlist_${user.id}`;
      const currentData = JSON.parse(localStorage.getItem(key) || "[]");

      let updatedData;
      if (action === "addToCart") {
        const exists = currentData.find(p => p.id === product.id);
        updatedData = exists
          ? currentData.map(p => p.id === product.id ? { ...p, quantity: (p.quantity || 1) + 1 } : p)
          : [...currentData, { ...product, quantity: 1 }];
        toast.success("Added to cart!");
      } else {
        if (currentData.some(p => p.id === product.id)) {
          toast.info("Already in wishlist");
          return;
        }
        updatedData = [...currentData, product];
        toast.success("Added to wishlist!");
      }

      localStorage.setItem(key, JSON.stringify(updatedData));

      // Sync with API
      await fetch(`http://localhost:5000/users/${user.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ [action === "addToCart" ? "cart" : "wishlist"]: updatedData })
      });

      window.dispatchEvent(new Event("cartUpdated"));
      window.dispatchEvent(new Event("wishlistUpdated"));

    } catch {
      toast.error("Failed to update. Try again.");
    }
  };

  // Filter, search, sort
  const processed = useMemo(() => {
    let list = [...products];
    if (filter !== "All") list = list.filter(p => (p.category || "").toLowerCase() === filter.toLowerCase());

    if (search.trim()) list = list.filter(p => (p.name || "").toLowerCase().includes(search.toLowerCase()));

    if (sort === "price-asc") list.sort((a, b) => a.price - b.price);
    else if (sort === "price-desc") list.sort((a, b) => b.price - a.price);
    else list.sort((a, b) => b.id - a.id);
    
    return list;
  }, [products, filter, search, sort]);

  const totalPages = filter === "All" ? 1 : Math.max(1, Math.ceil(processed.length / PAGE_SIZE));
  const pageProducts = filter === "All" ? processed : processed.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const categories = useMemo(() => ["All", ...Array.from(new Set(products.map(p => (p.category || "").trim()).filter(Boolean)))], [products]);

  if (loading) return <div className="w-full px-4 md:px-12 pt-32 pb-12 text-center text-[#7B4B3A] animate-pulse">Loading products...</div>;

  return (
    <div className="w-full px-4 md:px-12 pt-32 pb-12">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-4xl font-bold text-center mb-10" style={{ color: "#7B4B3A" }}>Shop All Accessories</h1>

        {/* Controls */}
        <div className="flex flex-col md:flex-row gap-6 items-center justify-between mb-10">
          <input
            value={search}
            onChange={e => { setSearch(e.target.value); setPage(1); }}
            placeholder="🔍 Search for accessories..."
            className="w-full md:w-80 px-4 py-3 rounded-lg shadow-sm border border-[#B88A6F] bg-[#F5F0E1] text-[#5C362C] focus:outline-none focus:ring-2 focus:ring-[#7B4B3A] placeholder-[#7B4B3A]"
          />
          <div className="flex flex-wrap justify-center gap-3">
            {categories.map(cat => (
              <button
                key={cat}
                onClick={() => { setFilter(cat); setPage(1); }}
                className={`px-5 py-2 rounded-full font-semibold transition duration-200 ${filter === cat ? "bg-[#7B4B3A] text-[#F5F0E1] shadow-md" : "bg-[#B88A6F] text-[#F5F0E1] hover:bg-[#A36A50]"}`}
              >
                {cat}
              </button>
            ))}
          </div>
          <select
            value={sort}
            onChange={e => setSort(e.target.value)}
            className="px-4 py-3 rounded-lg border border-[#B88A6F] bg-[#F5F0E1] text-[#5C362C] focus:outline-none focus:ring-2 focus:ring-[#7B4B3A]"
          >
            <option value="newest">🆕 Newest</option>
            <option value="price-asc">⬇️ Price: Low → High</option>
            <option value="price-desc">⬆️ Price: High → Low</option>
          </select>
        </div>

        {/* Product Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8">
          {pageProducts.length ? pageProducts.map(product => (
            <ProductCard
              key={product.id}
              product={product}
              isNewCustomer={true}
              onQuickView={() => setModalProduct(product)}
              onAddToCart={() => handleProductAction('addToCart', product)}
              onAddToWishlist={() => handleProductAction('addToWishlist', product)}
              user={user}
            />
          )) : <div className="col-span-full text-center p-8 text-[#7B4B3A]">No products found.</div>}
        </div>

        {/* Pagination */}
        {filter !== "All" && totalPages > 1 && (
          <div className="flex items-center justify-center gap-3 mt-10">
            <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} className="px-4 py-2 rounded bg-[#F5F0E1] border border-[#B88A6F] disabled:opacity-50 text-[#5C362C] hover:bg-[#E8D9C5] transition-colors">Prev</button>
            {Array.from({ length: totalPages }).map((_, i) => (
              <button key={i} onClick={() => setPage(i+1)} className={`px-4 py-2 rounded transition-colors ${page === i+1 ? "bg-[#7B4B3A] text-[#F5F0E1]" : "bg-[#F5F0E1] border border-[#B88A6F] text-[#5C362C] hover:bg-[#E8D9C5]"}`}>
                {i+1}
              </button>
            ))}
            <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages} className="px-4 py-2 rounded bg-[#F5F0E1] border border-[#B88A6F] disabled:opacity-50 text-[#5C362C] hover:bg-[#E8D9C5] transition-colors">Next</button>
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
