import React, { useState, useEffect } from "react";
import Sidebar from "./Sidebar";
import { FaEdit, FaTrash, FaPlus, FaSearch, FaArrowLeft,FaArrowRight,FaBars,FaTimes} from "react-icons/fa";
import { toast } from 'react-toastify';
import ConfirmModal from "../Components/ConfirmModal";

const ManageProduct = () => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [products, setProducts] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalProductsCount, setTotalProductsCount] = useState(0);
  const [searchTerm, setSearchTerm] = useState("");
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [showDeleted, setShowDeleted] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [confirmModalConfig, setConfirmModalConfig] = useState({
    isOpen: false,
    title: "",
    message: "",
    onConfirm: () => {},
    isDanger: true,
    confirmText: "Confirm"
  });
  const productsPerPage = 10;

  // Form state
  const [formData, setFormData] = useState({
    name: "",
    price: "",
    image: "",
    category: "",
    description: "",
    stock: 0,
  });

  // Check mobile screen
  useEffect(() => {
    const checkMobile = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
      // Auto-close sidebar on mobile
      if (mobile) {
        setSidebarOpen(false);
      }
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Fetch products from backend with search and pagination
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const url = showDeleted 
          ? `http://localhost:5000/api/admin/products/deleted?search=${searchTerm}&page=${currentPage}&limit=${productsPerPage}`
          : `http://localhost:5000/api/products?search=${searchTerm}&page=${currentPage}&limit=${productsPerPage}`;
          
        const res = await fetch(url, {
          credentials: showDeleted ? "include" : "same-origin"
        });
        
        if (!res.ok) throw new Error("Failed to fetch products");
        const data = await res.json();
        if (data.products) {
          setProducts(data.products);
          setTotalPages(data.totalPages || 1);
          setTotalProductsCount(data.totalProducts || 0);
        } else {
          setProducts(data);
          setTotalPages(1);
          setTotalProductsCount(data.length);
        }
      } catch (err) {
        console.error("Error fetching products:", err);
      }
    };
    
    const timeoutId = setTimeout(() => {
      fetchProducts();
    }, 400); // Debounce search
    
    return () => clearTimeout(timeoutId);
  }, [searchTerm, currentPage, showDeleted]);

  // When search or toggle changes, reset page to 1
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, showDeleted]);

  // Pagination calculations for text display
  const indexOfFirstProduct = (currentPage - 1) * productsPerPage;
  const indexOfLastProduct = Math.min(currentPage * productsPerPage, totalProductsCount);

  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  // Reset form
  const resetForm = () => {
    setFormData({
      name: "",
      price: "",
      image: "",
      category: "",
      description: "",
      stock: 0,
    });
    setEditingProduct(null);
    setShowAddForm(false);
  };

  // Add new product
  const handleAddProduct = async (e) => {
    e.preventDefault();
    try {
      const newProduct = {
        ...formData,
        price: parseFloat(formData.price),
        stock: parseInt(formData.stock),
        id: Date.now().toString()
      };

      const res = await fetch("http://localhost:5000/api/admin/products", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify(newProduct),
      });

      if (res.ok) {
        const createdProduct = await res.json();
        setProducts(prev => [...prev, createdProduct]);
        resetForm();
      }
    } catch (err) {
      console.error("Error adding product:", err);
    }
  };

  // Update product
  const handleUpdateProduct = async (e) => {
    e.preventDefault();
    try {
      const updatedProduct = {
        ...formData,
        price: parseFloat(formData.price),
        stock: parseInt(formData.stock),
        id: editingProduct.id
      };

      const res = await fetch(`http://localhost:5000/api/admin/products/${editingProduct.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify(updatedProduct),
      });

      if (res.ok) {
        setProducts(prev => 
          prev.map(p => p.id === editingProduct.id ? updatedProduct : p)
        );
        resetForm();
      }
    } catch (err) {
      console.error("Error updating product:", err);
    }
  };

  // Delete product
  const handleDeleteProduct = (productId) => {
    setConfirmModalConfig({
      isOpen: true,
      title: "Delete Product",
      message: "Are you sure you want to delete this product? It will be moved to the Trash Bin.",
      isDanger: true,
      confirmText: "Delete",
      onConfirm: async () => {
        try {
          const res = await fetch(`http://localhost:5000/api/admin/products/${productId}`, {
            method: "DELETE",
            credentials: "include"
          });

          if (res.ok) {
            setProducts(prev => prev.filter(p => p.id !== productId));
            toast.success("Product deleted successfully!");
          } else {
            toast.error("Failed to delete product.");
          }
        } catch (err) {
          console.error("Error deleting product:", err);
          toast.error("An error occurred while deleting.");
        }
      }
    });
  };

  // Restore product
  const handleRestoreProduct = (productId) => {
    setConfirmModalConfig({
      isOpen: true,
      title: "Restore Product",
      message: "Are you sure you want to restore this product to the active store?",
      isDanger: false,
      confirmText: "Restore",
      onConfirm: async () => {
        try {
          const res = await fetch(`http://localhost:5000/api/admin/products/${productId}/restore`, {
            method: "PATCH",
            credentials: "include"
          });

          if (res.ok) {
            setProducts(prev => prev.filter(p => p.id !== productId));
            toast.success("Product restored successfully!");
          } else {
            toast.error("Failed to restore product.");
          }
        } catch (err) {
          console.error("Error restoring product:", err);
          toast.error("An error occurred while restoring.");
        }
      }
    });
  };

  // Edit product - opens as modal
  const handleEditProduct = (product) => {
    setEditingProduct(product);
    setFormData({
      name: product.name,
      price: product.price.toString(),
      image: product.image,
      category: product.category || "",
      description: product.description || "",
      stock: product.stock || 0,
    });
    setShowAddForm(true);
  };

  return (
    <div className="flex min-h-screen bg-[#F5F0E1]">
      <ConfirmModal 
        isOpen={confirmModalConfig.isOpen}
        onClose={() => setConfirmModalConfig(prev => ({ ...prev, isOpen: false }))}
        onConfirm={confirmModalConfig.onConfirm}
        title={confirmModalConfig.title}
        message={confirmModalConfig.message}
        isDanger={confirmModalConfig.isDanger}
        confirmText={confirmModalConfig.confirmText}
      />
      {/* Sidebar */}
      <Sidebar isOpen={sidebarOpen} setIsOpen={setSidebarOpen} />
      
      {/* Mobile Overlay with background color */}
      {isMobile && sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Main Content */}
      <div className={`flex-1 transition-all duration-300 p-4 md:p-6 ${sidebarOpen && !isMobile ? 'lg:ml-64' : ''}`}>
        
        {/* Mobile Header with Toggle */}
        {isMobile && (
          <div className="flex items-center mb-6">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="p-2 rounded-lg bg-[#7B4B3A] text-[#F5F0E1] hover:bg-[#5C362C] transition-colors duration-200 mr-4"
            >
              <FaBars size={20} />
            </button>
            <h1 className="text-2xl font-bold" style={{ color: "#7B4B3A" }}>
              Manage Products
            </h1>
          </div>
        )}

        {/* Desktop Header */}
        {!isMobile && (
          <div className="mb-8">
            <h1 className="text-3xl font-bold" style={{ color: "#7B4B3A" }}>
              Manage Products
            </h1>
            <p className="text-[#5C362C] mt-2">Add, edit, and manage your product inventory</p>
          </div>
        )}

        {/* Search and Add Product Bar */}
        <div className="bg-white rounded-xl shadow-lg border border-[#7B4B3A]/30 p-4 mb-6">
          <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
            {/* Search Box */}
            <div className="relative flex-1 w-full sm:max-w-md">
              <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search products by name or category..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#7B4B3A] focus:border-transparent"
              />
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
              <button
                onClick={() => {
                  setShowDeleted(!showDeleted);
                  setCurrentPage(1);
                }}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors duration-200 w-full sm:w-auto justify-center ${
                  showDeleted 
                    ? "bg-red-100 text-red-700 hover:bg-red-200 border border-red-300" 
                    : "bg-[#EDE4D3] text-[#7B4B3A] hover:bg-[#D2B48C] border border-[#B88A6F]"
                }`}
              >
                {showDeleted ? "View Active" : "View Trash"}
              </button>
              
              <button
                onClick={() => {
                  resetForm();
                  setShowAddForm(true);
                }}
                className="flex items-center gap-2 bg-[#7B4B3A] text-[#F5F0E1] px-4 py-2 rounded-lg hover:bg-[#5C362C] transition-colors duration-200 w-full sm:w-auto justify-center"
              >
                <FaPlus />
                Add New Product
              </button>
            </div>
          </div>
        </div>

        {/* Products Table */}
        <div className="bg-white rounded-xl shadow-lg border border-[#7B4B3A]/30 overflow-hidden">
          <div className="px-4 py-3 font-semibold text-lg" style={{ backgroundColor: "#7B4B3A", color: "#F5F0E1" }}>
            Products ({totalProductsCount})
          </div>
          
          {products.length === 0 ? (
            <div className="p-8 text-center">
              <p className="text-gray-500 text-lg font-medium">No products found</p>
              <p className="text-gray-400 text-sm mt-1">
                {searchTerm ? "Try adjusting your search terms" : "Add your first product to get started"}
              </p>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-[#5C362C] uppercase tracking-wider">Product</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-[#5C362C] uppercase tracking-wider">Price</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-[#5C362C] uppercase tracking-wider">Stock</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-[#5C362C] uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {products.map((product) => (
                      <tr key={product.id} className="hover:bg-gray-100 transition">
                        <td className="px-4 py-4">
                          <div className="flex items-center">
                            <img 
                              src={product.image} 
                              alt={product.name}
                              className="w-10 h-10 sm:w-12 sm:h-12 object-cover rounded-lg mr-3"
                            />
                            <div>
                              <p className="font-medium text-gray-900 text-sm sm:text-base">{product.name}</p>
                              <p className="text-xs sm:text-sm text-gray-500">{product.category}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-4 text-gray-900 text-sm sm:text-base">₹{product.price}</td>
                        <td className="px-4 py-4">
                          <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                            product.stock > 10 ? 'bg-green-100 text-green-800' :
                            product.stock > 0 ? 'bg-yellow-100 text-yellow-800' :
                            'bg-red-100 text-red-800'
                          }`}>
                            {product.stock} in stock
                          </span>
                        </td>
                        <td className="px-4 py-4">
                          <div className="flex gap-2">
                            {showDeleted ? (
                              <button
                                onClick={() => handleRestoreProduct(product.id)}
                                className="px-3 py-1 bg-green-100 text-green-700 hover:bg-green-200 rounded-lg transition-colors text-sm font-medium border border-green-300"
                              >
                                Restore
                              </button>
                            ) : (
                              <>
                                <button
                                  onClick={() => handleEditProduct(product)}
                                  className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                  title="Edit Product"
                                >
                                  <FaEdit />
                                </button>
                                <button
                                  onClick={() => handleDeleteProduct(product.id)}
                                  className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                  title="Delete Product"
                                >
                                  <FaTrash />
                                </button>
                              </>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="px-4 py-4 border-t border-gray-200 flex flex-col sm:flex-row items-center justify-between gap-4">
                  <div className="text-sm text-gray-700">
                    Showing {indexOfFirstProduct + 1} to {indexOfLastProduct} of {totalProductsCount} products
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                      disabled={currentPage === 1}
                      className="p-2 rounded-lg border border-gray-300 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors"
                    >
                      <FaArrowLeft />
                    </button>
                    
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                      <button
                        key={page}
                        onClick={() => setCurrentPage(page)}
                        className={`px-3 py-2 rounded-lg border transition-colors ${
                          currentPage === page
                            ? 'bg-[#7B4B3A] text-[#F5F0E1] border-[#7B4B3A]'
                            : 'border-gray-300 hover:bg-gray-50'
                        }`}
                      >
                        {page}
                      </button>
                    ))}
                    
                    <button
                      onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                      disabled={currentPage === totalPages}
                      className="p-2 rounded-lg border border-gray-300 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors"
                    >
                      <FaArrowRight />
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* Modal for Add/Edit Product */}
      {showAddForm && (
        <div className="fixed inset-0 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#F5F0E1] rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b border-[#7B4B3A]">
              <h2 className="text-xl font-bold text-[#7B4B3A]">
                {editingProduct ? "Edit Product" : "Add New Product"}
              </h2>
              <button
                onClick={resetForm}
                className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
              >
                <FaTimes size={20} />
              </button>
            </div>
            
            <form 
              onSubmit={editingProduct ? handleUpdateProduct : handleAddProduct} 
              className="p-6"
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-[#5C362C] mb-2">Product Name</label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    required
                    className="w-full px-3 py-2 border border-[#B88A6F] bg-[#EDE4D3] text-[#7B4B3A] placeholder-[#7B4B3A]/60 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#7B4B3A]"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#5C362C] mb-2">Price (₹)</label>
                  <input
                    type="number"
                    name="price"
                    value={formData.price}
                    onChange={handleInputChange}
                    required
                    step="0.01"
                    min="0"
                    className="w-full px-3 py-2 border border-[#B88A6F] bg-[#EDE4D3] text-[#7B4B3A] placeholder-[#7B4B3A]/60 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#7B4B3A]"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#5C362C] mb-2">Image URL</label>
                  <input
                    type="url"
                    name="image"
                    value={formData.image}
                    onChange={handleInputChange}
                    required
                    className="w-full px-3 py-2 border border-[#B88A6F] bg-[#EDE4D3] text-[#7B4B3A] placeholder-[#7B4B3A]/60 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#7B4B3A]"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#5C362C] mb-2">Category</label>
                  <input
                    type="text"
                    name="category"
                    value={formData.category}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-[#B88A6F] bg-[#EDE4D3] text-[#7B4B3A] placeholder-[#7B4B3A]/60 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#7B4B3A]"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-[#5C362C] mb-2">Description</label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    rows="3"
                    className="w-full px-3 py-2 border border-[#B88A6F] bg-[#EDE4D3] text-[#7B4B3A] placeholder-[#7B4B3A]/60 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#7B4B3A]"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#5C362C] mb-2">Stock Quantity</label>
                  <input
                    type="number"
                    name="stock"
                    value={formData.stock}
                    onChange={handleInputChange}
                    min="0"
                    className="w-full px-3 py-2 border border-[#B88A6F] bg-[#EDE4D3] text-[#7B4B3A] placeholder-[#7B4B3A]/60 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#7B4B3A]"
                  />
                </div>
              </div>
              
              <div className="flex gap-4 justify-end mt-6 pt-4 border-t border-gray-200">
                <button
                  type="button"
                  onClick={resetForm}
                  className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors duration-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 bg-[#7B4B3A] text-[#F5F0E1] rounded-lg hover:bg-[#5C362C] transition-colors duration-200"
                >
                  {editingProduct ? "Update Product" : "Add Product"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ManageProduct;