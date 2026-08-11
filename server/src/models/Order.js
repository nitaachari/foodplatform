const mongoose = require("mongoose");

const { Schema } = mongoose;


const orderSchema = new Schema(

{

    // ==========================
    // References
    // ==========================


    customer:{
        type:Schema.Types.ObjectId,
        ref:"User",
        required:true
    },


    restaurant:{
        type:Schema.Types.ObjectId,
        ref:"Restaurant",
        required:true
    },


    deliveryPartner:{
        type:Schema.Types.ObjectId,
        ref:"DeliveryPartner",
        default:null
    },
    payment:{
        type:Schema.Types.ObjectId,
        ref:"Payment",
        default:null
    },


    // ==========================
    // Items Snapshot
    // ==========================


    items:[
        {

            menuItem:{
                type:Schema.Types.ObjectId,
                ref:"MenuItem"
            },


            name:{
                type:String,
                required:true
            },


            price:{
                type:Number,
                required:true
            },


            quantity:{
                type:Number,
                required:true,
                min:1
            },


            customizations:[
                {
                    name:String,
                    choice:String,
                    price:Number
                }
            ]

        }
    ],



    // ==========================
    // Delivery Address Snapshot
    // ==========================


    deliveryAddress:{

        street:String,

        city:String,

        state:String,

        country:String,

        pincode:String,


        coordinates:{
            type:{
                type:String,
                enum:["Point"],
                default:"Point"
            },

            coordinates:[Number]
        }

    },



    // ==========================
    // Pricing
    // ==========================


    pricing:{

        subtotal:{
            type:Number,
            required:true
        },


        deliveryFee:{
            type:Number,
            default:0
        },


        tax:{
            type:Number,
            default:0
        },


        discount:{
            type:Number,
            default:0
        },


        total:{
            type:Number,
            required:true
        }

    },



    // ==========================
    // Status
    // ==========================


    paymentStatus:{
        type:String,

        enum:[
            "pending",
            "paid",
            "failed",
            "refunded"
        ],

        default:"pending"
    },


    orderStatus:{
        type:String,

        enum:[
            "placed",
            "accepted",
            "preparing",
            "ready",
            "out_for_delivery",
            "delivered",
            "cancelled",
            "rejected"
        ],

        default:"placed"
    },


    cancelReason:{
        type:String
    },


    // ==========================
    // Delivery Tracking
    // ==========================

    deliveryTracking:{

        currentLocation:{
            type:{
                type:String,
                enum:["Point"]
            },

            coordinates:[Number]
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


orderSchema.index({
    customer:1
});


orderSchema.index({
    restaurant:1
});


orderSchema.index({
    deliveryPartner:1
});


orderSchema.index({
    orderStatus:1
});
orderSchema.index({
    "deliveryAddress.coordinates":"2dsphere"
});
orderSchema.index({
    "deliveryTracking.currentLocation":"2dsphere"
});
orderSchema.index({
    createdAt:-1
});

const Order = mongoose.model(
    "Order",
    orderSchema
);


module.exports = Order;