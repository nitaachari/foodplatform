const MenuItem = require("../models/MenuItem");
const Restaurant = require("../models/Restaurant");
const Category = require("../models/Category");

// Create Menu Item

const createMenuItem = async (menuData, ownerId) => {
    const {
        restaurantId,
        categoryId,
        name,
        description,
        images,
        price,
        discountPrice,
        foodType, //veg or non veg or egg
        ingredients,
        customizationOptions,
        preparationTime
    } = menuData;

    const normalizedName = name.trim().toLowerCase();

    // Check restaurant exists

    const restaurant = await Restaurant.findById(restaurantId);

    if (!restaurant) {
        throw new Error("Restaurant not found.");
    }

    // Verify ownership

    if (restaurant.owner.toString() !== ownerId.toString()) {
        throw new Error("You are not authorized to manage this restaurant.");
    }

    // Check category exists

    const category = await Category.findById(categoryId);

    if (!category) {
        throw new Error("Category not found.");
    }

    // Verify category belongs to restaurant

    if (category.restaurant.toString() !== restaurantId.toString()) {
        throw new Error("Category does not belong to this restaurant.");
    }

    //after validating if data is accurate and authorized and belongs to then create

    const menuItem = await MenuItem.create({
        restaurant: restaurantId,
        category: categoryId,
        name: normalizedName,
        description,
        images,
        price,
        discountPrice,
        foodType,
        ingredients,
        customizationOptions,
        preparationTime
    });

    return menuItem;
};

// Get complete restaurant menu

const getMenuByRestaurant = async (restaurantId) => {
    const restaurant = await Restaurant.findById(restaurantId);

    if (!restaurant) {
        throw new Error("Restaurant not found.");
    }

    const menuItems = await MenuItem.find({
        restaurant: restaurantId
    }).populate("category", "name");

    return menuItems;
};

// Get menu items by category

const getMenuByCategory = async (categoryId) => {
    const category = await Category.findById(categoryId);

    if (!category) {
        throw new Error("Category not found.");
    }

    const menuItems = await MenuItem.find({
        category: categoryId
    }).populate("category", "name");

    return menuItems;
};

// Update Menu Item

const updateMenuItem = async (menuItemId, ownerId, updateData) => {
    const menuItem = await MenuItem.findById(menuItemId);

    if (!menuItem) {
        throw new Error("Menu item not found.");
    }

    const restaurant = await Restaurant.findById(menuItem.restaurant);

    if (!restaurant) {
        throw new Error("Restaurant not found.");
    }

    if (restaurant.owner.toString() !== ownerId.toString()) {
        throw new Error("You are not authorized to update this menu item.");
    }

    const allowedFields = [
        //the fields that you can update

        "name",
        "description",
        "images",
        "price",
        "discountPrice",
        "foodType",
        "ingredients",
        "customizationOptions",
        "isAvailable",
        "preparationTime"
    ];

    allowedFields.forEach((field) => {
        if (updateData[field] !== undefined) {
            menuItem[field] = updateData[field]; //update it should not be undefined
        }
    });

    if (updateData.name) {
        //so that we dont add the not normalized name

        menuItem.name = updateData.name.trim().toLowerCase();
    }

    await menuItem.save();

    return menuItem;
};

// Delete Menu Item

const deleteMenuItem = async (menuItemId, ownerId) => {
    const menuItem = await MenuItem.findById(menuItemId);

    if (!menuItem) {
        throw new Error("Menu item not found.");
    }

    const restaurant = await Restaurant.findById(menuItem.restaurant);

    if (!restaurant) {
        throw new Error("Restaurant not found.");
    }

    if (restaurant.owner.toString() !== ownerId.toString()) {
        throw new Error("You are not authorized to delete this menu item.");
    }

    await menuItem.deleteOne();
};

module.exports = {
    createMenuItem,
    getMenuByRestaurant,
    getMenuByCategory,
    updateMenuItem,
    deleteMenuItem
};
