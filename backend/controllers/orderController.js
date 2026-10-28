const Order = require("../models/Order");
const Product = require("../models/Product");

// Create a new order (Protected)
const createOrder = async (req, res) => {
  try {
    const { items, total, shippingInfo } = req.body;

    if (!items || items.length === 0) {
      return res.status(400).json({ message: "No order items" });
    }

    // Check stock for each item before processing
    for (const item of items) {
      const productId = item.product || item.id;
      const product = await Product.findById(productId);
      
      if (!product) {
        return res.status(404).json({ message: `Product ${item.name} not found in database.` });
      }
      
      const currentStock = product.stock || 0;
      if (currentStock < item.quantity) {
        return res.status(400).json({ 
          message: `Not enough stock for ${product.name}. Only ${currentStock} left in stock.` 
        });
      }
    }

    // If we reach here, all items are in stock. Deduct stock and calculate real total.
    let realTotal = 0;
    const finalItems = [];

    for (const item of items) {
      const productId = item.product || item.id;
      const product = await Product.findById(productId);
      
      const currentStock = product.stock || 0;
      product.stock = currentStock - item.quantity;
      await product.save();
      
      // Calculate real price
      const price = parseFloat((product.price || 0).toString().replace(/[^0-9.]/g, "")) || 0;
      realTotal += price * item.quantity;
      
      // Store the exact price the user bought it at
      finalItems.push({
        ...item,
        price: price
      });
    }

    // Create the order linking it to the logged in user
    const order = new Order({
      userId: req.user._id,
      userName: req.user.firstName + " " + req.user.lastName,
      items: finalItems,
      total: realTotal,
      shippingInfo
    });

    const createdOrder = await order.save();

    res.status(201).json(createdOrder);
  } catch (error) {
    console.error("Order Error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Get logged in user's orders (Protected)
const getUserOrders = async (req, res) => {
  try {
    const orders = await Order.find({ userId: req.user._id });
    res.json(orders);
  } catch (error) {
    console.error("Fetch Orders Error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

module.exports = {
  createOrder,
  getUserOrders
};
