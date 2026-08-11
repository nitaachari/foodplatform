const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const cookieParser = require("cookie-parser");
const authRoutes = require("./routes/auth.routes");
const restaurantRoutes = require("./routes/restaurant.routes");
const categoryRoutes = require("./routes/category.routes");
const menuItemRoutes =require("./routes/menuItem.routes");
const cartRoutes =require("./routes/cart.routes");
const orderRoutes =require("./routes/order.routes");
const paymentRoutes = require("./routes/payment.routes");
const deliveryPartnerRoutes = require("./routes/deliveryPartner.routes");
const reviewRoutes = require("./routes/review.routes");
const app = express();


// Security Middleware

app.use(
    helmet()
);


// CORS

app.use(
    cors({
        origin:"http://localhost:5173",
        credentials:true
    })
);


// Stripe Webhook
// Must be registered BEFORE express.json() below — Stripe's
// signature verification needs the raw, unparsed request body.
// Because this exact path is matched here first, requests to it
// never reach the express.json() middleware or the paymentRoutes
// router mounted further down.

app.post(
    "/api/payments/webhook",
    express.raw({ type: "application/json" }),
    require("./controllers/payment.controller").handleStripeWebhook
);


// Body Parser

app.use(
    express.json()
);


app.use(
    express.urlencoded({
        extended:true
    })
);


// Cookies

app.use(
    cookieParser()
);


// Test Route

app.get(
    "/",
    (req,res)=>{

        res.json({
            message:"Food Ordering API Running"
        });

    }
);
app.use(
    "/api/auth",
    authRoutes
);
app.use("/api/restaurants", restaurantRoutes);
app.use(
    "/api/categories",
    categoryRoutes
);
app.use(
    "/api/menu",
    menuItemRoutes
);
app.use(
    "/api/cart",
    cartRoutes
);
app.use(
    "/api/orders",
    orderRoutes
);
app.use("/api/payments", paymentRoutes);
app.use(
    "/api/delivery-partners",
    deliveryPartnerRoutes
);

app.use(
    "/api/reviews",
    reviewRoutes
);



module.exports = app;