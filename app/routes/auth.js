const express = require('express');
const router = express.Router();
const authCtrl = require('../controllers/authController');

router.post('/login', authCtrl.login);
router.post('/signup', authCtrl.signup);
router.post('/confirm', authCtrl.definePassword);

module.exports = router;