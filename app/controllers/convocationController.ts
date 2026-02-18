import redis from '../config/redisClient.js';
import models from '../models/index.js';
import { Op } from 'sequelize';
import { Request, Response } from 'express';

const createConvocation = async (req: Request, res: Response) => {
    const t = await models.sequelize.transaction();
    try {
        const { matchDate, matchHour, convocationHour, location, teamId, userPlayerIds = [] } = req.body;

        if (!matchDate || !matchHour || !convocationHour || !location || !teamId || userPlayerIds.length === 0) {
            await t.rollback();
            return res.status(400).json({
                status: 'error',
                message: 'Tous les champs sont requis.',
            });
        }

        const team = await models.Teams.findByPk(teamId as any);
        if (!team) {
            await t.rollback();
            return res.status(404).json({
                status: 'error',
                message: 'Équipe non trouvée.',
            });
        } else {
            const coachInTeam = await models.UsersCoachTeam.findOne({
                where: {
                    teamId: teamId,
                    userCoachId: (req.auth as any).userId
                }
            });
            if (!coachInTeam) {
                await t.rollback();
                return res.status(403).json({
                    status: 'error',
                    message: 'Vous n’avez pas la permission de créer une convocation pour cette équipe.',
                });
            }
        }

        const players = await models.Users.findAll({
            where: { id: userPlayerIds } as any,
            include: [{ model: models.UserRolesCategories, where: { roleId: 1, categoryId: team.categoryId } as any },],
            transaction: t
        }
        );

        if (players.length !== userPlayerIds.length) {
            await t.rollback();
            return res.status(404).json({
                status: 'error',
                message: 'Au moins un joueur n’a pas été trouvé.',
            });
        }

        const convocation = await models.Convocations.create({
            matchDate,
            matchHour,
            convocationHour,
            location,
            teamId
        }, { transaction: t });

        // @ts-ignore
        if ((convocation as any).addUsers) {
            await (convocation as any).addUsers(players, { transaction: t });
        }
        await redis.del('convocations:{}{}');
        await t.commit();
        return res.status(201).json({
            status: 'success',
            message: 'Convocation créée avec succès.',
            data: {
                convocation: convocation,
                players: players.map(player => ({
                    id: player.id,
                    firstName: player.firstName,
                    lastName: player.lastName,
                }))
            },
        });

    } catch (error) {
        await t.rollback();
        console.error(error);
        return res.status(500).json({
            status: 'error',
            message: 'Une erreur est survenue lors de la création de la convocation.',
        });
    }
};

const updateConvocation = async (req: Request, res: Response) => {
    const t = await models.sequelize.transaction();
    try {
        const id = req.params.id;
        const { matchDate, matchHour, convocationHour, location, userPlayerIds = [] } = req.body; // teamId retiré

        const convocation = await models.Convocations.findByPk(id as any);
        if (!convocation) {
            await t.rollback();
            return res.status(404).json({
                status: 'error',
                message: 'Convocation non trouvée.',
            });
        }

        const coachInTeam = await models.UsersCoachTeam.findOne({
            where: {
                teamId: convocation.teamId,
                userCoachId: (req.auth as any).userId
            }
        });
        if (!coachInTeam) {
            await t.rollback();
            return res.status(403).json({
                status: 'error',
                message: 'Vous n\'avez pas la permission de modifier cette convocation.',
            });
        }

        if (matchDate !== undefined) convocation.matchDate = matchDate;
        if (matchHour !== undefined) convocation.matchHour = matchHour;
        if (convocationHour !== undefined) convocation.convocationHour = convocationHour;
        if (location !== undefined) convocation.location = location;

        const team = await models.Teams.findByPk(convocation.teamId);
        // @ts-ignore
        const teamCategoryId = team?.categoryId;

        let players: any[] = [];
        if (userPlayerIds.length > 0) {
            players = await models.Users.findAll({
                where: { id: userPlayerIds } as any,
                include: [
                    { model: models.UserRolesCategories, where: { roleId: 1, categoryId: teamCategoryId } as any },
                ],
                transaction: t
            });

            if (players.length !== userPlayerIds.length) {
                await t.rollback();
                return res.status(404).json({
                    status: 'error',
                    message: 'Au moins un joueur n\'a pas été trouvé.',
                });
            }

            if ((convocation as any).setUsers) {
                await (convocation as any).setUsers(players, { transaction: t });
            }
        } else {
            players = await (convocation as any).getUsers({ transaction: t });
        }

        await convocation.save({ transaction: t });
        await redis.del('convocations:{}{}');
        await t.commit();
        return res.status(200).json({
            status: 'success',
            message: 'Convocation mise à jour avec succès.',
            data: {
                convocation: convocation,
                players: players.map(player => ({
                    id: player.id,
                    firstName: player.firstName,
                    lastName: player.lastName,
                }))
            },
        });
    } catch (error) {
        await t.rollback();
        return res.status(500).json({
            status: 'error',
            message: 'Une erreur est survenue lors de la mise à jour de la convocation.',
        });
    }
};

const deleteConvocation = async (req: Request, res: Response) => {
    try {
        const id = req.params.id;
        const convocation = await models.Convocations.findByPk(id as any);
        if (!convocation) {
            return res.status(404).json({
                status: 'error',
                message: 'Convocation non trouvée.',
            });
        }

        await convocation.destroy();
        await redis.del('convocations:{}{}');
        return res.status(200).json({
            status: 'success',
            message: 'Convocation supprimée avec succès.',
        });
    } catch (error) {
        return res.status(500).json({
            status: 'error',
            message: 'Une erreur est survenue lors de la suppression de la convocation.',
        });
    }
};

const getAllConvocations = async (req: Request, res: Response) => {
    try {
        let { _category, _date } = req.query as { _category?: any, _date?: string };

        if (_category && !Array.isArray(_category)) {
            _category = [_category];
        }

        const whereCategory: any = {};
        if (_category && _category.length > 0) {
            whereCategory.id = { [Op.in]: _category };
        }

        const whereConvocation: any = {};
        if (_date) {
            whereConvocation.matchDate = { [Op.gte]: new Date(_date) };
        }

        const latestIds = await models.Convocations.findAll({
            attributes: [
                [models.sequelize.fn('MAX', models.sequelize.col('Convocations.id')), 'maxId']
            ],
            where: Object.keys(whereConvocation).length ? whereConvocation : undefined,
            include: [
                {
                    model: models.Teams,
                    attributes: [],
                    where: Object.keys(whereCategory).length ? whereCategory : undefined
                }
            ],
            group: ['Convocations.teamId'],
            raw: true
        });

        const ids = latestIds.map((row: any) => row.maxId);

        if (ids.length === 0) {
            return res.status(404).json({
                status: 'error',
                message: 'Aucune convocation trouvée.',
            });
        }

        const convocations = await models.Convocations.findAll({
            where: { id: { [Op.in]: ids } },
            include: [
                {
                    model: models.Teams,
                    attributes: ['id', 'name'],
                },
                { model: models.Users, attributes: ['id', 'firstName', 'lastName'], through: { attributes: [] } }
            ],
            order: [['matchDate', 'DESC']]
        });

        return res.status(200).json({
            status: 'success',
            message: 'Convocations récupérées avec succès.',
            data: { convocations }
        });
    } catch (error) {
        return res.status(500).json({
            status: 'error',
            message: 'Une erreur est survenue lors de la récupération des convocations.',
        });
    }
};

const getOneConvocation = async (req: Request, res: Response) => {
    try {
        const id = req.params.id;
        const convocation = await models.Convocations.findByPk(id as any, {
            include: [
                { model: models.Teams, attributes: ['id', 'name'] },
                { model: models.Users, attributes: ['id', 'firstName', 'lastName'], through: { attributes: [] } }
            ]
        });

        if (!convocation) {
            return res.status(404).json({
                status: 'error',
                message: 'Convocation non trouvée.',
            });
        }

        return res.status(200).json({
            status: 'success',
            message: 'Convocation récupérée avec succès.',
            data: { convocation }
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({
            status: 'error',
            message: 'Une erreur est survenue lors de la récupération de la convocation.',
        });
    }
};

export default {
    createConvocation,
    updateConvocation,
    deleteConvocation,
    getAllConvocations,
    getOneConvocation,
};
