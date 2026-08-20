const mongoose = require("mongoose");
const bcrypt = require("bcrypt");

const { Schema } = mongoose;

const userSchema = new Schema(
    //name of the model
    {
        
        // Basic Information
        

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
            select: false, //this means send this field only when explicitly asked for
            minlength: 8
        },
        phone: {
            type: String,
            required: true,
            unique: true,
            trim: true //remove the extra whitespaces
        },

        
        // Authorization
        

        role: {
            type: String,
            enum: ["customer", "restaurant", "delivery"],
            default: "customer"
        },
        accountStatus: {
            type: String,
            enum: ["active", "blocked", "deleted"],
            default: "active"
        },

        
        // Profile
        

        profileImage: {
            type: String,
            default: ""
        },

        
        // Customer Addresses
        

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

        
        // Account Verification
        

        isVerified: {
            type: Boolean,
            default: false
        },

        
        // JWT Refresh Tokens
        

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

        
        // Security / Tracking
        

        lastLogin: {
            type: Date
        }
    },
    {
        timestamps: true
    }
);

// Indexes


/*
Each of these just tells MongoDB: "keep a fast sorted shortcut list for this field, 
because I'm going to be searching by it a lot." 
(The 1 just means "sorted smallest to largest" — not something you need to worry much about; -1 would just mean the opposite order.)
 */
/*
How does binary search actually skip so much?

This is the real trick behind the shortcut list, worth seeing once:

The list is sorted alphabetically by email.
Jump straight to the middle entry. Is our email bigger or smaller than that one, alphabetically?
If it's smaller — throw away the entire right half of the list, we know it's not there.
If it's bigger — throw away the entire left half.
Repeat on whatever's left, which is now half the size.

Every single check throws away half of what remains. 
That's why 200,000 items only takes about 18 checks — you're cutting the haystack in half, again and again, not walking through it straw by straw.
*/

userSchema.index({
    //fast lookup using binary search on sorted list
    email: 1
});
//MongoDB sees this query is filtering by email, checks "do I have a shortcut list for that field?" — sees userSchema.index({ email: 1 }) — and automatically uses it instead of scanning everyone. You don't write anything different. The index just quietly makes the exact same code faster.

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

/* Notice in the output: "Building the index once... 344.089 ms" — building that sorted list wasn't free. And it's not just a one-time cost — every time a new user registers, MongoDB has to slot their email into that sorted list too, not just save the raw document. So indexes make reading faster, but make every write slightly slower, since the shortcut list has to stay up to date. That's exactly why you don't index every field on every model — only the ones you'll actually search or sort by a lot. Looking at your schema, email, phone, and role are all genuinely good picks, since login searches by email, and you'll likely filter users by role somewhere too.*/

const User = mongoose.model("User", userSchema);

module.exports = User;
