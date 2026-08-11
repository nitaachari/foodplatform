const mongoose = require("mongoose");

const { Schema } = mongoose;


const reviewSchema = new Schema(

{

    // ==========================
    // References
    // ==========================


    user:{
        type:Schema.Types.ObjectId,
        ref:"User",
        required:true
    },


    order:{
        type:Schema.Types.ObjectId,
        ref:"Order",
        required:true
    },


    restaurant:{
        type:Schema.Types.ObjectId,
        ref:"Restaurant",
        required:true
    },


    menuItem:{
        type:Schema.Types.ObjectId,
        ref:"MenuItem",
        default:null
    },


    // ==========================
    // Review Content
    // ==========================


    rating:{
        type:Number,
        required:true,
        min:1,
        max:5
    },


    comment:{
        type:String,
        trim:true,
        maxlength:1000
    },


    images:[
        {
            type:String
        }
    ],


    // ==========================
    // AI Sentiment
    // ==========================


    sentiment:{
        type:String,

        enum:[
            "positive",
            "neutral",
            "negative"
        ],

        default:null
    },


    // ==========================
    // Restaurant Owner Reply
    // ==========================

    reply:{

        comment:{
            type:String,
            trim:true,
            maxlength:1000
        },

        repliedAt:{
            type:Date
        }

    }


},

{
    timestamps:true
}

);



// ==========================
// Indexes
// ==========================


// Restaurant reviews
reviewSchema.index({
    restaurant:1
});


// Menu item reviews
reviewSchema.index({
    menuItem:1
});


// User review history
reviewSchema.index({
    user:1
});


// Prevent duplicate reviews
reviewSchema.index(
{
    user:1,
    order:1,
    restaurant:1
},
{
    unique:true
}
);



const Review = mongoose.model(
    "Review",
    reviewSchema
);


module.exports = Review;