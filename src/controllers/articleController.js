const Article = require('../models/Article');

// Création d'un article
exports.createArticle = async (req, res, next) => {
    try {
        const article = await Article.create(req.body);
        res.status(201).json({ message: 'Article créé !', article });
    } catch (error) {
        res.status(400).json({ error });
    }
};

// Mise à jour d'un article
exports.updateArticle = async (req, res, next) => {
    try {
        const [updated] = await Article.update(req.body, { where: { id: req.params.id } });
        if (updated === 0) {
            return res.status(404).json({ message: 'Article non trouvé !' });
        }
        res.status(200).json({ message: 'Article modifié !' });
    } catch (error) {
        res.status(400).json({ error });
    }
};

// Suppression d'un article
exports.deleteArticle = async (req, res, next) => {
    try {
        const deleted = await Article.destroy({ where: { id: req.params.id } });
        if (deleted === 0) {
            return res.status(404).json({ message: 'Article non trouvé !' });
        }
        res.status(200).json({ message: 'Article supprimé !' });
    } catch (error) {
        res.status(400).json({ error });
    }
};

// Récupération de tous les articles
exports.getAllArticles = async (req, res, next) => {
    try {
        const articles = await Article.findAll();
        res.status(200).json(articles);
    } catch (error) {
        res.status(400).json({ error });
    }
};

// Récupération d'un article par son id
exports.getOneArticle = async (req, res, next) => {
    try {
        const article = await Article.findByPk(req.params.id);
        if (!article) {
            return res.status(404).json({ message: 'Article non trouvé !' });
        }
        res.status(200).json(article);
    } catch (error) {
        res.status(400).json({ error });
    }
};
