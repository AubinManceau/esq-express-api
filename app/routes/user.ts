import express from 'express';
import userCtrl from '../controllers/userController.js';
import auth from '../middlewares/auth.js';
import role from '../middlewares/role.js';
import cacheMiddleware from '../middlewares/cache.js';
import upload from '../middlewares/upload.js'
import { validateData } from '../middlewares/validation.js';
import { updateUserPasswordSchema, updateUserSchema } from '../schemas/user.schema.js';

const router = express.Router();

router.patch('/password', auth, validateData(updateUserPasswordSchema), userCtrl.updatePassword);
router.patch('/admin/:userId', auth, upload.fields([{ name: 'photo', maxCount: 1 }, { name: 'photo_celebration', maxCount: 1 }]), role([4]), userCtrl.updateUserForAdmin);
router.patch('/', auth, validateData(updateUserSchema), userCtrl.updateUser);
router.delete('/:userId', auth, role([4]), userCtrl.deleteUser);
router.get('/uploads/:filename', auth, role([3, 4]), userCtrl.getFiles);
router.get('/profile', auth, userCtrl.getProfile);
router.get('/:userId', auth, userCtrl.getUser);
router.get('/', auth, cacheMiddleware('users:', 120), userCtrl.getUsers);

export default router;
