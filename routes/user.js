const express = require('express');
const {
    signup,
    login,
    logout,
    forgotPassword,
    resetPassword,
    getUserDetails,
    updatePassword,
    updateUserDetails,
    getAllUsers,
    getSingleUser,
    adminUpdateUserDetails,
    adminDeleteUserDetails,
    tempAdminLogin
} = require('../controllers/userController');
const {isLoggedIn, checkRoles} = require('../middlewares/userCheckMiddleware');
const router = express.Router();

// User Routes
router.route('/signup').post(signup);
router.route('/login').post(login);
router.route('/logout').get(logout);
router.route('/forgotPassword').post(forgotPassword);
router.route('/password/reset/:token').post(resetPassword);
router.route('/userDashboard').get(isLoggedIn, getUserDetails);
router.route('/password/update').post(isLoggedIn, updatePassword);
router.route('/user/update').post(isLoggedIn, updateUserDetails);

// Admin routes
router.route('/admin/temp').get(tempAdminLogin);
router.route('/admin/users').get(isLoggedIn, checkRoles('admin'), getAllUsers);
router.route('/admin/user/:user_id')
.get(isLoggedIn, checkRoles('admin'), getSingleUser)
.put(isLoggedIn, checkRoles('admin'), adminUpdateUserDetails)
.delete(isLoggedIn, checkRoles('admin'), adminDeleteUserDetails);


module.exports = router;
