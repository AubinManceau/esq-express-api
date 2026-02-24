import express from 'express';
import authCtrl from '../controllers/authController.js';
import auth from '../middlewares/auth.js';
import role from '../middlewares/role.js';

const router = express.Router();

router.post('/signup', auth, role([4]), authCtrl.signup);
router.post('/bulk-signup', auth, role([4]), authCtrl.bulkSignup);
router.post('/resend-confirmation/:id', auth, role([4]), authCtrl.resendConfirmationEmail);
router.post('/refresh-token', authCtrl.refreshAccessToken);
router.post('/logout', auth, authCtrl.logout);
router.post('/login', authCtrl.login);
router.post('/confirm', authCtrl.definePassword);
router.post('/forgot-password', authCtrl.forgotPassword);
router.post('/reset-password', authCtrl.resetPassword);
export default router;
