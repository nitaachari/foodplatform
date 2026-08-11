const User = require("../models/User");

const generateToken = require("../utils/generateToken");




// ======================================
// Register User
// ======================================

const registerUser = async (data) => {


    const {
        name,
        email,
        password,
        phone,
        role
    } = data;



    // Check existing user

    const existingUser =
        await User.findOne({
            email
        });


    if (existingUser) {

        throw new Error(
            "User already exists"
        );

    }





    // Validate role

    const allowedRoles = [

        "customer",

        "restaurant",

        "delivery"

    ];



    // Default role for users who do not specify one

    const userRole = role || "customer";



    if (!allowedRoles.includes(userRole)) {

        throw new Error(
            "Invalid role"
        );

    }






    // IMPORTANT:
    // Do NOT hash password here.
    //
    // User model pre("save") hook
    // automatically hashes it.

    const user = await User.create({

        name,

        email,

        password,

        phone,

        role:userRole

    });







    const token =
        generateToken(
            user._id
        );







    // Remove password before response

    user.password = undefined;





    return {

        user,

        token

    };


};









// ======================================
// Login User
// ======================================

const loginUser = async (data) => {


    const {

        email,

        password

    } = data;





    // password is select:false
    // so explicitly request it

    const user =
        await User.findOne({
            email
        })
        .select("+password");






    if (!user) {

        throw new Error(
            "Invalid credentials"
        );

    }








    // Compare password using schema method

    const isMatch =
        await user.comparePassword(
            password
        );







    if (!isMatch) {

        throw new Error(
            "Invalid credentials"
        );

    }







    const token =
        generateToken(
            user._id
        );








    // Remove password before response

    user.password = undefined;







    return {

        user,

        token

    };


};








module.exports = {


    registerUser,

    loginUser


};