const DeliveryPartner = require("../models/DeliveryPartner");
const Order = require("../models/Order");



const ALLOWED_STATUSES = [
    "online",
    "offline",
    "busy"
];
// "suspended" is intentionally excluded — that's an admin action,
// not something a delivery partner can set on themselves.



// ======================================
// Create Delivery Partner Profile
// ======================================

const createProfile = async (
    userId,
    data
) => {

    const {
        phone,
        licenseNumber,
        vehicleDetails
    } = data;

    const existingProfile = await DeliveryPartner.findOne({
        user: userId
    });

    if (existingProfile) {
        throw new Error(
            "You already have a delivery partner profile."
        );
    }

    let profile;

    try {

        profile = await DeliveryPartner.create({

            user: userId,

            phone,

            licenseNumber,

            vehicleDetails

        });

    } catch (error) {

        // Duplicate key error — most likely the unique licenseNumber
        if (error.code === 11000) {
            throw new Error(
                "That license number is already registered."
            );
        }

        throw error;

    }

    return profile;

};



// ======================================
// Get My Profile
// ======================================

const getMyProfile = async (
    userId
) => {

    const profile = await DeliveryPartner.findOne({
        user: userId
    });

    if (!profile) {
        throw new Error(
            "No delivery partner profile found for this account."
        );
    }

    return profile;

};



// ======================================
// Update Availability Status
// ======================================

const updateStatus = async (
    userId,
    status
) => {

    if (!ALLOWED_STATUSES.includes(status)) {
        throw new Error(
            "Invalid status. Must be one of: " + ALLOWED_STATUSES.join(", ")
        );
    }

    const profile = await DeliveryPartner.findOne({
        user: userId
    });

    if (!profile) {
        throw new Error(
            "No delivery partner profile found for this account."
        );
    }

    if (profile.status === "suspended") {
        throw new Error(
            "Your account is suspended. Contact support."
        );
    }

    profile.status = status;

    await profile.save();

    return profile;

};



// ======================================
// Update Current Location
// ======================================

const updateLocation = async (
    userId,
    coordinates
) => {

    if (
        !Array.isArray(coordinates) ||
        coordinates.length !== 2 ||
        coordinates.some((value) => typeof value !== "number")
    ) {
        throw new Error(
            "coordinates must be [longitude, latitude]."
        );
    }

    const profile = await DeliveryPartner.findOne({
        user: userId
    });

    if (!profile) {
        throw new Error(
            "No delivery partner profile found for this account."
        );
    }

    profile.currentLocation = {
        type: "Point",
        coordinates
    };

    await profile.save();

    return profile;

};



// ======================================
// Get My Earnings
// (derived from delivered orders rather than a stored
// running total -- same aggregation-over-Orders approach
// used elsewhere in this project for analytics)
// ======================================

const getMyEarnings = async (
    userId
) => {

    const profile = await DeliveryPartner.findOne({
        user: userId
    });

    if (!profile) {
        throw new Error(
            "No delivery partner profile found for this account."
        );
    }

    const now = new Date();

    const startOfToday = new Date(
        now.getFullYear(),
        now.getMonth(),
        now.getDate()
    );

    const startOfWeek = new Date(startOfToday);
    startOfWeek.setDate(
        startOfToday.getDate() - startOfToday.getDay()
    );

    const deliveredOrders = await Order.find({
        deliveryPartner: profile._id,
        orderStatus: "delivered"
    })
        .sort({ updatedAt: -1 })
        .select("pricing.deliveryFee updatedAt createdAt restaurant")
        .populate("restaurant", "name");

    let totalEarnings = 0;
    let todayEarnings = 0;
    let weekEarnings = 0;

    deliveredOrders.forEach((order) => {

        const fee = order.pricing?.deliveryFee || 0;

        totalEarnings += fee;

        if (order.updatedAt >= startOfToday) {
            todayEarnings += fee;
        }

        if (order.updatedAt >= startOfWeek) {
            weekEarnings += fee;
        }

    });

    return {

        totalDeliveries: profile.totalDeliveries,

        totalEarnings,

        todayEarnings,

        weekEarnings,

        recentDeliveries: deliveredOrders.slice(0, 20)

    };

};



module.exports = {

    createProfile,

    getMyProfile,

    updateStatus,

    updateLocation,

    getMyEarnings

};
