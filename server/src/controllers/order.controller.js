const orderService = require("../services/order.service");



// ======================================
// Create Order
// ======================================

const createOrder = async(req,res)=>{


    try{


        const order =
            await orderService.createOrder(

                req.user._id,

                req.body.deliveryAddress,

                req.body.paymentMethod

            );



        res.status(201).json({

            success:true,

            message:
            "Order placed successfully",

            order

        });


    }
    catch(error){


        res.status(400).json({

            success:false,

            message:error.message

        });


    }


};







// ======================================
// Get Customer Orders
// ======================================

const getCustomerOrders = async(req,res)=>{


    try{


        const orders =
            await orderService.getCustomerOrders(

                req.user._id

            );



        res.status(200).json({

            success:true,

            orders

        });


    }
    catch(error){


        res.status(400).json({

            success:false,

            message:error.message

        });


    }


};







// ======================================
// Get Single Order
// ======================================

const getOrderById = async(req,res)=>{


    try{


        const order =
            await orderService.getOrderById(

                req.params.id,

                req.user._id

            );



        res.status(200).json({

            success:true,

            order

        });


    }
    catch(error){


        res.status(404).json({

            success:false,

            message:error.message

        });


    }


};







// ======================================
// Cancel Order
// ======================================

const cancelOrder = async(req,res)=>{


    try{


        const order =
            await orderService.cancelOrder(

                req.params.id,

                req.user._id,

                req.body.reason

            );



        res.status(200).json({

            success:true,

            message:
            "Order cancelled",

            order

        });


    }
    catch(error){


        res.status(400).json({

            success:false,

            message:error.message

        });


    }


};







// ======================================
// Restaurant Orders
// ======================================

const getRestaurantOrders = async(req,res)=>{


    try{


        const orders =
            await orderService.getRestaurantOrders(

                req.user._id
            );



        res.status(200).json({

            success:true,

            orders

        });


    }
    catch(error){


        res.status(400).json({

            success:false,

            message:error.message

        });


    }


};







// ======================================
// Update Order Status
// ======================================

const updateOrderStatus = async(req,res)=>{


    try{


        const order =
            await orderService.updateOrderStatus(

                req.params.id,

                req.user._id,

                req.body.status

            );



        res.status(200).json({

            success:true,

            message:
            "Order status updated",

            order

        });


    }
    catch(error){


        res.status(400).json({

            success:false,

            message:error.message

        });


    }


};







// ======================================
// Assign Delivery Partner
// ======================================

const assignDeliveryPartner = async(req,res)=>{


    try{


        const order =
            await orderService.assignDeliveryPartner(

                req.params.id,

                req.user._id

            );



        res.status(200).json({

            success:true,

            message:
            "Delivery partner assigned",

            order

        });


    }
    catch(error){


        res.status(400).json({

            success:false,

            message:error.message

        });


    }


};







// ======================================
// Update Delivery Status
// ======================================

const updateDeliveryStatus = async(req,res)=>{


    try{


        const order =
            await orderService.updateDeliveryStatus(

                req.params.id,

                req.user._id,

                req.body.status

            );



        res.status(200).json({

            success:true,

            message:
            "Delivery status updated",

            order

        });


    }
    catch(error){


        res.status(400).json({

            success:false,

            message:error.message

        });


    }


};







// ======================================
// Get Available Orders (Delivery Partner)
// ======================================

const getAvailableOrders = async(req,res)=>{


    try{


        const orders =
            await orderService.getAvailableOrders();



        res.status(200).json({

            success:true,

            orders

        });


    }
    catch(error){


        res.status(400).json({

            success:false,

            message:error.message

        });


    }


};




// ======================================
// Get My Deliveries (Delivery Partner)
// ======================================

const getMyDeliveries = async(req,res)=>{


    try{


        const orders =
            await orderService.getDeliveryPartnerOrders(

                req.user._id

            );



        res.status(200).json({

            success:true,

            orders

        });


    }
    catch(error){


        res.status(400).json({

            success:false,

            message:error.message

        });


    }


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

    getMyDeliveries

};