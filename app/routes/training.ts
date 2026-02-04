import express from 'express';
import trainingCtrl from '../controllers/trainingController.js';
import auth from '../middlewares/auth.js';
import role from '../middlewares/role.js';
import cacheMiddleware from '../middlewares/cache.js';
import { validateData } from '../middlewares/validation.js';
import { createTrainingSchema, updateTrainingInput } from '../schemas/training.schema.js';

const router = express.Router();

router.get('/user', auth, cacheMiddleware('trainings-user:', 120), trainingCtrl.getTrainingsByUser);
router.get('/:id', auth, trainingCtrl.getTraining);
router.get('/', auth, cacheMiddleware('trainings:', 120), role([4]), trainingCtrl.getTrainings);
router.post('/', auth, role([2, 4]), validateData(createTrainingSchema), trainingCtrl.createTraining);
router.patch('/:id', auth, role([2, 4]), validateData(updateTrainingInput), trainingCtrl.updateTraining);
router.patch('/:id/status/:status', auth, trainingCtrl.updateTrainingUserStatus);
router.delete('/:id', auth, role([2, 4]), trainingCtrl.deleteTraining);

export default router;
