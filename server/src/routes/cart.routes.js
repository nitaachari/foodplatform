const express = require("express");

const router = express.Router();

const {
    addToCart,
    getCart,
    updateQuantity,
    removeItem,
    clearCart
} = require("../controllers/cart.controller");

const protect = require("../middleware/auth.middleware");

// ===============================
// Cart Routes
// ===============================

// Add item

router.post("/", protect, addToCart);

// Get cart

router.get("/", protect, getCart);

// Update quantity

router.patch("/item/:itemId", protect, updateQuantity);

// Remove item

router.delete("/item/:itemId", protect, removeItem);

// Clear cart

router.delete("/", protect, clearCart);

module.exports = router;
