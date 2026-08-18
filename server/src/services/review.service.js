const Review = require("../models/Review");
const Order = require("../models/Order");
const Restaurant = require("../models/Restaurant");
const MenuItem = require("../models/MenuItem");



// ======================================
// Recalculate & persist a restaurant's
// cached rating from its Review documents
// ======================================

const recalculateRestaurantRating = async (restaurantId) => {

    // 1. Find all reviews belonging to this restaurant
    const reviews = await Review.find({
        restaurant: restaurantId
    });

    // 2. Add all the ratings together
    let totalRating = 0;

    for (const review of reviews) {
        totalRating += review.rating;
    }

    // 3. Calculate the average
    const average = reviews.length > 0
        ? totalRating / reviews.length
        : 0;

    // 4. Round the average to 1 decimal place
    const roundedAverage = Math.round(average * 10) / 10;

    // 5. Update the restaurant's cached rating
    await Restaurant.findByIdAndUpdate(restaurantId, {
        rating: {
            average: roundedAverage,
            count: reviews.length
        }
    });

};
const recalculateMenuItemRating = async (menuItemId) => {

    // 1. Find all reviews belonging to this menu item
    const reviews = await Review.find({
        menuItem: menuItemId
    });

    // 2. Add all the ratings together
    let totalRating = 0;

    for (const review of reviews) {
        totalRating += review.rating;
    }

    // 3. Calculate the average
    const average = reviews.length > 0
        ? totalRating / reviews.length
        : 0;

    // 4. Round the average to 1 decimal place
    const roundedAverage = Math.round(average * 10) / 10;

    // 5. Update the menu item's cached rating
    await MenuItem.findByIdAndUpdate(menuItemId, {
        rating: {
            average: roundedAverage,
            count: reviews.length
        }
    });

};



// ======================================
// Create Review
// ======================================

const createReview = async (
    userId,
    data
) => {

    const {
        orderId,
        menuItemId,
        rating,
        comment,
        images
    } = data;

    const order = await Order.findById(orderId);

    if (!order) {
        throw new Error(
            "Order not found."
        );
    }

    // Reviews are always tied to the customer's own order —
    // never trust a restaurant/menuItem id supplied directly
    // by the client, derive it from the order instead.

    if (order.customer.toString() !== userId.toString()) {
        throw new Error(
            "You can only review your own orders."
        );
    }

    if (order.orderStatus !== "delivered") {
        throw new Error(
            "You can only review an order after it has been delivered."
        );
    }

    if (menuItemId) {

        const itemInOrder = order.items.some(
            (item) => item.menuItem &&
                item.menuItem.toString() === menuItemId.toString()
        );

        if (!itemInOrder) {
            throw new Error(
                "That menu item was not part of this order."
            );
        }

    }

    let review;

    try {

        review = await Review.create({

            user: userId,

            order: order._id,

            restaurant: order.restaurant,

            menuItem: menuItemId || null,

            rating,

            comment,

            images: images || []

        });

    } catch (error) {

        // Duplicate key error from the unique(user, order, restaurant) index
        if (error.code === 11000) {
            throw new Error(
                "You have already reviewed this order."
            ); //checking for duplicacy
        }

        throw error;

    }

    await recalculateRestaurantRating(order.restaurant); //we keep on recalculating the reviews whenever there is a new review

    if (menuItemId) {
        await recalculateMenuItemRating(menuItemId); //recalculate
    }

    return review;

};



// ======================================
// Get Reviews For A Restaurant
// ======================================

const getReviewsByRestaurant = async (
    restaurantId
) => {

    const restaurant = await Restaurant.findById(restaurantId);

    if (!restaurant) {
        throw new Error(
            "Restaurant not found."
        );
    }

    const reviews = await Review.find({
        restaurant: restaurantId
    })
        .sort({ createdAt: -1 })
        .populate("user", "name profileImage");

    return reviews;

};



// ======================================
// Get Reviews For A Menu Item
// ======================================

const getReviewsByMenuItem = async (
    menuItemId
) => {

    const menuItem = await MenuItem.findById(menuItemId);

    if (!menuItem) {
        throw new Error(
            "Menu item not found."
        );
    }

    const reviews = await Review.find({
        menuItem: menuItemId
    })
        .sort({ createdAt: -1 })
        .populate("user", "name profileImage");

    return reviews;

};



// ======================================
// Restaurant Reply To A Review
// ======================================

const replyToReview = async (
    reviewId,
    ownerId, //only the owner of the restaurant can reply
    replyComment
) => {

    const review = await Review.findById(reviewId);

    if (!review) {
        throw new Error(
            "Review not found."
        );
    }

    const restaurant = await Restaurant.findById(review.restaurant);

    if (!restaurant) {
        throw new Error(
            "Restaurant not found."
        );
    }

    if (restaurant.owner.toString() !== ownerId.toString()) {
        throw new Error(
            "You are not authorized to reply to this review."
        );
    }

    review.reply = { //just modify or add the reply other all things are same
        comment: replyComment,
        repliedAt: new Date()
    };

    await review.save();

    return review;

};



module.exports = {

    createReview,

    getReviewsByRestaurant,

    getReviewsByMenuItem,

    replyToReview

};
