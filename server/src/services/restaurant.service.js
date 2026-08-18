const Restaurant = require("../models/Restaurant");



const createRestaurant = async (restaurantData, ownerId) => {

    const existingRestaurant = await Restaurant.findOne({
        owner: ownerId
    });

    if (existingRestaurant) {
        throw new Error("You already own a restaurant.");
    }

    const restaurant = await Restaurant.create({
        ...restaurantData,
        owner: ownerId
    });

    return restaurant;
};
const getRestaurantByOwner = async (ownerId) => {

    const restaurant =
        await Restaurant.findOne({

            owner: ownerId

        });

    if (!restaurant) {

        throw new Error(
            "Restaurant not found."
        );

    }

    return restaurant;

};





const getAllRestaurants = async () => {

    return await Restaurant.find() //if we do find without anything so you get all
        .populate("owner", "name email");

};





const getRestaurantById = async (restaurantId) => {

    const restaurant = await Restaurant.findById(restaurantId)
        .populate("owner", "name email");

    if (!restaurant) {
        throw new Error("Restaurant not found.");
    }

    return restaurant;

};





const updateRestaurant = async (
    restaurantId,
    ownerId,
    updateData
) => {

    const restaurant = await Restaurant.findById(
        restaurantId
    );

    if (!restaurant) {
        throw new Error("Restaurant not found.");
    }

    if (
        restaurant.owner.toString() !==
        ownerId.toString()
    ) {
        throw new Error(
            "You are not authorized to update this restaurant."
        );
    }

    const allowedFields = [

    "name",

    "description",

    "phone",

    "email",

    "address",

    "location",

    "operatingHours",

    "images",

    "cuisineTypes",

    "status"

];

    allowedFields.forEach((field) => {

        if (updateData[field] !== undefined) {

            restaurant[field] = updateData[field];

        }

    });

    await restaurant.save();

    return restaurant;

};





const deleteRestaurant = async (
    restaurantId,
    ownerId
) => {

    const restaurant = await Restaurant.findById(
        restaurantId
    );

    if (!restaurant) {
        throw new Error("Restaurant not found.");
    }

    if (
        restaurant.owner.toString() !==
        ownerId.toString()
    ) {
        throw new Error(
            "You are not authorized to delete this restaurant."
        );
    }

    await restaurant.deleteOne();

};





module.exports = {

    createRestaurant,

    getAllRestaurants,

    getRestaurantById,

    updateRestaurant,
    getRestaurantByOwner,

    deleteRestaurant

};