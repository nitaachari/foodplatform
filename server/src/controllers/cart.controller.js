const cartService = require("../services/cart.service");

// =====================================
// Add Item To Cart
// =====================================

const addToCart = async (req, res) => {
    try {
        const cart = await cartService.addToCart(
            req.user._id,
            req.body
        );

        res.status(200).json({
            success: true,
            message: "Item added to cart",
            cart
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            message: error.message
        });
    }
};

// =====================================
// Get Cart
// =====================================

const getCart = async (req, res) => {
    try {
        const cart = await cartService.getCart(req.user._id);

        res.status(200).json({
            success: true,
            cart
        });
    } catch (error) {
        res.status(404).json({
            success: false,
            message: error.message
        });
    }
};

// =====================================
// Update Quantity
// =====================================

const updateQuantity = async (req, res) => {
    try {
        const cart = await cartService.updateQuantity(
            req.user._id,
            req.params.itemId,
            req.body.quantity
        );

        res.status(200).json({
            success: true,
            message: "Quantity updated",
            cart
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            message: error.message
        });
    }
};

// =====================================
// Remove Item
// =====================================

const removeItem = async (req, res) => {
    try {
        const cart = await cartService.removeItem(
            req.user._id,
            req.params.itemId
        );

        res.status(200).json({
            success: true,
            message: "Item removed from cart",
            cart
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            message: error.message
        });
    }
};

// =====================================
// Clear Cart
// =====================================

const clearCart = async (req, res) => {
    try {
        const cart = await cartService.clearCart(req.user._id);

        res.status(200).json({
            success: true,
            message: "Cart cleared",
            cart
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            message: error.message
        });
    }
};

module.exports = {
    addToCart,
    getCart,
    updateQuantity,
    removeItem,
    clearCart
};
