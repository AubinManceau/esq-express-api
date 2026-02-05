import { describe, it, expect } from 'vitest';
import request from 'supertest';
import { app } from '../../app.js';
import { getPlayerToken } from '../utils/auth.helper.js';
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

  it('devrait modifier le statut d\'un user sur un training', async () => {
    const training = await createTestTraining();

    const auth = await getPlayerToken();
    authHeaders = auth.headers;

    const res = await request(app)
      .patch(`/api/v1/trainings/${training.id}/status/absent`)
      .set(authHeaders)

    if (res.status !== 200) {
      console.error('Response body:', res.body);
    }

    expect(res.status).toBe(200);
    expect(res.body.data.status).toBe('absent');

    const statusInDb = await models.TrainingUsersStatus.findOne({
        where: { 
            trainingId: training.id, 
            userId: auth.user.id 
        }
    });

    expect(statusInDb).not.toBeNull();
    expect(statusInDb?.status).toBe('absent');

    expect(redis.del).toHaveBeenCalledWith('trainings:{}{}');
    expect(redis.del).toHaveBeenCalledWith('trainings-user:{}{}');
  });

  it('ne devrait pas modifier le statut d\'un user non authentifié sur un training', async () => {
    const training = await createTestTraining();

    const res = await request(app)
      .patch(`/api/v1/trainings/${training.id}/status/absent`)
    
      if (res.status !== 401) {
      console.error('Response body:', res.body);
    }

    expect(res.status).toBe(401);
  });

  it('ne devrait pas modifier le statut d\'un user sur un training avec un statut invalide', async () => {
    const training = await createTestTraining();

    const auth = await getPlayerToken();
    authHeaders = auth.headers;

    const res = await request(app)
      .patch(`/api/v1/trainings/${training.id}/status/invalid-status`)
      .set(authHeaders)
    
      if (res.status !== 400) {
      console.error('Response body:', res.body);
    }

    expect(res.status).toBe(400);
    const statusInDb = await models.TrainingUsersStatus.findOne({
        where: { 
            trainingId: training.id, 
            userId: auth.user.id 
        }
    });
    expect(statusInDb).not.toBeNull();
    expect(statusInDb?.status).not.toBe('invalid-status');
  });

  it('ne devrait pas modifier le statut d\'un user non autorisé sur un training', async () => {
    const training = await createTestTraining({categoryId: 2});

    const auth = await getPlayerToken();
    authHeaders = auth.headers;

    const res = await request(app)
      .patch(`/api/v1/trainings/${training.id}/status/absent`)
      .set(authHeaders)
    
      if (res.status !== 404) {
      console.error('Response body:', res.body);
    }

    expect(res.status).toBe(404);
    const statusInDb = await models.TrainingUsersStatus.findOne({
        where: { 
            trainingId: training.id, 
            userId: auth.user.id 
        }
    });
    expect(statusInDb).toBeNull();
  });
});