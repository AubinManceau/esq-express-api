import request from 'supertest';
import { app } from '../../app.js';

export const getAuthToken = async () => {
  const userPayload = {
    email: `test-${Date.now()}@example.com`,
    password: 'Password123!',
    username: 'testuser'
  };

  // 1. Inscription
  await request(app).post('/api/v1/auth/register').send(userPayload);

  // 2. Connexion
  const res = await request(app).post('/api/v1/auth/login').send({
    email: userPayload.email,
    password: userPayload.password
  });

  // On retourne le token (et l'utilisateur si besoin)
  return {
    token: res.body.token,
    user: res.body.user,
    headers: { Authorization: `Bearer ${res.body.token}` }
  };
};