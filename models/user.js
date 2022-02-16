const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken'); 
const crypto = require("crypto");
const userSchema = new mongoose.Schema({
    name:{
        type:String,
        required:[true,'Please Provide Name']
    },
    email:{
        type:String,
        required:[true,'Please Provide Email'],
        unique:true,
        validate:[validator.isEmail,"Please Provide a valid Email"]
    },
    password:{
        type:String,
        required:[true,'Please Provide Password'],
        minlength:[6,'Password should atleast contain 6 characters'],
        select:false // When querying the DB password field will not be retured by default we will have to explicitly specify to select it
    },
    role:{
        type:String,
        default:'user'
    },
    photo:{
        id:{
            type:String,
        },
        secure_url:{
            type:String,
        }
    },
    createdAt:{
        type:Date,
        default: Date.now
    },
    forgotPasswordToken: String,
    forgotPasswordExpiry: Date 
});

// encrypt password hook 
userSchema.pre('save', async function(next){
    if(!this.isModified('password')){  // Checking if password feild is modified OR Initialized, if not then we move on
        return next();
    }
    this.password = await bcrypt.hash(this.password,10);
});

// Method to Validate Password 
userSchema.methods.validatePassword = async function(input_password){
    return await bcrypt.compare(input_password,this.password);
}

// Methode to Get JWT Token
userSchema.methods.getJwtToken = function(){
    return jwt.sign({user_id: this._id , user_email:this.email},process.env.JWT_SECRET,{
        expiresIn:process.env.JWT_EXPIRY
    });
}

// Method to generate forgot password token and store its hash in DB
userSchema.methods.getForgotPasswordToken = async function(){ 
 const forgotPasswordToken = crypto.randomBytes(20).toString('hex'); // generate long random string
 // hash this token and store in DB for extra security 
 this.forgotPasswordToken = crypto.createHash("sha256").update(forgotPasswordToken).digest("hex");
 // Set Expiry date of Token
 this.forgotPasswordExpiry = Date.now() + 30*60*1000 ; // setting expriry for 30 mins
 return forgotPasswordToken;
}

module.exports = mongoose.model('User',userSchema);