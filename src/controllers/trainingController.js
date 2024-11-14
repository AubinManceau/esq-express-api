const Training = require('../models/Training');
const Category = require('../models/Category');
const { Op } = require('sequelize');
const UserRoleCategory = require('../models/UserRoleCategory');
const TrainingUserStatus = require('../models/TrainingUserStatus');

// Création d'un entraînement  
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

// Mise à jour d'un entraînement
exports.updateTraining = async (req, res, next) => {
    try {
        const { categoryId } = req.body;

        // Mettez à jour l'entraînement
        const [updated] = await Training.update(req.body, { where: { id: req.params.id } });

        if (updated === 0) {
            return res.status(404).json({ message: 'Entrainement non trouvé !' });
        }

        // Si categoryId a été modifié, supprimez les anciennes lignes de TrainingUserStatus et recréez-les
        if (categoryId) {
            // Supprimer toutes les entrées existantes dans TrainingUserStatus pour cet entraînement
            await TrainingUserStatus.destroy({
                where: { trainingId: req.params.id }
            });

            // Récupérer les utilisateurs associés à la nouvelle catégorie
            const users = await UserRoleCategory.findAll({
                where: {
                    categoryId: categoryId,
                    roleId: { [Op.in]: [1, 2] } // Récupérer les utilisateurs avec les rôles spécifiques
                }
            });

            // Recréer les entrées dans TrainingUserStatus pour les utilisateurs associés
            await Promise.all(users.map(user =>
                TrainingUserStatus.create({
                    userId: user.userId,
                    trainingId: req.params.id // Utilisez l'ID de l'entraînement mis à jour
                })
            ));
        }

        res.status(200).json({ message: 'Entrainement modifié et statuts d\'utilisateurs mis à jour !' });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

// Suppression d'un entraînement
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

// Récupération de tous les entraînements
exports.getAllTrainings = async (req, res, next) => {
    try {
        const trainings = await Training.findAll();
        res.status(200).json(trainings);
    } catch (error) {
        res.status(400).json({ error });
    }
};

// Récupération d'un entraînement par son id
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
