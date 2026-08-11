const mongoose = require("mongoose");

const { Schema } = mongoose;


const cartSchema = new Schema(

{

    // ==========================
    // User Reference
    // ==========================

    user:{
        type:Schema.Types.ObjectId,
        ref:"User",
        required:true,
        unique:true
    },


    // ==========================
    // Restaurant Reference
    // ==========================

    restaurant:{
        type:Schema.Types.ObjectId,
        ref:"Restaurant",
        required:true
    },


    // ==========================
    // Cart Items
    // ==========================

    items:[
        {

            menuItem:{
                type:Schema.Types.ObjectId,
                ref:"MenuItem",
                required:true
            },


            name:{
                type:String,
                required:true
            },


            price:{
                type:Number,
                required:true,
                min:0
            },


            quantity:{
                type:Number,
                required:true,
                min:1,
                default:1
            },


            customizations:[
                {

                    name:String,

                    choice:String,

                    price:{
                        type:Number,
                        default:0
                    }

                }
            ]

        }
    ],


    // ==========================
    // Price
    // ==========================

    totalAmount:{
        type:Number,
        default:0
    }

},

{
    timestamps:true
}

);



// Index

cartSchema.index({
    user:1
});


const Cart = mongoose.model(
    "Cart",
    cartSchema
);


module.exports = Cart;