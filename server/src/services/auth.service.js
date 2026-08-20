const User = require("../models/User");
const generateToken = require("../utils/generateToken");
const bcrypt = require("bcrypt"); // used for password hashing

// ======================================
// Register User
// ======================================

const registerUser = async (data) => {
    // Destructuring the data that comes from the controller
    const { name, email, password, phone, role } = data;

    // Check if a user with this email already exists
    const existingUser = await User.findOne({ email });

    if (existingUser) {
        throw new Error("User already exists");
    }

    // These are the roles that a user is allowed to have
    const allowedRoles = ["customer", "restaurant", "delivery"];

    // If no role is provided, make the user a customer by default
    const userRole = role || "customer";

    if (!allowedRoles.includes(userRole)) {
        throw new Error("Invalid role");
    }

    // Generate a random salt before hashing the password
    const salt = await bcrypt.genSalt(10);

    // Hash the password using the salt
    const hashedPassword = await bcrypt.hash(password, salt);

    const user = await User.create({
        name,
        email,
        password: hashedPassword,
        phone,
        role: userRole
    });

    // Generate JWT token using the user's ID
    const token = generateToken(user._id);

    // Remove password before sending the user back
    // We don't want to expose the hashed password in the response
    user.password = undefined;

    return {
        user,
        token
    };

    // The service returns this data to the controller,
    // and the controller uses it to send the response
};

// ======================================
// Login User
// ======================================

const loginUser = async (data) => {
    const { email, password } = data;

    // Password is select:false in the User model,
    // so we have to explicitly request it here
    const user = await User.findOne({ email }).select("+password");

    if (!user) {
        throw new Error("Invalid credentials");
    }

    // bcrypt compares the password entered by the user
    // with the hashed password stored in the database
    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
        throw new Error("Invalid credentials");
    }

    // Generate JWT token after successful login
    const token = generateToken(user._id);

    // Remove password before sending the user back
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
