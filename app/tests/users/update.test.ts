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

  it('devrait modifier son compte utilisateur', async () => {
    
  });

  it('devrait modifier le mot de passe de son compte utilisateur', async () => {
    
  });

  it('devrait modifier le compte utilisateur pour un administrateur', async () => {
    
  });
});