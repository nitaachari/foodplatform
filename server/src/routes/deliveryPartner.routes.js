const express = require("express");

const router = express.Router();

const {
    createProfile,
    getMyProfile,
    updateStatus,
    updateLocation,
    getMyEarnings
} = require("../controllers/deliveryPartner.controller");

const protect = require("../middleware/auth.middleware");

const authorize = require("../middleware/role.middleware");

router.post("/", protect, authorize("delivery"), createProfile);

router.get("/me", protect, authorize("delivery"), getMyProfile);

router.patch("/me/status", protect, authorize("delivery"), updateStatus);

router.patch("/me/location", protect, authorize("delivery"), updateLocation);

router.get("/me/earnings", protect, authorize("delivery"), getMyEarnings);

module.exports = router;
