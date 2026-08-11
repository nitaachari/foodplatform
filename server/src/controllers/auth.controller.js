const authService = require("../services/auth.service");
const cookieOptions = require("../utils/cookieOptions");



const register = async(req,res)=>{

    try{

        const result =
        await authService.registerUser(
            req.body
        );


        res
        .cookie(
            "token",
            result.token,
            cookieOptions
        )
        .status(201)
        .json({

            message:"User registered successfully",

            user:result.user

        });


    }
    catch(error){

        res.status(400).json({

            message:error.message

        });

    }

};





const login = async(req,res)=>{


    try{


        const result =
        await authService.loginUser(
            req.body
        );


        res
        .cookie(
            "token",
            result.token,
            cookieOptions
        )
        .status(200)
        .json({

            message:"Login successful",

            user:result.user

        });


    }
    catch(error){


        res.status(401).json({

            message:error.message

        });


    }


};





// Get currently logged-in user

const getMe = async(req,res)=>{

    res.status(200).json({

        user:req.user

    });

};





// Logout user

const logout = async(req,res)=>{

    res
    .clearCookie(
        "token",
        cookieOptions
    )
    .status(200)
    .json({

        message:"Logged out successfully"

    });

};





module.exports = {

    register,

    login,

    getMe,

    logout

};