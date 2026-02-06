import express from 'express';
import teamCtrl from '../controllers/teamController.js';
import auth from '../middlewares/auth.js';
import role from '../middlewares/role.js';
import cacheMiddleware from '../middlewares/cache.js';
import { validateData } from '../middlewares/validation.js';
import { createTeamSchema, updateTeamSchema } from '../schemas/team.schema.js';

const router = express.Router();

router.post('/create', auth, role([3, 4]), validateData(createTeamSchema), teamCtrl.createTeam);
router.patch('/:id', auth, role([3, 4]), validateData(updateTeamSchema), teamCtrl.updateTeam);
router.delete('/:id', auth, role([3, 4]), teamCtrl.deleteTeam);
router.get('/:id', auth, teamCtrl.getOneTeam);
router.get('/', auth, cacheMiddleware('teams:', 120), role([3, 4]), teamCtrl.getAllTeams);

export default router;
