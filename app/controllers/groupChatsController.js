import models from '../models/index.js';

const createGroupChat = async (req, res) => {
    const t = await models.sequelize.transaction();
    try {
        const { name, categoryId, roleId } = req.body;

        if (!name) {
            await t.rollback();
            return res.status(400).json({
                status: 'error',
                message: 'Le nom du groupe est requis.',
            });
        }

        if (categoryId) {
            const categoryExists = await models.Category.findByPk(categoryId, { transaction: t });
            if (!categoryExists) {
                await t.rollback();
                return res.status(404).json({
                    status: 'error',
                    message: 'La catégorie spécifiée n\'existe pas.',
                });
            }
        }

        if (roleId) {
            const roleExists = await models.Roles.findByPk(roleId, { transaction: t });
            if (!roleExists) {
                await t.rollback();
                return res.status(404).json({
                    status: 'error',
                    message: 'Le rôle spécifié n\'existe pas.',
                });
            }
        }

        let groupChat;
        if (roleId === 3 || roleId === 4) {
            groupChat = await models.ChatGroups.create({ name, roleId }, { transaction: t });
        } else if ((roleId === 1 || roleId === 2) && categoryId) {
            groupChat = await models.ChatGroups.create({ name, roleId, categoryId }, { transaction: t });
        } else if (!roleId && categoryId) {
            groupChat = await models.ChatGroups.create({ name, categoryId }, { transaction: t });
        } else {
            await t.rollback();
            return res.status(400).json({
                status: 'error',
                message: 'L\'ID de rôle ou l\'ID de catégorie est requis.',
            });
        }

        let where = {};
        if (roleId && categoryId) {
            where = { roleId, categoryId };
        } else if (roleId) {
            where = { roleId };
        } else if (categoryId) {
            where = { categoryId };
        }

        let userIds = [];
        if (Object.keys(where).length > 0) {
            const users = await models.UserRolesCategories.findAll({
                where,
                attributes: ["userId"],
                transaction: t
            });
            userIds = users.map(u => u.userId);
        }

        if (userIds.length > 0) {
            await groupChat.addUsers(userIds, { transaction: t });
        }

        await t.commit();
        return res.status(201).json({
            status: 'success',
            message: 'Groupe de discussion créé avec succès.',
            data: {
                groupChat,
                userIds,
            },
        });
    } catch (error) {
        await t.rollback();
        console.error(error);
        return res.status(500).json({
            status: 'error',
            message: 'Une erreur est survenue lors de la création du groupe de discussion.',
        });
    }
};


const updateGroupChat = async (req, res) => {
    const t = await models.sequelize.transaction();
    try {
        const { id } = req.params;
        const { name, categoryId, roleId } = req.body;

        const groupChat = await models.ChatGroups.findByPk(id, { transaction: t });
        if (!groupChat) {
            await t.rollback();
            return res.status(404).json({
                status: 'error',
                message: 'Groupe de discussion non trouvé.',
            });
        }

        if (categoryId) {
            const categoryExists = await models.Category.findByPk(categoryId, { transaction: t });
            if (!categoryExists) {
                await t.rollback();
                return res.status(404).json({
                    status: 'error',
                    message: 'La catégorie spécifiée n\'existe pas.',
                });
            }
        }

        if (roleId) {
            const roleExists = await models.Roles.findByPk(roleId, { transaction: t });
            if (!roleExists) {
                await t.rollback();
                return res.status(404).json({
                    status: 'error',
                    message: 'Le rôle spécifié n\'existe pas.',
                });
            }
        }

        if (name !== undefined) groupChat.name = name;
        if (categoryId !== undefined) groupChat.categoryId = categoryId;
        if (roleId !== undefined) groupChat.roleId = roleId;
        await groupChat.save({ transaction: t });

        let where = {};
        if (roleId && categoryId) {
            where = { roleId, categoryId };
        } else if (roleId) {
            where = { roleId };
        } else if (categoryId) {
            where = { categoryId };
        }

        let userIds = [];
        if (Object.keys(where).length > 0) {
            const users = await models.UserRolesCategories.findAll({
                where,
                attributes: ["userId"],
                transaction: t
            });
            userIds = users.map(u => u.userId);
        }

        await groupChat.setUsers(userIds, { transaction: t });
        await t.commit();

        return res.status(200).json({
            status: 'success',
            message: 'Groupe de discussion mis à jour avec succès.',
            data: {
                groupChat,
            },
        });
    } catch (error) {
        await t.rollback();
        return res.status(500).json({
            status: 'error',
            message: 'Une erreur est survenue lors de la mise à jour du groupe de discussion.',
        });
    }
};

const deleteGroupChat = async (req, res) => {
    const t = await models.sequelize.transaction();
    try {
        const { id } = req.params;

        const groupChat = await models.ChatGroups.findByPk(id, { transaction: t });
        if (!groupChat) {
            await t.rollback();
            return res.status(404).json({
                status: 'error',
                message: 'Groupe de discussion non trouvé.',
            });
        }

        await groupChat.destroy({ transaction: t });
        await t.commit();
        return res.status(200).json({
            status: 'success',
            message: 'Groupe de discussion supprimé avec succès.',
        });
    } catch (error) {
        await t.rollback();
        return res.status(500).json({
            status: 'error',
            message: 'Une erreur est survenue lors de la suppression du groupe de discussion.',
        });
    }
};

const getAllGroupChats = async (req, res) => {
    try {
        const userId = req.auth.userId;
        const groupChats = await models.ChatGroups.findAll({
            include: [
                {
                    model: models.Users,
                    where: { id: userId },
                    attributes: [],
                    through: { attributes: [] },
                },
            ],
            attributes: ['id', 'name'],
        });
        return res.status(200).json({
            status: 'success',
            data: groupChats
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({
            status: 'error',
            message: 'Une erreur est survenue lors de la récupération des groupes de discussion.',
        });
    }
};

const getGroupChatById = async (req, res) => {
    try {
        const userId = req.auth.userId;
        const { id } = req.params;
        const groupChat = await models.ChatGroups.findOne({
            where: { id: id },
            include: [
                {
                    model: models.Users,
                    where: { id: userId },
                    attributes: [],
                    through: { attributes: [] },
                },
                {
                    model: models.GroupMessages,
                    attributes: ['id', 'content', 'senderId', 'createdAt'],
                    order: [['createdAt', 'ASC']]
                }
            ],
            attributes: ['id', 'name'],
        });
        if (!groupChat) {
            return res.status(404).json({
                status: 'error',
                message: 'Groupe de discussion non trouvé.',
            });
        }
        return res.status(200).json({
            status: 'success',
            data: groupChat
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({
            status: 'error',
            message: 'Une erreur est survenue lors de la récupération du groupe de discussion.',
        });
    }
};

export default {
    createGroupChat,
    updateGroupChat,
    deleteGroupChat,
    getAllGroupChats,
    getGroupChatById
};