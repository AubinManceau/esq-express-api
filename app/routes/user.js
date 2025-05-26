const express = require('express');
const router = express.Router();
const userCtrl = require('../controllers/userController');
const auth = require('../middleware/auth');

router.put('/:userId',auth, userCtrl.updateUser);
router.put('/:userId/password',auth, userCtrl.updatePassword);
router.delete('/:userId',auth, userCtrl.deleteUser);
router.get('/:userId',auth, userCtrl.getUser);
router.get('/',auth, userCtrl.getUsers);
router.get('/roles/:roleName',auth, userCtrl.getUsersByRole);
router.get('/roles/:roleName/:categoryName',auth, userCtrl.getUsersByRolesAndCategories);

module.exports = router;