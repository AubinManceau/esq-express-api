import models from '../models/index.js';
import { Sequelize, Op } from 'sequelize';
import { Request, Response } from 'express';

const sendPrivateMessage = async (req: Request, res: Response) => {
    const t = await models.sequelize.transaction();
    try {
        const senderId = (req.auth as any).userId;
        const { receiverId, content } = req.body;

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

        const receiver = await models.Users.findByPk(receiverId as any);
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

        const io = req.app.get('io');
        io.to(`user_${receiverId}`).emit('new_private_message', {
            message: {
                id: message.id,
                senderId: message.senderId,
                receiverId: message.receiverId,
                content: message.content,
                createdAt: message.createdAt,
            }
        });

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

const getAllPrivateConversations = async (req: Request, res: Response) => {
    try {
        const userId = (req.auth as any).userId;

        const messages = await models.PrivateMessages.findAll({
            where: {
                [Op.or]: [
                    { senderId: userId } as any,
                    { receiverId: userId }
                ]
            },
            order: [['createdAt', 'DESC']],
        });

        const conversations = messages.reduce((acc: any, msg: any) => {
            const otherUserId = msg.senderId === userId ? msg.receiverId : msg.senderId;
            if (!acc[otherUserId]) {
                acc[otherUserId] = msg;
            }
            return acc;
        }, {});

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


const getPrivateConversation = async (req: Request, res: Response) => {
    try {
        const userId = (req.auth as any).userId;
        const { otherUserId } = req.params;

        if (!otherUserId || userId === parseInt(otherUserId as string, 10)) {
            return res.status(400).json({
                status: 'error',
                message: 'ID utilisateur invalide pour la conversation.',
            });
        }

        const messages = await models.PrivateMessages.findAll({
            where: {
                [Op.or]: [
                    { senderId: userId, receiverId: otherUserId } as any,
                    { senderId: otherUserId, receiverId: userId }
                ]
            },
            order: [['createdAt', 'DESC']],
            limit: 50,
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
