const Product = require("../models/product");
const bigPromise = require("../middlewares/bigPromise");
const CustomError = require('../utils/customError');
const cloudinary = require('cloudinary');
const ProductFilters = require("../utils/productFilterUtils");

const createProduct = bigPromise(async (req, res, next) => {
    const imageArray = [];
    //console.log(Array.isArray(req.files.sampleFiles));
    if (!req.files) {
        return next(new CustomError("Please Provide Product Images", 400));
    }
    //console.log(req.files);
    let files = [];
    if(Array.isArray(req.files.productImages)){
        files.push(... req.files.productImages);
    }
    else{
        files.push(req.files.productImages);
    }
    //console.log(files);
    
    if (files) {
        for (let index = 0; index < files.length; index++) {
            const result = await cloudinary.v2.uploader.upload(files[index].tempFilePath, {folder: "EcomStore/products"});
            imageArray.push({id: result.public_id, secure_url: result.secure_url});
        }
    }
    req.body.price = Number(req.body.price);
    req.body.AddedBy = req.user._id;
    req.body.photos = imageArray;
    const product = await Product.create(req.body);
    if (! product) {
        return next(new CustomError("Product Creation Failed", 400));
    }
    res.status(200).json({success: true, product})
});

const getFilteredProducts = bigPromise(async (req, res, next) => {
    const productObj = new ProductFilters(Product.find(),req.query)
    .search()
    .filter();

    const itemsPerPage = 6 ;
    await productObj.pager(itemsPerPage);
    const products = await productObj.base;

    if(!products){
        return next(new CustomError("Product Filter Failed..",400));
    }

    res.status(200).json({
        success:true,
        products,
        productsLength:products.length
    })
});

const adminGetProduct = bigPromise(async (req,res,next)=>{
    const product = await Product.findById(req.params.product_id);

    if(!product){
        return next(new CustomError("Cannot get products..",400));
    }
    res.status(200).json({
        success:true,
        product
    });
});

const adminGetAllProducts = bigPromise(async (req,res,next)=>{
    const products = await Product.find();

    if(!products){
        return next(new CustomError("Cannot get products..",400));
    }
    res.status(200).json({
        success:true,
        products
    });
});

const adminUpdateProduct = bigPromise(async (req,res,next)=>{
    let product = await Product.findById(req.params.product_id);
    
    if(!product){
        return next(new CustomError("No Product found ",400));
    }
    const imageArray = [] ; 
    if (req.files) {
        // delete old images 
        for (let index = 0; index < product.photos.length; index++) {
            const res = await cloudinary.v2.uploader.destroy(product.photos[index].id);
        };

        // upload new images
        let files = [];
        if(Array.isArray(req.files.productImages)){
            files.push(... req.files.productImages);
        }
        else{
            files.push(req.files.productImages);
        }
        
        if (files) {
            for (let index = 0; index < files.length; index++) {
                const result = await cloudinary.v2.uploader.upload(files[index].tempFilePath, {folder: "EcomStore/products"});
                imageArray.push({id: result.public_id, secure_url: result.secure_url});
            }
        }
    }
    req.body.photos = imageArray;
    updated_product = await Product.findByIdAndUpdate(req.params.product_id,req.body,{
        new:true,
        runValidators:true,
        useFindAndModify:false
    });
    if(!updated_product){
        return next(new CustomError("Cannot update Product",400));
    }

    res.status(200).json({
        success:true,
        updated_product
    });
});

const adminDeleteProduct = bigPromise(async (req,res,next)=>{
    let product = await Product.findById(req.params.product_id);
    
    if(!product){
        return next(new CustomError("No Product found ",400));
    }

    // delete old images 
    for (let index = 0; index < product.photos.length; index++) {
        const res = await cloudinary.v2.uploader.destroy(product.photos[index].id);
    };

    await product.remove();

    res.status(200).json({
        success:true,
        msg:"Product Deleted Successfully.."
    });

});

const addReview = bigPromise(async (req,res,next)=>{
    const product = await Product.findById(req.query.product_id);
    if(!product){
        return next(new CustomError("Product with given id not found",400));
    }
    const {rating,comment} = req.body;
    const review = {
        user : req.user._id,
        name: req.user.name,
        rating: Number(rating),
        comment:comment
    };
    const AlreadyReview = product.reviews.find(rev=> rev.user.toString()==req.user._id.toString());

    if(AlreadyReview){
        product.reviews.forEach((review)=>{
            if(review.user.toString()==req.user._id.toString()){
                review.comment = comment;
                review.rating = Number(rating);
            }
        });
    }else{
        product.reviews.push(review);
        product.numOfReviews = product.reviews.length;
    }
    product.rating = product.reviews.reduce((acc,rev)=> acc= acc+rev.rating , 0)/product.numOfReviews ;
    
    await product.save({validateBeforeSave:false});

    res.status(200).json({
        success:true,
        reviews:product.reviews,
        rating:product.rating,
        numOfReviews:product.numOfReviews
    });
});

const getReviews = bigPromise(async (req,res,next)=>{
    const product = await Product.findById(req.query.product_id);
    if(!product){
        return next(new CustomError("Product with given id not found",400));
    }
    res.status(200).json({
        success:true,
        reviews:product.reviews,
        numOfReviews:product.reviews.length
    });
});

const deleteReview = bigPromise(async (req,res,next)=>{
    const product = await Product.findById(req.query.product_id);
    if(!product){
        return next(new CustomError("Product with given id not found",400));
    }
    const filtered = product.reviews.filter(rev=> rev.user.toString()!=req.user._id.toString());
    product.reviews = filtered ; 
    product.numOfReviews = filtered.length ; 
    product.rating = product.reviews.reduce((acc,rev)=> acc= acc+rev.rating , 0)/product.numOfReviews ;
    
    await product.save({validateBeforeSave:false});

    res.status(200).json({
        success:true,
        msg:"Review Delete Successfully"
    });
});
module.exports = {
    createProduct,
    getFilteredProducts,
    adminGetProduct,
    adminUpdateProduct,
    adminDeleteProduct,
    addReview,
    getReviews,
    deleteReview,
    adminGetAllProducts
};
