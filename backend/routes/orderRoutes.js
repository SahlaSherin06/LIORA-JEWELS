const express = require("express");
const router = express.Router();
const { createOrder, getUserOrders } = require("../controllers/orderController");
const authMiddleware = require("../middleware/authMiddleware");
const asyncHandler = require("../middleware/asyncHandler");
const validate = require("../middleware/validate");
const { createOrderSchema } = require("../validations/schemas");

// Both of these require the user to be logged in!
router.post("/", authMiddleware, validate(createOrderSchema), asyncHandler(createOrder));
router.get("/", authMiddleware, asyncHandler(getUserOrders));

module.exports = router;
