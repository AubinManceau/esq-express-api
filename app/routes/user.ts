import express from 'express';
import userCtrl from '../controllers/userController.js';
import auth from '../middlewares/auth.js';
import role from '../middlewares/role.js';
import cacheMiddleware from '../middlewares/cache.js';
import upload from '../middlewares/upload.js'
import { validateData } from '../middlewares/validation.js';
import { deleteUserSchema } from '../schemas/user.schema.js';

const router = express.Router();

router.patch('/', express.json(), auth, userCtrl.updateUser);
router.patch('/admin/:userId', auth, upload.fields([{ name: 'photo', maxCount: 1 }, { name: 'photo_celebration', maxCount: 1 }]), role([4]), userCtrl.updateUserForAdmin);
router.delete('/:userId', express.json(), auth, role([4]), validateData(deleteUserSchema, 'params'), userCtrl.deleteUser);
router.get('/:userId', express.json(), auth, userCtrl.getUser);
router.get('/', express.json(), auth, cacheMiddleware('users:', 120), userCtrl.getUsers);
router.get('/uploads/:filename', express.json(), auth, role([3, 4]), userCtrl.getFiles);

export default router;
