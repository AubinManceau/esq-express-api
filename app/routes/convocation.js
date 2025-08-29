import express from 'express';
import convocationCtrl from '../controllers/convocationController.js';
import auth from '../middlewares/auth.js';
import role from '../middlewares/role.js';

const router = express.Router();

router.post('/create', auth, role([2, 4]), convocationCtrl.createConvocation);
router.patch('/:id', auth, role([2, 4]), convocationCtrl.updateConvocation);
router.delete('/:id', auth, role([2, 4]), convocationCtrl.deleteConvocation);
router.get('/category', auth, convocationCtrl.getConvocationsByCategory);
router.get('/:id', auth, convocationCtrl.getOneConvocation);
router.get('/', auth, role([4]), convocationCtrl.getAllConvocations);

export default router;