const express = require("express");
const router = express.Router();
const { 
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
} = require("../controllers/adminController");
const authMiddleware = require("../middleware/authMiddleware");
const adminMiddleware = require("../middleware/adminMiddleware");
const asyncHandler = require("../middleware/asyncHandler");
const validate = require("../middleware/validate");
const { productSchema } = require("../validations/schemas");

// ALL routes here are protected by both authMiddleware AND adminMiddleware
router.use(authMiddleware, adminMiddleware);

// ==========================================
// USER MANAGEMENT ROUTES
// ==========================================
router.get("/users", asyncHandler(getAllUsers));
router.put("/users/:id", asyncHandler(updateUserStatus));
router.delete("/users/:id", asyncHandler(deleteUser));

// ==========================================
// ORDER MANAGEMENT ROUTES
// ==========================================
router.get("/orders", asyncHandler(getAllOrders));
router.put("/orders/:id/status", asyncHandler(updateOrderStatus));

// ==========================================
// PRODUCT MANAGEMENT ROUTES
// ==========================================
router.get("/products/deleted", asyncHandler(getDeletedProducts));
router.post("/products", validate(productSchema), asyncHandler(createProduct));
router.put("/products/:id", validate(productSchema), asyncHandler(updateProduct));
router.delete("/products/:id", asyncHandler(deleteProduct));
router.patch("/products/:id/restore", asyncHandler(restoreProduct));

module.exports = router;
