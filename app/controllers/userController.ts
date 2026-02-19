import models from '../models/index.js';
import bcrypt from 'bcryptjs';
import 'dotenv/config';
import redis from '../config/redisClient.js';
import { Op } from 'sequelize';
import { deleteFile } from '../utils/fileUtils.js';
import { ROLES } from '../config/constants.js';
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
    const t = await models.sequelize.transaction();

    try {
        const userId = req.params.userId;
        const adminId = (req.auth as any).userId;

        if (!userId) {
            await t.rollback();
            return res.status(400).json({
                status: 'error',
                message: "L'identifiant de l'utilisateur est requis."
            });
        }

        const { email, firstName, lastName, phone, isActive, rolesCategories, licence } = req.body;

        const user = await models.Users.findByPk(userId as any, { transaction: t });
        if (!user) {
            await t.rollback();
            return res.status(404).json({
                status: 'error',
                message: "Utilisateur non trouvé."
            });
        }

        if (req.body.photo === "DELETE" && user.photo) {
            deleteFile(user.photo);
            user.photo = null;
        }

        if (req.body.photo_celebration === "DELETE" && user.photo_celebration) {
            deleteFile(user.photo_celebration);
            user.photo_celebration = null;
        }

        const files = req.files as { [fieldname: string]: Express.Multer.File[] } | undefined;

        if (files && files.photo) {
            if (user.photo) deleteFile(user.photo);
            user.photo = `/uploads/${files.photo[0].filename}`;
        }
        if (files && files.photo_celebration) {
            if (user.photo_celebration) deleteFile(user.photo_celebration);
            user.photo_celebration = `/uploads/${files.photo_celebration[0].filename}`;
        }

        if (Number(userId) !== Number(adminId)) {
            if (email !== undefined) user.email = email;
            if (firstName !== undefined) user.firstName = firstName;
            if (lastName !== undefined) user.lastName = lastName;
            if (phone !== undefined) user.phone = phone;
            if (licence !== undefined) user.licence = licence;
            if (isActive !== undefined) {
                user.isActive = isActive;
                user.refreshToken = null;
                user.password = null;
            }

            if (Array.isArray(rolesCategories)) {
                await models.UserRolesCategories.destroy({ where: { userId } as any, transaction: t });

                for (const item of rolesCategories) {
                    // Assuming rolesCategories comes as object or needs parsing? The original code did `for (const { roleId, categoryId } of rolesCategories)`
                    // Depending on how it's sent (JSON vs FormData), it might be a string or object.
                    // Assuming object here as per original code.
                    const { roleId, categoryId } = item;

                    const role = await models.Roles.findByPk(roleId as any, { transaction: t });
                    if (!role) throw new Error(`Le rôle '${roleId}' n'existe pas`);

                    let category = null;
                    if ([ROLES.PLAYER, ROLES.COACH].includes(Number(roleId) as any)) {
                        if (!categoryId) throw new Error(`La catégorie est requise pour le rôle '${role.name}'`);

                        category = await models.Categories.findByPk(categoryId as any, { transaction: t });
                        if (!category) throw new Error(`La catégorie '${categoryId}' n'existe pas`);

                        const trainings = await models.Trainings.findAll({ where: { categoryId } as any, transaction: t });
                        // @ts-ignore - Sequelize mixin method, might need explicit type definition on Model or use standard querying
                        // But since I didn't add mixins to User model definition yet, TS will complain.
                        // Ideally I should define mixins in InitModels or User model file. 
                        // For now suppressing error or using manual association creation if standard mixins are missing.

                        // user.setTrainings is a mixin.
                        if ((user as any).setTrainings) {
                            await (user as any).setTrainings(trainings, { transaction: t });
                        }
                    }

                    await models.UserRolesCategories.create({
                        userId: Number(userId),
                        roleId: Number(roleId),
                        categoryId: category ? category.id : null
                    }, { transaction: t });
                }
            }
        } else if (Number(userId) === Number(adminId) && (email !== undefined || firstName !== undefined || lastName !== undefined || phone !== undefined || isActive !== undefined || Array.isArray(rolesCategories))) {
            await t.rollback();
            return res.status(403).json({
                status: 'error',
                message: "Un administrateur ne peut pas modifier son propre compte via cette route."
            });
        }

        await user.save({ transaction: t });
        await redis.del('users:{}{}');
        await t.commit();

        res.status(200).json({
            status: 'success',
            message: 'Utilisateur mis à jour avec succès!',
            data: user
        });

    } catch (error: any) {
        await t.rollback();
        res.status(500).json({
            status: 'error',
            message: "Erreur interne du serveur lors de la mise à jour de l'utilisateur."
        });
    }
};

const updatePassword = async (req: Request, res: Response) => {
    try {
        const userId = (req.auth as any).userId;
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

        const user = await models.Users.findByPk(userId as any);
        if (!user || !user.isActive) {
            return res.status(404).json({
                status: 'error',
                message: "Utilisateur non trouvé."
            });
        }

        if (!user.password) {
            return res.status(400).json({
                status: 'error',
                message: "L'utilisateur n'a pas de mot de passe défini."
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

    } catch (error) {
        res.status(500).json({
            status: 'error',
            message: "Erreur interne du serveur lors de la suppression de l'utilisateur."
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
    deleteUser
};
