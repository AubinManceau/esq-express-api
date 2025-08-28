import express from 'express';
import convocationCtrl from '../controllers/convocationController.js';
import auth from '../middlewares/auth.js';
import role from '../middlewares/role.js';

const router = express.Router();

router.post('/create', auth, role([2, 4]), convocationCtrl.createConvocation);
router.patch('/:id', auth, role([2, 4]), convocationCtrl.updateConvocation);
router.delete('/:id', auth, role([2, 4]), convocationCtrl.deleteConvocation);
router.get('/', auth, role([4]), convocationCtrl.getAllConvocations);
router.get('/:id', auth, role([2, 4]), convocationCtrl.getOneConvocation);
router.get('/category/:categoryId', auth, role([2, 4]), convocationCtrl.getConvocationsByCategory);

export default router;