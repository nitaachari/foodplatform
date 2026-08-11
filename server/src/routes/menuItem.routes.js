const express = require("express");

const router = express.Router();



const {
    createMenuItem,
    getMenuByRestaurant,
    getMenuByCategory,
    updateMenuItem,
    deleteMenuItem
}
=
require("../controllers/menuItem.controller");



const protect=require("../middleware/auth.middleware");
const authorize = require("../middleware/role.middleware");





// ===============================
// Public Routes
// ===============================


// Get all menu items of restaurant

router.get(
    "/restaurant/:restaurantId",
    getMenuByRestaurant
);



// Get menu items by category

router.get(
    "/category/:categoryId",
    getMenuByCategory
);







// ===============================
// Restaurant Owner Routes
// ===============================



// Create menu item

router.post(
    "/",
    protect,
    authorize("restaurant"),
    createMenuItem
);



// Update menu item

router.patch(
    "/:id",
    protect,
    authorize("restaurant"),
    updateMenuItem
);



// Delete menu item

router.delete(
    "/:id",
    protect,
    authorize("restaurant"),
    deleteMenuItem
);





module.exports = router;