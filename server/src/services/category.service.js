const Category = require("../models/Category");
const Restaurant = require("../models/Restaurant");



// Create Category

const createCategory = async (
    categoryData,
    ownerId
) => {

    const {
        restaurantId,
        name
    } = categoryData;


    const normalizedName = name
        .trim()
        .toLowerCase();



    const restaurant =
        await Restaurant.findById(
            restaurantId
        );


    if (!restaurant) {

        throw new Error(
            "Restaurant not found."
        );

    }



    if (
        restaurant.owner.toString() !==
        ownerId.toString()
    ) {

        throw new Error(
            "You are not authorized to manage categories for this restaurant."
        );

    }



    const existingCategory =
        await Category.findOne({

            restaurant: restaurantId,

            name: normalizedName

        });



    if (existingCategory) {

        throw new Error(
            "Category already exists."
        );

    }



    const category =
        await Category.create({

            restaurant: restaurantId,

            name: normalizedName

        });



    return category;

};





// Get all categories of a restaurant

const getCategoriesByRestaurant = async (
    restaurantId
) => {


    const restaurant =
        await Restaurant.findById(
            restaurantId
        );


    if (!restaurant) {

        throw new Error(
            "Restaurant not found."
        );

    }



    const categories =
        await Category.find({

            restaurant: restaurantId

        });



    return categories;

};





// Update Category

const updateCategory = async (
    categoryId,
    ownerId,
    updateData
) => {


    const category =
        await Category.findById(
            categoryId
        );


    if (!category) {

        throw new Error(
            "Category not found."
        );

    }



    const restaurant =
        await Restaurant.findById(
            category.restaurant
        );


    if (!restaurant) {

        throw new Error(
            "Restaurant not found."
        );

    }



    if (
        restaurant.owner.toString() !==
        ownerId.toString()
    ) {

        throw new Error(
            "You are not authorized to update this category."
        );

    }



    if (updateData.name) {


        const normalizedName =
            updateData.name
            .trim()
            .toLowerCase();



        const existingCategory =
            await Category.findOne({

                restaurant: category.restaurant,

                name: normalizedName,

                _id: {
                    $ne: categoryId
                }

            });



        if (existingCategory) {

            throw new Error(
                "Category already exists."
            );

        }



        category.name = normalizedName;

    }



    await category.save();



    return category;

};





// Delete Category

const deleteCategory = async (
    categoryId,
    ownerId
) => {


    const category =
        await Category.findById(
            categoryId
        );


    if (!category) {

        throw new Error(
            "Category not found."
        );

    }



    const restaurant =
        await Restaurant.findById(
            category.restaurant
        );



    if (!restaurant) {

        throw new Error(
            "Restaurant not found."
        );

    }



    if (
        restaurant.owner.toString() !==
        ownerId.toString()
    ) {

        throw new Error(
            "You are not authorized to delete this category."
        );

    }



    await category.deleteOne();



};





module.exports = {

    createCategory,

    getCategoriesByRestaurant,

    updateCategory,

    deleteCategory

};