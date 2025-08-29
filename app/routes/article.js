import express from 'express';
import articleCtrl from '../controllers/articleController.js';
import auth from '../middlewares/auth.js';
import role from '../middlewares/role.js';

const router = express.Router();

router.post('/create', auth, role([3, 4]), articleCtrl.createArticle);
router.patch('/:id', auth, role([3, 4]), articleCtrl.updateArticle);
router.delete('/:id', auth, role([3, 4]), articleCtrl.deleteArticle);
router.get('/category', auth, articleCtrl.getArticlesByCategory);
router.get('/:id', auth, articleCtrl.getOneArticle);
router.get('/', auth, role([3, 4]), articleCtrl.getAllArticles);

export default router;