require("dotenv").config();


const app = require("./app");

const connectDB = require("./config/database");


const PORT = process.env.PORT || 5000;



// Database Connection

connectDB();


// Start Server

app.listen(
    PORT,
    ()=>{

        console.log(
            `Server running on port ${PORT}`
        );

    }
);