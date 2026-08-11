const mongoose = require("mongoose");
const bcrypt = require("bcrypt");

const { Schema } = mongoose;


const userSchema = new Schema(
    {

        // ==========================
        // Basic Information
        // ==========================

        name: {
            type: String,
            required: true,
            trim: true,
            minlength: 2,
            maxlength: 50
        },


        email: {
            type: String,
            required: true,
            unique: true,
            lowercase: true,
            trim: true
        },


        password: {
            type: String,
            required: true,
            select:false, //this means send this field only when explicitly asked for
            minlength: 8
        },


        phone: {
            type: String,
            required: true,
            unique: true,
            trim: true
        },


        // ==========================
        // Authorization
        // ==========================

        role: {
            type: String,
            enum: [
                "customer",
                "restaurant",
                "delivery"
            ],
            default: "customer"
        },


        accountStatus: {
            type: String,
            enum: [
                "active",
                "blocked",
                "deleted"
            ],
            default: "active"
        },


        // ==========================
        // Profile
        // ==========================

        profileImage: {
            type: String,
            default: ""
        },


        // ==========================
        // Customer Addresses
        // ==========================

        addresses: [
            {
                label: {
                    type: String,
                    required: true
                },


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
                },


                // GeoJSON format
                // [longitude, latitude]

                coordinates: {
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


                isDefault: {
                    type: Boolean,
                    default: false
                }

            }
        ],


        // ==========================
        // Account Verification
        // ==========================

        isVerified: {
            type: Boolean,
            default: false
        },


        // ==========================
        // JWT Refresh Tokens
        // ==========================

        refreshTokens: [
            {
                token: {
                    type: String,
                    required: true
                },


                createdAt: {
                    type: Date,
                    default: Date.now
                },


                device: {
                    type: String
                }
            }
        ],


        // ==========================
        // Security / Tracking
        // ==========================

        lastLogin: {
            type: Date
        }

    },


    {
        timestamps: true
    }
);



// =====================================
// Password Hashing Middleware
// =====================================

userSchema.pre("save", async function(){
    if(!this.isModified("password")) return;
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
});



// =====================================
// Compare Password Method
// =====================================

userSchema.methods.comparePassword = async function(
    enteredPassword
){

    return await bcrypt.compare(
        enteredPassword,
        this.password
    );

};



// =====================================
// Indexes
// =====================================

userSchema.index({
    email: 1
});


userSchema.index({
    phone: 1
});


userSchema.index({
    role: 1
});


// Geo queries
// Restaurants / delivery partners / addresses

userSchema.index({
    "addresses.coordinates": "2dsphere"
});



const User = mongoose.model(
    "User",
    userSchema
);


module.exports = User;