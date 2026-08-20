const Payment = require("../models/Payment");
const Order = require("../models/Order");
const Cart = require("../models/Cart");
const Stripe = require("stripe");

const stripe = Stripe(process.env.STRIPE_SECRET_KEY);


// Create Payment Attempt

//to create payments
const createPayment = async (
    orderId, //we get this from frontend
    userId,
    paymentMethod //card or cash
) => {
    const order = await Order.findById(orderId);

    if (!order) {
        throw new Error("Order not found.");
    }

    // Ensure only order owner can pay

    if (order.customer.toString() !== userId.toString()) {
        throw new Error("You are not authorized to pay for this order.");
    }

    // Prevent payment after successful payment

    if (order.paymentStatus === "paid") {
        throw new Error("Order has already been paid.");
    }

    // Count previous payment attempts

    const previousAttempts = await Payment.countDocuments({
        order: orderId
    });

    
    // Card payments go through Stripe.
    // "cod" keeps the existing manual/mock flow for now.
    

    let stripePaymentIntentId = null;
    let clientSecret = null;

    if (paymentMethod === "card") {
        // Stripe expects the amount in the smallest currency
        // unit — paise for INR.
        const amountInPaise = Math.round(order.pricing.total * 100);

        const intent = await stripe.paymentIntents.create(
            {
                amount: amountInPaise,
                currency: "inr",
                metadata: {
                    orderId: order._id.toString(),
                    userId: userId.toString()
                },
                automatic_payment_methods: {
                    enabled: true
                }
            },
            {
                // Prevents duplicate PaymentIntents if the client
                // retries this call for the same attempt.
                idempotencyKey: `order_${order._id}_attempt_${previousAttempts + 1}` //its basically a unique identifier for this payment intent so that if due to network issues server creates two or multiple payment intents for the same order the customer wont be charged twice as stripe will be like oh i have seen this identifier before hence i will not charge it again
            }
        );

        stripePaymentIntentId = intent.id;
        clientSecret = intent.client_secret;
    }

    

    const paymentData = {
        order: order._id,
        user: userId,
        amount: order.pricing.total,
        paymentMethod, //variable is same so automatically fills
        gateway: paymentMethod === "card" ? "stripe" : "mock",
        status: "pending",
        attemptNumber: previousAttempts + 1
    };

    if (paymentMethod === "card") {
        paymentData.stripePaymentIntentId = stripePaymentIntentId; //only put for card not cod
    }

    const payment = await Payment.create(paymentData);

    // clientSecret is single-use and only needed by the frontend
    // for this specific request — it is never persisted.
    return { payment, clientSecret };
};


// Verify Payment
// (manual flow — cod / non-Stripe methods only.
// Card payments are confirmed by the Stripe webhook,
// see markPaymentSucceeded / markPaymentFailed below,
// since a client can never be trusted to self-report
// that a real charge succeeded.)


const verifyPayment = async (paymentId,transactionId) => { //for cod and updates payment
    const payment = await Payment.findById(paymentId);

    if (!payment) {
        throw new Error("Payment not found.");
    }

    if (payment.gateway === "stripe") {
        throw new Error(
            "Card payments are confirmed automatically by Stripe. Check the payment status instead of verifying manually."
        );
    }

    if (payment.status === "completed") {
        throw new Error("Payment already completed.");
    }

    // Check if another attempt already succeeded

    const existingSuccessfulPayment = await Payment.findOne({
        order: payment.order,
        status: "completed"
    });

    if (existingSuccessfulPayment) {
        throw new Error("Order is already paid.");
    }

    payment.status = "completed";

    payment.transactionId = transactionId;
    payment.paidAt = new Date();

    payment.metadata = {
        verified: true
    };

    await payment.save();

    // Update order payment status

    const order = await Order.findById(payment.order);

    order.paymentStatus = "paid";

    order.payment = payment._id;

    await order.save();

    return payment;
};


// Get Payment By ID


const getPaymentById = async (
    paymentId,
    userId
) => {
    const payment = await Payment.findById(paymentId).populate("order");

    if (!payment) {
        throw new Error("Payment not found.");
    }

    if (payment.user.toString() !== userId.toString()) {
        throw new Error("Unauthorized.");
    }

    return payment;
};


// Get All Payments For Order


const getPaymentByOrderId = async (
    orderId,
    userId
) => {
    const payments = await Payment.find({
        order: orderId,
        user: userId
    }).sort({
        createdAt: -1
    });

    if (payments.length === 0) {
        throw new Error("No payment attempts found.");
    }

    return payments;
};


// Mark Payment Succeeded
// (called from the Stripe webhook handler — this is the
// authoritative confirmation path for card payments, not
// anything the client submits directly)
//webhook


const markPaymentSucceeded = async (stripePaymentIntentId) => { //This is called when Stripe tells your server that the payment succeeded.
    const payment = await Payment.findOne({ stripePaymentIntentId }); //based on paymentintent id

    if (!payment) {
        // Webhook arrived for a PaymentIntent we don't recognize —
      
        
        console.warn(
            `Stripe webhook: no Payment found for PaymentIntent ${stripePaymentIntentId}`
        );
        return null;
    }

    if (payment.status === "completed") {
        // Already processed (Stripe can send duplicate webhook
        // deliveries) — nothing further to do.
        return payment;
    }

    payment.status = "completed";
    payment.paidAt = new Date();
    payment.transactionId = stripePaymentIntentId;

    await payment.save();

    const order = await Order.findById(payment.order);

    if (order) {
        order.paymentStatus = "paid";
        order.payment = payment._id;

        await order.save();

        // createOrder intentionally left the cart alone for card
        // payments (see order.service.js) so a failed payment
        // wouldn't lose the customer's cart for nothing. Now that
        // the charge has actually succeeded, clear it.
        const cart = await Cart.findOne({ user: payment.user });

        if (cart) {
            cart.items = [];
            cart.totalAmount = 0;

            await cart.save();
        }

        // TODO: once Socket.io is wired up (see sockets/index.js),
        // emit here so the customer's checkout page updates live:
        //
        // const { getIO } = require("../sockets");
        // getIO().to(`order:${order._id}`).emit("payment:completed", {
        //     orderId: order._id
        // });
    }

    return payment;
};


// Mark Payment Failed


const markPaymentFailed = async (stripePaymentIntentId) => {
    const payment = await Payment.findOne({ stripePaymentIntentId });

    if (!payment) {
        console.warn(
            `Stripe webhook: no Payment found for PaymentIntent ${stripePaymentIntentId}`
        );
        return null;
    }

    if (payment.status !== "completed") {
        payment.status = "failed";
        await payment.save();
    }

    return payment;
};


// Confirm Card Payment
// (dev/local alternative to the webhook — the server retrieves the
// PaymentIntent status directly from Stripe's API rather than trusting
// anything the client claims. Still safe: the client only supplies a
// paymentId it owns, never a success/failure verdict. The one thing
// this can't do that the webhook can is find out about a payment that
// succeeded after the browser stopped talking to us — see the caveat
// in chat. Fine for testing, worth pairing with the real webhook
// before going to production.)
//development/testing alternative if webhook does not work


const confirmCardPayment = async (
    paymentId,
    userId
) => {
    const payment = await Payment.findById(paymentId);

    if (!payment) {
        throw new Error("Payment not found.");
    }

    if (payment.user.toString() !== userId.toString()) {
        throw new Error("Unauthorized.");
    }

    if (payment.gateway !== "stripe") {
        throw new Error("Not a Stripe payment.");
    }

    if (payment.status === "completed") {
        return payment;
    }

    const intent = await stripe.paymentIntents.retrieve(payment.stripePaymentIntentId); //backend verifies the payment we ask stripe for payment status

    if (intent.status === "succeeded") {
        return markPaymentSucceeded(payment.stripePaymentIntentId);
    }

    if (intent.status === "processing") {
        // Still settling on Stripe's side — not failed, just not
        // done yet. Leave it pending; the frontend can retry the
        // confirm call after a short delay if needed.
        return payment;
    }

    // requires_payment_method, requires_action, canceled, etc. —
    // the attempt didn't succeed.
    payment.status = "failed";
    await payment.save();

    throw new Error(`Payment not completed (status: ${intent.status}).`);
};

module.exports = {
    createPayment,
    verifyPayment,
    getPaymentById,
    getPaymentByOrderId,
    markPaymentSucceeded,
    markPaymentFailed,
    confirmCardPayment
};
