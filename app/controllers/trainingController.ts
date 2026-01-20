import redis from '../config/redisClient.js';
import models from '../models/index.js';
import { Op } from 'sequelize';
import { Request, Response } from 'express';

const createTraining = async (req: Request, res: Response) => {
    const t = await models.sequelize.transaction();
    try {
        const { type, date, startTime, status, categoryId } = req.body;

        if (!type || !date || !startTime || !categoryId) {
            await t.rollback();
            return res.status(400).json({
                status: 'error',
                message: 'Type, Date, Heure et une catégorie sont requis.'
            });
        }

        const category = await models.Categories.findByPk(categoryId as any, { transaction: t });
        if (!category) {
            await t.rollback();
            return res.status(404).json({
                status: 'error',
                message: 'Catégorie non trouvé.'
            });
        }

        const training = await models.Trainings.create({
            type, date, startTime, status, categoryId
        },
            { transaction: t }
        );

        const users = await models.UserRolesCategories.findAll({
            where: { categoryId: Number(categoryId) } as any,
            attributes: ['userId'],
            transaction: t
        });

        const usersIds = [...new Set(users.map(u => u.userId))];

        // @ts-ignore
        if ((training as any).addUsers) {
            await (training as any).addUsers(usersIds, { transaction: t });
        }
        await redis.del('trainings:{}{}');
        await redis.del('trainings-user:{}{}');

        await t.commit();
        return res.status(201).json({
            status: 'success',
            message: 'Entrainement créé avec succès!',
            data: {
                training: {
                    id: training.id,
                    type: training.type,
                    date: training.date,
                    startTime: training.startTime,
                    status: training.status,
                    category: {
                        id: category.id,
                        name: category.name
                    }
                },
            }
        });

    } catch (error) {
        await t.rollback();
        return res.status(500).json({
            status: 'error',
            message: "Erreur interne du serveur lors de la création de l'entrainement."
        });
    }
};

const updateTraining = async (req: Request, res: Response) => {
    const t = await models.sequelize.transaction();
    try {
        const { type, date, startTime, status, categoryId } = req.body;
        const trainingId = req.params.id;

        const training = await models.Trainings.findByPk(trainingId as any, { transaction: t });
        if (!training) {
            await t.rollback();
            return res.status(404).json({
                status: 'error',
                message: 'Entrainement non trouvé.'
            });
        }

        if (type !== undefined) training.type = type;
        if (date !== undefined) training.date = date;
        if (startTime !== undefined) training.startTime = startTime;
        if (status !== undefined) training.status = status;

        let category = null;
        if (categoryId && categoryId !== training.categoryId) {
            category = await models.Categories.findByPk(categoryId as any, { transaction: t });
            if (!category) {
                await t.rollback();
                return res.status(404).json({
                    status: 'error',
                    message: 'Catégorie non trouvé.'
                });
            }

            training.categoryId = categoryId;

            const users = await models.UserRolesCategories.findAll({
                where: { categoryId } as any,
                attributes: ['userId'],
                transaction: t
            });

            const usersIds = [...new Set(users.map(u => u.userId))];
            // @ts-ignore
            if ((training as any).setUsers) {
                await (training as any).setUsers(usersIds, { transaction: t });
            }
        }

        if (!category) {
            category = await models.Categories.findByPk(training.categoryId, { transaction: t });
        }

        await training.save({ transaction: t });
        await redis.del('trainings:{}{}');
        await redis.del('trainings-user:{}{}');
        await t.commit();

        return res.status(200).json({
            status: 'success',
            message: 'Entrainement modifié avec succès!',
            data: {
                training: {
                    id: training.id,
                    type: training.type,
                    date: training.date,
                    startTime: training.startTime,
                    status: training.status,
                    category: {
                        id: category ? category.id : null,
                        name: category ? category.name : null
                    }
                },
            }
        });
    } catch (error) {
        await t.rollback();
        return res.status(500).json({
            status: 'error',
            message: "Erreur interne du serveur lors de la modification de l'entrainement."
        });
    }
};

const deleteTraining = async (req: Request, res: Response) => {
    try {
        const trainingId = req.params.id;

        const training = await models.Trainings.findByPk(trainingId as any);
        if (!training) {
            return res.status(404).json({
                status: 'error',
                message: 'Entrainement non trouvé.'
            });
        }

        await redis.del('trainings:{}{}');
        await redis.del('trainings-user:{}{}');
        await training.destroy();

        return res.status(200).json({
            status: 'success',
            message: 'Entrainement supprimé avec succès!',
        });
    } catch (error) {
        return res.status(500).json({
            status: 'error',
            message: "Erreur interne du serveur lors de la suppression de l'entrainement."
        });
    }
};

const getTrainings = async (req: Request, res: Response) => {
    try {
        const trainings = await models.Trainings.findAll({
            include: {
                model: models.Categories,
                attributes: ['id', 'name'],
            }
        });

        const results = await Promise.all(trainings.map(async training => {
            const [presentCount, absentCount, notRespondedCount] = await Promise.all([
                models.TrainingUsersStatus.count({ where: { trainingId: training.id, status: 'present' } as any }),
                models.TrainingUsersStatus.count({ where: { trainingId: training.id, status: 'absent' } as any }),
                models.TrainingUsersStatus.count({ where: { trainingId: training.id, status: 'pending' } as any }),
            ]);

            return {
                id: training.id,
                type: training.type,
                date: training.date,
                startTime: training.startTime,
                status: training.status,
                category: {
                    // @ts-ignore
                    id: training.Category?.id,
                    // @ts-ignore
                    name: training.Category?.name
                },
                responses: {
                    present: presentCount,
                    pending: notRespondedCount,
                    absent: absentCount
                }
            };
        }));

        return res.status(200).json({
            status: 'success',
            message: 'Entrainements récupérés avec succès!',
            data: results
        });
    } catch (error) {
        return res.status(500).json({
            status: 'error',
            message: "Erreur interne du serveur lors de la récupération des entrainements."
        });
    }
};

const getTraining = async (req: Request, res: Response) => {
    try {
        const trainingId = req.params.id;

        const training = await models.Trainings.findByPk(trainingId as any, {
            include: {
                model: models.Categories,
                attributes: ['id', 'name']
            }
        });

        if (!training) {
            return res.status(404).json({
                status: 'error',
                message: 'Entrainement non trouvé.'
            });
        }

        const [presentCount, absentCount, notRespondedCount] = await Promise.all([
            models.TrainingUsersStatus.count({ where: { trainingId: training.id, status: 'present' } as any }),
            models.TrainingUsersStatus.count({ where: { trainingId: training.id, status: 'absent' } as any }),
            models.TrainingUsersStatus.count({ where: { trainingId: training.id, status: 'pending' } as any }),
        ]);

        return res.status(200).json({
            status: 'success',
            message: 'Entrainement récupéré avec succès!',
            data: {
                id: training.id,
                type: training.type,
                date: training.date,
                startTime: training.startTime,
                status: training.status,
                category: {
                    // @ts-ignore
                    id: training.Category?.id,
                    // @ts-ignore
                    name: training.Category?.name
                },
                responses: {
                    present: presentCount,
                    pending: notRespondedCount,
                    absent: absentCount
                }
            }
        });
    } catch (error) {
        return res.status(500).json({
            status: 'error',
            message: "Erreur interne du serveur lors de la récupération de l'entrainement."
        });
    }
};

const getTrainingsByUser = async (req: Request, res: Response) => {
    try {
        const userId = (req.auth as any).userId;

        const userCategories = await models.UserRolesCategories.findAll({
            where: { userId } as any,
            attributes: ['categoryId']
        });

        if (!userCategories || userCategories.length === 0) {
            return res.status(404).json({
                status: "error",
                message: "Catégorie(s) de l'utilisateur non trouvée(s)."
            });
        }

        const categoryIds = [...new Set(userCategories.map(uc => uc.categoryId))];

        const trainings = await models.Trainings.findAll({
            where: {
                categoryId: { [Op.in]: categoryIds } as any,
            },
            order: [['date', 'ASC']],
            include: {
                model: models.Categories,
                attributes: ['id', 'name']
            }
        });

        if (!trainings || trainings.length === 0) {
            return res.status(404).json({
                status: "error",
                message: "Aucun entrainement trouvé pour l'utilisateur."
            });
        }

        const results = await Promise.all(trainings.map(async training => {
            const [presentCount, absentCount, notRespondedCount] = await Promise.all([
                models.TrainingUsersStatus.count({ where: { trainingId: training.id, status: 'present' } as any }),
                models.TrainingUsersStatus.count({ where: { trainingId: training.id, status: 'absent' } as any }),
                models.TrainingUsersStatus.count({ where: { trainingId: training.id, status: 'pending' } as any }),
            ]);

            return {
                id: training.id,
                type: training.type,
                date: training.date,
                startTime: training.startTime,
                status: training.status,
                category: {
                    // @ts-ignore
                    id: training.Category?.id,
                    // @ts-ignore
                    name: training.Category?.name
                },
                responses: {
                    present: presentCount,
                    pending: notRespondedCount,
                    absent: absentCount
                }
            };
        }));

        const groupedByCategory = results.reduce((acc: any, training: any) => {
            const { id, name } = training.category;

            if (!acc[id]) {
                acc[id] = { id, name, trainings: [] };
            }

            acc[id].trainings.push({
                id: training.id,
                type: training.type,
                date: training.date,
                startTime: training.startTime,
                status: training.status,
                responses: training.responses
            });

            return acc;
        }, {});

        // Corrected potential previous bug: returning the grouped values properly
        return res.status(200).json({
            status: 'success',
            message: 'Entrainements récupérés avec succès!',
            data: Object.values(groupedByCategory)
        });

    } catch (error) {
        return res.status(500).json({
            status: 'error',
            message: "Erreur interne du serveur lors de la récupération des entrainements."
        });
    }
};

const updateTrainingUserStatus = async (req: Request, res: Response) => {
    try {
        const userId = parseInt((req.auth as any).userId as string, 10);
        const trainingId = parseInt(req.params.id as string, 10);
        const status = req.params.status as string;

        const allowedStatuses = ['present', 'absent', 'pending'];

        if (!allowedStatuses.includes(status)) {
            return res.status(400).json({
                status: 'error',
                message: 'Statut invalide. Les statuts autorisés sont: present, absent, pending.'
            });
        }

        const record = await models.TrainingUsersStatus.findOne({
            where: { trainingId, userId } as any
        });

        if (!record) {
            return res.status(404).json({
                status: 'error',
                message: "Aucune réponse d'utilisateur trouvée pour cet entrainement."
            });
        }

        record.status = status as 'present' | 'absent' | 'pending';
        await redis.del('trainings:{}{}');
        await redis.del('trainings-user:{}{}');
        await record.save();

        return res.status(200).json({
            status: 'success',
            message: "Statut mis à jour avec succès.",
            data: {
                trainingId,
                userId,
                status
            }
        });

    } catch (error) {
        return res.status(500).json({
            status: 'error',
            message: "Erreur serveur lors de la mise à jour du statut."
        });
    }
};

export default {
    createTraining,
    updateTraining,
    deleteTraining,
    getTrainings,
    getTraining,
    getTrainingsByUser,
    updateTrainingUserStatus,
};
