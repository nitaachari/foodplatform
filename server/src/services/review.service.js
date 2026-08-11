const Review = require("../models/Review");
const Order = require("../models/Order");
const Restaurant = require("../models/Restaurant");
const MenuItem = require("../models/MenuItem");



// ======================================
// Recalculate & persist a restaurant's
// cached rating from its Review documents
// ======================================

const recalculateRestaurantRating = async (restaurantId) => {

    const [stats] = await Review.aggregate([

        {
            $match: { restaurant: restaurantId }
        },

        {
            $group: {
                _id: "$restaurant",
                average: { $avg: "$rating" },
                count: { $sum: 1 }
            }
        }

    ]);

    await Restaurant.findByIdAndUpdate(restaurantId, {
        rating: {
            average: stats ? Math.round(stats.average * 10) / 10 : 0,
            count: stats ? stats.count : 0
        }
    });

};



// ======================================
// Recalculate & persist a menu item's
// cached rating from its Review documents
// ======================================

const recalculateMenuItemRating = async (menuItemId) => {

    const [stats] = await Review.aggregate([

        {
            $match: { menuItem: menuItemId }
        },

        {
            $group: {
                _id: "$menuItem",
                average: { $avg: "$rating" },
                count: { $sum: 1 }
            }
        }

    ]);

    await MenuItem.findByIdAndUpdate(menuItemId, {
        rating: {
            average: stats ? Math.round(stats.average * 10) / 10 : 0,
            count: stats ? stats.count : 0
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
            );
        }

        throw error;

    }

    await recalculateRestaurantRating(order.restaurant);

    if (menuItemId) {
        await recalculateMenuItemRating(menuItemId);
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
    ownerId,
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

    review.reply = {
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
