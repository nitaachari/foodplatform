const mongoose = require("mongoose");

const { Schema } = mongoose;


const chatSchema = new Schema(

{

    // ==========================
    // Participants
    // ==========================


    sender:{
        type:Schema.Types.ObjectId,
        ref:"User",
        required:true
    },


    receiver:{
        type:Schema.Types.ObjectId,
        ref:"User",
        required:true
    },


    // ==========================
    // Context
    // ==========================


    order:{
        type:Schema.Types.ObjectId,
        ref:"Order",
        default:null
    },


    restaurant:{
        type:Schema.Types.ObjectId,
        ref:"Restaurant",
        default:null
    },


    deliveryPartner:{
        type:Schema.Types.ObjectId,
        ref:"DeliveryPartner",
        default:null
    },


    // ==========================
    // Message
    // ==========================


    message:{
        type:String,
        required:true,
        trim:true,
        maxlength:1000
    },


    messageType:{
        type:String,

        enum:[
            "text",
            "image",
            "location"
        ],

        default:"text"
    },


    isRead:{
        type:Boolean,
        default:false
    }

},

{
    timestamps:true
}

);


// ==========================
// Indexes
// ==========================


// Fetch conversation

chatSchema.index({
    sender:1,
    receiver:1
});


// Order based chat

chatSchema.index({
    order:1
});


// Latest messages

chatSchema.index({
    createdAt:-1
});



const Chat = mongoose.model(
    "Chat",
    chatSchema
);


module.exports = Chat;