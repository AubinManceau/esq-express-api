import models from '../models/index.js';
import { Op } from 'sequelize';

export const createTraining = async (req, res) => {
    try {
        const { type, date, startTime, status, categoryId } = req.body;
        if (!type || !date || !startTime || !categoryId) {
            return res.status(400).json({ 
                status: 'error',
                message: 'Type, Date, Heure et une catégorie sont requis.'
            });
        }

        const category = await models.Categories.findByPk(categoryId);
        if (!category) {
            return res.status(404).json({ 
                status: 'error',
                message: 'Catégorie non trouvé.' 
            });
        }

        const training = await models.Trainings.create({ 
            type,
            date,
            startTime,
            status,
            categoryId
        });
        
        const rolesId = [1, 2];
        const users = await models.UserRolesCategories.findAll({
            where: {
                categoryId: categoryId,
                roleId: { [Op.in]: rolesId }
            }
        });

        await Promise.all(users.map(user =>
            models.TrainingUsersStatus.create({ 
                userId: user.userId, 
                trainingId: training.id 
            })
        ));

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
        console.error("Erreur lors de la création de l'entrainement:", error);
        
        return res.status(500).json({ 
            status: 'error',
            message: "Erreur interne du serveur lors de la création de l'entrainement."
        });
    }
};

export const updateTraining = async (req, res) => {
    try {
        const { type, date, startTime, status, categoryId } = req.body;
        const trainingId = req.params.id;

        const training = await models.Trainings.findByPk(trainingId);
        if (!training) {
            return res.status(404).json({ 
                status: 'error',
                message: 'Entrainement non trouvé.' 
            });
        }

        let category = null;

        if (categoryId && categoryId !== training.categoryId) {
            const category = await models.Categories.findByPk(categoryId);
            if (!category) {
                return res.status(404).json({ 
                    status: 'error',
                    message: 'Catégorie non trouvé.' 
                });
            }

            await models.TrainingUsersStatus.destroy({
                where: { trainingId: req.params.id }
            });

            const rolesId = [1, 2];
            const users = await models.UserRolesCategories.findAll({
                where: {
                    categoryId: categoryId,
                    roleId: { [Op.in]: rolesId }
                }
            });

            await Promise.all(users.map(user =>
                models.TrainingUsersStatus.create({
                    userId: user.userId,
                    trainingId: req.params.id
                })
            ));
        }

        await training.update({ 
            type,
            date,
            startTime,
            status,
            categoryId
        });

        if (!category && training.categoryId) {
            category = await models.Categories.findByPk(training.categoryId);
        }

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
        console.error("Erreur lors de la modification de l'entrainement:", error);
        
        return res.status(500).json({ 
            status: 'error',
            message: "Erreur interne du serveur lors de la modification de l'entrainement."
        });
    }
};

export const deleteTraining = async (req, res) => {
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
        console.error("Erreur lors de la suppression de l'entrainement:", error);
        
        return res.status(500).json({ 
            status: 'error',
            message: "Erreur interne du serveur lors de la suppression de l'entrainement."
        });
    }
};

export const getTrainings = async (res) => {
    try {
        const trainings = await models.Trainings.findAll({
            include: {
                model: models.Categories,
                as: 'category',
                attributes: ['id', 'name'],
            }
        });

        return res.status(200).json({ 
            status: 'success',
            message: 'Entrainements récupérés avec succès!', 
            data: trainings.map(training => ({
                id: training.id,
                type: training.type,
                date: training.date,
                startTime: training.startTime,
                status: training.status,
                category: {
                    id: training.category.id,
                    name: training.category.name
                }
            }))
        });
    } catch (error) {
        console.error("Erreur lors de la récupération des entrainements:", error);
        
        return res.status(500).json({ 
            status: 'error',
            message: "Erreur interne du serveur lors de la récupération des entrainements."
        });
    }
};


export const getTraining = async (req, res) => {
    try {
        const trainingId = req.params.id;

        const training = await models.Trainings.findByPk(trainingId, {
            include: {
                model: models.Categories,
                as: 'category',
                attributes: ['id', 'name']
            }
        });

        if (!training) {
            return res.status(404).json({ 
                status: 'error',
                message: 'Entrainement non trouvé.' 
            });
        }

        const presentCount = await TrainingUserStatus.count({
            where: { trainingId, status: 'present' },
        });

        const absentCount = await TrainingUserStatus.count({
            where: { trainingId, status: 'absent' },
        });

        const notRespondedCount = await TrainingUserStatus.count({
            where: { trainingId, status: 'pending' },
        });

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
                        id: training.category.id,
                        name: training.category.name
                    },
                    responses : {
                        present: presentCount,
                        pending: notRespondedCount,
                        absent: absentCount
                    }
                },
            }
        });
    } catch (error) {
        console.error("Erreur lors de la récupération de l'entrainement:", error);
        
        return res.status(500).json({ 
            status: 'error',
            message: "Erreur interne du serveur lors de la récupération de l'entrainement."
        });
    }
};

export const getUpcomingTrainingsByUserCategory = async (req, res) => {
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

        const categoryIds = userCategories.map(uc => uc.categoryId);

        const trainings = await models.Trainings.findAll({
            where: {
                categoryId: {
                    [Op.in]: categoryIds
                },
                date: {
                    [Op.gte]: today
                }
            },
            order: [['date', 'ASC']],
            include: {
                model: models.Categories,
                as: 'category',
                attributes: ['id', 'name']
            }
        });

        return res.status(200).json({
            status: 'success',
            message: 'Entrainements à venir récupérés avec succès!',
            data: trainings
        });

    } catch (error) {
        console.error("Erreur lors de la récupération des entrainements à venir:", error);
        return res.status(500).json({
            status: 'error',
            message: "Erreur interne du serveur lors de la récupération des entrainements."
        });
    }
};

export const updateTrainingUserStatus = async (req, res) => {
    try {
        const userId = req.auth.userId;
        const { trainingId } = req.params;
        const { status } = req.body;

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
        console.error("Erreur lors de la mise à jour du statut de participation:", error);
        return res.status(500).json({
            status: 'error',
            message: "Erreur serveur lors de la mise à jour du statut."
        });
    }
};
