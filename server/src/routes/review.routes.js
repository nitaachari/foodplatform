const express = require("express");

const router = express.Router();

const {
    createReview,
    getReviewsByRestaurant,
    getReviewsByMenuItem,
    replyToReview
} = require("../controllers/review.controller");

const protect = require("../middleware/auth.middleware");

const authorize = require("../middleware/role.middleware");

// ===============================
// Public Routes
// ===============================

router.get("/restaurant/:restaurantId", getReviewsByRestaurant);

router.get("/menu/:menuItemId", getReviewsByMenuItem);

// ===============================
// Customer Routes
// ===============================

router.post("/", protect, authorize("customer"), createReview);

// ===============================
// Restaurant Owner Routes
// ===============================

router.patch("/:id/reply", protect, authorize("restaurant"), replyToReview);

module.exports = router;
