import { describe, it, expect, beforeEach } from 'vitest';
import request from 'supertest';
import { app } from '../../app.js';
import { getPlayerToken, getMemberToken } from '../utils/auth.helper.js';
import redis from '../../config/redisClient.js'
import models from '../../models/index.js';

describe('Articles API', () => {
  let authHeaders: { Cookie: string };
  let author : { user: any };

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

  it('devrait modifier un article et purger le cache', async () => {
    const { article } = await createTestArticle();

    const res = await request(app)
      .patch(`/api/v1/articles/${article.id}`)
      .set(authHeaders)
      .send({
        title: 'Article A updated',
      });

    expect(res.status).toBe(200);
    const articleId = res.body.data.article.id;
    expect(articleId).toBe(article.id);

    const updated = await models.Articles.findByPk(articleId);
    expect(updated).not.toBeNull();
    expect(updated?.title).toBe(res.body.data.article.title);
    expect(updated?.content).toBe(article.content);
    expect(updated?.status).toBe(article.status);

    expect(redis.del).toHaveBeenCalledWith('articles:{}{}');
  });

  it('ne devrait pas modifié un article avec un utilisateur non authentifié', async () => {
    const {article} = await createTestArticle();

    const res = await request(app)
      .patch(`/api/v1/articles/${article.id}`)
      .send({title: 'Article A updated'});

    if (res.status !== 401) {
      console.error('Response body:', res.body);
    }
    expect(res.status).toBe(401);
    const articleInDb = await models.Articles.findByPk(article.id);
    expect(articleInDb?.title).not.toBe('Article A updated');
    expect(articleInDb?.title).toBe(article.title);
  });

  it('ne devrait pas modifié un article avec un utilisateur non autorisé', async () => {
    const {article} = await createTestArticle();

    const playerAuth = await getPlayerToken();

    const res = await request(app)
      .patch(`/api/v1/articles/${article.id}`)
      .set(playerAuth.headers)
      .send({title: 'Article A updated'});

    if (res.status !== 403) {
      console.error('Response body:', res.body);
    }
    expect(res.status).toBe(403);
    const articleInDb = await models.Articles.findByPk(article.id);
    expect(articleInDb?.title).not.toBe('Article A updated');
    expect(articleInDb?.title).toBe(article.title);
  });

  it('ne devrait pas modifier un article avec un body invalide', async () => {
    const {article} = await createTestArticle();
    
    const res = await request(app)
      .patch(`/api/v1/articles/${article.id}`)
      .set(authHeaders)
      .send({title: ''});
    if (res.status !== 400) {
      console.error('Response body:', res.body);
    }

    expect(res.status).toBe(400);
    const articleInDb = await models.Articles.findByPk(article.id);
    expect(articleInDb?.title).not.toBe('');
    expect(articleInDb?.title).toBe(article.title);
  });

  it('ne devrait pas modifier l\'auteur d\'un article', async () => {
    const {article} = await createTestArticle();
    
    const res = await request(app)
      .patch(`/api/v1/articles/${article.id}`)
      .set(authHeaders)
      .send({userAuthorId: 9999});
    if (res.status !== 400) {
      console.error('Response body:', res.body);
    }

    expect(res.status).toBe(400);
    const articleInDb = await models.Articles.findByPk(article.id);
    expect(articleInDb?.userAuthorId).toBe(article.userAuthorId);
  });

  it('ne devrait pas modifier un article inexistante', async () => {
    const articleId = 9999;
    
    const res = await request(app)
      .patch(`/api/v1/articles/${articleId}`)
      .set(authHeaders)
      .send({title: 'Article A updated'});

    if (res.status !== 404) {
      console.error('Response body:', res.body);
    }

    expect(res.status).toBe(404);
  });
});