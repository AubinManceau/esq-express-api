import { describe, it, expect, beforeEach } from 'vitest';
import request from 'supertest';
import { app } from '../../app.js';
import { getCoachToken, getAdminToken, getPlayerToken } from '../utils/auth.helper.js';
import redis from '../../config/redisClient.js'
import models from '../../models/index.js';

describe('Users API', () => {
  let authHeaders: { Cookie: string };
  let user: { user: any };
  let admin: { user: any };

  beforeEach(async () => {
        const auth = await getAdminToken();
        authHeaders = auth.headers;
        user = await getPlayerToken();
        admin = auth;
    });

  it('devrait supprimer un utilisateur et purger le cache', async () => {
    const res = await request(app)
      .delete(`/api/v1/users/${user.user.id}`)
      .set(authHeaders)

    expect(res.status).toBe(200);

    const updated = await models.Users.findByPk(user.user.id);
    expect(updated).toBeNull();

    expect(redis.del).toHaveBeenCalledWith(`users:{}{}`);
  });

  it('ne devrait pas supprimer un user avec un utilisateur non authentifié', async () => {
    
    const res = await request(app)
      .delete(`/api/v1/users/${user.user.id}`)

    if (res.status !== 401) {
      console.error('Response body:', res.body);
    }
    expect(res.status).toBe(401);
    const userInDb = await models.Users.findByPk(user.user.id);
    expect(userInDb).not.toBeNull();
  });

  it('ne devrait pas supprimer un user avec un utilisateur non autorisé', async () => {
    const coachAuth = await getCoachToken();

    const res = await request(app)
      .delete(`/api/v1/users/${user.user.id}`)
      .set(coachAuth.headers)

    if (res.status !== 403) {
      console.error('Response body:', res.body);
    }
    expect(res.status).toBe(403);
    const userInDb = await models.Users.findByPk(user.user.id);
    expect(userInDb).not.toBeNull();
  });

  it('ne devrait pas supprimer son propre compte', async () => {
    const res = await request(app)
      .delete(`/api/v1/users/${admin.user.id}`)
      .set(authHeaders)

    if (res.status !== 403) {
      console.error('Response body:', res.body);
    }
    expect(res.status).toBe(403);
    const userInDb = await models.Users.findByPk(admin.user.id);
    expect(userInDb).not.toBeNull();
  });

  it('ne devrait pas supprimer un user inexistant', async () => {
    const userId = 9999;
    
    const res = await request(app)
      .delete(`/api/v1/users/${userId}`)
      .set(authHeaders)

    if (res.status !== 404) {
      console.error('Response body:', res.body);
    }

    expect(res.status).toBe(404);
  });
});