const bigPromise = require("../middlewares/bigPromise");

const home = bigPromise((req,res)=>{
    res.status(200).json({
        success:true,
        msg:"Hello"
    })
});

module.exports = home;