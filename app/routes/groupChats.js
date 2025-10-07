import express from 'express';
import groupChatsCtrl from '../controllers/groupChatsController.js';
import groupMessagesCtrl from '../controllers/groupMessagesController.js';
import auth from '../middlewares/auth.js';
import role from '../middlewares/role.js';
import cacheMiddleware from '../middlewares/cache.js';

const router = express.Router();

router.post('/create', auth, role([4]), groupChatsCtrl.createGroupChat);
router.patch('/:id', auth, role([4]), groupChatsCtrl.updateGroupChat);
router.delete('/:id', auth, role([4]), groupChatsCtrl.deleteGroupChat);
router.get('/:id', auth, groupChatsCtrl.getGroupChatById);
router.get('/', auth, cacheMiddleware('groupChats:', 120), groupChatsCtrl.getAllGroupChats);
router.post('/:id/messages', auth, groupMessagesCtrl.sendGroupMessage);

export default router;