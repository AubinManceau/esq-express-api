import models from '../models/index.js';
import bcrypt from 'bcryptjs';
import 'dotenv/config';

const updateUser = async (req, res) => {
    try {
        const userId = req.auth.userId;
        const { email, firstName, lastName, phone } = req.body;

        const user = await models.Users.findByPk(userId);
        if (!user || !user.isActive) {
            return res.status(404).json({
                status: 'error',
                message: "Utilisateur non trouvé."
            });
        }

        if (email !== undefined) user.email = email;
        if (firstName !== undefined) user.firstName = firstName;
        if (lastName !== undefined) user.lastName = lastName;
        if (phone !== undefined) user.phone = phone;

        await user.save();

        res.status(200).json({
            status: 'success',
            message: 'Utilisateur mis à jour avec succès!',
            data: user
        });

    } catch (error) {
        res.status(500).json({
            status: 'error',
            message: 'Erreur interne du serveur lors de la mise à jour de l\'utilisateur.'
        });
    }
};

const updateUserForAdmin = async (req, res) => {
    const t = await models.sequelize.transaction();

    try {
        const userId = req.params.userId;
        const adminId = req.auth.userId;

        if (!userId) {
            await t.rollback();
            return res.status(400).json({
                status: 'error',
                message: "L'identifiant de l'utilisateur est requis."
            });
        }
        
        if (userId == adminId) {
            await t.rollback();
            return res.status(400).json({
                status: 'error',
                message: "Un administrateur ne peut pas modifier son propre compte via cette route."
            });
        }
        const { email, firstName, lastName, phone, isActive, rolesCategories } = req.body;

        const user = await models.Users.findByPk(userId, { transaction: t });
        if (!user) {
            await t.rollback();
            return res.status(404).json({
                status: 'error',
                message: "Utilisateur non trouvé."
            });
        }

        if (email !== undefined) user.email = email;
        if (firstName !== undefined) user.firstName = firstName;
        if (lastName !== undefined) user.lastName = lastName;
        if (phone !== undefined) user.phone = phone;
        if (isActive !== undefined) {
            user.isActive = isActive; 
            user.refreshToken = "";
        }

        if (Array.isArray(rolesCategories)) {
            await models.UserRolesCategories.destroy({ where: { userId }, transaction: t });

            for (const { roleId, categoryId } of rolesCategories) {
                const role = await models.Roles.findByPk(roleId, { transaction: t });
                if (!role) throw new Error(`Le rôle '${roleId}' n'existe pas`);

                let category = null;
                if ([1, 2].includes(roleId)) {
                    if (!categoryId) throw new Error(`La catégorie est requise pour le rôle '${role.name}'`);
                    category = await models.Categories.findByPk(categoryId, { transaction: t });
                    if (!category) throw new Error(`La catégorie '${categoryId}' n'existe pas`);

                    const trainings = await models.Trainings.findAll({ where: { categoryId }, transaction: t });
                    await Promise.all(trainings.map(training =>
                        models.TrainingUsersStatus.create({ userId, trainingId: training.id }, { transaction: t })
                    ));
                }

                await models.UserRolesCategories.create({
                    userId,
                    roleId,
                    categoryId: category ? category.id : null
                }, { transaction: t });
            }
        }

        await user.save({ transaction: t });
        await t.commit();

        res.status(200).json({
            status: 'success',
            message: 'Utilisateur mis à jour avec succès!',
            data: user
        });

    } catch (error) {
        await t.rollback();
        res.status(500).json({
            status: 'error',
            message: "Erreur interne du serveur lors de la mise à jour de l'utilisateur."
        });
    }
};

const updatePassword = async (req, res) => {
    try {
        const userId = req.auth.userId;
        const { oldPassword, newPassword, confirmPassword } = req.body;

        if (!oldPassword || !newPassword || !confirmPassword) {
            return res.status(400).json({
                status: 'error',
                message: "Tous les champs sont requis."
            });
        }

        if (newPassword !== confirmPassword) {
            return res.status(400).json({ 
                status: 'error',
                message: "Le nouveau mot de passe et la confirmation ne correspondent pas."
            });
        }

        const user = await models.Users.findByPk(userId);
        if (!user || !user.isActive) {
            return res.status(404).json({ 
                status: 'error',
                message: "Utilisateur non trouvé."
            });
        }

        const isPasswordValid = await bcrypt.compare(oldPassword, user.password);
        if (!isPasswordValid) {
            return res.status(401).json({ 
                status: 'error',
                message: "L'ancien mot de passe est incorrect."
            });
        }

        const hashedPassword = await bcrypt.hash(newPassword, 10);
        user.password = hashedPassword;
        await user.save();

        res.status(200).json({
            status: 'success',
            message: 'Mot de passe mis à jour avec succès!'
        });

    } catch (error) {
        res.status(500).json({
            status: 'error',
            message: "Erreur interne du serveur lors de la mise à jour du mot de passe."
        });
    }
};

const getUser = async (req, res) => {
    try {
        const userId = req.params.userId;

        if (!userId) {
            return res.status(400).json({
                status: 'error',
                message: "L'identifiant de l'utilisateur est requis."
            });
        }

        const user = await models.Users.findByPk(userId, {
            include: [
                {
                    model: models.UserRolesCategories,
                    include: [
                        { model: models.Roles },
                        { model: models.Categories }
                    ]
                }
            ]
        });
        if (!user) {
            return res.status(404).json({
                status: 'error',
                message: "Utilisateur non trouvé."
            });
        }

        res.status(200).json({
            status: 'success',
            message: "Utilisateur récupéré avec succès.",
            data: { 
                user: user
            }
        });

    } catch (error) {
        return res.status(500).json({ 
            status: 'error',
            message: "Erreur interne du serveur lors de la récupération de l'utilisateur."
        });
    }
};

const getUsers = async (req, res) => {
    try {
        const users = await models.Users.findAll({
            include: [
                {
                    model: models.UserRolesCategories,
                    include: [{ model: models.Roles }, { model: models.Categories }]
                }
            ]
        });

        res.status(200).json({ 
            status: 'success',
            message: "Utilisateurs récupérés avec succès.",
            data: users
         });
    } catch (error) {
        return res.status(500).json({ 
            status: 'error',
            message: "Erreur interne du serveur lors de la récupération des utilisateurs."
        });
    }
};

const deleteUser = async (req, res) => {
    try {
        const userId = req.params.userId;

        if (!userId) {
            return res.status(400).json({
                status: 'error',
                message: "L'identifiant de l'utilisateur est requis."
            });
        }

        const user = await models.Users.findByPk(userId);
        if (!user) {
            return res.status(404).json({
                status: 'error',
                message: "Utilisateur non trouvé."
            });
        }

        await user.destroy();

        res.status(200).json({
            status: 'success',
            message: "Utilisateur supprimé avec succès."
        });

    } catch (error) {
        res.status(500).json({
            status: 'error',
            message: "Erreur interne du serveur lors de la suppression de l'utilisateur."
        });
    }
};

export default {
    updateUser,
    updateUserForAdmin,
    updatePassword,
    getUser,
    getUsers,
    deleteUser
};
