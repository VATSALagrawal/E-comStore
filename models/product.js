const mongoose = require('mongoose');
const productSchema = new mongoose.Schema({
    name :{
        type:String,
        required:[true,"Please Provide a name for your Product"],
        trim:true,
        maxlength:[30,"Product Name should be of max 30 characters"]
    },
    price:{
        type:Number,
        required:[true,"Please Provide a Price for your Product"],
        maxlength:[4,"Product Price should be of max 4 digits"]
    },
    description :{
        type:String,
        required:[true,"Please Provide a description for your Product"],
        maxlength:[50,"Description can be of maximum 50 characters"]
    },
    photos:[
        {
            id:{
                type:String,
                required:[true,"Please Provide Product Photo id"],
            },
            secure_url:{
                type:String,
                required:[true,"Please Provide Product Photo url"],
            },
        }
    ],
    category:{
        type:String,
        required:[true,"Please Provide a Category for your Product from shortsleeves , longsleeves and hoodies"],
        enum:{
            values:[
                'shortsleeves',
                'longsleeves',
                'hoodies'
            ],
            message:"Please Select Category Only from short-sleeves , long-sleeves and hoodies"
        }
    },
    brand:{
        type:String,
        required:[true,"Please Provide a Brand Name for your Product"],
    },
    stock :{
        type:Number,
        default:100
    },
    rating :{
        type:Number,
        default:0
    },
    numOfReviews :{
        type:Number,
        default:0
    },
    reviews:[
        {
            user:{
                type:mongoose.Schema.ObjectId,
                ref:'User',
                required:true
            },
            name:{
                type:String,
                required:[true,"Please Provide a Name"]
            },
            rating :{
                type:Number,
                required:[true,"Please Provide Review Rating "]
            },
            comment:{
                type:String,
                maxlength:[50,"Comment can be of maximum 50 characters"]
            }
        }
    ],
    AddedBy:{
        type:mongoose.Schema.ObjectId,
        ref:'User',
        required:true
    },
    CreatedAt:{
        type:Date,
        default: Date.now
    } 
});

module.exports = mongoose.model('Product',productSchema);