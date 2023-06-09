const Order = require("../models/orderModel");
const Event = require("../models/eventModel");
const ErrorHandler = require("../utils/errorhander");
const catchAsyncErrors = require("../middleware/catchAsyncErrors");

//Create new Order
exports.newOrder = catchAsyncErrors(async (req,res,next)=>{
    const {
        shippingInfo,
        orderItems,
        paymentInfo,
        itemsPrice,
        texPrice,
        shippingPrice,
        totalPrice
    } = req.body;

    const order = await Order.create({
        shippingInfo,
        orderItems,
        paymentInfo,
        itemsPrice,
        texPrice,
        shippingPrice,
        totalPrice,
        paidAt: Date.now(),
        user: req.user._id,
    });
    res.status(201).json({
        success:true,
        order,
    })
});




//get Single Order
exports.getSingleOrder = catchAsyncErrors(async (req, res, next)=>{
    const order = await Order.findById(req.params.id).populate(
        "user",
        "name email"
    );
    if(!order){
        return next(new ErrorHandler("Order not found with this Id",404));
    }
    res.status(200).json({
        success: true,
        order
    })
})

//get logged in user Orders
exports.myOrders = catchAsyncErrors( async(req, res, next)=>{
    const orders = await Order.find({user: req.user._id});

    res.status(200).json({
        success: true,
        orders,
    })
})

//get All Orders -- Admin
exports.getAllOrders = catchAsyncErrors(async(req,res, next)=>{
    const orders = await Order.find();

    let totalAmount =0;

    orders.forEach((order)=>{
        totalAmount += order.totalPrice;
    })

    res.status(200).json({
        success: true,
        totalAmount,
        orders,
    })
})

//Update OrderStatus --Admin
exports.updateOrder = catchAsyncErrors(async (req,res,next)=>{
    const order = await Order.findById(req.params.id);

    if(!order){
        return next(new ErrorHandler("Order not found with this Id",404))
    }

    if(order.orderStatus === "Delivered"){
        return next(new ErrorHandler("You have already delivered this order",400));
    }

    if(req.body.status === "Shipped"){
        order.orderItems.forEach(async(order)=>{
            await updateStock(order.event, order.quantity);
        });
    }

    order.orderStatus = req.body.status;

    if(req.body.status =="Delivered"){
        order.deliveredAt = Date.now();
    }

    await order.save({validateBeforeSave: false});
    res.status(200).json({
        success: true,
    })
}) 

async function updateStock(id, quantity){
    const event = await Event.findById(id);

    event.Stock -= quantity;
     
    await event.save({validateBeforeSave: false})
}

//delete Order --Admin
exports.deleteOrder = catchAsyncErrors(async(req,res,next)=>{
    const order = await Order.findById(req.params.id);

    if(!order){
        return next(new ErrorHandler("Order not found with this id",404));
    }
    await order.remove();

    res.status(200).json({
        success:true,
    })
})
