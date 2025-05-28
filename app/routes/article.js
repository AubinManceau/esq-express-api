import express from 'express';
import articleCtrl from '../controllers/articleController.js';
import auth from '../middlewares/auth.js';

const router = express.Router();

router.post('/create', articleCtrl.createArticle);
router.patch('/:id', articleCtrl.updateArticle);
router.delete('/:id', articleCtrl.deleteArticle);
router.get('/', articleCtrl.getAllArticles);
router.get('/:id', articleCtrl.getOneArticle);
router.get('/category/:category', articleCtrl.getArticlesByCategory);

export default router;