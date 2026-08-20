const menuItemService = require("../services/menuItem.service");

// Create Menu Item

const createMenuItem = async (req, res) => {
    try {
        const menuItem = await menuItemService.createMenuItem(
            req.body,
            req.user._id
        );

        res.status(201).json({
            success: true,
            message: "Menu item created successfully",
            menuItem
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            message: error.message
        });
    }
};

// Get Complete Restaurant Menu

const getMenuByRestaurant = async (req, res) => {
    try {
        const menuItems = await menuItemService.getMenuByRestaurant(
            req.params.restaurantId
        );

        res.status(200).json({
            success: true,
            menuItems
        });
    } catch (error) {
        res.status(404).json({
            success: false,
            message: error.message
        });
    }
};

// Get Menu By Category

const getMenuByCategory = async (req, res) => {
    try {
        const menuItems = await menuItemService.getMenuByCategory(req.params.categoryId);

        res.status(200).json({
            success: true,
            menuItems
        });
    } catch (error) {
        res.status(404).json({
            success: false,
            message: error.message
        });
    }
};

// Update Menu Item

const updateMenuItem = async (req, res) => {
    try {
        const menuItem = await menuItemService.updateMenuItem(
            req.params.id,
            req.user._id,
            req.body
        );

        res.status(200).json({
            success: true,
            message: "Menu item updated successfully",
            menuItem
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            message: error.message
        });
    }
};

// Delete Menu Item

const deleteMenuItem = async (req, res) => {
    try {
        await menuItemService.deleteMenuItem(
            req.params.id,
            req.user._id
        );

        res.status(200).json({
            success: true,
            message: "Menu item deleted successfully"
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            message: error.message
        });
    }
};

module.exports = {
    createMenuItem,
    getMenuByRestaurant,
    getMenuByCategory,
    updateMenuItem,
    deleteMenuItem
};
