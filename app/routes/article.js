import express from 'express';
import articleCtrl from '../controllers/articleController.js';
import auth from '../middlewares/auth.js';
import role from '../middlewares/role.js';

const router = express.Router();

router.post('/create', auth, role([3, 4]), articleCtrl.createArticle);
router.patch('/:id', auth, role([3, 4]), articleCtrl.updateArticle);
router.delete('/:id', auth, role([3, 4]), articleCtrl.deleteArticle);
router.get('/', auth, role([3, 4]), articleCtrl.getAllArticles);
router.get('/:id', auth, role([3, 4]), articleCtrl.getOneArticle);
router.get('/category/:category', auth, role([3, 4]), articleCtrl.getArticlesByCategory);

export default router;