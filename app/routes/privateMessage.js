import express from 'express';
import privateCtrl from '../controllers/privateMessagesController.js';
import auth from '../middlewares/auth.js';

const router = express.Router();

router.post('/create', auth, privateCtrl.sendPrivateMessage);
router.get('/:otherUserId', auth, privateCtrl.getPrivateConversation);
router.get('/', auth, privateCtrl.getAllPrivateConversations);

export default router;