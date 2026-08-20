const mongoose = require("mongoose");

const { Schema } = mongoose;

const paymentSchema = new Schema(
    {
        
        // References
        

        order: {
            type: Schema.Types.ObjectId,
            ref: "Order",
            required: true
        },
        attemptNumber: {
            type: Number,
            required: true
        },
        user: {
            type: Schema.Types.ObjectId,
            ref: "User",
            required: true
        },

        
        // Payment Information
        

        amount: {
            type: Number,
            required: true,
            min: 0
        },
        paymentMethod: {
            type: String,
            enum: ["card", "cod"],
            required: true
        },
        transactionId: {
            type: String,
            unique: true,
            sparse: true
        },
        stripePaymentIntentId: {
            /*sparse: true is supposed to mean "don't enforce uniqueness for documents where this field is completely missing." But there's a sharp edge here worth knowing: "missing" and "explicitly set to null" are two different things to MongoDB. */
            type: String,
            unique: true,
            sparse: true
        },
        gateway: {
            type: String
        },

        
        // Payment Status
        

        status: {
            type: String,
            enum: ["pending", "processing", "completed", "failed", "refunded"],
            default: "pending"
        },
        paidAt: {
            type: Date
        },

        
        // Refund Information
        

        refundDetails: {
            amount: Number,
            reason: String,
            refundedAt: Date
        },

        
        // Gateway Metadata
        

        metadata: {
            type: Object
        }
    },
    {
        timestamps: true
    }
);


// Indexes


paymentSchema.index({
    order: 1
});

paymentSchema.index({
    user: 1
});

paymentSchema.index({
    transactionId: 1
});

const Payment = mongoose.model("Payment", paymentSchema);

module.exports = Payment;
