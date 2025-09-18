import express from 'express';
import articleCtrl from '../controllers/articleController.js';
import auth from '../middlewares/auth.js';
import role from '../middlewares/role.js';
import cacheMiddleware from '../middlewares/cache.js';
import { validateCreateArticle, validateUpdateArticle } from '../middlewares/validation.js';

const router = express.Router();

router.post('/create', auth, role([3, 4]), validateCreateArticle, articleCtrl.createArticle);
router.patch('/:id', auth, role([3, 4]), validateUpdateArticle, articleCtrl.updateArticle);
router.delete('/:id', auth, role([3, 4]), articleCtrl.deleteArticle);
router.get('/:id', auth, articleCtrl.getOneArticle);
router.get('/', auth, cacheMiddleware('articles:', 120), articleCtrl.getAllArticles);

export default router;