const express = require('express');
const router = express.Router();
const trainingCtrl = require('../controllers/trainingController');
// const auth = require('../middleware/auth');

router.post('/create', trainingCtrl.createTraining);
router.patch('/:id', trainingCtrl.updateTraining);
router.delete('/:id', trainingCtrl.deleteTraining);
router.get('/', trainingCtrl.getAllTrainings);
router.get('/:id', trainingCtrl.getOneTraining);

module.exports = router;