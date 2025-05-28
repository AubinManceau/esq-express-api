import express from 'express';
import userCtrl from '../controllers/userController.js';
import auth from '../middlewares/auth.js';

const router = express.Router();

router.put('/:userId',auth, userCtrl.updateUser);
router.put('/:userId/password',auth, userCtrl.updatePassword);
router.delete('/:userId',auth, userCtrl.deleteUser);
router.get('/:userId',auth, userCtrl.getUser);
router.get('/',auth, userCtrl.getUsers);
router.get('/roles/:roleName',auth, userCtrl.getUsersByRole);
router.get('/roles/:roleName/:categoryName',auth, userCtrl.getUsersByRolesAndCategories);

export default router;