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

  it('devrait afficher tous les utilisateurs', async () => {
    
  });

  it('ne devrait pas afficher tous les utilisateurs avec un utilisateur non authentifié', async () => {
    
  });

  it('ne devrait pas afficher tous les utilisateurs avec un utilisateur non autorisé', async () => {
    
  });

  it('ne devrait pas afficher tous les utilisateurs s\'il n\'y a pas d\'utilisateurs', async () => {
    
  });

  it('devrait afficher un utilisateur spécifique', async () => {

  });

  it('ne devrait pas afficher un utilisateur spécifique avec un utilisateur non authentifié', async () => {

  });

  it('ne devrait pas afficher un utilisateur spécifique avec un utilisateur non autorisé', async () => {

  });

  it('ne devrait pas afficher un utilisateur spécifique qui n\'existe pas', async () => {

  });

  it('devrait afficher ses informations de profil', async () => {

  });

  it('ne devrait pas afficher ses informations de profil avec un utilisateur non authentifié', async () => {

  });

  it('ne devrait pas afficher ses informations de profil avec un utilisateur non trouvé', async () => {

  });
});