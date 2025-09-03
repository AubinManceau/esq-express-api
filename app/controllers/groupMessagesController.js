import models from '../models/index.js';

const sendGroupMessage = async (req, res) => {
    const t = await models.sequelize.transaction();
    try {
        const senderId = req.auth.userId;
        const chatGroupId = req.params.id;
        const { content } = req.body;

        if (!content) {
            await t.rollback();
            return res.status(400).json({
                status: 'error',
                message: 'Tous les champs sont requis.',
            });
        }

        const group = await models.ChatGroups.findByPk(chatGroupId);
        if (!group) {
            await t.rollback();
            return res.status(404).json({
                status: 'error',
                message: 'Groupe non trouvé.',
            });
        }

        const message = await models.GroupMessages.create({
            senderId,
            chatGroupId,
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
                    groupId: message.groupId,
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

export default {
    sendGroupMessage
};