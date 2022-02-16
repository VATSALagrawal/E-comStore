const express = require('express');
const {
    createProduct,
    getFilteredProducts,
    adminGetProduct,
    adminUpdateProduct,
    adminDeleteProduct,
    getReviews,
    addReview,
    deleteReview,
    adminGetAllProducts
} = require('../controllers/productController');
const router = express.Router();
const {isLoggedIn, checkRoles} = require('../middlewares/userCheckMiddleware');

// user routes
router.route('/products').get(isLoggedIn, getFilteredProducts);

// admin routes
router.route('/admin/product/create').post(isLoggedIn, checkRoles('admin'), createProduct);
router.route('/admin/product/:product_id').get(isLoggedIn, checkRoles('admin'), adminGetProduct).put(isLoggedIn, checkRoles('admin'), adminUpdateProduct).delete(isLoggedIn, checkRoles('admin'), adminDeleteProduct);
router.route('/admin/products').get(isLoggedIn, checkRoles('admin'), adminGetAllProducts);

router.route('/product/:product_id').get(isLoggedIn, adminGetProduct);
router.route('/reviews').get(isLoggedIn, getReviews);
router.route('/review').put(isLoggedIn, addReview).delete(isLoggedIn, deleteReview);
module.exports = router;
