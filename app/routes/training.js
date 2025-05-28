import express from 'express';
import trainingCtrl from '../controllers/trainingController.js';
import auth from '../middleware/auth.js';

const router = express.Router();

router.get('/', auth, trainingCtrl.getTrainings);
router.get('/:id', auth, trainingCtrl.getTraining);
router.get('/upcoming', auth, trainingCtrl.getUpcomingTrainingsByUserCategory);
router.get('/:id/:status', auth, trainingCtrl.getTrainingStatus);
router.post('/', auth, trainingCtrl.createTraining);
router.put('/:id', auth, trainingCtrl.updateTraining);
router.patch('/:id/:status', auth, trainingCtrl.updateTrainingUserStatus);
router.delete('/:id', auth, trainingCtrl.deleteTraining);

export default router;