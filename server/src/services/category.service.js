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
        .toLowerCase(); //this is done so that you can check that the new category you are creating does not already exist



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
        ownerId.toString() //every restaurant has an owner and so you are checking if the user who is adding category is the owner
    ) {

        throw new Error(
            "You are not authorized to manage categories for this restaurant." //example of authorization
        );

    }



    const existingCategory =
        await Category.findOne({

            restaurant: restaurantId, //each rest is uniquely identified by restaurant id

            name: normalizedName

        }); //we check in categories if the category already exist so check for the restaurant 



    if (existingCategory) {

        throw new Error(
            "Category already exists."
        );

    }



    const category =
        await Category.create({

            restaurant: restaurantId,

            name: normalizedName //else create category 

        });



    return category;  // for the response the controller will send

};





// Get all categories of a restaurant

const getCategoriesByRestaurant = async (
    restaurantId
) => {


    const restaurant =
        await Restaurant.findById(
            restaurantId
        ); //first check if the restaurant exists


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
    ownerId, //to see if the owner is authorized to make changes
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
            .toLowerCase(); //we store normalized names so thats its easy for comparison to check if category exists instead of fetching the name first and then converting to lowercase and checking



        const existingCategory =
            await Category.findOne({

                restaurant: category.restaurant,

                name: normalizedName,

                _id: {
                    $ne: categoryId
                }

            }); //if you are trying to update the same way like theres no change in original and updated then show category already exists error so we show category already exists error in two places one while creating category and one while updating



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
    ownerId //to check authorization
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