const mongoose = require("mongoose");

const { Schema } = mongoose;


const menuItemSchema = new Schema(

{

    restaurant:{
        type:Schema.Types.ObjectId,
        ref:"Restaurant",
        required:true
    },


    category:{
        type:Schema.Types.ObjectId,
        ref:"Category",
        required:true
    },


    name:{
        type:String,
        required:true,
        trim:true,
        maxlength:100
    },


    description:{
        type:String,
        trim:true,
        maxlength:500
    },


    images:[
        {
            type:String
        }
    ],


    price:{
        type:Number,
        required:true,
        min:0
    },


    discountPrice:{
        type:Number,
        min:0
    },


    foodType:{
        type:String,
        enum:[
            "veg",
            "non-veg",
            "egg"
        ],
        required:true
    },


    ingredients:[
        {
            type:String
        }
    ],


    customizationOptions:[
        {
            name:String,

            choices:[
                {
                    name:String,
                    price:Number
                }
            ]
        }
    ],


    isAvailable:{
        type:Boolean,
        default:true
    },


    preparationTime:{
        type:Number,
        default:15
    },


    rating:{
        average:{
            type:Number,
            default:0
        },

        count:{
            type:Number,
            default:0
        }
    }

},

{
    timestamps:true
}

);



// Indexes

menuItemSchema.index({
    restaurant:1
});


menuItemSchema.index({
    category:1
});


menuItemSchema.index({
    name:"text",
    description:"text",
    ingredients:"text"
});


const MenuItem = mongoose.model(
    "MenuItem",
    menuItemSchema
);


module.exports = MenuItem;