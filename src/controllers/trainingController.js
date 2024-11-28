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
        const { categoryId } = req.body;

        const [updated] = await Training.update(req.body, { where: { id: req.params.id } });

        if (updated === 0) {
            return res.status(404).json({ message: 'Entrainement non trouvé !' });
        }

        if (categoryId) {
            await TrainingUserStatus.destroy({
                where: { trainingId: req.params.id }
            });

            const users = await UserRoleCategory.findAll({
                where: {
                    categoryId: categoryId,
                    roleId: { [Op.in]: [1, 2] }
                }
            });

            await Promise.all(users.map(user =>
                TrainingUserStatus.create({
                    userId: user.userId,
                    trainingId: req.params.id
                })
            ));
        }

        res.status(200).json({ message: 'Entrainement modifié et statuts d\'utilisateurs mis à jour !' });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

exports.deleteTraining = async (req, res, next) => {
    try {
        const deleted = await Training.destroy({ where: { id: req.params.id } });
        if (deleted === 0) {
            return res.status(404).json({ message: 'Entrainement non trouvé !' });
        }
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
        const training = await Training.findByPk(req.params.id);
        if (!training) {
            return res.status(404).json({ message: 'Entrainement non trouvé !' });
        }
        res.status(200).json(training);
    } catch (error) {
        res.status(400).json({ error });
    }
};
