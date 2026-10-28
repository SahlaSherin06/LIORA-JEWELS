const User = require("../models/User");
const Product = require("../models/Product");

const addToCart = async (req, res) => {
  try {
    const { productId, quantity } = req.body;
    
    // Find the product to make sure it actually exists in our database
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    // Find the currently logged-in user
    const user = await User.findById(req.user._id);

    // Check if this product is already in their cart
    const existingItem = user.cart.find(item => item.product === productId || item.id === productId);
    
    const requestedQuantity = quantity || 1;
    const currentStock = product.stock || 0;
    
    if (existingItem) {
      const newQuantity = existingItem.quantity + requestedQuantity;
      if (newQuantity > currentStock) {
        return res.status(400).json({ message: `Cannot add more. Only ${currentStock} in stock.` });
      }
      // If it's already there, just increase the quantity
      existingItem.quantity = newQuantity;
    } else {
      if (requestedQuantity > currentStock) {
        return res.status(400).json({ message: `Cannot add. Only ${currentStock} in stock.` });
      }
      // If it's new, push a new object into the cart array
      user.cart.push({
        id: productId, 
        product: productId,
        name: product.name,
        price: product.price,
        image: product.image || "",
        category: product.category || "",
        quantity: quantity || 1
      });
    }

    user.markModified('cart'); 
    await user.save();
    
    res.json(user.cart);
  } catch (error) {
    console.error("Cart Error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Add an item to the user's wishlist
const addToWishlist = async (req, res) => {
  try {
    const { productId } = req.body;
    
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    const user = await User.findById(req.user._id);

    // Check if it's already in the wishlist
    const existingItem = user.wishlist.find(item => item.product === productId);
    
    if (existingItem) {
      return res.status(400).json({ message: "Product is already in your wishlist" });
    } else {
      user.wishlist.push({
        id: productId,
        product: productId,
        name: product.name,
        price: product.price,
        image: product.image || ""
      });
    }

    user.markModified('wishlist'); 
    await user.save();
    
    res.json(user.wishlist);
  } catch (error) {
    console.error("Wishlist Error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

const clearCart = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    user.cart = [];
    user.markModified('cart');
    await user.save();
    res.json(user.cart);
  } catch (error) {
    res.status(500).json({ message: "Server error clearing cart" });
  }
};

const removeFromCart = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    user.cart = user.cart.filter(item => (item.product || item.id) !== req.params.productId);
    user.markModified('cart');
    await user.save();
    res.json(user.cart);
  } catch (error) {
    res.status(500).json({ message: "Server error removing from cart" });
  }
};

const updateCartQuantity = async (req, res) => {
  try {
    const { quantity } = req.body;
    const user = await User.findById(req.user._id);
    const item = user.cart.find(item => (item.product || item.id) === req.params.productId);
    
    if (item) {
      const product = await Product.findById(req.params.productId);
      if (!product) {
        return res.status(404).json({ message: "Product no longer exists" });
      }
      const currentStock = product.stock || 0;
      if (quantity > currentStock) {
        return res.status(400).json({ message: `Cannot update. Only ${currentStock} in stock.` });
      }
      
      item.quantity = quantity;
      user.markModified('cart');
      await user.save();
    }
    res.json(user.cart);
  } catch (error) {
    res.status(500).json({ message: "Server error updating cart" });
  }
};

const removeFromWishlist = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    user.wishlist = user.wishlist.filter(item => (item.product || item.id) !== req.params.productId);
    user.markModified('wishlist');
    await user.save();
    res.json(user.wishlist);
  } catch (error) {
    res.status(500).json({ message: "Server error removing from wishlist" });
  }
};

const getCartDetails = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    const cart = user.cart || [];
    
    // Optimized single query to get all products in cart
    const productIds = cart.map(item => item.product || item.id);
    const products = await Product.find({ _id: { $in: productIds } });
    
    // Map latest stock and price
    const updatedCart = cart.map(item => {
      const dbProduct = products.find(p => p._id.toString() === (item.product || item.id).toString());
      return {
        ...item,
        price: dbProduct ? dbProduct.price : item.price,
        image: dbProduct ? (dbProduct.image || item.image) : item.image,
        currentStock: dbProduct ? (dbProduct.stock || 0) : 0
      };
    });
    
    res.json(updatedCart);
  } catch (error) {
    console.error("Cart Details Error:", error);
    res.status(500).json({ message: "Server error fetching cart details" });
  }
};

module.exports = {
  addToCart,
  clearCart,
  removeFromCart,
  updateCartQuantity,
  addToWishlist,
  removeFromWishlist,
  getCartDetails
};
