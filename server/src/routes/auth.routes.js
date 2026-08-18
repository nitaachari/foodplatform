const express = require("express");

const router = express.Router(); //router here acts like a mini app


const {
    register,
    login,
    logout,
    getMe
}
=
require("../controllers/auth.controller"); //import all the controllers

//now another good thing about our backend is layered and its production level now usually the function is written here but we use controllers

const protect=require("../middleware/auth.middleware");



router.post(
"/register", 
register
);


router.post(
"/login",
login
);


router.post(
"/logout",
logout
);


router.get(
"/me",
protect, //acts as a middleware
getMe
);



module.exports = router;