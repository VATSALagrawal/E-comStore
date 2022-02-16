const express = require('express');
const app = express();
const cookieParser = require('cookie-parser');
const fileUpload = require('express-fileupload');
const morgan = require('morgan');

//for swagger documentation
const swaggerUi = require("swagger-ui-express");
const YAML = require("yamljs");
const swaggerDocument = YAML.load("./swagger.yaml");
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDocument));


// regular middlewares
app.use(express.json());
app.use(express.urlencoded({extended:true}));

// middleware for cookie-parser and file upload;
app.use(cookieParser());
app.use(fileUpload({
    useTempFiles:true,
    tempFileDir:"/tmp/"
}));

// moragn middleware
app.use(morgan("tiny"));

app.get('/',(req,res)=>{
    res.send("<h3>Please visit <a href='/api-docs'>API Docs</a> for API functionality demonstration</h3>");
});
// import all routes here
const homeRouter = require('./routes/home');
const userRouter = require('./routes/user');
const productRouter = require('./routes/product');
const paymentRouter = require('./routes/payment');
const orderRouter = require('./routes/order');
const errorHandler = require('./middlewares/errorHandler');


// Inject Route Middlewares here
app.use('/api/v1',homeRouter);
app.use('/api/v1',userRouter);
app.use('/api/v1',productRouter);
app.use('/api/v1',paymentRouter);
app.use('/api/v1',orderRouter);
app.use(errorHandler);

module.exports = app;