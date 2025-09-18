import express from 'express';
import groupChatsCtrl from '../controllers/groupChatsController.js';
import groupMessagesCtrl from '../controllers/groupMessagesController.js';
import auth from '../middlewares/auth.js';
import role from '../middlewares/role.js';
import cacheMiddleware from '../middlewares/cache.js';
import { validateCreateGroupChat, validateUpdateGroupChat, validateSendGroupMessage } from '../middlewares/validation.js';

const router = express.Router();

router.post('/create', auth, role([4]), validateCreateGroupChat, groupChatsCtrl.createGroupChat);
router.patch('/:id', auth, role([4]), validateUpdateGroupChat, groupChatsCtrl.updateGroupChat);
router.delete('/:id', auth, role([4]), groupChatsCtrl.deleteGroupChat);
router.get('/:id', auth, groupChatsCtrl.getGroupChatById);
router.get('/', auth, cacheMiddleware('groupChats:', 120), groupChatsCtrl.getAllGroupChats);
router.post('/:id/messages', auth, validateSendGroupMessage, groupMessagesCtrl.sendGroupMessage);

export default router;