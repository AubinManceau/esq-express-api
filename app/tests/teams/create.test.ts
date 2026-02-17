import { describe, it, expect, beforeEach } from 'vitest';
import request from 'supertest';
import { app } from '../../app.js';
import { getMemberToken, getCoachToken } from '../utils/auth.helper.js';
import redis from '../../config/redisClient.js'
import models from '../../models/index.js';

describe('Teams API', () => {
  let authHeaders: { Cookie: string };

  beforeEach(async () => {
    const auth = await getMemberToken();
    authHeaders = auth.headers;
  });

  it('devrait créer une team, lier les coach et purger le cache', async () => {
    const coach = await getCoachToken();

    const payload = {
      name: 'team A',
      division: 'Division 1',
      categoryId: 1,
      userCoachIds: [coach.user.id],
    };

    const res = await request(app)
      .post('/api/v1/teams/create')
      .set(authHeaders)
      .send(payload);

    expect(res.status).toBe(201);
    const teamId = res.body.data.team.id;
    expect(teamId).toBeDefined();

    const teamInDb = await models.Teams.findByPk(teamId);
    expect(teamInDb).not.toBeNull();
    expect(teamInDb?.name).toBe(payload.name);
    expect(teamInDb?.division).toBe(payload.division);
    expect(teamInDb?.categoryId).toBe(payload.categoryId);

    const coachInTeam = await models.UsersCoachTeam.findOne({
      where: {
        userCoachId: coach.user.id,
        teamId: teamId,
      },
    });
    expect(coachInTeam).not.toBeNull();

    expect(redis.del).toHaveBeenCalledWith('teams:{}{}');
  });

  it('ne devrait pas créer une team avec un utilisateur non authentifié', async () => {
    const initialCount = await models.Teams.count();
    const coach = await getCoachToken();

    const res = await request(app)
      .post('/api/v1/teams/create')
      .send({
        name: 'team B',
        division: 'Division 2',
        categoryId: 1,
        userCoachIds: [coach.user.id],
      });

    if (res.status !== 401) {
      console.error('Response body:', res.body);
    }
    const finalCount = await models.Teams.count();
    expect(res.status).toBe(401);
    expect(finalCount).toBe(initialCount);
  });

  it('ne devrait pas créer une team avec un body incomplet', async () => {
    const initialCount = await models.Teams.count();
    const coach = await getCoachToken();

    const res = await request(app)
      .post('/api/v1/teams/create')
      .set(authHeaders)
      .send({
        name: 'team C',
        division: 'Division 3',
        userCoachIds: [coach.user.id],
      });

    if (res.status !== 400) {
      console.error('Response body:', res.body);
    }

    const finalCount = await models.Teams.count();
    expect(res.status).toBe(400);
    expect(finalCount).toBe(initialCount);
  });

  it('ne devrait pas créer une team avec un body invalide', async () => {
    const initialCount = await models.Teams.count();

    const res = await request(app)
      .post('/api/v1/teams/create')
      .set(authHeaders)
      .send({
        name: '',
        division: '',
        categoryId: 'invalid',
        userCoachIds: 'not-an-array',
      });

    if (res.status !== 400) {
      console.error('Response body:', res.body);
    }

    const finalCount = await models.Teams.count();
    expect(res.status).toBe(400);
    expect(finalCount).toBe(initialCount);
  });

  it('ne devrait pas créer une team avec une category inexistante', async () => {
    const initialCount = await models.Teams.count();
    const coach = await getCoachToken();

    const res = await request(app)
      .post('/api/v1/teams/create')
      .set(authHeaders)
      .send({
        name: 'team D',
        division: 'Division 4',
        categoryId: 9999,
        userCoachIds: [coach.user.id],
      });

    if (res.status !== 404) {
      console.error('Response body:', res.body);
    }

    const finalCount = await models.Teams.count();
    expect(res.status).toBe(404);
    expect(finalCount).toBe(initialCount);
  });

  it('ne devrait pas créer une team avec un user non coach', async () => {
    const initialCount = await models.Teams.count();
    const nonCoach = await getMemberToken();

    const res = await request(app)
      .post('/api/v1/teams/create')
      .set(authHeaders)
      .send({
        name: 'team D',
        division: 'Division 4',
        categoryId: 1,
        userCoachIds: [nonCoach.user.id],
      });

    if (res.status !== 404) {
      console.error('Response body:', res.body);
    }

    const finalCount = await models.Teams.count();
    expect(res.status).toBe(404);
    expect(finalCount).toBe(initialCount);
  });

  it('ne devrait pas créer une team avec un coach pas de la catégorie', async () => {
    const initialCount = await models.Teams.count();
    const coach = await getCoachToken();

    const res = await request(app)
      .post('/api/v1/teams/create')
      .set(authHeaders)
      .send({
        name: 'team D',
        division: 'Division 4',
        categoryId: 2,
        userCoachIds: [coach.user.id],
      });

    if (res.status !== 404) {
      console.error('Response body:', res.body);
    }

    const finalCount = await models.Teams.count();
    expect(res.status).toBe(404);
    expect(finalCount).toBe(initialCount);
  });
});