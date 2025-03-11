const User = require('../models/User');
const Role = require('../models/Role');
const Category = require('../models/Category');
const UserRoleCategory = require('../models/UserRoleCategory');
const bcrypt = require('bcrypt');
const TrainingUserStatus = require('../models/TrainingUserStatus');
require('dotenv').config();

exports.updateUser = async (req, res, next) => {
    try{
        const userId = req.params.userId;
        const {email, firstName, lastName, roleName, categoryName } = req.body;

        if (!email || !firstName || !lastName) {
            return res.status(400).json({ error: 'Email, prénom et nom sont requis.' });
        }

        const user = await User.findByPk(userId);
        if (!user || !user.isActive) {
            return res.status(404).json({ error: 'Utilisateur non trouvé.' });
        }

        if (roleName && roleName.length > 0) {
            await UserRoleCategory.destroy({ where: { userId: userId } });
            for (let i = 0; i < roleName.length; i++) {
                const role = roleName[i];
                const category = categoryName[i] || null;
            
                const roleInstance = await Role.findOne({ where: { name: role } });
                if (!roleInstance) {
                    return res.status(400).json({ error: `Le rôle '${role}' n'existe pas.` });
                }
            
                let categoryInstance = null;
                if (category) {
                    categoryInstance = await Category.findOne({ where: { name: category } });
                    if (!categoryInstance) {
                        return res.status(400).json({ error: `La catégorie '${category}' n'existe pas.` });
                    }
                }
            
                await UserRoleCategory.create({
                    userId: user.id,
                    roleId: roleInstance.id,
                    categoryId: categoryInstance ? categoryInstance.id : null
                });
            }
        }

        user.email = email;
        user.first_name = firstName;
        user.last_name = lastName;
        await user.save();

        res.status(200).json({ message: 'Utilisateur mis à jour avec succès!' });

    } catch (error) {
    console.error('Erreur lors de la mise à jour de l\'utilisateur:', error);
    }  
};

exports.updatePassword = async (req, res, next) => {
    try {
        const userId = req.params.userId;
        const { oldPassword, newPassword, confirmPassword } = req.body;

        if (!oldPassword || !newPassword || !confirmPassword) {
            return res.status(400).json({ error: 'Ancien mot de passe, nouveau mot de passe et confirmation sont requis.' });
        }

        if (newPassword !== confirmPassword) {
            return res.status(400).json({ error: 'Les mots de passe ne correspondent pas.' });
        }

        const user = await User.findByPk(userId);
        if (!user || !user.isActive) {
            return res.status(404).json({ error: 'Utilisateur non trouvé.' });
        }

        const isPasswordValid = await bcrypt.compare(oldPassword, user.password);
        if (!isPasswordValid) {
            return res.status(401).json({ message: 'Ancien mot de passe incorrect.' });
        }

        const hashedPassword = await bcrypt.hash(newPassword, 10);
        user.password = hashedPassword;
        await user.save();

        res.status(200).json({ message: 'Mot de passe mis à jour avec succès!' });

    } catch (error) {
        console.error('Erreur lors de la mise à jour du mot de passe:', error);
    }
};

exports.getUser = async (req, res, next) => {
    try {
        const userId = req.params.userId;

        if (!userId) {
            return res.status(400).json({ error: 'Identifiant est requis.' });
        }

        const user = await User.findByPk(userId);
        if (!user) {
            return res.status(404).json({ error: 'Utilisateur non trouvé.' });
        }

        const userRoleCategory = await UserRoleCategory.findAll({
            where: { userId: userId },
            include: [
                { model: Role },
                { model: Category }
            ]
        });

        res.status(200).json({ user: user, userRoleCategory: userRoleCategory });

    } catch (error) {
        console.error('Erreur lors de la récupération de l\'utilisateur:', error);
    }
};

exports.getUsers = async (req, res, next) => {
    try {
        const users = await User.findAll();

        for (let i = 0; i < users.length; i++) {
            const user = users[i];
            const userRoleCategory = await UserRoleCategory.findAll({
                where: { userId: user.id },
                include: [
                    { model: Role },
                    { model: Category }
                ]
            });
            user.dataValues.userRoleCategory = userRoleCategory;
        }

        res.status(200).json({ users: users });
    } catch (error) {
        console.error('Erreur lors de la récupération des utilisateurs:', error);
    }
};

exports.deleteUser = async (req, res, next) => {
    try {
        const userId = req.params.userId;

        if (!userId) {
            return res.status(400).json({ error: 'Identifiant est requis.' });
        }

        const user = await User.findByPk(userId);
        if (!user) {
            return res.status(404).json({ error: 'Utilisateur non trouvé.' });
        }

        await UserRoleCategory.destroy({ where: { userId: userId } });
        await TrainingUserStatus.destroy({ where: { userId: userId } });
        await user.destroy();

        res.status(200).json({ message: 'Utilisateur supprimé avec succès!' });

    } catch (error) {
        console.error('Erreur lors de la suppression de l\'utilisateur:', error);
    }
};

exports.getUsersByRole = async (req, res, next) => {
    try {
        const roleName = req.params.roleName;

        if (!roleName) {
            return res.status(400).json({ error: 'Nom du rôle est requis.' });
        }

        const role = await Role.findOne({ where: { name: roleName } });
        if (!role) {
            return res.status(404).json({ error: 'Rôle non trouvé.' });
        }

        const userRoleCategory = await UserRoleCategory.findAll({
            where: { roleId: role.id },
            include: [
                { model: User },
                { model: Category }
            ]
        });

        res.status(200).json({ userRoleCategory: userRoleCategory });

    } catch (error) {
        console.error('Erreur lors de la récupération des utilisateurs par rôle:', error);
    }
};

exports.getUsersByRolesAndCategories = async (req, res, next) => {
    try {
        const roleName = req.params.roleName;
        const categoryName = req.params.categoryName;

        if (!roleName || !categoryName) {
            return res.status(400).json({ error: 'Nom du rôle et de la catégorie sont requis.' });
        }

        const role = await Role.findOne({ where: { name: roleName } });
        if (!role) {
            return res.status(404).json({ error: 'Rôle non trouvé.' });
        }

        const category = await Category.findOne({ where: { name: categoryName } });
        if (!category) {
            return res.status(404).json({ error: 'Catégorie non trouvée.' });
        }

        const userRoleCategory = await UserRoleCategory.findAll({
            where: { roleId: role.id, categoryId: category.id },
            include: [
                { model: User }
            ]
        });

        res.status(200).json({ userRoleCategory: userRoleCategory });

    } catch (error) {
        console.error('Erreur lors de la récupération des utilisateurs par rôle et catégorie:', error);
    }
};
