import { describe, it, expect, beforeAll } from 'vitest';
import request from 'supertest';
import { app } from '../app.js';
import { getAuthToken } from './utils/auth.helper.js';

describe('Articles API', () => {
  let authHeaders: { Authorization: string };

  beforeAll(async () => {
    // On génère un token une seule fois pour cette suite de tests
    const auth = await getAuthToken();
    authHeaders = auth.headers;
  });

  it('devrait créer un article avec un utilisateur authentifié', async () => {
    const res = await request(app)
      .post('/api/v1/articles/create')
      .set(authHeaders) // Injection automatique du header Authorization
      .send({
        title: 'Mon superbe article',
        content: 'Contenu de test'
      });

    expect(res.status).toBe(201);
    expect(res.body.title).toBe('Mon superbe article');
  });

  it('devrait refuser l’accès sans token', async () => {
    const res = await request(app).post('/api/v1/articles/create').send({ title: 'Hack' });
    expect(res.status).toBe(401);
  });
});