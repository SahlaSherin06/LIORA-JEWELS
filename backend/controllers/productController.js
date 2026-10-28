const Product = require("../models/Product");

// Get all products
const getProducts = async (req, res) => {
  try {
    const { search, category, sort, page, limit } = req.query;

    let query = { isDeleted: { $ne: true } };
    if (category && category !== "All") {
      query.category = { $regex: new RegExp(`^${category}$`, "i") };
    }
    if (search) {
      query.name = { $regex: new RegExp(search, "i") };
    }

    let sortOptions = {};
    if (sort === "price-asc") sortOptions = { price: 1, _id: 1 };
    else if (sort === "price-desc") sortOptions = { price: -1, _id: -1 };
    else sortOptions = { createdAt: -1, _id: -1 }; // stable sort

    if (page && limit) {
      // Pagination requested
      const pageNum = parseInt(page);
      const limitNum = parseInt(limit);
      const skip = (pageNum - 1) * limitNum;

      const products = await Product.find(query).sort(sortOptions).skip(skip).limit(limitNum);
      const totalProducts = await Product.countDocuments(query);
      const totalPages = Math.max(1, Math.ceil(totalProducts / limitNum));

      return res.json({ products, totalPages, totalProducts });
    } else {
      // No pagination, return all matching products as array (for backward compatibility)
      const products = await Product.find(query).sort(sortOptions);
      return res.json(products);
    }
  } catch (error) {
    res.status(500).json({ message: "Server Error" });
  }
};

// Get single product
const getProductById = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (product && product.isDeleted !== true) {
      res.json(product);
    } else {
      res.status(404).json({ message: "Product not found" });
    }
  } catch (error) {
    res.status(500).json({ message: "Server Error" });
  }
};

// Get all unique categories
const getCategories = async (req, res) => {
  try {
    const categories = await Product.distinct("category", { isDeleted: { $ne: true } });
    const cleanCategories = Array.from(new Set(categories.map(c => (c || "").trim()).filter(Boolean)));
    res.json(cleanCategories);
  } catch (error) {
    res.status(500).json({ message: "Server Error" });
  }
};

module.exports = {
  getProducts,
  getProductById,
  getCategories
};
