const mongoose = require("mongoose");

const { Schema } = mongoose;

const categorySchema = new Schema(
    {
        restaurant: {
            type: Schema.Types.ObjectId,
            ref: "Restaurant",
            required: true
        },

        name: {
            type: String,
            required: true,
            trim: true
        }
    },
    {
        timestamps: true
    }
);

// A restaurant cannot have two categories with the same name
categorySchema.index(
    {
        restaurant: 1,
        name: 1
    },
    {
        unique: true
    }
);

const Category = mongoose.model("Category", categorySchema);

module.exports = Category;