const paymentService = require("../services/payment.service");
const Stripe = require("stripe");

const stripe = Stripe(process.env.STRIPE_SECRET_KEY);

// ======================================
// Create Payment
// ======================================

const createPayment = async (req, res) => {
    try {
        const { payment, clientSecret } = await paymentService.createPayment(
            req.body.orderId,
            req.user._id,
            req.body.paymentMethod
        );

        res.status(201).json({
            success: true,
            message: "Payment created successfully.",
            payment,
            clientSecret
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            message: error.message
        });
    }
};

// ======================================
// Verify Payment
// ======================================

const verifyPayment = async (req, res) => {
    try {
        const payment = await paymentService.verifyPayment(
            req.body.paymentId,
            req.body.transactionId
        );

        res.status(200).json({
            success: true,
            message: "Payment verified successfully.",
            payment
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            message: error.message
        });
    }
};

// ======================================
// Get Payment By Id
// ======================================

const getPaymentById = async (req, res) => {
    try {
        const payment = await paymentService.getPaymentById(
            req.params.id,
            req.user._id
        );

        res.status(200).json({
            success: true,
            payment
        });
    } catch (error) {
        res.status(404).json({
            success: false,
            message: error.message
        });
    }
};

// ======================================
// Get Payments For Order
// ======================================

const getPaymentByOrderId = async (req, res) => {
    try {
        const payments = await paymentService.getPaymentByOrderId(
            req.params.orderId,
            req.user._id
        );

        res.status(200).json({
            success: true,
            payments
        });
    } catch (error) {
        res.status(404).json({
            success: false,
            message: error.message
        });
    }
};
const confirmPayment = async (req, res) => {
    try {
        const payment = await paymentService.confirmCardPayment(
            req.body.paymentId,
            req.user._id
        );

        res.status(200).json({
            success: true,
            payment
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            message: error.message
        });
    }
};

// ======================================
// Stripe Webhook
// (Stripe calls this directly — it is the source of truth
// for card payment confirmation, not anything the browser
// submits. Mounted in app.js with a raw body parser, before
// req.user auth or express.json() touch the request.)
// ======================================

const handleStripeWebhook = async (req, res) => {
    const signature = req.headers["stripe-signature"];

    let event;

    try {
        event = stripe.webhooks.constructEvent(
            req.body,
            signature,
            process.env.STRIPE_WEBHOOK_SECRET
        );
    } catch (error) {
        console.error(`Stripe webhook signature verification failed: ${error.message}`);

        return res
            .status(400)
            .send(`Webhook signature verification failed: ${error.message}`);
    }

    try {
        if (event.type === "payment_intent.succeeded") {
            const intent = event.data.object;

            await paymentService.markPaymentSucceeded(intent.id);
        }

        if (event.type === "payment_intent.payment_failed") {
            const intent = event.data.object;

            await paymentService.markPaymentFailed(intent.id);
        }

        res.status(200).json({ received: true });
    } catch (error) {
        // Returning a 500 here makes Stripe retry the delivery,
        // which is what we want if our own DB write failed.
        console.error(
            `Error processing Stripe webhook event ${event.type}: ${error.message}`
        );

        res.status(500).json({ received: false });
    }
};

module.exports = {
    createPayment,
    verifyPayment,
    getPaymentById,
    getPaymentByOrderId,
    handleStripeWebhook,
    confirmPayment
};
