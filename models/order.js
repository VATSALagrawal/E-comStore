const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
    shippingInfo:{
        address:{
            type:String,
            required:true
        },
        city:{
            type:String,
            required:true
        },
        postalCode:{
            type:String,
            required:true
        },
        state:{
            type:String,
            required:true
        },
        country:{
            type:String,
            required:true
        },
    },
    user:{
        type:mongoose.Schema.ObjectId,
        ref:'User',
        required:true    
    },
    orderItems :[
        {
            name:{
                type:String,
                required:true
            },
            quantity:{
                type:Number,
                required:true
            },
            image:{
                type:String,  // secure url of image
                required:true
            },
            price:{
                type:Number ,  // price of one item * quantit   y
                required:true
            },
            product:{
                type:mongoose.Schema.ObjectId,
                ref:'Product',
                required:true   
            }
        }
    ],
    paymentInfo:{
        id:{
            type:String,   // Payment id recieved from RazorPay
            required:true
        }
    },
    taxAmount:{
        type:Number,
        required:true
    },
    shippingAmount:{
        type:Number,
        required:true
    },
    totalAmount:{
        type:Number,
        required:true
    },
    orderStatus:{
        type:String,
        required:true,
        enum:{
            values:[
                'processing',
                'failed',
                'delivered',
                'paymentCompleted'
            ],
            message:"Please Select Order status Only from processing , failed, delivered , paymentCompleted"
        },
        default:'processing'
    },
    deliveredAt:{
        type:Date
    },
    createdAt:{
        type:Date,
        default:Date.now
    }  

});

module.exports = mongoose.model('Order',orderSchema);