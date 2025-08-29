import models from '../models/index.js';

const createConvocation = async (req, res) => {
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

        const team = await models.Teams.findByPk(teamId); 
        if (!team) { 
            await t.rollback(); 
            return res.status(404).json({ 
                status: 'error',
                message: 'Équipe non trouvée.', 
            });
        }

        const players = await models.Users.findAll({ 
            where: { id: userPlayerIds }, 
            include: [ { model: models.UserRolesCategories, where: { roleId: 1, categoryId: team.categoryId } }, ],
            transaction: t }
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

        await convocation.addUsers(players, { transaction: t });
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

const updateConvocation = async (req, res) => {
    const t = await models.sequelize.transaction();
    try {
        const id = req.params.id;
        const { matchDate, matchHour, convocationHour, location, teamId, userPlayerIds = [] } = req.body;

        const convocation = await models.Convocations.findByPk(id);
        if (!convocation) {
            await t.rollback();
            return res.status(404).json({
                status: 'error',
                message: 'Convocation non trouvée.',
            });
        }

        if (matchDate !== undefined) convocation.matchDate = matchDate;
        if (matchHour !== undefined) convocation.matchHour = matchHour;
        if (convocationHour !== undefined) convocation.convocationHour = convocationHour;
        if (location !== undefined) convocation.location = location;
        let team = null;
        if (teamId !== undefined) {
            team = await models.Teams.findByPk(teamId);
            if (!team) {
                await t.rollback();
                return res.status(404).json({
                    status: 'error',
                    message: 'Équipe non trouvée.',
                });
            }
            convocation.teamId = teamId;
        } else {
            team = await models.Teams.findByPk(convocation.teamId);
        }

        let players = [];
        if (userPlayerIds.length > 0) {
            players = await models.Users.findAll({
                where: { id: userPlayerIds },
                include: [
                    { model: models.UserRolesCategories, where: { roleId: 1, categoryId: team.categoryId } },
                ],
                transaction: t
            });

            if (players.length !== userPlayerIds.length) {
                await t.rollback();
                return res.status(404).json({
                    status: 'error',
                    message: 'Au moins un joueur n’a pas été trouvé.',
                });
            }
            await convocation.setUsers(players, { transaction: t });
        }

        await convocation.save({ transaction: t });
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

const deleteConvocation = async (req, res) => {
    try {
        const id = req.params.id;
        const convocation = await models.Convocations.findByPk(id);
        if (!convocation) {
            return res.status(404).json({
                status: 'error',
                message: 'Convocation non trouvée.',
            });
        }

        await convocation.destroy();
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

const getAllConvocations = async (req, res) => {
    try {
        const convocations = await models.Convocations.findAll({
            include: [
                { model: models.Teams, attributes: ['id', 'name'] },
                { model: models.Users, attributes: ['id', 'firstName', 'lastName'], through: { attributes: [] } }
            ]
        });

        if (convocations.length === 0) {
            return res.status(404).json({
                status: 'error',
                message: 'Aucune convocation trouvée.',
            });
        }

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

const getOneConvocation = async (req, res) => {
    try {
        const id = req.params.id;
        const convocation = await models.Convocations.findByPk(id, {
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

const getConvocationsByCategory = async (req, res) => {
    try {
        const userRoles = req.auth.roles;
        if (!userRoles || userRoles.length === 0) {
            return res.status(403).json({
                status: 'error',
                message: 'Rôle non autorisé.',
            });
        }
        const userCategories = userRoles
            .map(role => role.categoryId)
            .filter(categoryId => categoryId !== null && categoryId !== undefined);

        if (userCategories.length === 0) {
            return res.status(403).json({
                status: 'error',
                message: 'Aucune catégorie associée à vos rôles.',
            });
        }

        const teams = await models.Teams.findAll({
            where: { categoryId: userCategories },
        });

        const convocations = await models.Convocations.findAll({
            where: { teamId: teams.map(team => team.id) },
            include: [
                { model: models.Teams, attributes: ['id', 'name'] },
                { model: models.Users, attributes: ['id', 'firstName', 'lastName'], through: { attributes: [] } }
            ]
        });

        if (convocations.length === 0) {
            return res.status(404).json({
                status: 'error',
                message: 'Aucune convocation trouvée pour vos catégories.',
            });
        }

        return res.status(200).json({
            status: 'success',
            message: 'Convocations récupérées avec succès.',
            data: { convocations }
        });
    } catch (error) {
        return res.status(500).json({
            status: 'error',
            message: 'Une erreur est survenue lors de la récupération des convocations par catégorie.',
        });
    }
};

export default {
    createConvocation,
    updateConvocation,
    deleteConvocation,
    getAllConvocations,
    getOneConvocation,
    getConvocationsByCategory
};
