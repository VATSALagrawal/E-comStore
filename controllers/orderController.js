const Product = require("../models/product");
const Order = require('../models/order');
const bigPromise = require("../middlewares/bigPromise");
const CustomError = require('../utils/customError');

const createOrder = bigPromise(async (req,res,next)=>{
    const {
        shippingInfo,
        orderItems,
        paymentInfo,
        taxAmount,
        shippingAmount,
        totalAmount
    } = req.body;

    if(!shippingInfo || !orderItems || !paymentInfo || !taxAmount || !shippingAmount || !totalAmount){
        return next(new CustomError('Please Provide all necessary fields',400));
    }
    for (let index = 0; index < orderItems.length; index++) {
        let result = await updateStock(orderItems[index].product,orderItems[index].quantity,next);
        if(!result){ // if stock not updated return from function
            return ;
        }
    }
    const order = await Order.create({
        shippingInfo,
        orderItems,
        paymentInfo,
        taxAmount,
        shippingAmount,
        totalAmount,
        user : req.user._id
    });

    if(!order){
        return next(new CustomError('Order Creation Failed',500));
    }

    res.status(200).json({
        success:true,
        order
    });
});

const getOrder = bigPromise(async (req,res,next)=>{
    const order = await Order.findById(req.params.order_id).populate('user',"name email");  // add populate to check object id from another collection and also select required fields from there
    if(!order){
        return next(new CustomError('Order with given id not Found',400));
    }
    res.status(200).json({
        success:true,
        order
    });
});

const getLoggedInUserOrder = bigPromise(async (req,res,next)=>{
    const order = await Order.find(req.user._id) ; 
    if(!order){
        return next(new CustomError('Order with given id not Found',400));
    }
    res.status(200).json({
        success:true,
        order
    });
});

const adminGetAllOrders = bigPromise(async (req,res,next)=>{
    const orders = await Order.find({});

    res.status(200).json({
        success:true,
        orders
    });
});

const adminUpdateOrder = bigPromise(async (req,res,next)=>{
    const order = await Order.findById(req.params.order_id);
    if(!order){
        return next(new CustomError('Order with given id not Found',400));
    }
    
    if(order.orderStatus=='delivered'){
        return next(new CustomError('Order already delivered',400));
    }

    order.orderStatus = req.body.orderStatus.toLowerCase();
    await order.save();

    res.status(200).json({
        success:true,
        order
    });

});

const adminDeleteOrder = bigPromise(async (req,res,next)=>{
    const order = await Order.findById(req.params.order_id);
    if(!order){
        return next(new CustomError('Order with given id not Found',400));
    }
    order.orderItems.forEach(async element => {
        await AddStock(element.product,element.quantity); // add stock of product since order was deleted
    });
    await order.remove();

    res.status(200).json({
        success:true,
        msg:"Order Deleted Successfully"
    });

});
const updateStock = async (productId,quantity,next) => { 
    const product = await Product.findById(productId);
    //console.log(product.stock,quantity);
    if(product.stock>=quantity){
        product.stock-=quantity;
        await product.save({validateBeforeSave:false});
        return true;
    }
    else{
        next(new CustomError(`Product Quantity of product ${product.name} not sufficient`,400));
        return false;
    }
};

const AddStock = async (productId,quantity) => { 
    const product = await Product.findById(productId);
    //console.log(product.stock,quantity);
    product.stock +=quantity;
    await product.save({validateBeforeSave:false});
};

module.exports = {createOrder , getOrder , getLoggedInUserOrder , adminGetAllOrders , adminUpdateOrder , adminDeleteOrder};