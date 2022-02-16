const express = require('express');
const { createOrder, getOrder, getLoggedInUserOrder , adminGetAllOrders, adminUpdateOrder, adminDeleteOrder } = require('../controllers/orderController');
const router = express.Router();
const {isLoggedIn, checkRoles} = require('../middlewares/userCheckMiddleware');

router.route('/order/create').post(isLoggedIn, createOrder);
router.route('/order/:order_id').get(isLoggedIn, getOrder);
router.route('/myorder').get(isLoggedIn, getLoggedInUserOrder);

// admin routes
router.route('/admin/orders').get(isLoggedIn, checkRoles('admin'),adminGetAllOrders);
router.route('/admin/order/:order_id').put(isLoggedIn, checkRoles('admin'),adminUpdateOrder)
.delete(isLoggedIn, checkRoles('admin'),adminDeleteOrder);



module.exports = router ;
