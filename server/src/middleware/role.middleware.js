const authorize = (...roles)=>{


    return (req,res,next)=>{


        if(
            !roles.includes(req.user.role)
        ){

            return res.status(403).json({

                message:
                "Access denied"

            });

        }


        next();


    };


};
const getMe = async(req,res)=>{


    res.status(200).json({

        user:req.user

    });


};


module.exports = authorize;