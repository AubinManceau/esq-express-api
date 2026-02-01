import { describe, it, expect, beforeAll } from 'vitest';
import request from 'supertest';
import { app } from '../app.js';
import { getAuthToken } from './utils/auth.helper.js';

describe('Trainings API', () => {
  let authHeaders: { Cookie: string };

  beforeAll(async () => {
    const auth = await getAuthToken();
    authHeaders = auth.headers;
  });

  it('devrait créer un training avec un utilisateur authentifié', async () => {
    const res = await request(app)
      .post('/api/v1/trainings')
      .set(authHeaders)
      .send({
        type: 'training',
        date: '2024-10-10',
        startTime: '10:00:00',
        categoryId: 1,
      });

    if (res.status !== 201) {
      console.error('Response body:', res.body);
    }

    expect(res.status).toBe(201);
    expect(res.body.data.training.type).toBe('training');
  });
});