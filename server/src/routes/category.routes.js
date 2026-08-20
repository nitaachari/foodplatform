const express = require("express");

const router = express.Router();

const {
    createCategory,
    getCategoriesByRestaurant,
    updateCategory,
    deleteCategory
} = require("../controllers/category.controller");

const protect = require("../middleware/auth.middleware");
const authorize = require("../middleware/role.middleware");

// Public route
// Get categories of a restaurant

router.get("/restaurant/:restaurantId", getCategoriesByRestaurant);

// Restaurant owner routes

router.post("/", protect, authorize("restaurant"), createCategory);

router.patch("/:id", protect, authorize("restaurant"), updateCategory);

router.delete("/:id", protect, authorize("restaurant"), deleteCategory);

module.exports = router;
