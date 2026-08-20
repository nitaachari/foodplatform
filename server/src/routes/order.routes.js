const express = require("express");

const router = express.Router();

const {
    createOrder,
    getCustomerOrders,
    getOrderById,
    cancelOrder,
    getRestaurantOrders,
    updateOrderStatus,
    assignDeliveryPartner,
    updateDeliveryStatus,
    getAvailableOrders,
    getMyDeliveries
} = require("../controllers/order.controller");

const protect = require("../middleware/auth.middleware");
const authorize = require("../middleware/role.middleware");

// ======================================
// Customer Routes
// ======================================

// Create order

router.post("/", protect, authorize("customer"), createOrder);

// My orders

router.get("/my", protect, authorize("customer"), getCustomerOrders);

// Restaurant orders
// NOTE: must be registered before "/:id" below -- Express matches routes in
// registration order, and "/:id" would otherwise treat "restaurant" as the
// :id param and crash on the ObjectId cast.

router.get("/restaurant", protect, authorize("restaurant"), getRestaurantOrders);

// ======================================
// Delivery Partner Browsing Routes
// NOTE: must also be registered before "/:id" for the same reason as
// "/restaurant" above -- otherwise Express treats "available"/"delivery"
// as the :id param.
// ======================================

// Orders ready for pickup, not yet claimed by any delivery partner

router.get("/available", protect, authorize("delivery"), getAvailableOrders);

// Orders (current + past) assigned to the logged-in delivery partner

router.get("/delivery/my", protect, authorize("delivery"), getMyDeliveries);

// Single order

router.get("/:id", protect, getOrderById);

// Cancel order

router.patch("/:id/cancel", protect, authorize("customer"), cancelOrder);

// ======================================
// Restaurant Routes
// ======================================

// Update status

router.patch("/:id/status", protect, authorize("restaurant"), updateOrderStatus);

// ======================================
// Delivery Partner Routes
// ======================================

// Assign delivery partner

router.patch("/:id/assign", protect, authorize("delivery"), assignDeliveryPartner);

// Update delivery status

router.patch(
    "/:id/delivery-status",
    protect,
    authorize("delivery"),
    updateDeliveryStatus
);

module.exports = router;
