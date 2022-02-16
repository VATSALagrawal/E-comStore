const bigPromise = require("../middlewares/bigPromise");
const CustomError = require('../utils/customError');
const Razorpay = require('razorpay');

const captureRazorpayPayment = bigPromise(async (req,res,next)=>{
    const amount = req.body.amount;
    var instance = new Razorpay({key_id:process.env.RAZOR_PAY_KEY, key_secret: process.env.RAZOR_PAY_SECRET});
    const options = {
        amount: amount*100, // multiply amount by 100 since default amount is in paisa 
        currency: "INR",
        receipt: "receipt#1",
        notes: {
            key1: "value3",
            key2: "value2"
        }
    };
    const myOrder = await instance.orders.create(options);

    if(myOrder){
        res.status(201).json({
            success:true,
            amount,
            order:myOrder
        });
    }
});

module.exports = captureRazorpayPayment;