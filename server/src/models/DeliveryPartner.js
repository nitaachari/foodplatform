const mongoose = require("mongoose");

const { Schema } = mongoose;

const deliveryPartnerSchema = new Schema(
    {
        
        // User Reference
        

        user: {
            type: Schema.Types.ObjectId,
            ref: "User",
            required: true,
            unique: true
        },

        
        // Personal Details
        

        phone: {
            type: String,
            required: true,
            trim: true,
            unique: true
        },
        profileImage: {
            type: String,
            default: ""
        },
        licenseNumber: {
            type: String,
            required: true,
            unique: true,
            trim: true
        },

        
        // Vehicle
        

        vehicleDetails: {
            type: {
                type: String,
                required: true,
                enum: ["bike", "scooter", "car"]
            },
            vehicleNumber: {
                type: String,
                required: true,
                trim: true
            }
        },

        
        // Availability
        

        status: {
            type: String,
            enum: ["offline", "online", "busy", "suspended"],
            default: "offline"
        },

        
        // Location
        

        currentLocation: {
            type: {
                type: String,
                enum: ["Point"],
                default: "Point"
            },
            coordinates: {
                type: [Number],
                default: [0, 0]
            }
        },

        
        // Performance
        

        totalDeliveries: {
            type: Number,
            default: 0
        },
        totalEarnings: {
            type: Number,
            default: 0
        },
        rating: {
            average: {
                type: Number,
                default: 0
            },
            count: {
                type: Number,
                default: 0
            }
        }
    },
    {
        timestamps: true
    }
);


// Indexes


deliveryPartnerSchema.index({
    user: 1
});

deliveryPartnerSchema.index({
    currentLocation: "2dsphere"
});

deliveryPartnerSchema.index({
    status: 1
});

const DeliveryPartner = mongoose.model("DeliveryPartner", deliveryPartnerSchema);

module.exports = DeliveryPartner;
