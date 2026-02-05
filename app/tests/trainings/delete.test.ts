import { describe, it, expect, beforeAll } from 'vitest';
import request from 'supertest';
import { app } from '../../app.js';
import { getCoachToken, getPlayerToken } from '../utils/auth.helper.js';
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

  it('devrait supprimer un training et purger le cache', async () => {
    const training = await createTestTraining();

    const auth = await getCoachToken();
    authHeaders = auth.headers;

    const res = await request(app)
      .delete(`/api/v1/trainings/${training.id}`)
      .set(authHeaders)

    expect(res.status).toBe(200);

    const updated = await models.Trainings.findByPk(training.id);
    expect(updated).toBeNull();

    const links = await models.TrainingUsersStatus.findAll({
        where: { trainingId: training.id }
    });
    expect(links.length).toBe(0);

    expect(redis.del).toHaveBeenCalledWith('trainings:{}{}');
    expect(redis.del).toHaveBeenCalledWith('trainings-user:{}{}');
  });

  it('ne devrait pas supprimer un training avec un utilisateur non authentifié', async () => {
    const training = await createTestTraining();

    const res = await request(app)
      .delete(`/api/v1/trainings/${training.id}`)

    if (res.status !== 401) {
      console.error('Response body:', res.body);
    }
    expect(res.status).toBe(401);
    const trainingInDb = await models.Trainings.findByPk(training.id);
    expect(trainingInDb).not.toBeNull();
  });

  it('ne devrait pas supprimer un training avec un utilisateur non autorisé', async () => {
    const training = await createTestTraining();

    const auth = await getPlayerToken();
    authHeaders = auth.headers;

    const res = await request(app)
      .delete(`/api/v1/trainings/${training.id}`)
      .set(authHeaders)

    if (res.status !== 403) {
      console.error('Response body:', res.body);
    }
    expect(res.status).toBe(403);
    const trainingInDb = await models.Trainings.findByPk(training.id);
    expect(trainingInDb).not.toBeNull();
  });

  it('ne devrait pas supprimer un training inexistant', async () => {
    const trainingId = 9999;

    const auth = await getCoachToken();
    authHeaders = auth.headers;
    
    const res = await request(app)
      .delete(`/api/v1/trainings/${trainingId}`)
      .set(authHeaders)

    if (res.status !== 404) {
      console.error('Response body:', res.body);
    }

    expect(res.status).toBe(404);
  });
});