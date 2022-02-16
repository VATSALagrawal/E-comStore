const errorHandler = (err,req,res,next)=>{
    if(err){
        console.log(err);
        console.log("HANDLING ERROR");
        if(err.code){
            res.status(err.code).json({
                success:false,
                msg:err.message
            })
        }
        else{
            res.status(400).json({
                success:false,
                msg:err.message
            });
        }
    }
};

module.exports = errorHandler;