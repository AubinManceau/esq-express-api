const express = require('express');
const router = express.Router();
const trainingCtrl = require('../controllers/trainingController');
const auth = require('../middleware/auth');

router.get('/', auth, trainingCtrl.getTrainings);
router.get('/:id', auth, trainingCtrl.getTraining);
router.get('/upcoming', auth, trainingCtrl.getUpcomingTrainingsByUserCategory)
router.post('/', auth, trainingCtrl.createTraining);
router.put('/:id', auth, trainingCtrl.updateTraining);
router.delete('/:id', auth, trainingCtrl.deleteTraining);

module.exports = router;