const bigPromise = require("../middlewares/bigPromise");
const CustomError = require('../utils/customError');
const User = require('../models/user');
const cookieToken = require("../utils/cookieToken");
const emailHelper = require("../utils/emailHelper");
const crypto = require('crypto');

const signup = bigPromise(async (req,res,next)=>{
    const {name,email,password} = req.body;

    if(!email || !name || !password){
        return next(new CustomError("Name , Email and Password are required",401));
    }

    const user = await User.create({
        name,
        email,
        password
    });

    cookieToken(user,res);
});
const tempAdminLogin = bigPromise(async (req,res,next)=>{
    const user = await User.findOne({name:'tempAdmin'});
    if(!user){
        return next(new CustomError('Temporary Admin login failed ..',400));
    } 
    cookieToken(user,res);
})

const login = bigPromise(async (req,res,next)=>{
    const {email,password} = req.body;

    // check for Empty email and password
    if(!email || !password){
        return next(new CustomError("Please Provide Email and Password",400));
    }

    const user = await User.findOne({email}).select("+password") // +password to specify to include password in query result since by default its defined false by us in user model

    // validation to check if user exists in DB
    if(!user){
        return next(new CustomError("User with Given Details Does not exist",400));
    }

    // Compare Passwords  
    const isPasswordCorrect = await user.validatePassword(password);
    if(!isPasswordCorrect){
        return next(new CustomError("Incorrect Email or Password",400));
    }

    // Generate token and set cookies
    cookieToken(user,res);    
});

const logout = bigPromise(async (req,res,next)=>{
    res.cookie("token",null,{
        expires:new Date(Date.now())
    });

    res.status(200).json({
        success:true,
        msg:"Logout Successfull"
    });
});

const forgotPassword = bigPromise(async (req,res,next)=>{
    const {email} = req.body;
    if(!email){
        return next(new CustomError("Please Provide Email",400));
    }
    const user = await User.findOne({email});
    if(!user){
        return next(new CustomError("User with Given Details Does not exist",400));
    }

    const forgotPasswordToken = await user.getForgotPasswordToken();    
    await user.save({validateBeforeSave:false});
    const forgotPasswordUrl = `${req.protocol}://${req.get("host")}/api/v1/password/reset/${forgotPasswordToken}`;

    const message = `Copy Paste this url in browser and hit enter \n\n ${forgotPasswordUrl}`;

    try {
        emailHelper({
            email:user.email,
            subject:"Ecom Store Password Reset Email",
            message
        });
        res.status(200).json({
            success:true,
            msg:"Password reset link sent successfully"
        });
    } catch (error) {
        user.forgotPasswordToken = undefined;
        user.forgotPasswordExpiry = undefined;
        await user.save({validateBeforeSave:false});
        return next(new CustomError(error.message,500));
    }


});

const resetPassword = bigPromise(async (req,res,next)=>{

    if(req.body.password!=req.body.confirmPassword){
        return next(new CustomError("Password and Confirm Password not matching"));
    }

    const {token} = req.params;
    const encryptedToken = crypto.createHash("sha256").update(token).digest("hex");
    
    const user = await User.findOne({
        encryptedToken,
        forgotPasswordExpiry: {$gt:Date.now() }
    });

    if(!user){
        return next(new CustomError("Invalid Token or Token Expired",400));
    }

    user.password = req.body.password;
    user.forgotPasswordToken = undefined;
    user.forgotPasswordExpiry = undefined;
    await user.save();
    
    cookieToken(user,res);
})

const getUserDetails = bigPromise(async (req,res,next)=>{
    if(!req.user){
        return next(new CustomError("Please log in to continue",401));
    }
    res.status(200).json({
        success:true,
        user:req.user
    });
})

const updatePassword = bigPromise(async (req,res,next)=>{
    if(!req.user){
        return next(new CustomError("Please Login to Change Password",400));
    }
    const {oldPassword,newPassword} = req.body
    const user = await User.findById(req.user._id).select("+password");
    const isPasswordCorrect = await user.validatePassword(oldPassword);
    if(!isPasswordCorrect){
        return next(new CustomError("Password not matching",400));
    }

    user.password = newPassword;
    await user.save();

    cookieToken(user,res);
});

const updateUserDetails = bigPromise(async (req,res,next)=>{
    const {name,email} = req.body;

    // Check if name and email are empty
    if(!name || !email){
        return next(new CustomError("Please Provide Name and Email",400));
    }

    const newData = {
        name:name,
        email:email
    };
    // Update provied user details in DB
    const user = await User.findByIdAndUpdate(req.user._id,newData,{
        new:true,
        runValidators:true,
        useFindAndModify:false
    });

    //Check if user details updated successfully in DB
    if(!user){
        return next(new CustomError("User Detail Modification Failed",400));
    }
    res.status(200).json({
        success:true,
        msg:"User Detail Modification Successfull"
    });
});

const getAllUsers = bigPromise(async (req,res,next)=>{
    const users = await User.find();
    if(!users){
        return next(new CustomError("Cannot get users..",400));
    }
    res.status(200).json({
        success:true,
        users
    });
});

const getSingleUser = bigPromise(async (req,res,next)=>{
    const {user_id} = req.params;
    const user = await User.findById(user_id);
    if(!user){
        return next(new CustomError("User Not Found",400));
    }
    res.status(200).json({
        success:true,
        user
    })
})

const adminUpdateUserDetails = bigPromise(async (req,res,next)=>{
    const {name,email,role} = req.body;
    const {user_id} = req.params;
    // Check if name and email are empty
    if(!name || !email){
        return next(new CustomError("Please Provide Name and Email",400));
    }

    const newData = {
        name:name,
        email:email,
        role : role
    };
    // Update provied user details in DB
    const user = await User.findByIdAndUpdate(user_id,newData,{
        new:true,
        runValidators:true,
        useFindAndModify:false
    });

    //Check if user details updated successfully in DB
    if(!user){
        return next(new CustomError("User Detail Modification Failed",400));
    }
    res.status(200).json({
        success:true,
        msg:"User Detail Modification Successfull"
    });
});

const adminDeleteUserDetails = bigPromise(async (req,res,next)=>{
    const user = await User.findById(req.params.user_id);
    if(!user){
        return next(new CustomError("User Not Found",400));
    }

    await user.remove();
    res.status(200).json({
        success:true,
        msg:"User Detail Deleted Successfull"
    });
});

module.exports = {signup, tempAdminLogin , login , logout , forgotPassword , 
    resetPassword , getUserDetails , updatePassword , updateUserDetails , 
    getAllUsers , getSingleUser , adminUpdateUserDetails , adminDeleteUserDetails} ;