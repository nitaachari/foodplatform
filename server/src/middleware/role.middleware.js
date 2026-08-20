const authorize = (...roles) => {
    //actually the way this function is written is because we use authorize(customer,restaurant) we use it like this we basically pass arguments and so we use the spread operator it converts into an array

    return (req, res, next) => {
        if (!roles.includes(req.user.role)) {
            return res.status(403).json({
                message: "Access denied"
            });
        }

        next();
    };
};
const getMe = async (req, res) => {
    res.status(200).json({
        user: req.user
    });
};

module.exports = authorize;
