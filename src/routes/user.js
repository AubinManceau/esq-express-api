const express = require('express');
const router = express.Router();
const userCtrl = require('../controllers/userController');

router.patch('/:userId', userCtrl.updateUser);
router.patch('/:userId/password', userCtrl.updatePassword);
router.delete('/:userId', userCtrl.deleteUser);
router.get('/:userId', userCtrl.getUser);
router.get('/', userCtrl.getUsers);
router.get('/:roleName', userCtrl.getUsersByRole);
router.get('/:roleName/:categoryName', userCtrl.getUsersByRolesAndCategories);

module.exports = router;