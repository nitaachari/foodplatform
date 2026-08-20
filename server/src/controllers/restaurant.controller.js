const restaurantService = require("../services/restaurant.service");

const createRestaurant = async (req, res) => {
    try {
        const restaurant = await restaurantService.createRestaurant(
            req.body,
            req.user._id
        );

        res.status(201).json({
            success: true,
            message: "Restaurant created successfully",
            restaurant
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            message: error.message
        });
    }
};
const getMyRestaurant = async (req, res) => {
    try {
        const restaurant = await restaurantService.getRestaurantByOwner(req.user._id);

        res.status(200).json({
            success: true,
            restaurant
        });
    } catch (error) {
        res.status(404).json({
            success: false,
            message: error.message
        });
    }
};

const getAllRestaurants = async (req, res) => {
    try {
        const restaurants = await restaurantService.getAllRestaurants();

        res.status(200).json({
            success: true,
            restaurants
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

const getRestaurantById = async (req, res) => {
    try {
        const restaurant = await restaurantService.getRestaurantById(req.params.id);

        res.status(200).json({
            success: true,
            restaurant
        });
    } catch (error) {
        res.status(404).json({
            success: false,
            message: error.message
        });
    }
};

const updateRestaurant = async (req, res) => {
    try {
        const restaurant = await restaurantService.updateRestaurant(
            req.params.id,
            req.user._id,
            req.body
        );

        res.status(200).json({
            success: true,
            message: "Restaurant updated successfully",
            restaurant
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            message: error.message
        });
    }
};

const deleteRestaurant = async (req, res) => {
    try {
        await restaurantService.deleteRestaurant(req.params.id, req.user._id);

        res.status(200).json({
            success: true,
            message: "Restaurant deleted successfully"
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            message: error.message
        });
    }
};

module.exports = {
    createRestaurant,
    getAllRestaurants,
    getRestaurantById,
    getMyRestaurant,
    updateRestaurant,
    deleteRestaurant
};
