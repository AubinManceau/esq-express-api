import { describe, it, expect, beforeAll } from 'vitest';
import request from 'supertest';
import { app } from '../../app.js';
import { getAuthToken } from '../utils/auth.helper.js';
import redis from '../../config/redisClient.js'
import models from '../../models/index.js';

describe('Trainings API', () => {
  let authHeaders: { Cookie: string };

  const createTestTraining = async (overrides = {}) => {
    return await models.Trainings.create({
      type: 'training',
      date: '2026-10-10',
      startTime: '10:00:00',
      categoryId: 1,
      status: 'active',
      ...overrides
    });
  };

  beforeAll(async () => {
    const auth = await getAuthToken();
    authHeaders = auth.headers;
  });

  it('devrait modifier un training et purger le cache', async () => {
    const training = await createTestTraining();

    const res = await request(app)
      .patch(`/api/v1/trainings/${training.id}`)
      .set(authHeaders)
      .send(
        {
          type: 'match',
          date: '2026-06-15',
        }
      );

    expect(res.status).toBe(200);
    const trainingId = res.body.data.training.id;
    expect(trainingId).toBe(training.id);

    const updated = await models.Trainings.findByPk(trainingId);
    expect(updated).not.toBeNull();
    expect(updated?.type).toBe(res.body.data.training.type);
    expect(updated?.date).toBe(res.body.data.training.date);
    expect(updated?.startTime).toBe(training.startTime);
    expect(updated?.status).toBe(training.status);

    expect(redis.del).toHaveBeenCalledWith('trainings:{}{}');
    expect(redis.del).toHaveBeenCalledWith('trainings-user:{}{}');
  });

  it('devrait modifier un training, lier les users et purger le cache', async () => {
    const training = await createTestTraining();

    const res = await request(app)
      .post(`/api/v1/trainings/${training.id}`)
      .set(authHeaders)
      .send({categoryId: 2});

    expect(res.status).toBe(200);
    const trainingId = res.body.data.training.id;
    expect(trainingId).toBe(training.id);

    const updated = await models.Trainings.findByPk(trainingId);
    expect(updated).not.toBeNull();
    expect(updated?.type).toBe(training.type);
    expect(updated?.date).toBe(training.date);
    expect(updated?.startTime).toBe(training.startTime);
    expect(updated?.status).toBe(training.status);

    const usersInCategory2 = await models.UserRolesCategories.findAll({ where: { categoryId: 2 } });
    const usersIdsInCategory2 = [...new Set(usersInCategory2.map(u => u.userId))];
    const linkedUsers = await (training as any).getUsers();
    const linkedUsersIds = linkedUsers.map((u: any) => u.id);
    expect(linkedUsersIds.sort()).toEqual(usersIdsInCategory2.sort());

    expect(redis.del).toHaveBeenCalledWith('trainings:{}{}');
    expect(redis.del).toHaveBeenCalledWith('trainings-user:{}{}');
  });

  // it('ne devrait pas modifié un training avec un utilisateur non authentifié', async () => {
  //   const initialCount = await models.Trainings.count();

  //   const res = await request(app)
  //     .post('/api/v1/trainings')
  //     .send({
  //       type: 'training',
  //       date: '2024-10-10',
  //       startTime: '10:00:00',
  //       categoryId: 1,
  //     });

  //   if (res.status !== 401) {
  //     console.error('Response body:', res.body);
  //   }
  //   const finalCount = await models.Trainings.count();
  //   expect(res.status).toBe(401);
  //   expect(finalCount).toBe(initialCount);
  // });

  // it('ne devrait pas modifier un training avec un body invalide', async () => {
  //   const initialCount = await models.Trainings.count();

  //   const res = await request(app)
  //     .post('/api/v1/trainings')
  //     .set(authHeaders)
  //     .send({
  //       type: 'training',
  //       startTime: '10:00:00',
  //       categoryId: 1,
  //     });

  //   if (res.status !== 400) {
  //     console.error('Response body:', res.body);
  //   }

  //   const finalCount = await models.Trainings.count();
  //   expect(res.status).toBe(400);
  //   expect(finalCount).toBe(initialCount);
  // });

  // it('ne devrait pas modifier un training avec une category inexistante', async () => {
  //   const initialCount = await models.Trainings.count();
  //   const res = await request(app)
  //     .post('/api/v1/trainings')
  //     .set(authHeaders)
  //     .send({
  //       type: 'training',
  //       date: '2024-10-10',
  //       startTime: '10:00:00',
  //       categoryId: 9999,
  //     });

  //   if (res.status !== 404) {
  //     console.error('Response body:', res.body);
  //   }

  //   const finalCount = await models.Trainings.count();
  //   expect(res.status).toBe(404);
  //   expect(finalCount).toBe(initialCount);
  // });

  // it('ne devrait pas modifier un training inexistant', async () => {
  //   const initialCount = await models.Trainings.count();
  //   const res = await request(app)
  //     .post('/api/v1/trainings')
  //     .set(authHeaders)
  //     .send({
  //       type: 'training',
  //       date: '2024-10-10',
  //       startTime: '10:00:00',
  //       categoryId: 9999,
  //     });

  //   if (res.status !== 404) {
  //     console.error('Response body:', res.body);
  //   }

  //   const finalCount = await models.Trainings.count();
  //   expect(res.status).toBe(404);
  //   expect(finalCount).toBe(initialCount);
  // });
});