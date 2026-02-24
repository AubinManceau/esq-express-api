import { describe, it, expect, beforeEach } from 'vitest';
import request from 'supertest';
import { app } from '../../app.js';
import { getCoachToken, getAdminToken, getPlayerToken } from '../utils/auth.helper.js';
import redis from '../../config/redisClient.js'
import models from '../../models/index.js';

describe('Users API', () => {
  let authHeaders: { Cookie: string };
  let user: { user: any };

  beforeEach(async () => {
      const auth = await getAdminToken();
      authHeaders = auth.headers;
      user = await getPlayerToken();
  });

  // TESTS MODIFICATION PROFIL

  it('devrait modifier son compte utilisateur', async () => {
    const response = await request(app)
      .patch('/api/users')
      .set(authHeaders)
      .send({
          firstName: 'NouveauPrénom',
          lastName: 'NouveauNom',
          email: user.user.email,
          phone: '1234567890'
      });

      expect(response.status).toBe(200);
      expect(response.body.status).toBe('success');
      expect(response.body.data.firstName).toBe('NouveauPrénom');
      expect(response.body.data.lastName).toBe('NouveauNom');
      expect(response.body.data.phone).toBe('1234567890');
  });

  it('ne devrait pas modifier un utilisateur en etant non authentifié', async () => {
    const response = await request(app)
      .patch('/api/users')
      .send({
          firstName: 'NouveauPrénom',
          lastName: 'NouveauNom',
          email: user.user.email,
          phone: '1234567890'
      });

    expect(response.status).toBe(401);
  });

  it('ne devrait pas modifier un utilisateur avec des donnees invalides', async () => {
    const response = await request(app)
      .patch('/api/users')
      .set(authHeaders)
      .send({
          firstName: '',
          lastName: '',
          email: 'emailinvalide',
          phone: '1234567890'
      });

    expect(response.status).toBe(400);
  });

  // TESTS MODIFICATION MOT DE PASSE

  it('devrait modifier le mot de passe de son compte utilisateur', async () => {
    
  });

  it('ne devrait pas modifier le mot de passe avec des donnees invalides', async () => {
    
  });

  it('ne devrait pas modifier le mot de passe si l\'ancien mot de passe est incorrect', async () => {
    
  });

  it('ne devrait pas modifier le mot de passe si le nouveau mot de passe ne correspond pas a la confirmation', async () => {
    
  });

  // TESTS MODIFICATION PAR ADMIN

  it('devrait modifier le compte utilisateur pour un administrateur', async () => {
    
  });
});