import models from '../models/index.js';

export const createArticle = async (req, res, next) => {
    try {
        const {categories, title, content, image, date, auther} = req.body;

        if (!title || !content || !date || !auther) {
            return res.status(400).json({ message: 'Champs manquants !' });
        }

        const allCategories = await models.Categories.findAll();
        const categoriesNames = allCategories.map((category) => category.name);

        let finalCategories = categories;
        if (categories === 'all') {
            finalCategories = [...new Set([ ...categoriesNames])];
        } else {
            finalCategories = [...new Set([ ...finalCategories])]
        }

        const article = new models.Articles({
            categories: finalCategories,
            title,
            content,
            image,
            date,
            auther,
        });

        await article.save();

        res.status(201).json({ message: 'Article créé !' });
    } catch (error) {
        res.status(400).json({ message: 'Erreur' });
    }
};

export const updateArticle = async (req, res, next) => {
    try {
        const id = req.params.id;
        const {categories, title, content, image, date, auther} = req.body;

        if (!title || !content || !date || !auther) {
            return res.status(400).json({ message: 'Champs manquants !' });
        }

        const allCategories = await Category.findAll();
        const categoriesNames = allCategories.map((category) => category.name);

        let finalCategories = categories;
        if (categories.includes('all')) {
            finalCategories = [...new Set([ ...categoriesNames])];
        } else {
            finalCategories = [...new Set([ ...finalCategories])]
        }

        const article = await models.Articles.findByPk(id);
        if (!article) {
            return res.status(404).json({ message: 'Article non trouvé !' });
        }

        article.categories = finalCategories;
        article.title = title;
        article.content = content;
        article.image = image;
        article.date = date;
        article.auther = auther;

        await article.save();

        res.status(200).json({ message: 'Article modifié !' });
    } catch (error) {
        res.status(400).json({ error });
    }
};

export const deleteArticle = async (req, res, next) => {
    try {
        const id = req.params.id;
        const article = await models.Articles.findByPk(id);
        if (!article) {
            return res.status(404).json({ message: 'Article non trouvé !' });
        }
        await article.destroy();
        res.status(200).json({ message: 'Article supprimé !' });
    } catch (error) {
        res.status(400).json({ error });
    }
};

export const getAllArticles = async (req, res, next) => {
    try {
        const articles = await models.Articles.findAll();
        res.status(200).json(articles);
    } catch (error) {
        res.status(400).json({ error });
    }
};

export const getOneArticle = async (req, res, next) => {
    try {
        const article = await models.Articles.findByPk(req.params.id);
        if (!article) {
            return res.status(404).json({ message: 'Article non trouvé !' });
        }
        res.status(200).json(article);
    } catch (error) {
        res.status(400).json({ error });
    }
};

export const getArticlesByCategory = async (req, res, next) => {
    try {
        const category = req.params.category;
        
        const categoryExists = await models.Categories.findOne({ where: { name: category } });
        if (!categoryExists) {
            return res.status(404).json({ message: 'Catégorie non trouvée !' });
        }

        const articles = await sequelize.query(
            `SELECT * FROM Articles WHERE json_each.value = ?`,
            {
                replacements: [category],
                type: QueryTypes.SELECT,
            }
        );

        if (!articles) {
            return res.status(404).json({ message: 'Aucun article trouvé pour cette catégorie !' });
        }

        res.status(200).json(articles);
    } catch (error) {
        res.status(400).json({ error });
    }
};
