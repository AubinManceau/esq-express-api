const Training = require('../models/Training');
const Category = require('../models/Category');
const { Op } = require('sequelize');
const UserRoleCategory = require('../models/UserRoleCategory');
const TrainingUserStatus = require('../models/TrainingUserStatus');

exports.createTraining = async (req, res, next) => {
    try {
        const { categoryId, ...trainingData } = req.body;

        if (!categoryId) {
            return res.status(400).json({ error: "categoryId est requis" });
        }

        const category = await Category.findByPk(categoryId);
        if (!category) {
            return res.status(404).json({ error: "Catégorie introuvable" });
        }

        const training = await Training.create({ ...trainingData, categoryId });
        
        const rolesId = [1, 2];
        const users = await UserRoleCategory.findAll({
            where: {
                categoryId: categoryId,
                roleId: { [Op.in]: rolesId }
            }
        });

        await Promise.all(users.map(user =>
            TrainingUserStatus.create({ userId: user.userId, trainingId: training.id })
        ));

        res.status(201).json({ message: 'Entrainement créé !', training });

    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

exports.updateTraining = async (req, res, next) => {
    try {
        const { categoryId, ...trainingData } = req.body;
        const trainingId = req.params.id;

        const training = await Training.findByPk(trainingId);
        if (!training) {
            return res.status(404).json({ message: 'Entrainement non trouvé !' });
        }

        if (categoryId) {
            await TrainingUserStatus.destroy({
                where: { trainingId: req.params.id }
            });

            const rolesId = [1, 2];
            const users = await UserRoleCategory.findAll({
                where: {
                    categoryId: categoryId,
                    roleId: { [Op.in]: rolesId }
                }
            });

            await Promise.all(users.map(user =>
                TrainingUserStatus.create({
                    userId: user.userId,
                    trainingId: req.params.id
                })
            ));
        }

        await training.update({ ...trainingData, categoryId });

        res.status(200).json({ message: 'Entrainement modifié' });
    } catch (error) {
        res.status(400).json({ error: error.message });
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
        res.status(200).json(training);
    } catch (error) {
        res.status(400).json({ error });
    }
};

exports.getTrainingsByCategory = async (req, res, next) => {
    try {
        const categoryName = req.params.name;
        const category = await Category.findOne({ where: { name: categoryName } });
        if (!category) {
            return res.status(404).json({ message: 'Catégorie non trouvée !' });
        }
        const categoryId = category.id;
        const trainings = await Training.findAll({ where: { categoryId } });
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
        res.status(200).json(trainings);
    } catch (error) {
        res.status(400).json({ error });
    }
}

exports.getTrainingStats = async (req, res, next) => {
    try {
        const trainingId = req.params.id;

        const presentCount = await TrainingUserStatus.count({
            where: { trainingId, status: 'present' },
        });

        const absentCount = await TrainingUserStatus.count({
            where: { trainingId, status: 'absent' },
        });

        const notRespondedCount = await TrainingUserStatus.count({
            where: { trainingId, status: 'notResponded' },
        });

        res.status(200).json({
            present: presentCount,
            absent: absentCount,
            notResponded: notRespondedCount,
        });
    } catch (error) {
        res.status(400).json({ error });
    }
};
