const jwt = require("jsonwebtoken");

const User = require("../models/User");

const protect = async (req, res, next) => {
    //middleware

    try {
        const token = req.cookies.token; //its a cookie and the name is token

        if (!token) {
            return res.status(401).json({
                message: "Not authorized"
            });
        }

        const decoded = jwt.verify(
            //verify the jwt everytime to check if the right user is authenticated
            token,
            process.env.JWT_SECRET
        );

        const user = await User.findById(
            //and then we send the user
            decoded.id
        );

        if (!user) {
            return res.status(401).json({
                message: "User not found"
            });
        }

        req.user = user; //modify so it can be used by the next function that runs after middleware

        next();
    } catch (error) {
        res.status(401).json({
            message: "Invalid token"
        });
    }
};

module.exports = protect;
