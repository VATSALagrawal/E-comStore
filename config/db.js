const mongoose = require('mongoose');

const connectDB = (url)=>{
    mongoose.connect(url,{
        useNewUrlParser:true,
        useUnifiedTopology:true
    }).then(console.log("Connection to DB SuccessFull.."))
    .catch(error=>{
        console.log("DB Connection Failed..");
        console.log(error);
        process.exit(1);
    })
};

module.exports = connectDB;