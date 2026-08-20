const express = require("express");

const router = express.Router();

const {
    createPayment,
    verifyPayment,
    getPaymentById,
    getPaymentByOrderId,
    confirmPayment
} = require("../controllers/payment.controller");

const protect = require("../middleware/auth.middleware");
const authorize = require("../middleware/role.middleware");

// ======================================
// Customer Routes
// ======================================

// Create Payment
router.post(
    "/create",
    protect,
    authorize("customer"),
    createPayment
);
router.post("/confirm", protect, authorize("customer"), confirmPayment);

// Verify Payment
router.post(
    "/verify",
    protect,
    authorize("customer"),
    verifyPayment
);

// Get Payment By Id
router.get(
    "/:id",
    protect,
    authorize("customer"),
    getPaymentById
);

// Get All Payment Attempts For Order
router.get(
    "/order/:orderId",
    protect,
    authorize("customer"),
    getPaymentByOrderId
);

module.exports = router;
