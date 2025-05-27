import express from 'express';
import authCtrl from '../controllers/authController.js';

const router = express.Router();

router.post('/login', authCtrl.login);
router.post('/signup', authCtrl.signup);
router.post('/confirm', authCtrl.definePassword);

export default router;