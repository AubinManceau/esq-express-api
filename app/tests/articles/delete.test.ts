import { describe, it, expect, beforeEach } from 'vitest';
import request from 'supertest';
import { app } from '../../app.js';
import { getCoachToken, getMemberToken } from '../utils/auth.helper.js';
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
  
  const createTestArticle = async (overrides = {}) => {
    const article = await models.Articles.create({
        title: 'Article A',
        content: 'Contenu de l\'article A',
        status: 'published',
        userAuthorId: author.user?.id,
        ...overrides
    });
    return { article };
  };

  it('devrait supprimer un article et purger le cache', async () => {
    const { article } = await createTestArticle();

    const res = await request(app)
      .delete(`/api/v1/articles/${article.id}`)
      .set(authHeaders)

    expect(res.status).toBe(200);

    const updated = await models.Articles.findByPk(article.id);
    expect(updated).toBeNull();

    expect(redis.del).toHaveBeenCalledWith('articles:{}{}');
  });

  it('ne devrait pas supprimer un article avec un utilisateur non authentifié', async () => {
    const { article } = await createTestArticle();
    const res = await request(app)
      .delete(`/api/v1/articles/${article.id}`)

    if (res.status !== 401) {
      console.error('Response body:', res.body);
    }
    expect(res.status).toBe(401);
    const articleInDb = await models.Articles.findByPk(article.id);
    expect(articleInDb).not.toBeNull();
  });

  it('ne devrait pas supprimer un article avec un utilisateur non autorisé', async () => {
    const { article } = await createTestArticle();

    const coachAuth = await getCoachToken();

    const res = await request(app)
      .delete(`/api/v1/articles/${article.id}`)
      .set(coachAuth.headers)

    if (res.status !== 403) {
      console.error('Response body:', res.body);
    }
    expect(res.status).toBe(403);
    const articleInDb = await models.Articles.findByPk(article.id);
    expect(articleInDb).not.toBeNull();
  });

  it('ne devrait pas supprimer un article inexistante', async () => {
    const articleId = 9999;
    
    const res = await request(app)
      .delete(`/api/v1/articles/${articleId}`)
      .set(authHeaders)

    if (res.status !== 404) {
      console.error('Response body:', res.body);
    }

    expect(res.status).toBe(404);
  });
});