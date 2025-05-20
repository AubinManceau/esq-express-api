const express = require('express');
const router = express.Router();
const trainingCtrl = require('../controllers/trainingController');
const auth = require('../middleware/auth');

router.post('/', auth, trainingCtrl.createTraining);
router.put('/:id', auth, trainingCtrl.updateTraining);
router.delete('/:id', auth, trainingCtrl.deleteTraining);
router.get('/', auth, trainingCtrl.getAllTrainings);
router.get('/:id', auth, trainingCtrl.getOneTraining);
router.get('/category/:name', auth, trainingCtrl.getTrainingsByCategory);
router.get('/user/:id', auth, trainingCtrl.getTrainingsByUser);

module.exports = router;