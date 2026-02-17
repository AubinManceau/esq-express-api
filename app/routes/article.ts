import express from 'express';
import articleCtrl from '../controllers/articleController.js';
import auth from '../middlewares/auth.js';
import role from '../middlewares/role.js';
import cacheMiddleware from '../middlewares/cache.js';
import { validateData } from '../middlewares/validation.js';
import { createArticleSchema, updateArticleSchema } from '../schemas/article.schema.js';

const router = express.Router();

router.post('/create', auth, role([3, 4]), validateData(createArticleSchema), articleCtrl.createArticle);
router.patch('/:id', auth, role([3, 4]), validateData(updateArticleSchema), articleCtrl.updateArticle);
router.delete('/:id', auth, role([3, 4]), articleCtrl.deleteArticle);
router.get('/:id', auth, articleCtrl.getOneArticle);
router.get('/', auth, cacheMiddleware('articles:', 120), articleCtrl.getAllArticles);

export default router;
