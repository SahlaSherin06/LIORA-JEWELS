const { z } = require("zod");

// User Registration Schema
const registerSchema = z.object({
  firstName: z.string().min(2, "First name must be at least 2 characters").max(50),
  lastName: z.string().min(1, "Last name is required").max(50),
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

// User Login Schema
const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
});

// Product Creation/Update Schema
const productSchema = z.object({
  name: z.string().min(2, "Product name must be at least 2 characters"),
  price: z.number().positive("Price must be greater than 0"),
  category: z.string().min(1, "Category is required"),
  image: z.string().url("Invalid image URL").optional().or(z.literal("")),
  description: z.string().optional(),
  stock: z.number().int().min(0, "Stock cannot be negative").optional(),
});

// Add to Cart / Update Cart Schema
const cartItemSchema = z.object({
  productId: z.string().optional(), // For addToCart
  quantity: z.number().int().positive("Quantity must be at least 1").optional(), // Optional since default is 1
});

// Create Order Schema
const createOrderSchema = z.object({
  items: z.array(z.object({
    id: z.string().optional(),
    product: z.string().optional(),
    name: z.string(),
    price: z.number().positive(),
    quantity: z.number().int().positive(),
    image: z.string().optional()
  })).min(1, "Order must contain at least one item"),
  total: z.number().positive("Total must be greater than 0"),
  shippingInfo: z.object({
    address: z.string().min(5, "Address must be at least 5 characters"),
    city: z.string().optional(),
    postalCode: z.string().optional(),
    country: z.string().optional(),
    phone: z.string().optional(),
    email: z.string().email("Invalid email address").optional(),
  }).optional()
});

module.exports = {
  registerSchema,
  loginSchema,
  productSchema,
  cartItemSchema,
  createOrderSchema
};
