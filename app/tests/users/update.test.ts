import { describe, it, expect, beforeEach } from 'vitest';
import request from 'supertest';
import { app } from '../../app.js';
import { getCoachToken, getAdminToken, getPlayerToken } from '../utils/auth.helper.js';
import redis from '../../config/redisClient.js'
import models from '../../models/index.js';
import e from 'express';

describe('Users API', () => {
  let authHeaders: { Cookie: string };
  let user: { user: any, headers: { Cookie: string } };
  let auth: { user: any, headers: { Cookie: string } };

  beforeEach(async () => {
      auth = await getAdminToken();
      authHeaders = auth.headers;
      user = await getPlayerToken();
  });

  // TESTS MODIFICATION PROFIL

  it('devrait modifier son compte utilisateur', async () => {
    const response = await request(app)
      .patch('/api/v1/users')
      .set(user.headers)
      .send({
          firstName: 'NouveauPrénom',
          lastName: 'NouveauNom'
      });

      const userId = response.body.data.id;
      expect(userId).toBe(user.user.id);
  
      const updated = await models.Users.findByPk(userId);
      expect(updated).not.toBeNull();
      expect(updated?.firstName).toBe(response.body.data.firstName);
      expect(updated?.lastName).toBe(response.body.data.lastName);
      expect(updated?.phone).toBe(user.user.phone);
      expect(updated?.email).toBe(user.user.email);

      expect(redis.del).toHaveBeenCalledWith('users:{}{}');
  });

  it('ne devrait pas modifier un utilisateur en etant non authentifié', async () => {
    const response = await request(app)
      .patch('/api/v1/users')
      .send({
          firstName: 'NouveauPrénom',
      });

    expect(response.status).toBe(401);
    const userInDb = await models.Users.findByPk(user.user.id);
    expect(userInDb?.firstName).toBe(user.user.firstName);
  });

  it('ne devrait pas modifier un utilisateur avec des donnees invalides', async () => {
    const response = await request(app)
      .patch('/api/v1/users')
      .set(user.headers)
      .send({
          firstName: '',
          lastName: '',
          email: 'emailinvalide',
          phone: '123'
      });

    expect(response.status).toBe(400);
    const userInDb = await models.Users.findByPk(user.user.id);
    expect(userInDb?.firstName).toBe(user.user.firstName);
    expect(userInDb?.lastName).toBe(user.user.lastName);
    expect(userInDb?.email).toBe(user.user.email);
    expect(userInDb?.phone).toBe(user.user.phone);
  });

  // TESTS MODIFICATION MOT DE PASSE

  it('devrait modifier le mot de passe de son compte utilisateur', async () => {
      const response = await request(app)
        .patch('/api/v1/users/password')
        .set(user.headers)
        .send({
            oldPassword: 'Test1234!',
            newPassword: 'newPassword123!',
            confirmPassword: 'newPassword123!'
        });

      expect(response.status).toBe(200);

      const loginResponse = await request(app)
        .post('/api/v1/auth/login')
        .send({
            email: user.user.email,
            password: 'newPassword123!'
        });

      expect(loginResponse.status).toBe(200);
  });

  it('ne devrait pas modifier le mot de passe de son compte utilisateur sans être authentifié', async () => {
      const response = await request(app)
        .patch('/api/v1/users/password')
        .send({
            oldPassword: 'Test1234!',
            newPassword: 'newPassword123!',
            confirmPassword: 'newPassword123!'
        });

      expect(response.status).toBe(401);

      const loginResponse = await request(app)
      .post('/api/v1/auth/login')
      .send({
          email: user.user.email,
          password: 'newPassword123!'
      });

      expect(loginResponse.status).toBe(401);
  });

  it('ne devrait pas modifier le mot de passe avec des donnees invalides', async () => {
      const response = await request(app)
        .patch('/api/v1/users/password')
        .set(user.headers)
        .send({
            oldPassword: 'Test1234!',
            newPassword: 'short',
            confirmPassword: 'short'
        });

      expect(response.status).toBe(400);
      
      const loginResponse = await request(app)
        .post('/api/v1/auth/login')
        .send({
            email: user.user.email,
            password: 'short'
        });
      
      expect(loginResponse.status).toBe(401);
  });

  it('ne devrait pas modifier le mot de passe si l\'ancien mot de passe est incorrect', async () => {
      const response = await request(app)
        .patch('/api/v1/users/password')
        .set(user.headers)
        .send({
            oldPassword: 'Wrong0ldPassword!',
            newPassword: 'newPassword123!',
            confirmPassword: 'newPassword123!'
        });
      expect(response.status).toBe(401);

      const loginResponse = await request(app)
        .post('/api/v1/auth/login')
        .send({
            email: user.user.email,
            password: 'newPassword123!'
        });
      
      expect(loginResponse.status).toBe(401);
  });

  it('ne devrait pas modifier le mot de passe si le nouveau mot de passe ne correspond pas a la confirmation', async () => {
      const response = await request(app)
        .patch('/api/v1/users/password')
        .set(user.headers)
        .send({
            oldPassword: 'Test1234!',
            newPassword: 'newPassword123!',
            confirmPassword: 'differentPassword123!'
        });
      expect(response.status).toBe(400);

      const loginResponse = await request(app)
        .post('/api/v1/auth/login')
        .send({
            email: user.user.email,
            password: 'newPassword123!'
        });
      
      expect(loginResponse.status).toBe(401);
  });

  // TESTS MODIFICATION PAR ADMIN (Méthode PATCH)

  it('devrait modifier le compte utilisateur par un administrateur', async () => {
    const response = await request(app)
      .patch(`/api/v1/users/${user.user.id}`) // Changement en .patch
      .set(auth.headers)
      .send({
          firstName: 'PrénomAdminModif',
          lastName: 'NomAdminModif',
          licence: 'LicenceAdminModif'
      });

    expect(response.status).toBe(200);
    
    const updated = await models.Users.findByPk(user.user.id);
    expect(updated?.firstName).toBe(response.body.data.firstName);
    expect(updated?.lastName).toBe(response.body.data.lastName);
    expect(updated?.licence).toBe(response.body.data.licence);
    expect(updated?.phone).toBe(user.user.phone);
    expect(updated?.email).toBe(user.user.email);
  });

  it('devrait modifier les roles de l\'utilisateur par un administrateur', async () => {
    const newRoles = [{ roleId: 2, categoryId: 2 }];

    const response = await request(app)
      .patch(`/api/v1/users/${user.user.id}`)
      .set(auth.headers)
      .send({
          rolesCategories: newRoles
      });

    expect(response.status).toBe(200);

    const rolesInDb = await models.UserRolesCategories.findAll({
        where: { userId: user.user.id }
    });
    expect(rolesInDb).toHaveLength(1);
    expect(Number(rolesInDb[0].roleId)).toBe(2);
    expect(Number(rolesInDb[0].categoryId)).toBe(2);
  });

  it('devrait desactiver un utilisateur par un administrateur', async () => {
    const response = await request(app)
      .patch(`/api/v1/users/${user.user.id}`)
      .set(auth.headers)
      .send({ isActive: false });

    expect(response.status).toBe(200);
    const updated = await models.Users.findByPk(user.user.id);
    expect(updated?.isActive).toBe(false);
    expect(updated?.refreshToken).toBeNull();
    expect(updated?.password).toBeNull();
  });

  it('devrait activer un utilisateur par un administrateur', async () => {
    await models.Users.update({ isActive: false, refreshToken: null, password: null }, { where: { id: user.user.id } });

    const response = await request(app)
      .patch(`/api/v1/users/${user.user.id}`)
      .set(auth.headers)
      .send({ isActive: true });

    expect(response.status).toBe(200);
    const updated = await models.Users.findByPk(user.user.id);
    expect(updated?.isActive).toBe(true);
  });

  it('devrait supprimer les photos de l\'utilisateur par un administrateur', async () => {
    await models.Users.update({ photo: 'path/to/photo.jpg', photo_celebration: 'path/to/photo_celebration.jpg' }, { where: { id: user.user.id } });

    const response = await request(app)
      .patch(`/api/v1/users/${user.user.id}`)
      .set(auth.headers)
      .send({ photo: 'DELETE', photo_celebration: 'DELETE' });

    expect(response.status).toBe(200);
    const updated = await models.Users.findByPk(user.user.id);
    expect(updated?.photo).toBeNull();
    expect(updated?.photo_celebration).toBeNull();
  });

  it('devrait ajouter les photos de l\'utilisateur par un administrateur', async () => {
    const response = await request(app)
      .patch(`/api/v1/users/${user.user.id}`)
      .set(auth.headers)
      .attach('photo', Buffer.from('fake-image-content'), 'test.png')
      .attach('photo_celebration', Buffer.from('fake-image-content'), 'test_celebration.png');

      if (response.status !== 200) {
  console.log("Corps de l'erreur reçue :", response.body);
}
    expect(response.status).toBe(200);
    const updated = await models.Users.findByPk(user.user.id);
    expect(updated?.photo).toMatch(/\/uploads\/.*\.png/);
    expect(updated?.photo_celebration).toMatch(/\/uploads\/.*\.png/);
  });

  it('ne devrait pas modifier le compte par un administrateur si l\'utilisateur n\'existe pas', async () => {
    const response = await request(app)
      .patch('/api/v1/users/999999')
      .set(auth.headers)
      .send({ firstName: 'Inexistant' });

    expect(response.status).toBe(404);
  });

  it('ne devrait pas modifier son propre compte admin via cette route', async () => {
    const response = await request(app)
      .patch(`/api/v1/users/${auth.user.id}`)
      .set(auth.headers)
      .send({ firstName: 'TentativeSelfModif' });

    expect(response.status).toBe(403);
    expect(response.body.message).toMatch(/propre compte/i);
  });
});