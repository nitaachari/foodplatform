const User = require("../models/User");

const generateToken = require("../utils/generateToken");
const bcrypt=require("bcrypt");




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
    } = data; //destructuring the data and this data comes from the controller where we give req.body as parameter and call this 



    // Check existing user

    const existingUser =
        await User.findOne({
            email
        }); //here we check for existing user using email we use await as we want to wait for the answer


    if (existingUser) {

        throw new Error(
            "User already exists" //if user exists give error
        );

    }





    // Validate role

    const allowedRoles = [

        "customer",

        "restaurant",

        "delivery"

    ];



    // Default role for users who do not specify one

    const userRole = role || "customer"; //default 



    if (!allowedRoles.includes(userRole)) {

        throw new Error(
            "Invalid role"
        );

    } //here we check if the role is either customer or delivery partner or user 
    // In registerUser, right before saving:
const salt = await bcrypt.genSalt(10); //random
//gensalt is generate salt and 10 rounds of it
/*
"Salt" is just a small random ingredient. Here's why it matters: imagine two different users both pick the exact same password, "password123". Without salt, they'd end up with the exact same scrambled result — and anyone looking at the database could tell "oh, these two people use the same password." Salt mixes in something random and different for each user, so even identical passwords end up looking completely different once scrambled. 
genSalt(10) just means "go generate one of these random ingredients for me."
 */
const hashedPassword = await bcrypt.hash(password, salt); //we hash the password using salt

//including pulling out the same salt that's secretly stored inside the saved hash






    

    const user = await User.create({ 

        name,

        email,

        password:hashedPassword,

        phone, //it will fill phone:phone

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

    }; //so result in controller gets this we return token as the controller sends that as a part of response so we need to return everything that we want the response to contain


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









    const isMatch = await bcrypt.compare(password, user.password); //bcrypt.compare what it does is basically scrambles what you have typed and checks it with the scrambled one in the database 






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