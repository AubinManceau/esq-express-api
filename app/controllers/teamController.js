import models from '../models/index.js';
import redis from '../config/redisClient.js';
import { Op } from 'sequelize';

const createTeam = async (req, res) => {
    const t = await models.sequelize.transaction();
    try {
        const { name, categoryId, userCoachIds = [] } = req.body;

        if (!name || !categoryId || userCoachIds.length === 0) {
            await t.rollback();
            return res.status(400).json({
                status: 'error',
                message: 'Le nom, la catégorie et le coach sont requis pour créer une équipe.',
            });
        }

        const category = await models.Categories.findByPk(categoryId);
        if (!category) {
            await t.rollback();
            return res.status(404).json({
                status: 'error',
                message: 'Catégorie non trouvée.',
            });
        }

        const coaches = await models.Users.findAll({
            where: { id: userCoachIds },
            include: [
                { model: models.UserRolesCategories, where: { roleId: 2, categoryId: categoryId } },
            ],
            transaction: t
        });

        if (coaches.length !== userCoachIds.length) {
            await t.rollback();
            return res.status(404).json({
                status: 'error',
                message: 'Au moins un coach n’a pas été trouvé.',
            });
        }

        const team = await models.Teams.create({ name, categoryId }, { transaction: t });
        await team.addUsers(coaches, { transaction: t });
        await redis.del('teams:{}{}');
        await t.commit();
        return res.status(201).json({
            status: 'success',
            message: 'Équipe créée avec succès.',
            data: { 
                team: team,
                coaches: coaches.map(coach => ({
                    id: coach.id,
                    firstName: coach.firstName,
                    lastName: coach.lastName,
                    email: coach.email,
                    phone: coach.phone
                }))
            },
        });

    } catch (error) {
        await t.rollback();
        console.error(error);
        return res.status(500).json({
            status: 'error',
            message: 'Une erreur est survenue lors de la création de l\'équipe.',
        });
    }
};

const updateTeam = async (req, res) => {
    const t = await models.sequelize.transaction();
    try {
        const id = req.params.id;
        const { name, categoryId, userCoachIds = [] } = req.body;

        const team = await models.Teams.findByPk(id);
        if (!team) {
            await t.rollback();
            return res.status(404).json({
                status: 'error',
                message: 'Équipe non trouvée.',
            });
        }

        let teamCategoryId = categoryId;
        if (name !== undefined) team.name = name;
        if (teamCategoryId !== undefined) {
            const category = await models.Categories.findByPk(teamCategoryId);
            if (!category) {
                await t.rollback();
                return res.status(404).json({
                    status: 'error',
                    message: 'Catégorie non trouvée.',
                });
            }
            team.categoryId = categoryId;
        } else {
            teamCategoryId = team.categoryId;
        }
        
        let coaches = [];
        if (userCoachIds.length > 0) {
            coaches = await models.Users.findAll({
                where: { id: userCoachIds },
                include: [
                    { model: models.UserRolesCategories, where: { roleId: 2, categoryId: teamCategoryId } },
                ],
                transaction: t
            });

            if (coaches.length !== userCoachIds.length) {
                await t.rollback();
                return res.status(404).json({
                    status: 'error',
                    message: 'Au moins un coach n’a pas été trouvé.',
                });
            }
            await team.setUsers(coaches, { transaction: t });
        }
        
        await team.save({ transaction: t });
        await redis.del('teams:{}{}');
        await t.commit();
        return res.status(200).json({
            status: 'success',
            message: 'Équipe mise à jour avec succès.',
            data: { 
                team: team,
                coaches: coaches.map(coach => ({
                    id: coach.id,
                    firstName: coach.firstName,
                    lastName: coach.lastName,
                    email: coach.email,
                    phone: coach.phone
                }))
            },
        });
    } catch (error) {
        await t.rollback();
        return res.status(500).json({
            status: 'error',
            message: 'Une erreur est survenue lors de la mise à jour de l\'équipe.',
        });
    }
};

const deleteTeam = async (req, res) => {
    try {
        const id = req.params.id;
        const team = await models.Teams.findByPk(id);
        if (!team) {
            return res.status(404).json({
                status: 'error',
                message: 'Équipe non trouvée.',
            });
        }

        await redis.del('teams:{}{}');
        await team.destroy();
        return res.status(200).json({
            status: 'success',
            message: 'Équipe supprimée avec succès.',
        });
    } catch (error) {
        return res.status(500).json({
            status: 'error',
            message: 'Une erreur est survenue lors de la suppression de l\'équipe.',
        });
    }
};

const getAllTeams = async (req, res) => {
    try {
        let { _category } = req.query;

        if (_category && !Array.isArray(_category)) {
            _category = [_category];
        }

        const whereCategory = {};
        if (_category && _category.length > 0) {
            whereCategory.id = { [Op.in]: _category };
        }

        const teams = await models.Teams.findAll({
            include: [
                { 
                    model: models.Categories, 
                    attributes: ['id', 'name'],
                    where: Object.keys(whereCategory).length ? whereCategory : undefined
                },
                { 
                    model: models.Users,
                    attributes: ['id', 'firstName', 'lastName', 'email', 'phone'],
                    through: { attributes: [] }
                }
            ]
        });

        if (teams.length === 0) {
            return res.status(404).json({
                status: 'error',
                message: 'Aucune équipe trouvée.',
            });
        }

        return res.status(200).json({
            status: 'success',
            message: 'Équipes récupérées avec succès.',
            data: { teams }
        });
    } catch (error) {
        return res.status(500).json({
            status: 'error',
            message: 'Une erreur est survenue lors de la récupération des équipes.',
        });
    }
};

const getOneTeam = async (req, res) => {
    try {
        const id = req.params.id;
        const team = await models.Teams.findByPk(id, {
            include: [
                { model: models.Categories, attributes: ['id', 'name'] },
                { model: models.Users, attributes: ['id', 'firstName', 'lastName', 'email', 'phone'], through: { attributes: [] } }
            ]
        });

        if (!team) {
            return res.status(404).json({
                status: 'error',
                message: 'Équipe non trouvée.',
            });
        }

        return res.status(200).json({
            status: 'success',
            message: 'Équipe récupérée avec succès.',
            data: { team }
        });
    } catch (error) {
        return res.status(500).json({
            status: 'error',
            message: 'Une erreur est survenue lors de la récupération de l\'équipe.',
        });
    }
};

export default {
    createTeam,
    updateTeam,
    deleteTeam,
    getAllTeams,
    getOneTeam,
};
