const express = require("express");

const router = express.Router();

const {
    createRestaurant,
    getAllRestaurants,
    getRestaurantById,
    updateRestaurant,
    deleteRestaurant,
    getMyRestaurant
} = require("../controllers/restaurant.controller");

const protect = require("../middleware/auth.middleware");
const authorize = require("../middleware/role.middleware");

router.post("/", protect, authorize("restaurant"), createRestaurant);

router.get("/", getAllRestaurants);
router.get("/my-restaurant", protect, authorize("restaurant"), getMyRestaurant);

router.get("/:id", getRestaurantById);

router.patch("/:id", protect, authorize("restaurant"), updateRestaurant);

router.delete("/:id", protect, authorize("restaurant"), deleteRestaurant);

module.exports = router;
