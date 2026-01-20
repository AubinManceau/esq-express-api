import models from '../models/index.js';
import redis from '../config/redisClient.js';
import { Op } from 'sequelize';
import { Request, Response } from 'express';

const createTeam = async (req: Request, res: Response) => {
    const t = await models.sequelize.transaction();
    try {
        const { name, division, categoryId, userCoachIds = [] } = req.body;

        if (!name || !division || !categoryId || userCoachIds.length === 0) {
            await t.rollback();
            return res.status(400).json({
                status: 'error',
                message: 'Le nom, la division, la catégorie et le coach sont requis pour créer une équipe.',
            });
        }

        const category = await models.Categories.findByPk(categoryId as any);
        if (!category) {
            await t.rollback();
            return res.status(404).json({
                status: 'error',
                message: 'Catégorie non trouvée.',
            });
        }

        const coaches = await models.Users.findAll({
            where: { id: userCoachIds } as any,
            include: [
                { model: models.UserRolesCategories, where: { roleId: 2, categoryId: categoryId } as any },
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

        const team = await models.Teams.create({ name, division, categoryId }, { transaction: t });

        // @ts-ignore
        if ((team as any).addUsers) {
            await (team as any).addUsers(coaches, { transaction: t });
        }
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

const updateTeam = async (req: Request, res: Response) => {
    const t = await models.sequelize.transaction();
    try {
        const id = req.params.id;
        const { name, division, categoryId, userCoachIds = [] } = req.body;

        const team = await models.Teams.findByPk(id as any);
        if (!team) {
            await t.rollback();
            return res.status(404).json({
                status: 'error',
                message: 'Équipe non trouvée.',
            });
        }

        let teamCategoryId = categoryId;
        if (name !== undefined) team.name = name;
        if (division !== undefined) team.division = division;
        if (teamCategoryId !== undefined) {
            const category = await models.Categories.findByPk(teamCategoryId as any);
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

        let coaches: any[] = [];
        if (userCoachIds.length > 0) {
            coaches = await models.Users.findAll({
                where: { id: userCoachIds } as any,
                include: [
                    { model: models.UserRolesCategories, where: { roleId: 2, categoryId: teamCategoryId } as any },
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
            // @ts-ignore
            if ((team as any).setUsers) {
                await (team as any).setUsers(coaches, { transaction: t });
            }
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

const deleteTeam = async (req: Request, res: Response) => {
    try {
        const id = req.params.id;
        const team = await models.Teams.findByPk(id as any);
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

const getAllTeams = async (req: Request, res: Response) => {
    try {
        let { _category } = req.query as { _category?: any };

        if (_category && !Array.isArray(_category)) {
            _category = [_category];
        }

        const whereCategory: any = {};
        if (_category && _category.length > 0) {
            whereCategory.id = { [Op.in]: _category };
        }

        const categories = await models.Categories.findAll({
            where: Object.keys(whereCategory).length ? whereCategory : undefined,
            attributes: ['id', 'name'],
            include: [
                {
                    model: models.Teams,
                    required: false,
                    attributes: ['id', 'name', 'division'],
                    include: [
                        {
                            model: models.Users,
                            attributes: ['id', 'firstName', 'lastName', 'email', 'phone'],
                            through: { attributes: [] },
                        }
                    ]
                }
            ]
        });

        if (categories.length === 0) {
            return res.status(404).json({
                status: 'error',
                message: 'Aucune catégorie trouvée.',
            });
        }

        return res.status(200).json({
            status: 'success',
            message: 'Équipes récupérées avec succès par catégorie.',
            data: categories
        });
    } catch (error) {
        return res.status(500).json({
            status: 'error',
            message: 'Une erreur est survenue lors de la récupération des équipes.',
        });
    }
};

const getOneTeam = async (req: Request, res: Response) => {
    try {
        const id = req.params.id;
        const team = await models.Teams.findByPk(id as any, {
            include: [
                { model: models.Categories, attributes: ['id', 'name', 'division'] },
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
