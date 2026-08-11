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

const ORDER_STATUS_TRANSITIONS = {

    placed: [
        "accepted",
        "rejected",
        "cancelled"
    ],

    accepted: [
        "preparing",
        "cancelled"
    ],

    preparing: [
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

const createOrder = async (

    customerId,

    deliveryAddress,

    paymentMethod

) => {

    if (!deliveryAddress) {

        throw new Error(
            "Delivery address is required."
        );

    }



    const cart = await Cart.findOne({

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

    for (const item of cart.items) {

        const menuItem =
            await MenuItem.findById(item.menuItem);

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

            pricing: {

                subtotal,

                deliveryFee,

                tax,

                discount,

                total

            }

        });



    // ======================================
    // Clear cart
    // (cod has no real charge to fail, so it's safe to clear right
    // away — same as before. "card" is different: if we clear here
    // and the payment then fails, the customer loses their cart with
    // nothing to show for it. For card, the cart is cleared later,
    // only once the payment actually succeeds — see
    // markPaymentSucceeded in payment.service.js.)
    // ======================================

    if (paymentMethod !== "card") {

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
        .sort({ createdAt: -1 })
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
        NON_CANCELLABLE_STATUSES.includes(
            order.orderStatus
        )
    ) {

        throw new Error(
            `Order cannot be cancelled once it is "${order.orderStatus}".`
        );

    }

    order.orderStatus = "cancelled";

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

            `Cannot change order status from "${order.orderStatus}" to "${status}".`

        );

    }



    order.orderStatus = status;

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

const assignDeliveryPartner = async (
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

    const order = await Order.findOneAndUpdate(
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
            new: true
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

    if (!DELIVERY_UPDATABLE_STATUSES.includes(status)) {
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

            orderStatus: "ready",

            deliveryPartner: null

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
