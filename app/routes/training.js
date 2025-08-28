import express from 'express';
import trainingCtrl from '../controllers/trainingController.js';
import auth from '../middlewares/auth.js';
import role from '../middlewares/role.js';

const router = express.Router();

router.get('/user', auth, trainingCtrl.getTrainingsByUser);
router.get('/:id', auth, trainingCtrl.getTraining);
router.get('/', auth, role([4]), trainingCtrl.getTrainings);
router.post('/', auth, role([2, 4]), trainingCtrl.createTraining);
router.patch('/:id', auth, role([2, 4]), trainingCtrl.updateTraining);
router.patch('/:id/status/:status', auth, trainingCtrl.updateTrainingUserStatus);
router.delete('/:id', auth, role([2, 4]), trainingCtrl.deleteTraining);

export default router;