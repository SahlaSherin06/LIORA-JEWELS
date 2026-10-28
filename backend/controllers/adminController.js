const User = require("../models/User");
const Product = require("../models/Product");
const Order = require("../models/Order");

// ==========================================
// USER MANAGEMENT
// ==========================================

// Admin: Get all users
const getAllUsers = async (req, res) => {
  try {
    const { search, page, limit } = req.query;
    
    let query = {};
    if (search) {
      query = {
        $or: [
          { firstName: { $regex: new RegExp(search, "i") } },
          { lastName: { $regex: new RegExp(search, "i") } },
          { email: { $regex: new RegExp(search, "i") } },
          { phone: { $regex: new RegExp(search, "i") } }
        ]
      };
    }

    if (page && limit) {
      const pageNum = parseInt(page);
      const limitNum = parseInt(limit);
      const skip = (pageNum - 1) * limitNum;

      const users = await User.find(query).select('-password').sort({ createdAt: -1 }).skip(skip).limit(limitNum);
      const totalUsers = await User.countDocuments(query);
      const totalPages = Math.max(1, Math.ceil(totalUsers / limitNum));

      return res.json({ users, totalPages, totalUsers });
    } else {
      const users = await User.find(query).select('-password').sort({ createdAt: -1 });
      return res.json(users);
    }
  } catch (error) {
    console.error("Error fetching all users:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Admin: Update user status
const updateUserStatus = async (req, res) => {
  try {
    const { isActive } = req.body;
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    user.isActive = isActive;
    await user.save();
    res.json({ message: "User status updated", user: { id: user._id, isActive: user.isActive } });
  } catch (error) {
    console.error("Error updating user status:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Admin: Delete user
const deleteUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    await User.findByIdAndDelete(req.params.id);
    res.json({ message: "User deleted" });
  } catch (error) {
    console.error("Error deleting user:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// ==========================================
// ORDER MANAGEMENT
// ==========================================

// Admin: Get all orders
const getAllOrders = async (req, res) => {
  try {
    const { search, status, page, limit } = req.query;
    
    let query = {};
    
    if (search) {
      query = {
        $or: [
          { userName: { $regex: new RegExp(search, "i") } }
        ]
      };
      
      // If the search term is a valid ObjectId, search by ID too
      if (search.length === 24) {
        query.$or.push({ _id: search });
      }
    }
    
    if (status && status !== 'All') {
      query.status = status;
    }

    if (page && limit) {
      const pageNum = parseInt(page);
      const limitNum = parseInt(limit);
      const skip = (pageNum - 1) * limitNum;

      const orders = await Order.find(query).sort({ createdAt: -1 }).skip(skip).limit(limitNum);
      const totalOrders = await Order.countDocuments(query);
      const totalPages = Math.max(1, Math.ceil(totalOrders / limitNum));

      return res.json({ orders, totalPages, totalOrders });
    } else {
      const orders = await Order.find(query).sort({ createdAt: -1 });
      return res.json(orders);
    }
  } catch (error) {
    console.error("Fetch All Orders Error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Admin: Update order status
const updateOrderStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const order = await Order.findById(req.params.id);
    
    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    order.status = status;
    await order.save();

    res.json({ message: "Order status updated", order });
  } catch (error) {
    console.error("Update Order Status Error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// ==========================================
// PRODUCT MANAGEMENT
// ==========================================

// Admin: Create a product
const createProduct = async (req, res) => {
  try {
    const { name, price, category, image, description, stock, reviews, rating } = req.body;

    if (!name || !price || !category) {
      return res.status(400).json({ message: "Please provide name, price, and category" });
    }

    const product = new Product({
      name,
      price,
      category,
      image: image || "",
      description: description || "",
      stock: stock || 0,
      rating: rating || 0,
      reviews: reviews || []
    });

    const createdProduct = await product.save();
    res.status(201).json(createdProduct);
  } catch (error) {
    console.error("Create Product Error:", error);
    res.status(500).json({ message: "Server Error" });
  }
};

// Admin: Update a product
const updateProduct = async (req, res) => {
  try {
    const { name, price, category, image, description, stock } = req.body;
    
    const product = await Product.findById(req.params.id);
    
    if (product && product.isDeleted !== true) {
      product.name = name || product.name;
      product.price = price || product.price;
      product.category = category || product.category;
      product.image = image || product.image;
      product.description = description || product.description;
      product.stock = stock !== undefined ? stock : product.stock;
      
      const updatedProduct = await product.save();
      res.json(updatedProduct);
    } else {
      res.status(404).json({ message: "Product not found" });
    }
  } catch (error) {
    console.error("Update Product Error:", error);
    res.status(500).json({ message: "Server Error" });
  }
};

// Admin: Delete a product (Soft Delete)
const deleteProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product || product.isDeleted === true) {
      return res.status(404).json({ message: "Product not found" });
    }
    await Product.findByIdAndUpdate(req.params.id, { isDeleted: true });
    res.json({ message: "Product removed" });
  } catch (error) {
    console.error("Delete Product Error:", error);
    res.status(500).json({ message: "Server Error" });
  }
};

// Admin: Get all deleted products
const getDeletedProducts = async (req, res) => {
  try {
    const { search, page, limit } = req.query;
    
    let query = { isDeleted: true };
    if (search) {
      query.name = { $regex: new RegExp(search, "i") };
    }

    if (page && limit) {
      const pageNum = parseInt(page);
      const limitNum = parseInt(limit);
      const skip = (pageNum - 1) * limitNum;

      const products = await Product.find(query).sort({ createdAt: -1 }).skip(skip).limit(limitNum);
      const totalProducts = await Product.countDocuments(query);
      const totalPages = Math.max(1, Math.ceil(totalProducts / limitNum));

      return res.json({ products, totalPages, totalProducts });
    } else {
      const products = await Product.find(query).sort({ createdAt: -1 });
      return res.json(products);
    }
  } catch (error) {
    console.error("Fetch Deleted Products Error:", error);
    res.status(500).json({ message: "Server Error" });
  }
};

// Admin: Restore a soft-deleted product
const restoreProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product || product.isDeleted !== true) {
      return res.status(404).json({ message: "Deleted product not found" });
    }
    await Product.findByIdAndUpdate(req.params.id, { isDeleted: false });
    res.json({ message: "Product restored successfully" });
  } catch (error) {
    console.error("Restore Product Error:", error);
    res.status(500).json({ message: "Server Error" });
  }
};

module.exports = {
  getAllUsers,
  updateUserStatus,
  deleteUser,
  getAllOrders,
  updateOrderStatus,
  createProduct,
  updateProduct,
  deleteProduct,
  getDeletedProducts,
  restoreProduct
};
