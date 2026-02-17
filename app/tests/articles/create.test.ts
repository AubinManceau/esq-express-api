import { describe, it, expect, beforeEach } from 'vitest';
import request from 'supertest';
import { app } from '../../app.js';
import { getMemberToken, getCoachToken } from '../utils/auth.helper.js';
import redis from '../../config/redisClient.js'
import models from '../../models/index.js';

describe('Articles API', () => {
  let authHeaders: { Cookie: string };
  let author: { user: any };

  beforeEach(async () => {
    const auth = await getMemberToken();
    authHeaders = auth.headers;
    author = auth;
  });

  it('devrait créer un article et purger le cache', async () => {
    const payload = {
      title: 'Titre de l\'article',
      content: 'Contenu de l\'article',
      status: 'published'
    };

    const res = await request(app)
      .post('/api/v1/articles/create')
      .set(authHeaders)
      .send(payload);

    expect(res.status).toBe(201);
    const articleId = res.body.data.article.id;
    expect(articleId).toBeDefined();

    const articleInDb = await models.Articles.findByPk(articleId);
    expect(articleInDb).not.toBeNull();
    expect(articleInDb?.title).toBe(payload.title);
    expect(articleInDb?.content).toBe(payload.content);
    expect(articleInDb?.status).toBe(payload.status);
    expect(articleInDb?.userAuthorId).toBe(author.user?.id);

    expect(redis.del).toHaveBeenCalledWith('articles:{}{}');
  });

  it('ne devrait pas créer un article avec un utilisateur non authentifié', async () => {
    const initialCount = await models.Articles.count();

    const res = await request(app)
      .post('/api/v1/articles/create')
      .send({
        title: 'team B',
        content: 'Contenu de l\'article B',
        status: 'published',
      });

    if (res.status !== 401) {
      console.error('Response body:', res.body);
    }
    const finalCount = await models.Articles.count();
    expect(res.status).toBe(401);
    expect(finalCount).toBe(initialCount);
  });

  it('ne devrait pas créer un article avec un utilisateur non autorisé', async () => {
    const initialCount = await models.Articles.count();
    const coachAuth = await getCoachToken();
    const coachAuthHeaders = coachAuth.headers;

    const res = await request(app)
      .post('/api/v1/articles/create')
      .set(coachAuthHeaders)
      .send({
        title: 'team B',
        content: 'Contenu de l\'article B',
        status: 'published',
      });

    if (res.status !== 403) {
      console.error('Response body:', res.body);
    }
    const finalCount = await models.Articles.count();
    expect(res.status).toBe(403);
    expect(finalCount).toBe(initialCount);
  });

  it('ne devrait pas créer un article avec un body incomplet', async () => {
    const initialCount = await models.Articles.count();

    const res = await request(app)
      .post('/api/v1/articles/create')
      .set(authHeaders)
      .send({
        title: 'team C',
        status: 'published',
      });

    if (res.status !== 400) {
      console.error('Response body:', res.body);
    }

    const finalCount = await models.Articles.count();
    expect(res.status).toBe(400);
    expect(finalCount).toBe(initialCount);
  });

  it('ne devrait pas créer un article avec un body invalide', async () => {
    const initialCount = await models.Articles.count();

    const res = await request(app)
      .post('/api/v1/articles/create')
      .set(authHeaders)
      .send({
        title: '',
        content: '',
        status: 'invalid',
      });

    if (res.status !== 400) {
      console.error('Response body:', res.body);
    }

    const finalCount = await models.Articles.count();
    expect(res.status).toBe(400);
    expect(finalCount).toBe(initialCount);
  });
});