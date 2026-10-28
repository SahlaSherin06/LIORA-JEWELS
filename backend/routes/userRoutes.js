const express = require("express");
const router = express.Router();
const { addToCart, clearCart, removeFromCart, updateCartQuantity, addToWishlist, removeFromWishlist, getCartDetails } = require("../controllers/userController");
const authMiddleware = require("../middleware/authMiddleware");
const asyncHandler = require("../middleware/asyncHandler");
const validate = require("../middleware/validate");
const { cartItemSchema } = require("../validations/schemas");

// Protected Routes
router.use(authMiddleware);

// Cart
router.get("/cart", asyncHandler(getCartDetails));
router.post("/cart", validate(cartItemSchema), asyncHandler(addToCart));
router.delete("/cart", asyncHandler(clearCart));
router.delete("/cart/:productId", asyncHandler(removeFromCart));
router.put("/cart/:productId", validate(cartItemSchema), asyncHandler(updateCartQuantity));

// Wishlist
router.post("/wishlist", asyncHandler(addToWishlist));
router.delete("/wishlist/:productId", asyncHandler(removeFromWishlist));

module.exports = router;
