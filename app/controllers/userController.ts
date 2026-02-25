import models from '../models/index.js';
import bcrypt from 'bcryptjs';
import 'dotenv/config';
import redis from '../config/redisClient.js';
import { Op } from 'sequelize';
import { deleteFile } from '../utils/fileUtils.js';
import { Request, Response } from 'express';
// @ts-ignore
import fs from 'fs';
import path from 'path';

// Fix for Multer type on Request if not fully extended
interface RequestWithFiles extends Request {
    files?: { [fieldname: string]: Express.Multer.File[] } | Express.Multer.File[];
}

const updateUser = async (req: Request, res: Response) => {
    try {
        const userId = (req.auth as any).userId;
        const { email, firstName, lastName, phone } = req.body;

        const user = await models.Users.findByPk(userId as any);
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
        await redis.del('users:{}{}');

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

const updateUserForAdmin = async (req: RequestWithFiles, res: Response) => {
    const userId = Number(req.params.userId);
    const adminId = Number((req.auth as any).userId);

    if (userId === adminId) {
        return res.status(403).json({ status: 'error', message: "Action interdite sur votre propre compte." });
    }

    const t = await models.sequelize.transaction();
    let filesToDelete: string[] = [];

    try {
        const user = await models.Users.findByPk(userId, { transaction: t });
        if (!user) {
            await t.rollback();
            return res.status(404).json({ status: 'error', message: "Utilisateur non trouvé." });
        }

        const { email, firstName, lastName, phone, isActive, rolesCategories, licence, photo, photo_celebration } = req.body;
        const files = req.files as { [fieldname: string]: Express.Multer.File[] } | undefined;

        const processPhoto = (field: 'photo' | 'photo_celebration', deleteFlag: string) => {
            if (deleteFlag === "DELETE" && user[field]) {
                filesToDelete.push(user[field]);
                user[field] = null;
            }
            if (files && files[field]) {
                if (user[field]) filesToDelete.push(user[field]);
                user[field] = `/uploads/${files[field][0].filename}`;
            }
        };

        processPhoto('photo', photo);
        processPhoto('photo_celebration', photo_celebration);

        const wasActive = user.isActive;
        const willBeActive = isActive;

        user.set({ email, firstName, lastName, phone, licence, isActive });
        
        if (willBeActive === false) {
            user.refreshToken = null;
            user.password = null;
        } 
        else if (wasActive === false && willBeActive === true) {
            const tempPassword = Math.random().toString(36).slice(-8) + 'A1!';
        }

        if (Array.isArray(rolesCategories)) {
            await models.UserRolesCategories.destroy({ where: { userId }, transaction: t });

            for (const item of rolesCategories) {
                const { roleId, categoryId } = item;
                if ([1, 2].includes(Number(roleId)) && !categoryId) {
                     throw new Error(`Catégorie manquante pour le rôle ${roleId}`);
                }

                await models.UserRolesCategories.create({
                    userId,
                    roleId: Number(roleId),
                    categoryId: categoryId ? Number(categoryId) : null
                }, { transaction: t });
                
                if (categoryId) {
                    const trainings = await models.Trainings.findAll({ 
                        where: { categoryId: Number(categoryId) },
                        transaction: t 
                    });
                    
                    // @ts-ignore
                    if (typeof user.setTrainings === 'function') {
                        // @ts-ignore
                        await user.setTrainings(trainings, { transaction: t });
                    }
                }
            }

        }

        await user.save({ transaction: t });
        await t.commit();
        filesToDelete.forEach(path => deleteFile(path));
        await redis.del('users:{}{}');
        return res.status(200).json({ 
            status: 'success',
            message: 'Utilisateur mis à jour avec succès!',
            data: user 
        });

    } catch (error: any) {
        if (t) await t.rollback();
        console.error(error);
        res.status(500).json({ status: 'error', message: error.message || "Erreur interne." });
    }
};

const updatePassword = async (req: Request, res: Response) => {
    try {
        const userId = (req.auth as any).userId;
        const { oldPassword, newPassword, confirmPassword } = req.body;

        const user = await models.Users.findByPk(userId as any);
        if (!user || !user.isActive) {
            return res.status(404).json({
                status: 'error',
                message: "Utilisateur non trouvé."
            });
        }

        if (!user.password || !user.isActive) {
            return res.status(400).json({
                status: 'error',
                message: "Le compte de cet utilisateur n'a pas de mot de passe défini ou est inactif."
            });
        }

        if (newPassword !== confirmPassword) {
            return res.status(400).json({
                status: 'error',
                message: "Le nouveau mot de passe et la confirmation ne correspondent pas."
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
        await redis.del('users:{}{}');

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

const getUser = async (req: Request, res: Response) => {
    try {
        const userId = req.params.userId;

        if (!userId) {
            return res.status(400).json({
                status: 'error',
                message: "L'identifiant de l'utilisateur est requis."
            });
        }

        const user = await models.Users.findByPk(userId as any, {
            include: [
                {
                    model: models.UserRolesCategories,
                    attributes: ['roleId', 'categoryId']
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
            data: user
        });

    } catch (error) {
        return res.status(500).json({
            status: 'error',
            message: "Erreur interne du serveur lors de la récupération de l'utilisateur."
        });
    }
};

const getUsers = async (req: Request, res: Response) => {
    try {
        let { _role, _category } = req.query as { _role?: any, _category?: any };

        if (_role && !Array.isArray(_role)) {
            _role = [_role];
        }
        if (_category && !Array.isArray(_category)) {
            _category = [_category];
        }

        const whereUserRolesCategories: any = {};
        if (_role && _role.length > 0) {
            whereUserRolesCategories.roleId = { [Op.in]: _role };
        }
        if (_category && _category.length > 0) {
            whereUserRolesCategories.categoryId = { [Op.in]: _category };
        }

        const users = await models.Users.findAll({
            include: [
                {
                    model: models.UserRolesCategories,
                    attributes: ['roleId', 'categoryId'],
                    where: Object.keys(whereUserRolesCategories).length > 0 ? whereUserRolesCategories : undefined
                }
            ]
        });

        if (users.length === 0) {
            return res.status(404).json({
                status: 'error',
                message: "Aucun utilisateur trouvé."
            });
        }

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

const getProfile = async (req: Request, res: Response) => {
    try {
        const userId = (req.auth as any).userId;

        const user = await models.Users.findByPk(userId as any, {
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
        if (!user || !user.isActive) {
            return res.status(404).json({
                status: 'error',
                message: 'Utilisateur non trouvé ou inactif.'
            });
        }

        // @ts-ignore
        const rolesCategories = (user as any).UserRolesCategories || [];

        const userData = {
            id: user.id,
            firstName: user.firstName,
            lastName: user.lastName,
            email: user.email,
            phone: user.phone,
            roles: rolesCategories.map((urc: any) => ({
                roleId: urc.roleId,
                roleName: urc.Role ? urc.Role.name : null,
                categoryId: urc.categoryId,
                categoryName: urc.Category ? urc.Category.name : null
            }))
        };

        return res.status(200).json({
            status: 'success',
            message: 'Profil utilisateur récupéré avec succès.',
            data: { user: userData }
        });

    } catch (error) {
        return res.status(500).json({
            status: 'error',
            message: 'Erreur interne du serveur lors de la récupération du profil utilisateur.'
        });
    }
};

const deleteUser = async (req: Request, res: Response) => {
    try {
        const userId = req.params.userId;

        if (Number(userId) === Number((req.auth as any).userId)) {
            return res.status(403).json({
                status: 'error',
                message: "Un utilisateur ne peut pas supprimer son propre compte."
            });
        }

        const user = await models.Users.findByPk(userId as any);
        if (!user) {
            return res.status(404).json({
                status: 'error',
                message: "Utilisateur non trouvé."
            });
        }

        if (user.photo) {
            deleteFile(user.photo);
        }

        if (user.photo_celebration) {
            deleteFile(user.photo_celebration);
        }

        await user.destroy();
        await redis.del('users:{}{}');

        res.status(200).json({
            status: 'success',
            message: "Utilisateur supprimé avec succès."
        });

    } catch (error: any) {
        console.error('Error deleting user:', error);
        res.status(500).json({
            status: 'error',
            message: error.message || "Erreur interne du serveur lors de la suppression de l'utilisateur."
        });
    }
};

const getFiles = (req: Request, res: Response) => {
    const { filename } = req.params;
    const filePath = path.resolve('app/uploads', filename as string);

    if (!fs.existsSync(filePath)) {
        return res.status(404).json({ status: 'error', message: 'Fichier non trouvé.' });
    }
    res.sendFile(filePath);
};

export default {
    updateUser,
    updateUserForAdmin,
    updatePassword,
    getFiles,
    getUser,
    getUsers,
    deleteUser,
    getProfile
};
