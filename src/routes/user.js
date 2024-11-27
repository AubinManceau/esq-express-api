const express = require('express');
const router = express.Router();
const userCtrl = require('../controllers/userController');

router.post('/login', userCtrl.login);
router.post('/signup', userCtrl.signup);
router.post('/confirm', userCtrl.definePassword);

module.exports = router;