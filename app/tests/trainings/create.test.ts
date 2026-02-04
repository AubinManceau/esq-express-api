import { describe, it, expect, beforeAll } from 'vitest';
import request from 'supertest';
import { app } from '../../app.js';
import { getAuthToken } from '../utils/auth.helper.js';
import redis from '../../config/redisClient.js'
import models from '../../models/index.js';

describe('Trainings API', () => {
  let authHeaders: { Cookie: string };

  beforeAll(async () => {
    const auth = await getAuthToken();
    authHeaders = auth.headers;
  });

  it('devrait créer un training, lier les users et purger le cache', async () => {
    const payload = {
      type: 'training',
      date: '2026-05-20',
      startTime: '18:00:00',
      categoryId: 1,
    };

    const res = await request(app)
      .post('/api/v1/trainings')
      .set(authHeaders)
      .send(payload);

    expect(res.status).toBe(201);
    const trainingId = res.body.data.training.id;
    expect(trainingId).toBeDefined();

    const trainingInDb = await models.Trainings.findByPk(trainingId);
    expect(trainingInDb).not.toBeNull();
    expect(trainingInDb?.type).toBe(payload.type);
    expect(trainingInDb?.date).toBe(payload.date);
    expect(trainingInDb?.startTime).toBe(payload.startTime);
    expect(trainingInDb?.status).toBe(res.body.data.training.status);

    const usersInCategory = await models.UserRolesCategories.count({ where: { categoryId: 1 } });
    
    const linkedUsersCount = await (trainingInDb as any).countUsers(); 
    expect(linkedUsersCount).toBe(usersInCategory);

    expect(redis.del).toHaveBeenCalledWith('trainings:{}{}');
    expect(redis.del).toHaveBeenCalledWith('trainings-user:{}{}');
  });

  it('ne devrait pas créer un training avec un utilisateur non authentifié', async () => {
    const initialCount = await models.Trainings.count();

    const res = await request(app)
      .post('/api/v1/trainings')
      .send({
        type: 'training',
        date: '2024-10-10',
        startTime: '10:00:00',
        categoryId: 1,
      });

    if (res.status !== 401) {
      console.error('Response body:', res.body);
    }
    const finalCount = await models.Trainings.count();
    expect(res.status).toBe(401);
    expect(finalCount).toBe(initialCount);
  });

  it('ne devrait pas créer un training avec un body incomplet', async () => {
    const initialCount = await models.Trainings.count();

    const res = await request(app)
      .post('/api/v1/trainings')
      .set(authHeaders)
      .send({
        type: 'training',
        startTime: '10:00:00',
        categoryId: 1,
      });

    if (res.status !== 400) {
      console.error('Response body:', res.body);
    }

    const finalCount = await models.Trainings.count();
    expect(res.status).toBe(400);
    expect(finalCount).toBe(initialCount);
  });

  // it('ne devrait pas créer un training avec un body invalide', async () => {
  //   const initialCount = await models.Trainings.count();

  //   const res = await request(app)
  //     .post('/api/v1/trainings')
  //     .set(authHeaders)
  //     .send({
  //       type: 'invalid-type',
  //       date: 'invalid-date',
  //       startTime: 'invalid-time',
  //       categoryId: 1,
  //     });

  //   if (res.status !== 400) {
  //     console.error('Response body:', res.body);
  //   }

  //   const finalCount = await models.Trainings.count();
  //   expect(res.status).toBe(400);
  //   expect(finalCount).toBe(initialCount);
  // });

  it('ne devrait pas créer un training avec une category inexistante', async () => {
    const initialCount = await models.Trainings.count();
    const res = await request(app)
      .post('/api/v1/trainings')
      .set(authHeaders)
      .send({
        type: 'training',
        date: '2024-10-10',
        startTime: '10:00:00',
        categoryId: 9999,
      });

    if (res.status !== 404) {
      console.error('Response body:', res.body);
    }

    const finalCount = await models.Trainings.count();
    expect(res.status).toBe(404);
    expect(finalCount).toBe(initialCount);
  });
});