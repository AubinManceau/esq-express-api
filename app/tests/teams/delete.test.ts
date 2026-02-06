import { describe, it, expect, beforeAll } from 'vitest';
import request from 'supertest';
import { app } from '../../app.js';
import { getCoachToken, getMemberToken } from '../utils/auth.helper.js';
import redis from '../../config/redisClient.js'
import models from '../../models/index.js';

describe('Teams API', () => {
  let authHeaders: { Cookie: string };

  beforeAll(async () => {
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

  it('devrait supprimer une team et purger le cache', async () => {
    const { team } = await createTestTeam();

    const res = await request(app)
      .delete(`/api/v1/teams/${team.id}`)
      .set(authHeaders)

    expect(res.status).toBe(200);

    const updated = await models.Teams.findByPk(team.id);
    expect(updated).toBeNull();

    const links = await models.UsersCoachTeam.findAll({
        where: { teamId: team.id }
    });
    expect(links.length).toBe(0);

    expect(redis.del).toHaveBeenCalledWith('teams:{}{}');
  });

  it('ne devrait pas supprimer une team avec un utilisateur non authentifié', async () => {
    const { team } = await createTestTeam();

    const res = await request(app)
      .delete(`/api/v1/teams/${team.id}`)

    if (res.status !== 401) {
      console.error('Response body:', res.body);
    }
    expect(res.status).toBe(401);
    const teamInDb = await models.Teams.findByPk(team.id);
    expect(teamInDb).not.toBeNull();
  });

  it('ne devrait pas supprimer une team avec un utilisateur non autorisé', async () => {
    const { team } = await createTestTeam();

    const coachAuth = await getCoachToken();

    const res = await request(app)
      .delete(`/api/v1/teams/${team.id}`)
      .set(coachAuth.headers)

    if (res.status !== 403) {
      console.error('Response body:', res.body);
    }
    expect(res.status).toBe(403);
    const teamInDb = await models.Teams.findByPk(team.id);
    expect(teamInDb).not.toBeNull();
  });

  it('ne devrait pas supprimer une team inexistante', async () => {
    const teamId = 9999;
    
    const res = await request(app)
      .delete(`/api/v1/teams/${teamId}`)
      .set(authHeaders)

    if (res.status !== 404) {
      console.error('Response body:', res.body);
    }

    expect(res.status).toBe(404);
  });
});