import { describe, it, expect, beforeEach } from 'vitest';
import request from 'supertest';
import { app } from '../../app.js';
import { getCoachToken, getPlayerToken, getMemberToken } from '../utils/auth.helper.js';
import redis from '../../config/redisClient.js'
import models from '../../models/index.js';

describe('Teams API', () => {
  let authHeaders: { Cookie: string };

  beforeEach(async () => {
      const auth = await getMemberToken();
      authHeaders = auth.headers;
  });

  const createTestTeam = async (overrides = {}) => {
    const coach = await getCoachToken();
    const team = await models.Teams.create({
        name: 'team A',
        division: 'division A',
        categoryId: 1,
        ...overrides
    });
    const coachInTeam = await models.UsersCoachTeam.create({
      userCoachId: coach.user.id,
      teamId: team.id,
      ...overrides
    });
    return { team, coachInTeam };
  };

  it('devrait modifier une team et purger le cache', async () => {
    const { team, coachInTeam } = await createTestTeam();

    const res = await request(app)
      .patch(`/api/v1/teams/${team.id}`)
      .set(authHeaders)
      .send({
        name: 'team A updated',
        division: 'division A updated'
      });

    expect(res.status).toBe(200);
    const teamId = res.body.data.team.id;
    expect(teamId).toBe(team.id);

    const updated = await models.Teams.findByPk(teamId);
    expect(updated).not.toBeNull();
    expect(updated?.name).toBe(res.body.data.team.name);
    expect(updated?.division).toBe(res.body.data.team.division);
    expect(updated?.categoryId).toBe(team.categoryId);

    const coachInTeamUpdated = await models.UsersCoachTeam.findAll({
      where: {
        teamId: teamId,
        userCoachId: coachInTeam.userCoachId
      },
    });
    expect(coachInTeamUpdated).not.toBeNull();
    expect(coachInTeamUpdated?.length).toBe(1);

    expect(redis.del).toHaveBeenCalledWith('teams:{}{}');
  });

  it('devrait modifier une team, lier les coachs et purger le cache', async () => {
    const { team, coachInTeam } = await createTestTeam();
    const coach2 = await getCoachToken();

    const res = await request(app)
      .patch(`/api/v1/teams/${team.id}`)
      .set(authHeaders)
      .send({userCoachIds: [coachInTeam.userCoachId, coach2.user.id]});

    expect(res.status).toBe(200);
    const teamId = res.body.data.team.id;
    expect(teamId).toBe(team.id);

    const updated = await models.Teams.findByPk(teamId);
    expect(updated).not.toBeNull();
    expect(updated?.name).toBe(team.name);
    expect(updated?.division).toBe(team.division);
    expect(updated?.categoryId).toBe(team.categoryId);

    const coachInTeamUpdated = await models.UsersCoachTeam.findAll({
      where: {
        teamId: teamId,
        userCoachId: [coachInTeam.userCoachId, coach2.user.id]
      },
    });
    expect(coachInTeamUpdated.length).toBe(2);

    expect(redis.del).toHaveBeenCalledWith('teams:{}{}');
  });

  it('devrait modifier une team, délier les coachs et purger le cache', async () => {
    const { team, coachInTeam } = await createTestTeam();

    const res = await request(app)
      .patch(`/api/v1/teams/${team.id}`)
      .set(authHeaders)
      .send({categoryId: 2});

    expect(res.status).toBe(200);
    const teamId = res.body.data.team.id;
    expect(teamId).toBe(team.id);

    const updated = await models.Teams.findByPk(teamId);
    expect(updated).not.toBeNull();
    expect(updated?.name).toBe(team.name);
    expect(updated?.division).toBe(team.division);
    expect(updated?.categoryId).toBe(res.body.data.team.categoryId);

    const coachInTeamUpdated = await models.UsersCoachTeam.findAll({
      where: {
        teamId: teamId
      },
    });
    expect(coachInTeamUpdated.length).toBe(0);

    expect(redis.del).toHaveBeenCalledWith('teams:{}{}');
  });

  it('ne devrait pas modifié une team avec un utilisateur non authentifié', async () => {
    const {team} = await createTestTeam();

    const res = await request(app)
      .patch(`/api/v1/teams/${team.id}`)
      .send({name: 'team A updated'});

    if (res.status !== 401) {
      console.error('Response body:', res.body);
    }
    expect(res.status).toBe(401);
    const teamInDb = await models.Teams.findByPk(team.id);
    expect(teamInDb?.name).not.toBe('team A updated');
    expect(teamInDb?.name).toBe(team.name);
  });

  it('ne devrait pas modifié une team avec un utilisateur non autorisé', async () => {
    const {team} = await createTestTeam();

    const playerAuth = await getPlayerToken();

    const res = await request(app)
      .patch(`/api/v1/teams/${team.id}`)
      .set(playerAuth.headers)
      .send({division: 'division A updated'});

    if (res.status !== 403) {
      console.error('Response body:', res.body);
    }
    expect(res.status).toBe(403);
    const teamInDb = await models.Teams.findByPk(team.id);
    expect(teamInDb?.division).not.toBe('division A updated');
    expect(teamInDb?.division).toBe(team.division);
  });

  it('ne devrait pas modifier une team avec un body invalide', async () => {
    const {team} = await createTestTeam();
    
    const res = await request(app)
      .patch(`/api/v1/teams/${team.id}`)
      .set(authHeaders)
      .send({division: ''});

    if (res.status !== 400) {
      console.error('Response body:', res.body);
    }

    expect(res.status).toBe(400);
    const teamInDb = await models.Teams.findByPk(team.id);
    expect(teamInDb?.division).not.toBe('');
    expect(teamInDb?.division).toBe(team.division);
  });

  it('ne devrait pas modifier une team avec une category inexistante', async () => {
    const {team} = await createTestTeam();

    const res = await request(app)
      .patch(`/api/v1/teams/${team.id}`)
      .set(authHeaders)
      .send({categoryId: 9999});

    if (res.status !== 404) {
      console.error('Response body:', res.body);
    }

    expect(res.status).toBe(404);
    const teamInDb = await models.Teams.findByPk(team.id);
    expect(teamInDb?.categoryId).toBe(team.categoryId);
  });

  it('ne devrait pas modifier une team inexistante', async () => {
    const teamId = 9999;
    
    const res = await request(app)
      .patch(`/api/v1/teams/${teamId}`)
      .set(authHeaders)
      .send({division: 'division A updated'});

    if (res.status !== 404) {
      console.error('Response body:', res.body);
    }

    expect(res.status).toBe(404);
  });
});