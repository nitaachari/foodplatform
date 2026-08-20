const jwt = require("jsonwebtoken"); //used to create jwt

const generateToken = (userId) => {
    return jwt.sign(
        //this basically takes payload secret and options
        {
            id: userId
        },
        process.env.JWT_SECRET,
        {
            expiresIn: process.env.JWT_EXPIRE
        }
    );
};

module.exports = generateToken;
