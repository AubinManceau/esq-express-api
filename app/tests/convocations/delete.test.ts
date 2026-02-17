import { describe, it, expect, beforeEach } from 'vitest';
import request from 'supertest';
import { app } from '../../app.js';
import { getCoachToken, getPlayerToken } from '../utils/auth.helper.js';
import redis from '../../config/redisClient.js'
import models from '../../models/index.js';

describe('Teams API', () => {
  let authHeaders: { Cookie: string };
  let coach: { user: any };

  beforeEach(async () => {
    const auth = await getCoachToken();
    authHeaders = auth.headers;
    coach = auth;
  });

  const createTestTeam = async (overrides = {}) => {
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

  const createTestConvocation = async (teamId: number, overrides = {}) => {
    const player = await getPlayerToken();
    const convocation = await models.Convocations.create({
        matchDate: '2024-07-01',
        matchHour: '15:00:00',
        convocationHour: '14:00:00',
        location: 'Stade Municipal',
        teamId,
        ...overrides
    });
    
    await models.UsersConvocation.create({
        userId: player.user.id,
        convocationId: convocation.id
    });
    return convocation;
  }

  it('devrait supprimer une convocation et purger le cache', async () => {
    const { team } = await createTestTeam();
    const convocation = await createTestConvocation(team.id);

    const res = await request(app)
      .delete(`/api/v1/convocations/${convocation.id}`)
      .set(authHeaders)

    expect(res.status).toBe(200);

    const updated = await models.Convocations.findByPk(convocation.id);
    expect(updated).toBeNull();

    const links = await models.UsersConvocation.findAll({
        where: { convocationId: convocation.id }
    });
    expect(links.length).toBe(0);

    expect(redis.del).toHaveBeenCalledWith('convocations:{}{}');
  });

  it('ne devrait pas supprimer une convocation avec un utilisateur non authentifié', async () => {
    const { team } = await createTestTeam();
    const convocation = await createTestConvocation(team.id);

    const res = await request(app)
      .delete(`/api/v1/convocations/${convocation.id}`)

    if (res.status !== 401) {
      console.error('Response body:', res.body);
    }
    expect(res.status).toBe(401);
    const convocationInDb = await models.Convocations.findByPk(convocation.id);
    expect(convocationInDb).not.toBeNull();
  });

  it('ne devrait pas supprimer une convocation avec un utilisateur non autorisé', async () => {
    const { team } = await createTestTeam();
    const convocation = await createTestConvocation(team.id);

    const playerAuth = await getPlayerToken();

    const res = await request(app)
      .delete(`/api/v1/convocations/${convocation.id}`)
      .set(playerAuth.headers)
    
    if (res.status !== 403) {
      console.error('Response body:', res.body);
    }
    expect(res.status).toBe(403);
    const convocationInDb = await models.Convocations.findByPk(convocation.id);
    expect(convocationInDb).not.toBeNull();
  });

  it('ne devrait pas supprimer une convocation inexistante', async () => {
    const convocationId = 9999;
    
    const res = await request(app)
      .delete(`/api/v1/convocations/${convocationId}`)
      .set(authHeaders)

    if (res.status !== 404) {
      console.error('Response body:', res.body);
    }

    expect(res.status).toBe(404);
  });
});