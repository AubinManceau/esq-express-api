import models from '../models/index.js';
import redis from '../config/redisClient.js';
import { Request, Response } from 'express';

const createArticle = async (req: Request, res: Response) => {
    const t = await models.sequelize.transaction();
    try {
        const userAuthorId = (req.auth as any).userId;
        const { title, content, status } = req.body;

        if (!userAuthorId) {
            await t.rollback();
            return res.status(400).json({
                status: 'error',
                message: 'ID de l\'auteur manquant !'
            });
        }

        const article = await models.Articles.create({
            title,
            content,
            userAuthorId,
            status
        }, { transaction: t });

        await t.commit();
        await redis.del('articles:{}{}');
        return res.status(201).json({
            status: 'success',
            message: 'Article créé !',
            data: {
                article: article
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

const updateArticle = async (req: Request, res: Response) => {
    const t = await models.sequelize.transaction();
    try {
        const id = req.params.id;
        const { title, content, status } = req.body;

        const article = await models.Articles.findByPk(id as any, { transaction: t });
        if (!article) {
            await t.rollback();
            return res.status(404).json({
                status: 'error',
                message: 'Article non trouvé !'
            });
        }

        if (title !== undefined) article.title = title;
        if (content !== undefined) article.content = content;
        if (status !== undefined) article.status = status;

        await article.save({ transaction: t });
        await redis.del('articles:{}{}');
        await t.commit();
        res.status(200).json({
            status: 'success',
            message: 'Article modifié !',
            data: {
                article
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

const deleteArticle = async (req: Request, res: Response) => {
    try {
        const id = req.params.id;
        const article = await models.Articles.findByPk(id as any);
        if (!article) {
            return res.status(404).json({
                status: 'error',
                message: 'Article non trouvé !'
            });
        }
        await article.destroy();
        await redis.del('articles:{}{}');
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

const getAllArticles = async (req: Request, res: Response) => {
    try {
        const articles = await models.Articles.findAll();

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

const getOneArticle = async (req: Request, res: Response) => {
    try {
        const id = req.params.id;
        const article = await models.Articles.findByPk(id as any);

        if (!article) {
            return res.status(404).json({
                status: 'error',
                message: 'Article non trouvé !'
            });
        }

        res.status(200).json({
            status: 'success',
            message: 'Article récupéré avec succès !',
            data: { article }
        });

    } catch (error) {
        res.status(500).json({
            status: 'error',
            error: "Erreur interne lors de la récupération de l'article"
        });
    }
};

export default {
    createArticle,
    updateArticle,
    deleteArticle,
    getAllArticles,
    getOneArticle
};