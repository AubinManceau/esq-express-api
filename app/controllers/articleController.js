import models from '../models/index.js';

const createArticle = async (req, res) => {
    const t = await models.sequelize.transaction();
    try {
        const userAuthorId = req.auth.userId;
        const { categories = [], title, content } = req.body;

        if (!title || !content || categories.length === 0) {
            await t.rollback();
            return res.status(400).json({
                status: 'error',
                message: 'Champs manquants !'
            });
        }

        const categoryRecords = await models.Categories.findAll({
            where: { id: categories },
            transaction: t
        });

        if (categoryRecords.length !== categories.length) {
            await t.rollback();
            return res.status(400).json({
                status: 'error',
                message: 'Une ou plusieurs catégories sont invalides !'
            });
        }

        const article = await models.Articles.create({
            title,
            content,
            userAuthorId,
        }, { transaction: t });

        await article.setCategories(categories, { transaction: t });

        await t.commit();
        const ArticleCategories = await article.getCategories(
            { attributes: ['id', 'name'], joinTableAttributes: [] }
        );
        return res.status(201).json({
            status: 'success',
            message: 'Article créé !',
            data: {
                article: article,
                categories: ArticleCategories
            }
        });
    } catch (error) {
        await t.rollback();
        return res.status(500).json({
            status: 'error',
            error: "Erreur interne lors de la création de l'article"
        });
    }
};

const updateArticle = async (req, res) => {
    const t = await models.sequelize.transaction();
    try {
        const id = req.params.id;
        const { categories = [], title, content } = req.body;

        const article = await models.Articles.findByPk(id, { transaction: t });
        if (!article) {
            await t.rollback();
            return res.status(404).json({
                status: 'error',
                message: 'Article non trouvé !'
            });
        }

        if (title !== undefined) article.title = title;
        if (content !== undefined) article.content = content;

        let updatedCategories = [];

        if (categories.length > 0) {
            const categoryRecords = await models.Categories.findAll({
                where: { id: categories },
                attributes: ['id', 'name'],
                transaction: t
            });

            if (categoryRecords.length !== categories.length) {
                await t.rollback();
                return res.status(400).json({
                    status: 'error',
                    message: 'Une ou plusieurs catégories sont invalides !'
                });
            }

            await article.setCategories(categories, { transaction: t });
            updatedCategories = categoryRecords;
        } else {
            await t.rollback();
            return res.status(400).json({
                status: 'error',
                message: 'Au moins une catégorie doit être fournie !'
            });
        }

        await article.save({ transaction: t });
        await t.commit();

        res.status(200).json({
            status: 'success',
            message: 'Article modifié !',
            data: {
                article,
                categories: updatedCategories
            }
        });
    } catch (error) {
        await t.rollback();
        res.status(500).json({
            status: 'error',
            error: "Erreur interne lors de la modification de l'article"
        });
    }
};

const deleteArticle = async (req, res) => {
    try {
        const id = req.params.id;
        const article = await models.Articles.findByPk(id);
        if (!article) {
            return res.status(404).json({
                status: 'error',
                message: 'Article non trouvé !'
            });
        }
        await article.destroy();
        res.status(200).json({
            status: 'success',
            message: 'Article supprimé !'
        });
    } catch (error) {
        res.status(500).json({
            status: 'error',
            error: "Erreur interne lors de la suppression de l'article"
        });
    }
};

const getAllArticles = async (req, res) => {
    try {
        const articles = await models.Articles.findAll({
            include: [
                {
                    model: models.Categories,
                    attributes: ['id', 'name'],
                    through: { attributes: [] }
                }
            ]
        });

        if (articles.length === 0) {
            return res.status(404).json({
                status: 'error',
                message: 'Aucun article trouvé !'
            });
        }

        res.status(200).json({
            status: 'success',
            message: 'Articles récupérés avec succès !',
            data: articles
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            status: 'error',
            error: "Erreur interne lors de la récupération des articles"
        });
    }
};

const getOneArticle = async (req, res) => {
    try {
        const id = req.params.id;
        const article = await models.Articles.findByPk(id, {
            include: [
                {
                    model: models.Categories,
                    attributes: ['id', 'name'],
                    through: { attributes: [] }
                }
            ]
        });

        if (!article) {
            return res.status(404).json({
                status: 'error',
                message: 'Article non trouvé !'
            });
        }

        res.status(200).json({
            status: 'success',
            message: 'Article récupéré avec succès !',
            data: article
        });

    } catch (error) {
        res.status(500).json({
            status: 'error',
            error: "Erreur interne lors de la récupération de l'article"
        });
    }
};

const getArticlesByCategory = async (req, res) => {
    try {
        const userRoles = req.auth.roles;

        if (!userRoles || userRoles.length === 0) {
            return res.status(403).json({
                status: 'error',
                message: 'Rôle non autorisé.',
            });
        }
        const userCategories = userRoles
            .map(role => role.categoryId)
            .filter(categoryId => categoryId !== null && categoryId !== undefined);

        if (userCategories.length === 0) {
            return res.status(403).json({
                status: 'error',
                message: 'Aucune catégorie associée à vos rôles.',
            });
        }

        const articles = await models.Articles.findAll({
            include: [
                {
                    model: models.Categories,
                    where: {
                        id: userCategories
                    },
                    attributes: ['id', 'name'],
                    through: { attributes: [] }
                }
            ]
        });

        if (articles.length === 0) {
            return res.status(404).json({
                status: 'error',
                message: 'Aucun article trouvé pour cette catégorie !'
            });
        }

        res.status(200).json({
            status: 'success',
            message: 'Articles récupérés avec succès !',
            data: articles
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            status: 'error',
            message: 'Erreur lors de la récupération des articles par catégorie !',
        });
    }
};

export default {
    createArticle,
    updateArticle,
    deleteArticle,
    getAllArticles,
    getOneArticle,
    getArticlesByCategory
};
