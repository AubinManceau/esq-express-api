import models from '../models/index.js';
import { Op } from 'sequelize';

const createTraining = async (req, res) => {
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

        const category = await models.Categories.findByPk(categoryId, { transaction: t });
        if (!category) {
            await t.rollback();
            return res.status(404).json({ 
                status: 'error',
                message: 'Catégorie non trouvé.' 
            });
        }

        const training = await models.Trainings.create({  type, date, startTime, status, categoryId }, { transaction: t });

        const users = await models.UserRolesCategories.findAll({
            where: { categoryId },
            attributes: ['userId'],
            transaction: t
        });

        const usersIds = [...new Set(users.map(u => u.userId))];

        await Promise.all(usersIds.map(userId =>
            models.TrainingUsersStatus.create({ 
                userId: userId, 
                trainingId: training.id 
            }, { transaction: t })
        ));

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
                    category : {
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

const updateTraining = async (req, res) => {
    const t = await models.sequelize.transaction();
    try {
        const { type, date, startTime, status, categoryId } = req.body;
        const trainingId = req.params.id;

        const training = await models.Trainings.findByPk(trainingId, { transaction: t });
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
            category = await models.Categories.findByPk(categoryId, { transaction: t });
            if (!category) {
                await t.rollback();
                return res.status(404).json({ 
                    status: 'error',
                    message: 'Catégorie non trouvé.' 
                });
            }

            training.categoryId = categoryId;

            await models.TrainingUsersStatus.destroy({
                where: { trainingId: trainingId },
                transaction: t
            });

            const users = await models.UserRolesCategories.findAll({
                where: { categoryId },
                attributes: ['userId'],
                transaction: t
            });

            const usersIds = [...new Set(users.map(u => u.userId))];

            await Promise.all(usersIds.map(userId =>
                models.TrainingUsersStatus.create({
                    userId: userId,
                    trainingId: trainingId
                }, { transaction: t })
            ));
        }

        if (!category) {
            category = await models.Categories.findByPk(training.categoryId, { transaction: t });
        }

        await training.save({ transaction: t });
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
                    category : {
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
            message: "Erreur interne du serveur lors de la modification de l'entrainement."
        });
    }
};

const deleteTraining = async (req, res) => {
    try {
        const trainingId = req.params.id;

        const training = await models.Trainings.findByPk(trainingId);
        if (!training) {
            return res.status(404).json({ 
                status: 'error',
                message: 'Entrainement non trouvé.' 
            });
        }

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

const getTrainings = async (req, res) => {
    try {
        const trainings = await models.Trainings.findAll({
            include: {
                model: models.Categories,
                attributes: ['id', 'name'],
            }
        });

        const results = await Promise.all(trainings.map(async training => {
            const [presentCount, absentCount, notRespondedCount] = await Promise.all([
                models.TrainingUsersStatus.count({ where: { trainingId: training.id, status: 'present' } }),
                models.TrainingUsersStatus.count({ where: { trainingId: training.id, status: 'absent' } }),
                models.TrainingUsersStatus.count({ where: { trainingId: training.id, status: 'pending' } }),
            ]);

            return {
                id: training.id,
                type: training.type,
                date: training.date,
                startTime: training.startTime,
                status: training.status,
                category: {
                    id: training.Category.id,
                    name: training.Category.name
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

const getTraining = async (req, res) => {
    try {
        const trainingId = req.params.id;

        const training = await models.Trainings.findByPk(trainingId, {
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
            models.TrainingUsersStatus.count({ where: { trainingId: training.id, status: 'present' } }),
            models.TrainingUsersStatus.count({ where: { trainingId: training.id, status: 'absent' } }),
            models.TrainingUsersStatus.count({ where: { trainingId: training.id, status: 'pending' } }),
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
                category : {
                    id: training.Category.id,
                    name: training.Category.name
                },
                responses : {
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

const getTrainingsByUser = async (req, res) => {
    try {
        const userId = req.auth.userId;
        const today = new Date().toISOString().split('T')[0];

        const userCategories = await models.UserRolesCategories.findAll({
            where: { userId },
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
                categoryId: { [Op.in]: categoryIds },
                date: { [Op.gte]: today }
            },
            order: [['date', 'ASC']],
            include: {
                model: models.Categories,
                attributes: ['id', 'name']
            }
        });

        const results = await Promise.all(trainings.map(async training => {
            const [presentCount, absentCount, notRespondedCount] = await Promise.all([
                models.TrainingUsersStatus.count({ where: { trainingId: training.id, status: 'present' } }),
                models.TrainingUsersStatus.count({ where: { trainingId: training.id, status: 'absent' } }),
                models.TrainingUsersStatus.count({ where: { trainingId: training.id, status: 'pending' } }),
            ]);

            return {
                id: training.id,
                type: training.type,
                date: training.date,
                startTime: training.startTime,
                status: training.status,
                category: {
                    id: training.Category.id,
                    name: training.Category.name
                },
                responses: {
                    present: presentCount,
                    pending: notRespondedCount,
                    absent: absentCount
                }
            };
        }));

        const groupedByCategory = {};
        results.forEach(training => {
            const categoryId = training.category.id;
            if (!groupedByCategory[categoryId]) {
                groupedByCategory[categoryId] = {
                    category: {
                        id: training.category.id,
                        name: training.category.name,
                        trainings: []
                    }
                };
            }
            groupedByCategory[categoryId].category.trainings.push({
                id: training.id,
                type: training.type,
                date: training.date,
                startTime: training.startTime,
                status: training.status,
                responses: training.responses
            });
        });

        return res.status(200).json({
            status: 'success',
            message: 'Entrainements à venir récupérés avec succès!',
            data: Object.values(groupedByCategory).map(item => item.category)
        });

    } catch (error) {
        return res.status(500).json({
            status: 'error',
            message: "Erreur interne du serveur lors de la récupération des entrainements."
        });
    }
};

const updateTrainingUserStatus = async (req, res) => {
    try {
        const userId = parseInt(req.auth.userId, 10);
        const trainingId = parseInt(req.params.id, 10);
        const status = req.params.status;

        const allowedStatuses = ['present', 'absent', 'pending'];

        if (!allowedStatuses.includes(status)) {
            return res.status(400).json({
                status: 'error',
                message: 'Statut invalide. Les statuts autorisés sont: present, absent, pending.'
            });
        }

        const record = await models.TrainingUsersStatus.findOne({
            where: { trainingId, userId }
        });

        if (!record) {
            return res.status(404).json({
                status: 'error',
                message: "Aucune réponse d'utilisateur trouvée pour cet entrainement."
            });
        }

        record.status = status;
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
