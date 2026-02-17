import { describe, it, expect, beforeEach } from 'vitest';
import request from 'supertest';
import { app } from '../../app.js';
import { getCoachToken, getMemberToken } from '../utils/auth.helper.js';
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

  it('devrait afficher tous les articles', async () => {
    const {article} = await createTestArticle();

    const res = await request(app)
      .get('/api/v1/articles')
      .set(authHeaders)

    if (res.status !== 200) {
      console.error('Response body:', res.body);
    }

    expect(res.status).toBe(200);
    expect(res.body.status).toBe('success');
    expect(Array.isArray(res.body.data)).toBe(true);

    const articleInRes = res.body.data.find((a: any) => a.id === article.id);
    expect(articleInRes).toBeDefined();
    expect(articleInRes.title).toBe(article.title);
    expect(articleInRes.content).toBe(article.content);
    expect(articleInRes.status).toBe(article.status);
    expect(articleInRes.userAuthorId).toBe(article.userAuthorId);
  });

  it('ne devrait pas afficher tous les articles avec un utilisateur non authentifié', async () => {
    const res = await request(app)
      .get(`/api/v1/articles`)

    if (res.status !== 401) {
      console.error('Response body:', res.body);
    }
    expect(res.status).toBe(401);
  });

  it('devrait afficher un article spécifique', async () => {
    const {article} = await createTestArticle();

    const res = await request(app)
      .get(`/api/v1/articles/${article.id}`)
      .set(authHeaders)

    if (res.status !== 200) {
      console.error('Response body:', res.body);
    }

    expect(res.status).toBe(200);
    expect(res.body.status).toBe('success');

    const articleInRes = res.body.data.article;
    expect(articleInRes).toBeDefined();

    expect(articleInRes.id).toBe(article.id);
    expect(articleInRes.title).toBe(article.title);
    expect(articleInRes.content).toBe(article.content);
    expect(articleInRes.status).toBe(article.status);
    expect(articleInRes.userAuthorId).toBe(article.userAuthorId);
  });

  it('ne devrait pas afficher un article inexistant', async () => {
    const articleId = 9999;

    const res = await request(app)
      .get(`/api/v1/articles/${articleId}`)
      .set(authHeaders)

    if (res.status !== 404) {
      console.error('Response body:', res.body);
    }

    expect(res.status).toBe(404);
    expect(res.body.status).toBe('error');
  });

  it('ne devrait pas afficher un article avec un utilisateur non authentifié', async () => {
    const { article } = await createTestArticle();

    const res = await request(app)
      .get(`/api/v1/articles/${article.id}`)
    if (res.status !== 401) {
      console.error('Response body:', res.body);
    }
    expect(res.status).toBe(401);
  });
});