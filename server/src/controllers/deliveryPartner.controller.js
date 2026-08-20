const deliveryPartnerService = require("../services/deliveryPartner.service");

// ======================================
// Create Profile
// ======================================

const createProfile = async (req, res) => {
    try {
        const profile = await deliveryPartnerService.createProfile(
            req.user._id,
            req.body
        );

        res.status(201).json({
            success: true,
            message: "Delivery partner profile created successfully.",
            profile
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            message: error.message
        });
    }
};

// ======================================
// Get My Profile
// ======================================

const getMyProfile = async (req, res) => {
    try {
        const profile = await deliveryPartnerService.getMyProfile(req.user._id);

        res.status(200).json({
            success: true,
            profile
        });
    } catch (error) {
        res.status(404).json({
            success: false,
            message: error.message
        });
    }
};

// ======================================
// Update Status
// ======================================

const updateStatus = async (req, res) => {
    try {
        const profile = await deliveryPartnerService.updateStatus(
            req.user._id,
            req.body.status
        );

        res.status(200).json({
            success: true,
            message: "Status updated successfully.",
            profile
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            message: error.message
        });
    }
};

// ======================================
// Update Location
// ======================================

const updateLocation = async (req, res) => {
    try {
        const profile = await deliveryPartnerService.updateLocation(
            req.user._id,
            req.body.coordinates
        );

        res.status(200).json({
            success: true,
            message: "Location updated successfully.",
            profile
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            message: error.message
        });
    }
};

// ======================================
// Get My Earnings
// ======================================

const getMyEarnings = async (req, res) => {
    try {
        const earnings = await deliveryPartnerService.getMyEarnings(req.user._id);

        res.status(200).json({
            success: true,
            earnings
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            message: error.message
        });
    }
};

module.exports = {
    createProfile,
    getMyProfile,
    updateStatus,
    updateLocation,
    getMyEarnings
};
