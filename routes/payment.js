const express = require('express');
const captureRazorpayPayment = require('../controllers/paymentController');
const router = express.Router();
const {isLoggedIn, checkRoles} = require('../middlewares/userCheckMiddleware');


router.route('/payment/capture').post(isLoggedIn,captureRazorpayPayment);

module.exports = router ;
