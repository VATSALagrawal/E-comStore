const express = require('express');
const home = require('../controllers/homeController');
const router = express.Router();

router.route('/dummy').get(home);

module.exports = router;