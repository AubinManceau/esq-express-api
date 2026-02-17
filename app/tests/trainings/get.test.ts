import { describe, it, expect } from 'vitest';
import request from 'supertest';
import { app } from '../../app.js';
import { getPlayerToken, getAdminToken } from '../utils/auth.helper.js';
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

  it('devrait afficher tous les trainings', async () => {
    const player = await getPlayerToken();
    const training = await createTestTraining();

    await models.TrainingUsersStatus.create({ trainingId: training.id, userId: player.user.id, status: 'present' });

    const auth = await getAdminToken();
    authHeaders = auth.headers;

    const res = await request(app)
      .get('/api/v1/trainings')
      .set(authHeaders)

    if (res.status !== 200) {
      console.error('Response body:', res.body);
    }

    expect(res.status).toBe(200);
    expect(res.body.status).toBe('success');
    expect(Array.isArray(res.body.data)).toBe(true);

    const trainingData = res.body.data.find((t: any) => t.id === training.id);

    expect(trainingData).toBeDefined();
    expect(trainingData.type).toBe('training');

    expect(trainingData.category).toHaveProperty('name');
    expect(trainingData.category.id).toBe(1);

    expect(trainingData.responses).toEqual({
        present: 1,
        absent: 0,
        pending: 0
    });
  });

  it('ne devrait pas afficher tous les trainings avec un utilisateur non authentifié', async () => {
    const res = await request(app)
      .get(`/api/v1/trainings`)

    if (res.status !== 401) {
      console.error('Response body:', res.body);
    }
    expect(res.status).toBe(401);
  });

  it('ne devrait pas afficher tous les trainings avec un utilisateur non autorisé', async () => {
    const auth = await getPlayerToken();
    authHeaders = auth.headers;

    const res = await request(app)
      .get(`/api/v1/trainings`)
      .set(authHeaders)

    if (res.status !== 403) {
      console.error('Response body:', res.body);
    }
    expect(res.status).toBe(403);
  });

  it('devrait afficher le training', async () => {
    const player = await getPlayerToken();
    const training = await createTestTraining();

    await models.TrainingUsersStatus.create({ trainingId: training.id, userId: player.user.id, status: 'present' });

    const auth = await getAdminToken();
    authHeaders = auth.headers;

    const res = await request(app)
      .get(`/api/v1/trainings/${training.id}`)
      .set(authHeaders)

    if (res.status !== 200) {
      console.error('Response body:', res.body);
    }

    expect(res.status).toBe(200);
    expect(res.body.status).toBe('success');

    const trainingData = res.body.data;

    expect(trainingData.id).toBe(training.id);
    expect(trainingData.type).toBe('training');

    expect(trainingData.category).toHaveProperty('name');
    expect(trainingData.category.id).toBe(1);

    expect(trainingData.responses).toEqual({
        present: 1,
        absent: 0,
        pending: 0
    });
  });

  it('ne devrait pas afficher un training inexistant', async () => {
    const trainingId = 9999;

    const auth = await getPlayerToken();
    authHeaders = auth.headers;

    const res = await request(app)
      .get(`/api/v1/trainings/${trainingId}`)
      .set(authHeaders)

    if (res.status !== 404) {
      console.error('Response body:', res.body);
    }

    expect(res.status).toBe(404);
    expect(res.body.status).toBe('error');
  });

  it('ne devrait pas afficher le training avec un utilisateur non authentifié', async () => {
    const training = await createTestTraining();

    const res = await request(app)
      .get(`/api/v1/trainings/${training.id}`)

    if (res.status !== 401) {
      console.error('Response body:', res.body);
    }
    expect(res.status).toBe(401);
  });

  it('devrait afficher tous les trainings de l\'utilisateur', async () => {
    const auth = await getPlayerToken();
    authHeaders = auth.headers;

    const training = await createTestTraining();
    await createTestTraining({categoryId: 2});

    await models.TrainingUsersStatus.create({ trainingId: training.id, userId: auth.user.id, status: 'present' });

    const res = await request(app)
      .get('/api/v1/trainings/user')
      .set(authHeaders)

    if (res.status !== 200) {
      console.error('Response body:', res.body);
    }

    expect(res.status).toBe(200);
    expect(res.body.data).toHaveLength(1);

    const categoryGroup = res.body.data[0];
    expect(categoryGroup.id).toBe(1);
    expect(categoryGroup.name).toBeDefined();

    const trainingData = categoryGroup.trainings.find((t: any) => t.id === training.id);
    expect(trainingData).toBeDefined();

    expect(trainingData.responses).toEqual({
        present: 1,
        absent: 0,
        pending: 0
    });

    const allTrainingsIds = res.body.data.flatMap((c: any) => c.trainings.map((t: any) => t.id));
    expect(allTrainingsIds).not.toContain(2);
  });

  it('ne devrait pas afficher tous les trainings de l\'utilisateur non authentifié', async () => {
    const res = await request(app)
      .get('/api/v1/trainings/user')

    if (res.status !== 401) {
      console.error('Response body:', res.body);
    }
    expect(res.status).toBe(401);
  });

  it('ne devrait pas afficher tous les trainings de l\'utilisateur s\'il n\'y en a pas', async () => {
    const auth = await getPlayerToken();
    authHeaders = auth.headers;
    
    const training = await createTestTraining({categoryId: 2});

    const res = await request(app)
      .get('/api/v1/trainings/user')
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

  it('ne devrait pas afficher tous les trainings de l\'utilisateur s\'il n\'a pas de categories', async () => {
    const auth = await getAdminToken();
    authHeaders = auth.headers;

    const res = await request(app)
      .get('/api/v1/trainings/user')
      .set(authHeaders)

    if (res.status !== 404) {
      console.error('Response body:', res.body);
    }

    expect(res.status).toBe(404);
  });
});