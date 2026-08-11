const reviewService = require("../services/review.service");



// ======================================
// Create Review
// ======================================

const createReview = async (req, res) => {

    try {

        const review = await reviewService.createReview(

            req.user._id,

            req.body

        );

        res.status(201).json({

            success: true,

            message: "Review submitted successfully.",

            review

        });

    }
    catch (error) {

        res.status(400).json({

            success: false,

            message: error.message

        });

    }

};



// ======================================
// Get Reviews By Restaurant
// ======================================

const getReviewsByRestaurant = async (req, res) => {

    try {

        const reviews = await reviewService.getReviewsByRestaurant(

            req.params.restaurantId

        );

        res.status(200).json({

            success: true,

            reviews

        });

    }
    catch (error) {

        res.status(404).json({

            success: false,

            message: error.message

        });

    }

};



// ======================================
// Get Reviews By Menu Item
// ======================================

const getReviewsByMenuItem = async (req, res) => {

    try {

        const reviews = await reviewService.getReviewsByMenuItem(

            req.params.menuItemId

        );

        res.status(200).json({

            success: true,

            reviews

        });

    }
    catch (error) {

        res.status(404).json({

            success: false,

            message: error.message

        });

    }

};



// ======================================
// Reply To Review
// ======================================

const replyToReview = async (req, res) => {

    try {

        const review = await reviewService.replyToReview(

            req.params.id,

            req.user._id,

            req.body.comment

        );

        res.status(200).json({

            success: true,

            message: "Reply posted successfully.",

            review

        });

    }
    catch (error) {

        res.status(400).json({

            success: false,

            message: error.message

        });

    }

};



module.exports = {

    createReview,

    getReviewsByRestaurant,

    getReviewsByMenuItem,

    replyToReview

};
