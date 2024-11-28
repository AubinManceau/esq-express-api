const express = require('express');
const router = express.Router();
const userCtrl = require('../controllers/userController');

router.post('/login', userCtrl.login);
router.post('/signup', userCtrl.signup);
router.post('/confirm', userCtrl.definePassword);
router.post('/update', userCtrl.updateUser);
router.post('/updatePassword', userCtrl.updatePassword);
router.delete('/delete/:userId', userCtrl.deleteUser);
router.get('/user/:userId', userCtrl.getUser);
router.get('/users', userCtrl.getUsers);
router.get('/users/:roleName', userCtrl.getUsersByRole);
router.get('/users/:roleName/:categoryName', userCtrl.getUsersByRolesAndCategories);

module.exports = router;