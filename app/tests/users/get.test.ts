import { describe, it, expect, beforeEach } from 'vitest';
import request from 'supertest';
import { app } from '../../app.js';
import { getAdminToken, getPlayerToken } from '../utils/auth.helper.js';

describe('Users API', () => {
  let authHeaders: { Cookie: string };
  let user: { user: any, headers: { Cookie: string } };

  beforeEach(async () => {
      const auth = await getAdminToken();
      authHeaders = auth.headers;
      user = await getPlayerToken();
  });

  it('devrait afficher tous les utilisateurs', async () => {
      const res = await request(app)
        .get('/api/v1/users')
        .set(authHeaders)
        .expect(200);
      
      if (res.status !== 200) {
          console.error('Response body:', res.body);
      }

      expect(res.status).toBe(200);
      expect(res.body.status).toBe('success');
      expect(Array.isArray(res.body.data)).toBe(true);
      
      const userInRes = res.body.data.find((u: any) => u.id === user.user.id);
      expect(userInRes).toBeDefined();
      expect(userInRes.email).toBe(user.user.email);
      expect(userInRes.firstName).toBe(user.user.firstName);
      expect(userInRes.lastName).toBe(user.user.lastName);
  });

  it('devrait afficher tous les utilisateurs avec un filtre sur les categories', async () => {
      const res = await request(app)
        .get('/api/v1/users?_category=1')
        .set(authHeaders)
        .expect(200);
      
      if (res.status !== 200) {
          console.error('Response body:', res.body);
      }

      expect(res.status).toBe(200);
      expect(res.body.status).toBe('success');
      expect(Array.isArray(res.body.data)).toBe(true);
      
      const userInRes = res.body.data.find((u: any) => u.id === user.user.id);
      expect(userInRes).toBeDefined();
      expect(userInRes.email).toBe(user.user.email);
      expect(userInRes.firstName).toBe(user.user.firstName);
      expect(userInRes.lastName).toBe(user.user.lastName);
  });

  it('devrait afficher tous les utilisateurs avec un filtre sur les rôles', async () => {
      const res = await request(app)
        .get('/api/v1/users?_role=1')
        .set(authHeaders)
        .expect(200);
      
      if (res.status !== 200) {
          console.error('Response body:', res.body);
      }

      expect(res.status).toBe(200);
      expect(res.body.status).toBe('success');
      expect(Array.isArray(res.body.data)).toBe(true);
      
      const userInRes = res.body.data.find((u: any) => u.id === user.user.id);
      expect(userInRes).toBeDefined();
      expect(userInRes.email).toBe(user.user.email);
      expect(userInRes.firstName).toBe(user.user.firstName);
      expect(userInRes.lastName).toBe(user.user.lastName);
  });

  it('ne devrait pas afficher tous les utilisateurs avec un utilisateur non authentifié', async () => {
      const res = await request(app)
        .get('/api/v1/users')
        .expect(401);
      
      if (res.status !== 401) {
          console.error('Response body:', res.body);
      }

      expect(res.status).toBe(401);
    
  });

  it('ne devrait pas afficher tous les utilisateurs s\'il n\'y a pas d\'utilisateurs', async () => {
    const res = await request(app)
        .get('/api/v1/users?_role=2')
        .set(authHeaders)
        .expect(404);
      
      if (res.status !== 404) {
          console.error('Response body:', res.body);
      }

      expect(res.status).toBe(404);
  });

  it('devrait afficher un utilisateur spécifique', async () => {
    const res = await request(app)
      .get(`/api/v1/users/${user.user.id}`)
      .set(authHeaders)
      .expect(200);

    if (res.status !== 200) {
      console.error('Response body:', res.body);
    }

    expect(res.status).toBe(200);
    expect(res.body.status).toBe('success');
    expect(res.body.data).toBeDefined();
    expect(res.body.data.id).toBe(user.user.id);
    expect(res.body.data.email).toBe(user.user.email);
    expect(res.body.data.firstName).toBe(user.user.firstName);
    expect(res.body.data.lastName).toBe(user.user.lastName);
  });

  it('ne devrait pas afficher un utilisateur spécifique avec un utilisateur non authentifié', async () => {
    const res = await request(app)
      .get(`/api/v1/users/${user.user.id}`)
      .expect(401);

    if (res.status !== 401) {
      console.error('Response body:', res.body);
    }

    expect(res.status).toBe(401);
  });

  it('ne devrait pas afficher un utilisateur spécifique qui n\'existe pas', async () => {
    const res = await request(app)
      .get(`/api/v1/users/999999`)
      .set(authHeaders)
      .expect(404);

    if (res.status !== 404) {
      console.error('Response body:', res.body);
    }

    expect(res.status).toBe(404);
  });

  it('devrait afficher ses informations de profil', async () => {
    const res = await request(app)
      .get(`/api/v1/users/profile`)
      .set(user.headers)
      .expect(200);
      
    if (res.status !== 200) {
      console.error('Response body:', res.body);
    }

    expect(res.status).toBe(200);
    expect(res.body.status).toBe('success');
    expect(res.body.data.user).toBeDefined();
    expect(res.body.data.user.id).toBe(user.user.id);
    expect(res.body.data.user.email).toBe(user.user.email);
    expect(res.body.data.user.firstName).toBe(user.user.firstName);
    expect(res.body.data.user.lastName).toBe(user.user.lastName);
  });

  it('ne devrait pas afficher ses informations de profil avec un utilisateur non authentifié', async () => {
      const res = await request(app)
        .get(`/api/v1/users/profile`)
        .expect(401);
      
      if (res.status !== 401) {
          console.error('Response body:', res.body);
      }

      expect(res.status).toBe(401);
  });
});