const Order = require("../models/Order");
const Cart = require("../models/Cart");
const Restaurant = require("../models/Restaurant");
const DeliveryPartner = require("../models/DeliveryPartner");
const MenuItem = require("../models/MenuItem");



// ======================================
// Constants
// ======================================

const DELIVERY_FEE = 40;
const TAX_RATE = 0.05;



// Order status transitions

const ORDER_STATUS_TRANSITIONS = { //this refers to for every status what is the transition refers to the order lifecycle and from one state what are the possible states it can transition into

    placed: [ //so for placed the order can go to accept or reject or cancelled
        "accepted",
        "rejected",
        "cancelled"
    ],

    accepted: [ //cancel can only happen until here after that order cannot be cancelled  if rest accepts order then it can go to preparation or can be cancelled by the user
        "preparing",
        "cancelled"
    ],

    preparing: [ //once the prep starts then there is no scope of cancel
        "ready"
    ],

    ready: [
        "out_for_delivery"
    ],

    out_for_delivery: [
        "delivered"
    ]

};



// Customer can cancel only before food preparation begins

const NON_CANCELLABLE_STATUSES = [

    "preparing",

    "ready",

    "out_for_delivery",

    "delivered",

    "cancelled",

    "rejected"

];



// ======================================
// Create Order
// ======================================
/*
Think about why the order has to exist first: your payment.service.js's createPayment function takes an orderId and creates a Stripe PaymentIntent with that ID in its metadata. Stripe needs something to attach the charge to. You can't create a payment for an order that doesn't exist yet — so the order has to be created as a "pending" shell first, then payment gets attempted against it. This is exactly how real checkout flows work (Amazon, Swiggy, etc. all create an order record before the charge settles) — it's what lets you show the customer an order confirmation page immediately, with a status that updates once payment clears.
 */

const createOrder = async (

    customerId, //the person who will receive the order 

    deliveryAddress, //where to deliver the order 

    paymentMethod 

) => {

    if (!deliveryAddress) {

        throw new Error(
            "Delivery address is required."
        );

    }



    const cart = await Cart.findOne({ //to check if cart is filled

        user: customerId

    });



    if (!cart || cart.items.length === 0) {

        throw new Error(
            "Your cart is empty."
        );

    }



    // ======================================
    // Ensure every menu item is still available
    // ======================================
//so that you dont order an unavailable item
    for (const item of cart.items) {

        const menuItem =
            await MenuItem.findById(item.menuItem); //first check if that item even exists 

        if (!menuItem) {

            throw new Error(
                `${item.name} no longer exists.`
            );

        }

        if (!menuItem.isAvailable) {

            throw new Error(
                `${item.name} is currently unavailable.`
            );

        }

    }



    // ======================================
    // Snapshot pricing
    // ======================================

    const subtotal = cart.totalAmount;

    const deliveryFee = DELIVERY_FEE;

    const tax =
        Math.round(
            subtotal * TAX_RATE * 100
        ) / 100;

    const discount = 0;

    const total =
        subtotal +
        deliveryFee +
        tax -
        discount;



    const order =
        await Order.create({

            customer: customerId,

            restaurant: cart.restaurant,

            items: cart.items,

            deliveryAddress,

            pricing: { //the price of the order

                subtotal,

                deliveryFee,

                tax,

                discount,

                total

            }

        });
        //after storing the order and clicking checkout we usually clear the cart right but if the payment has failed the cart should not be cleared the cart should only be cleared if payment has succeeded



    // ======================================
    // Clear cart
    // (cod has no real charge to fail, so it's safe to clear right
    // away — same as before. "card" is different: if we clear here
    // and the payment then fails, the customer loses their cart with
    // nothing to show for it. For card, the cart is cleared later,
    // only once the payment actually succeeds — see
    // markPaymentSucceeded in payment.service.js.)
    // ======================================

    if (paymentMethod !== "card") { //if cod then just clear the cart

        cart.items = [];

        cart.totalAmount = 0;

        await cart.save();

    }



    return order;

};


// ======================================
// Get Customer Orders
// ======================================

const getCustomerOrders = async (
    customerId
) => {

    const orders = await Order.find({
        customer: customerId
    })
        .sort({ createdAt: -1 }) //based on recency
        .populate("restaurant", "name images")
        .populate("deliveryPartner");

    return orders;

};




// ======================================
// Get Single Order
// ======================================

const getOrderById = async (
    orderId,
    userId
) => {

    const order = await Order.findById(orderId)
        .populate("restaurant")
        .populate("deliveryPartner");

    if (!order) {

        throw new Error(
            "Order not found."
        );

    }

    const isCustomer =
        order.customer.toString() ===
        userId.toString();

    const isRestaurantOwner =
        order.restaurant &&
        order.restaurant.owner.toString() ===
        userId.toString();

    const isAssignedDeliveryPartner =
        order.deliveryPartner &&
        order.deliveryPartner.user.toString() ===
        userId.toString();

    if (
        !isCustomer &&
        !isRestaurantOwner &&
        !isAssignedDeliveryPartner
    ) {

        throw new Error(
            "You are not authorized to view this order."
        );

    }

    return order;

};




// ======================================
// Cancel Order
// ======================================

const cancelOrder = async (

    orderId,

    customerId,

    reason

) => {

    const order =
        await Order.findById(orderId);

    if (!order) {

        throw new Error(
            "Order not found."
        );

    }

    if (
        order.customer.toString() !==
        customerId.toString()
    ) {

        throw new Error(
            "You are not authorized to cancel this order."
        );

    }

    if (
        NON_CANCELLABLE_STATUSES.includes( //then u cannot cancel
            order.orderStatus
        )
    ) {

        throw new Error(
            `Order cannot be cancelled once it is "${order.orderStatus}".`
        );

    }

    order.orderStatus = "cancelled"; //otherwise just change the status

    order.cancelReason =
        reason || "Cancelled by customer";

    await order.save();

    return order;

};

// ======================================
// Get Restaurant Orders
// ======================================

const getRestaurantOrders = async (
    ownerId
) => {

    const restaurant =
        await Restaurant.findOne({

            owner: ownerId

        });

    if (!restaurant) {

        throw new Error(
            "No restaurant found for this account."
        );

    }

    const orders =
        await Order.find({

            restaurant: restaurant._id

        })
        .sort({

            createdAt: -1

        })
        .populate(
            "customer",
            "name phone"
        )
        .populate(
            "deliveryPartner"
        );

    return orders;

};




// ======================================
// Update Order Status
// ======================================

const VALID_ORDER_STATUSES = [

    "placed",

    "accepted",

    "preparing",

    "ready",

    "out_for_delivery",

    "delivered",

    "cancelled",

    "rejected"

];



const updateOrderStatus = async (

    orderId,

    ownerId,

    status

) => {

    if (
        !VALID_ORDER_STATUSES.includes(status)
    ) {

        throw new Error(
            "Invalid order status."
        );

    }



    const order =
        await Order.findById(orderId);

    if (!order) {

        throw new Error(
            "Order not found."
        );

    }



    const restaurant =
        await Restaurant.findById(
            order.restaurant
        );

    if (!restaurant) {

        throw new Error(
            "Restaurant not found."
        );

    }



    if (
        restaurant.owner.toString() !==
        ownerId.toString()
    ) {

        throw new Error(
            "You are not authorized to update this order."
        );

    }



    // ======================================
    // Validate status transition
    // ======================================

    const allowedTransitions =
        ORDER_STATUS_TRANSITIONS[
            order.orderStatus
        ] || [];



    if (
        !allowedTransitions.includes(status)
    ) {

        throw new Error(

            `Cannot change order status from "${order.orderStatus}" to "${status}".` //if it cannot transition to that

        );

    }



    order.orderStatus = status; //make the transition

    await order.save();

    return order;

};


// ======================================
// Assign Delivery Partner
// (self-assign: userId is the logged-in delivery
// partner's own _id, resolved to their DeliveryPartner
// profile — a delivery partner can only assign themself,
// never an arbitrary partner id from the client)
// ======================================
/*
1. Verify the delivery partner

Make sure the logged-in user actually has a delivery-partner profile.

2. Ensure the partner is available

Only partners whose status is online can accept deliveries.

3. Perform advisory checks

Check whether the order exists, is ready, and is currently unassigned so you can return helpful error messages.

4. Atomically claim the order

Use a single MongoDB operation that says “find a ready, unassigned order and assign me to it” so only one request can win.

5. Mark the partner as busy

After the claim succeeds, update the delivery partner so they cannot immediately take another order.
 */

const assignDeliveryPartner = async ( //only a delivery partner can assign himself to the order every order has to be assigned a delivery partner
    orderId,
    userId
) => {

    const deliveryPartner = await DeliveryPartner.findOne({
        user: userId
    });

    if (!deliveryPartner) {
        throw new Error(
            "No delivery partner profile found for this account."
        );
    }

    if (deliveryPartner.status !== "online") {
        throw new Error(
            "You must be online to accept deliveries."
        );
    }

    // ======================================
    // Advisory pre-check
    // ======================================
    // This read is only here to produce a clear, specific error message
    // for the common cases (order missing / not ready yet). It can be
    // stale by the time the atomic claim below runs -- that's fine,
    // because the claim re-checks the same conditions itself and is the
    // actual source of truth.

    const existingOrder = await Order.findById(orderId);

    if (!existingOrder) {
        throw new Error(
            "Order not found."
        );
    }

    if (existingOrder.orderStatus !== "ready") {
        throw new Error(
            "Order is not ready for pickup yet."
        );
    }

    if (existingOrder.deliveryPartner) {
        throw new Error(
            "This order already has a delivery partner assigned."
        );
    }

    // ======================================
    // Atomic claim
    // ======================================
    // findOneAndUpdate's filter + update run as a single atomic operation
    // in MongoDB. This is the actual fix for the race condition: if two
    // delivery partners hit "Accept" on the same order at the same
    // instant, only one findOneAndUpdate call can match
    // (orderStatus: "ready", deliveryPartner: null) -- the other gets
    // null back, even though both passed the advisory checks above.

    const order = await Order.findOneAndUpdate( //so that its an atomic action
        {
            _id: orderId,
            orderStatus: "ready",
            deliveryPartner: null
        },
        {
            deliveryPartner: deliveryPartner._id,
            orderStatus: "out_for_delivery"
        },
        {
            new: true //By default, findOneAndUpdate() returns the old document.
        }
    );

    if (!order) {
        throw new Error(
            "This order was just claimed by another delivery partner."
        );
    }

    deliveryPartner.status = "busy";
    await deliveryPartner.save();

    return order;

};



// ======================================
// Update Delivery Status
// (userId = logged-in delivery partner's _id;
// must be the partner assigned to this order)
// ======================================

const DELIVERY_UPDATABLE_STATUSES = [
    "out_for_delivery",
    "delivered"
];

const updateDeliveryStatus = async (
    orderId,
    userId,
    status
) => {

    if (!DELIVERY_UPDATABLE_STATUSES.includes(status)) { //
        throw new Error(
            "Invalid delivery status."
        );
    }

    const order = await Order.findById(orderId);

    if (!order) {
        throw new Error(
            "Order not found."
        );
    }

    if (!order.deliveryPartner) {
        throw new Error(
            "No delivery partner is assigned to this order."
        );
    }

    const deliveryPartner = await DeliveryPartner.findById(
        order.deliveryPartner
    );

    if (
        !deliveryPartner ||
        deliveryPartner.user.toString() !== userId.toString()
    ) {
        throw new Error(
            "You are not authorized to update this delivery."
        );
    }

    order.orderStatus = status;

    if (status === "delivered") {

        deliveryPartner.status = "online";
        deliveryPartner.totalDeliveries += 1;
        await deliveryPartner.save();

    }

    await order.save();

    return order;

};



// ======================================
// Get Available Orders
// (orders a delivery partner can browse and accept —
// ready for pickup, not yet claimed by anyone)
// ======================================

const getAvailableOrders = async () => {

    const orders =
        await Order.find({

            orderStatus: "ready", //is status is ready and no delivery partner has been assigned to it yet 

            deliveryPartner: null

        })
        .sort({

            createdAt: -1 //based on recency

        })
        .populate(
            "restaurant",
            "name address images"
        )
        .populate( //replaces the id with the info
            "customer",
            "name phone"
        );

    return orders;

};



// ======================================
// Get Delivery Partner Orders
// (current + past deliveries assigned to the
// logged-in delivery partner)
// ======================================

const getDeliveryPartnerOrders = async (
    userId
) => {

    const deliveryPartner =
        await DeliveryPartner.findOne({

            user: userId

        });

    if (!deliveryPartner) {

        throw new Error(
            "No delivery partner profile found for this account."
        );

    }

    const orders =
        await Order.find({

            deliveryPartner: deliveryPartner._id

        })
        .sort({

            createdAt: -1

        })
        .populate(
            "restaurant",
            "name address images"
        )
        .populate(
            "customer",
            "name phone"
        );

    return orders;

};



module.exports = {

    createOrder,

    getCustomerOrders,

    getOrderById,

    cancelOrder,

    getRestaurantOrders,

    updateOrderStatus,

    assignDeliveryPartner,

    updateDeliveryStatus,

    getAvailableOrders,

    getDeliveryPartnerOrders

};
