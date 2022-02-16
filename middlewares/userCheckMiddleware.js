const CustomError = require("../utils/customError");
const bigPromise = require("./bigPromise");
const jwt = require('jsonwebtoken');
const User = require("../models/user");
const isLoggedIn = bigPromise(async (req,res,next)=>{
    let token = req.cookies.token ;
    if(!token && req.header("Authorization")){
        token = req.header("Authorization").replace("Bearer ",'');
    }
    if(!token){
        return next(new CustomError('Please Log In',401));
    }

    const decoded = jwt.verify(token,process.env.JWT_SECRET);
    const user = await User.findById(decoded.user_id);

    if(!user){
        return next(new CustomError('User Does not exist',401));
    }
    user.password = undefined;
    req.user = user;
    next();
});

const checkRoles = (...roles) =>{
    return (req,res,next)=>{
        // checking if roles array contains role of user 
        if(!roles.includes(req.user.role)){
            return next(new CustomError('You Are Not Authorized',401));
        }
        next();
    }
}
module.exports = {isLoggedIn , checkRoles};