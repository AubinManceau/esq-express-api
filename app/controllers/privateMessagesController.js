import models from '../models/index.js';
import { Sequelize } from 'sequelize';

const sendPrivateMessage = async (req, res) => {
    const t = await models.sequelize.transaction();
    try {
        const senderId = req.auth.userId;
        const {receiverId, content } = req.body;

        if (!receiverId || !content) {
            await t.rollback();
            return res.status(400).json({
                status: 'error',
                message: 'Tous les champs sont requis.',
            });
        }

        if (senderId === receiverId) {
            await t.rollback();
            return res.status(400).json({
                status: 'error',
                message: 'Vous ne pouvez pas vous envoyer un message à vous-même.',
            });
        }

        const receiver = await models.Users.findByPk(receiverId);
        if (!receiver) {
            await t.rollback();
            return res.status(404).json({
                status: 'error',
                message: 'Utilisateur destinataire non trouvé.',
            });
        }

        const message = await models.PrivateMessages.create({
            senderId,
            receiverId,
            content,
        }, { transaction: t });

        await t.commit();
        return res.status(201).json({
            status: 'success',
            message: 'Message envoyé avec succès.',
            data: {
                message: {
                    id: message.id,
                    senderId: message.senderId,
                    receiverId: message.receiverId,
                    content: message.content,
                    createdAt: message.createdAt,
                }
            },
        });
    } catch (error) {
        await t.rollback();
        console.error(error);
        return res.status(500).json({
            status: 'error',
            message: 'Une erreur est survenue lors de l\'envoi du message.',
        });
    }
};

const getAllPrivateConversations = async (req, res) => {
    try {
        const userId = req.auth.userId;

        const messages = await models.PrivateMessages.findAll({
            where: {
                [Sequelize.Op.or]: [
                    { senderId: userId },
                    { receiverId: userId }
                ]
            },
            order: [['createdAt', 'DESC']],
        });

        const conversations = {};
        messages.forEach(msg => {
            const otherUserId = msg.senderId === userId ? msg.receiverId : msg.senderId;
            if (!conversations[otherUserId]) {
                conversations[otherUserId] = msg;
            }
        });

        return res.status(200).json({
            status: 'success',
            data: {
                conversations,
            },
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({
            status: 'error',
            message: 'Une erreur est survenue lors de la récupération des conversations.',
        });
    }
};


const getPrivateConversation = async (req, res) => {
    try {
        const userId = req.auth.userId;
        const { otherUserId } = req.params;

        if (!otherUserId || userId === parseInt(otherUserId, 10)) {
            return res.status(400).json({
                status: 'error',
                message: 'ID utilisateur invalide pour la conversation.',
            });
        }

        const messages = await models.PrivateMessages.findAll({
            where: {
                [Sequelize.Op.or]: [
                    { senderId: userId, receiverId: otherUserId },
                    { senderId: otherUserId, receiverId: userId }
                ]
            },
            order: [['createdAt', 'ASC']],
        });

        return res.status(200).json({
            status: 'success',
            data: {
                messages,
            },
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({
            status: 'error',
            message: 'Une erreur est survenue lors de la récupération de la conversation.',
        });
    }
};

export default {
    sendPrivateMessage,
    getAllPrivateConversations,
    getPrivateConversation
};