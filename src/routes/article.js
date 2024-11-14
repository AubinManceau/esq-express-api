const express = require('express');
const router = express.Router();
const articleCtrl = require('../controllers/articleController');
// const auth = require('../middleware/auth');

router.post('/create', articleCtrl.createArticle);
router.patch('/:id', articleCtrl.updateArticle);
router.delete('/:id', articleCtrl.deleteArticle);
router.get('/', articleCtrl.getAllArticles);
router.get('/:id', articleCtrl.getOneArticle);

module.exports = router;