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
        user: userId //now check if the user is trying to create another profile
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

            phone, //does not have to match the phone number you have put while registering same like restaurant

            licenseNumber,

            vehicleDetails

        });

    } catch (error) {

        // Duplicate key error — most likely the unique licenseNumber
        if (error.code === 11000) {
            throw new Error(
                "That license number is already registered." //everyone will have a unique license number
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
        user: userId //we have a seperate schema and model for delivery partners 
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
    userId, //this is the unique way to identify delivery partner
    status
) => {

    if (!ALLOWED_STATUSES.includes(status)) { //if not in the allowed statuses
        throw new Error(
            "Invalid status. Must be one of: " + ALLOWED_STATUSES.join(", ")
        );
    }

    const profile = await DeliveryPartner.findOne({ //the first one
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

    profile.status = status; //update the status

    await profile.save();

    return profile;

};



// ======================================
// Update Current Location
// ======================================

const updateLocation = async ( //used for google map 
    userId,
    coordinates
) => {

    if (
        !Array.isArray(coordinates) ||
        coordinates.length !== 2 ||
        coordinates.some((value) => typeof value !== "number")
    ) {
        throw new Error(
            "coordinates must be [longitude, latitude]." //if not an array or length is not 2 or the values are not number
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

    profile.currentLocation = { //update the current location here with coordinates
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

const getMyEarnings = async ( //dashboard that contains earnings of the logged in delivery partner
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

    const now = new Date(); //find todays data as we want data of earnings today this week
//now = 13 Aug 2026 14:45:30
    const startOfToday = new Date( //find the full date of today
        now.getFullYear(),
        now.getMonth(),
        now.getDate()
    );
    //but we want orders from the start of today that is midnight so the above code basically resets time to 00:00:00
// the below code is for The date representing the beginning of the current week. lets say its 13/08/2026 that is thursday so we want the date of the beginning of the current week that is sunday which is 9th august how to find?
//find which day is it basically and subtract from the date so like if its thursday its the 4th day so 13-4=9 which is sunday
    const startOfWeek = new Date(startOfToday);
    startOfWeek.setDate(
        startOfToday.getDate() - startOfToday.getDay() //here we are getting the day
    );

    const deliveredOrders = await Order.find({ //find the delivered orders of that partner
        deliveryPartner: profile._id,
        orderStatus: "delivered"
    })
        .sort({ updatedAt: -1 }) //-1 means descending
        .select("pricing.deliveryFee updatedAt createdAt restaurant") //only select these
        .populate("restaurant", "name"); // for restaurant store name

    let totalEarnings = 0;
    let todayEarnings = 0;
    let weekEarnings = 0;

    deliveredOrders.forEach((order) => {

        const fee = order.pricing?.deliveryFee || 0; //if pricing exists then give fee else 0

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

        recentDeliveries: deliveredOrders.slice(0, 20) //thats why we sorted in descending order

    };

};



module.exports = {

    createProfile,

    getMyProfile,

    updateStatus,

    updateLocation,

    getMyEarnings

};
