const { Op } = require('sequelize');
const { models } = require('../app.js');

exports.createTraining = async (req, res, next) => {
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

exports.updateTraining = async (req, res, next) => {
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

exports.deleteTraining = async (req, res, next) => {
    try {
        const trainingId = req.params.id;
        const training = await Training.findByPk(trainingId);
        if (!training) {
            return res.status(404).json({ message: 'Entrainement non trouvé !' });
        }
        await TrainingUserStatus.destroy({ where: { trainingId } });
        await training.destroy();
        res.status(200).json({ message: 'Entrainement supprimé !' });
    } catch (error) {
        res.status(400).json({ error });
    }
};

exports.getAllTrainings = async (req, res, next) => {
    try {
        const trainings = await Training.findAll();
        res.status(200).json(trainings);
    } catch (error) {
        res.status(400).json({ error });
    }
};

exports.getOneTraining = async (req, res, next) => {
    try {
        const trainingId = req.params.id;
        const training = await Training.findByPk(trainingId);
        if (!training) {
            return res.status(404).json({ message: 'Entrainement non trouvé !' });
        }

        const presentCount = await TrainingUserStatus.count({
            where: { trainingId, status: 'present' },
        });

        const absentCount = await TrainingUserStatus.count({
            where: { trainingId, status: 'absent' },
        });

        const notRespondedCount = await TrainingUserStatus.count({
            where: { trainingId, status: 'notResponded' },
        });

        res.status(200).json(
            training,
            {
                present: presentCount,
                absent: absentCount,
                notResponded: notRespondedCount,
            }
        );
    } catch (error) {
        res.status(400).json({ error });
    }
};

exports.getTrainingsByCategory = async (req, res, next) => {
    try {
        const categoryName = req.params.name;
        const category = await Category.findOne({ where: { name: categoryName } });
        if (!category) {
            return res.status(403).json({ message: 'Catégorie non trouvée !' });
        }
        const categoryId = category.id;
        const trainings = await Training.findAll({ where: { categoryId } });
        if (!trainings.length) {
            return res.status(404).json({ message: 'Aucun entrainement trouvé pour cette catégorie !' });
        }
        res.status(200).json(trainings);
    } catch (error) {
        res.status(400).json({ error });
    }
};

exports.getTrainingsByUser = async (req, res, next) => {
    try {
        const userId = req.params.id;
        const trainings = await Training.findAll({
            include: [{
                model: TrainingUserStatus,
                where: { userId },
                required: true
            }]
        });
        if (!trainings.length) {
            return res.status(404).json({ message: 'Aucun entrainement trouvé pour cet utilisateur !' });
        }
        res.status(200).json(trainings);
    } catch (error) {
        res.status(400).json({ error });
    }
};
