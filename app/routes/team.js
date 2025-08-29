import express from 'express';
import teamCtrl from '../controllers/teamController.js';
import auth from '../middlewares/auth.js';
import role from '../middlewares/role.js';

const router = express.Router();

router.post('/create', auth, role([3, 4]), teamCtrl.createTeam);
router.patch('/:id', auth, role([3, 4]), teamCtrl.updateTeam);
router.delete('/:id', auth, role([3, 4]), teamCtrl.deleteTeam);
router.get('/category', auth, teamCtrl.getTeamsByCategory);
router.get('/:id', auth, teamCtrl.getOneTeam);
router.get('/', auth, role([3, 4]), teamCtrl.getAllTeams);

export default router;