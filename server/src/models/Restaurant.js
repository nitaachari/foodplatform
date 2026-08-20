const mongoose = require("mongoose");

const { Schema } = mongoose;

const restaurantSchema = new Schema(
    {
        
        // Restaurant Owner
        

        owner: {
            type: Schema.Types.ObjectId,
            ref: "User",
            required: true,
            unique: true
        },

        
        // Basic Information
        

        name: {
            type: String,
            required: true,
            trim: true,
            minlength: 2,
            maxlength: 100
        },
        description: {
            type: String,
            trim: true,
            maxlength: 500
        },
        images: [
            {
                type: String
            }
        ],

        
        // Restaurant Contact
        

        phone: {
            type: String,
            required: true,
            trim: true
        },
        email: {
            type: String,
            lowercase: true,
            trim: true
        },

        
        // Cuisine Information
        

        cuisineTypes: [
            {
                type: String,
                trim: true
            }
        ],

        
        // Address
        

        address: {
            street: {
                type: String,
                required: true
            },
            city: {
                type: String,
                required: true
            },
            state: {
                type: String,
                required: true
            },
            country: {
                type: String,
                default: "India"
            },
            pincode: {
                type: String,
                required: true
            }
        },

        
        // Geo Location
        

        location: {
            type: {
                type: String,
                enum: ["Point"],
                default: "Point"
            },
            coordinates: {
                type: [Number],
                required: true
            }
        },

        
        // Operating Hours
        

        operatingHours: [
            {
                day: {
                    type: String,
                    required: true
                },
                open: {
                    type: String,
                    required: true
                },
                close: {
                    type: String,
                    required: true
                },
                isClosed: {
                    type: Boolean,
                    default: false
                }
            }
        ],

        
        // Restaurant Status
        

        status: {
            type: String,
            enum: ["open", "closed", "suspended"],
            default: "open"
        },

        
        // Cached Rating
        

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


// Find restaurant by owner
restaurantSchema.index({
    owner: 1
});

// Nearby restaurant search
restaurantSchema.index({
    location: "2dsphere"
});

// Restaurant search
restaurantSchema.index({
    name: "text",
    description: "text",
    cuisineTypes: "text"
});

const Restaurant = mongoose.model("Restaurant", restaurantSchema);

module.exports = Restaurant;
