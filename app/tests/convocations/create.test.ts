import { describe, it, expect, beforeEach } from 'vitest';
import request from 'supertest';
import { app } from '../../app.js';
import { getMemberToken, getCoachToken, getPlayerToken } from '../utils/auth.helper.js';
import redis from '../../config/redisClient.js'
import models from '../../models/index.js';

describe('Convocations API', () => {
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

  it('devrait créer une convocation, lier les joueurs et purger le cache', async () => {
    const { team } = await createTestTeam();
    const player = await getPlayerToken();

    const payload = {
      matchDate: '2024-07-01',
      matchHour: '15:00:00',
      convocationHour: '14:00:00',
      location: 'Stade Municipal',
      teamId: team.id,
      userPlayerIds: [player.user.id],
    };

    const res = await request(app)
      .post('/api/v1/convocations/create')
      .set(authHeaders)
      .send(payload);

    expect(res.status).toBe(201);
    const convocationId = res.body.data.convocation.id;
    expect(convocationId).toBeDefined();

    const convocationInDb = await models.Convocations.findByPk(convocationId);
    expect(convocationInDb).not.toBeNull();
    expect(convocationInDb?.matchDate).toBe(payload.matchDate);
    expect(convocationInDb?.matchHour).toBe(payload.matchHour);
    expect(convocationInDb?.convocationHour).toBe(payload.convocationHour);
    expect(convocationInDb?.location).toBe(payload.location);
    expect(convocationInDb?.teamId).toBe(payload.teamId);

    const playerInConvocation = res.body.data.players.find((p: any) => p.id === player.user.id);
    expect(playerInConvocation).toBeDefined();
    expect(playerInConvocation.firstName).toBe(player.user.firstName);
    expect(playerInConvocation.lastName).toBe(player.user.lastName);

    const playerConvocation = await models.UsersConvocation.findOne({
      where: {
        userId: player.user.id,
        convocationId: convocationId,
      } as any,
    });
    expect(playerConvocation).not.toBeNull();

    expect(redis.del).toHaveBeenCalledWith('convocations:{}{}');
  });

  it('ne devrait pas créer une convocation avec un utilisateur non authentifié', async () => {
    const initialCount = await models.Convocations.count();
    const { team } = await createTestTeam();
    const player = await getPlayerToken();

    const res = await request(app)
      .post('/api/v1/convocations/create')
      .send({
        matchDate: '2024-07-01',
        matchHour: '15:00:00',
        convocationHour: '14:00:00',
        location: 'Stade Municipal',
        teamId: team.id,
        userPlayerIds: [player.user.id],
      });

    if (res.status !== 401) {
      console.error('Response body:', res.body);
    }
    const finalCount = await models.Convocations.count();
    expect(res.status).toBe(401);
    expect(finalCount).toBe(initialCount);
  });

  it('ne devrait pas créer une convocation avec un utilisateur non autorisé', async () => {
    const initialCount = await models.Convocations.count();
    const { team } = await createTestTeam();
    const player = await getPlayerToken();
    const member = await getMemberToken();

    const res = await request(app)
      .post('/api/v1/convocations/create')
      .set(member.headers)
      .send({
        matchDate: '2024-07-01',
        matchHour: '15:00:00',
        convocationHour: '14:00:00',
        location: 'Stade Municipal',
        teamId: team.id,
        userPlayerIds: [player.user.id],
      });

    if (res.status !== 403) {
      console.error('Response body:', res.body);
    }
    const finalCount = await models.Convocations.count();
    expect(res.status).toBe(403);
    expect(finalCount).toBe(initialCount);
  });

  it('ne devrait pas créer une convocation avec un body incomplet', async () => {
    const initialCount = await models.Convocations.count();
    const { team } = await createTestTeam();
    const player = await getPlayerToken();

    const res = await request(app)
      .post('/api/v1/convocations/create')
      .set(authHeaders)
      .send({
        teamId: team.id,
        userPlayerIds: [player.user.id],
      });

    if (res.status !== 400) {
      console.error('Response body:', res.body);
    }

    const finalCount = await models.Convocations.count();
    expect(res.status).toBe(400);
    expect(finalCount).toBe(initialCount);
  });

  it('ne devrait pas créer une convocation avec un body invalide', async () => {
    const initialCount = await models.Convocations.count();
    const { team } = await createTestTeam();
    const player = await getPlayerToken();

    const res = await request(app)
      .post('/api/v1/convocations/create')
      .set(authHeaders)
      .send({
        matchDate: '',
        matchHour: '',
        convocationHour: '',
        location: '',
        teamId: team.id,
        userPlayerIds: [player.user.id],
      });

    if (res.status !== 400) {
      console.error('Response body:', res.body);
    }

    const finalCount = await models.Convocations.count();
    expect(res.status).toBe(400);
    expect(finalCount).toBe(initialCount);
  });

  it('ne devrait pas créer une convocation avec une team inexistante', async () => {
    const initialCount = await models.Convocations.count();
    const player = await getPlayerToken();

    const res = await request(app)
      .post('/api/v1/convocations/create')
      .set(authHeaders)
      .send({
        matchDate: '2024-07-01',
        matchHour: '15:00:00',
        convocationHour: '14:00:00',
        location: 'Stade Municipal',
        teamId: 9999,
        userPlayerIds: [player.user.id],
      });

    if (res.status !== 404) {
      console.error('Response body:', res.body);
    }

    const finalCount = await models.Convocations.count();
    expect(res.status).toBe(404);
    expect(finalCount).toBe(initialCount);
  });

  it('ne devrait pas créer une convocation par un joueur non coach de la team', async () => {
    const initialCount = await models.Convocations.count();
    const coach = await getCoachToken({ categoryId: 2 });
    const { team } = await createTestTeam();
    const player = await getPlayerToken();

    const res = await request(app)
      .post('/api/v1/convocations/create')
      .set(coach.headers)
      .send({
        matchDate: '2024-07-01',
        matchHour: '15:00:00',
        convocationHour: '14:00:00',
        location: 'Stade Municipal',
        teamId: team.id,
        userPlayerIds: [player.user.id],
      });

    if (res.status !== 403) {
      console.error('Response body:', res.body);
    }

    const finalCount = await models.Convocations.count();
    expect(res.status).toBe(403);
    expect(finalCount).toBe(initialCount);
  });

  it('ne devrait pas créer une convocation sans joueurs', async () => {
    const initialCount = await models.Convocations.count();
    const { team } = await createTestTeam();

    const res = await request(app)
      .post('/api/v1/convocations/create')
      .set(authHeaders)
      .send({
        matchDate: '2024-07-01',
        matchHour: '15:00:00',
        convocationHour: '14:00:00',
        location: 'Stade Municipal',
        teamId: team.id,
        userPlayerIds: [],
      });

    if (res.status !== 400) {
      console.error('Response body:', res.body);
    }

    const finalCount = await models.Convocations.count();
    expect(res.status).toBe(400);
    expect(finalCount).toBe(initialCount);
  });

  it('ne devrait pas créer une convocation avec des joueurs non associés à la category de la team', async () => {
    const initialCount = await models.Convocations.count();
    const { team } = await createTestTeam();
    const player = await getPlayerToken({ categoryId: 2 });

    const res = await request(app)
      .post('/api/v1/convocations/create')
      .set(authHeaders)
      .send({
        matchDate: '2024-07-01',
        matchHour: '15:00:00',
        convocationHour: '14:00:00',
        location: 'Stade Municipal',
        teamId: team.id,
        userPlayerIds: [player.user.id],
      });

    if (res.status !== 404) {
      console.error('Response body:', res.body);
    }

    const finalCount = await models.Convocations.count();
    expect(res.status).toBe(404);
    expect(finalCount).toBe(initialCount);
  });
});