const express = require("express");
const router = express.Router();
const { 
  getProducts, 
  getProductById, 
  getCategories
} = require("../controllers/productController");
const asyncHandler = require("../middleware/asyncHandler");

// Public Routes
router.get("/categories", asyncHandler(getCategories));
router.get("/", asyncHandler(getProducts));
router.get("/:id", asyncHandler(getProductById));

module.exports = router;
