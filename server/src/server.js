require("dotenv").config(); //get the env file

const app = require("./app"); //get the app server

const connectDB = require("./config/database"); //this connects the database

const PORT = process.env.PORT || 5000; //the port where we want our server to listen

// Database Connection

connectDB(); //establish database connection

// Start Server

app.listen(
    //express server listens for requests
    PORT,
    () => {
        console.log(`Server running on port ${PORT}`);
    }
);
//our start point
