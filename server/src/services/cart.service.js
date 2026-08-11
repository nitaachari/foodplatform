const Cart = require("../models/Cart");
const MenuItem = require("../models/MenuItem");



// =====================================
// Calculate Cart Total
// =====================================

const calculateTotal = (cart) => {


    let total = 0;


    cart.items.forEach(
        (item)=>{


            let itemTotal =
                item.price *
                item.quantity;



            // Add customization prices

            if(item.customizations){

                item.customizations.forEach(
                    (option)=>{


                        itemTotal +=
                            option.price *
                            item.quantity;


                    }
                );

            }



            total += itemTotal;


        }
    );



    cart.totalAmount = total;


};







// =====================================
// Add Item To Cart
// =====================================

const addToCart = async (
    userId,
    data
)=>{


    const {
        menuItemId,
        quantity,
        customizations
    } = data;



    // Find menu item

    const menuItem =
        await MenuItem.findById(
            menuItemId
        );



    if(!menuItem){

        throw new Error(
            "Menu item not found."
        );

    }




    // Check availability

    if(!menuItem.isAvailable){

        throw new Error(
            "Menu item is currently unavailable."
        );

    }




    // Find user cart

    let cart =
        await Cart.findOne({
            user:userId
        });




    // Create cart if first item

    if(!cart){


        cart =
        await Cart.create({

            user:userId,

            restaurant:
                menuItem.restaurant,

            items:[]

        });


    }




    // Check restaurant mismatch

    if(
        cart.restaurant.toString()
        !==
        menuItem.restaurant.toString()
    ){

        throw new Error(
            "Cart already contains items from another restaurant."
        );

    }




    // Check existing item

    const existingItem =
        cart.items.find(

            item =>
            item.menuItem.toString()
            ===
            menuItemId

        );




    if(existingItem){


        existingItem.quantity +=
            quantity || 1;



    }
    else{


        cart.items.push({

            menuItem:
                menuItem._id,


            name:
                menuItem.name,


            price:
                menuItem.discountPrice ||
                menuItem.price,


            quantity:
                quantity || 1,


            customizations:
                customizations || []

        });


    }





    calculateTotal(cart);



    await cart.save();



    return cart;


};







// =====================================
// Get User Cart
// =====================================

const getCart = async (
    userId
)=>{


    const cart =
        await Cart.findOne({
            user:userId
        })
        .populate(
            "items.menuItem",
            "name images price"
        )
        .populate(
            "restaurant",
            "name images"
        );



    if(!cart){

        throw new Error(
            "Cart is empty."
        );

    }



    return cart;


};







// =====================================
// Update Quantity
// =====================================

const updateQuantity = async (
    userId,
    itemId,
    quantity
)=>{


    const cart =
        await Cart.findOne({
            user:userId
        });



    if(!cart){

        throw new Error(
            "Cart not found."
        );

    }





    const item =
        cart.items.find(

            item =>
            item._id.toString()
            ===
            itemId

        );




    if(!item){

        throw new Error(
            "Item not found in cart."
        );

    }




    if(quantity < 1){

        throw new Error(
            "Quantity must be at least 1."
        );

    }




    item.quantity =
        quantity;




    calculateTotal(cart);



    await cart.save();



    return cart;


};







// =====================================
// Remove Item
// =====================================

const removeItem = async (
    userId,
    itemId
)=>{


    const cart =
        await Cart.findOne({
            user:userId
        });



    if(!cart){

        throw new Error(
            "Cart not found."
        );

    }




    const initialLength =
        cart.items.length;



    cart.items =
        cart.items.filter(

            item =>
            item._id.toString()
            !==
            itemId

        );




    if(
        cart.items.length
        ===
        initialLength
    ){

        throw new Error(
            "Item not found in cart."
        );

    }





    calculateTotal(cart);



    await cart.save();



    return cart;


};







// =====================================
// Clear Cart
// =====================================

const clearCart = async (
    userId
)=>{


    const cart =
        await Cart.findOne({
            user:userId
        });



    if(!cart){

        throw new Error(
            "Cart not found."
        );

    }




    cart.items = [];

    cart.totalAmount = 0;



    await cart.save();



    return cart;


};







module.exports = {


    addToCart,

    getCart,

    updateQuantity,

    removeItem,

    clearCart

};