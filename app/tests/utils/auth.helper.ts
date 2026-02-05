import models from '../../models/index.js';
import request from 'supertest';
import { app } from '../../app.js';
import bcrypt from 'bcryptjs';

export const getAdminToken = async () => {
  const admin = await models.Users.findOne({
    include: [{
      model: models.UserRolesCategories,
      include: [{
        model: models.Roles,
        where: { id: 4 }
      }]
    }]
  });

  if (!admin) {
    throw new Error("SuperAdmin non trouvé en base. Vérifie ton seeding.");
  }

  const loginAdmin = await request(app)
    .post('/api/v1/auth/login')
    .set('Content-Type', 'application/json')
    .set('Accept', 'application/json')
    .send({
      email: admin.email,
      password: process.env.ADMIN_PASSWORD
    });

  if (loginAdmin.status !== 200) {
    console.log("DEBUG LOGIN BODY:", loginAdmin.body);
    throw new Error(`Login admin failed: ${loginAdmin.body.message}`);
  }

  const adminToken = loginAdmin.body.data.token;

  const userEmail = `test-${Date.now()}@example.com`;
  const signupRes = await request(app)
    .post('/api/v1/auth/signup')
    .set('Content-Type', 'application/json')
    .set('Accept', 'application/json')
    .set('Cookie', [`token=${adminToken}`])
    .send({
      firstName: 'Test',
      lastName: 'User',
      email: userEmail,
      rolesCategories: [{ roleId: 4 }]
    });

  if (signupRes.status !== 201) {
    console.error('Erreur lors du signup de test:', signupRes.body);
    throw new Error(`Signup failed: ${signupRes.body.message}`);
  }

  const newUserId = signupRes.body.data.user.id;
  const password = 'Test1234!';

  const hashedPassword = await bcrypt.hash(password, 10);
  await models.Users.update({ isActive: true, password: hashedPassword }, { where: { id: newUserId } });

  const loginRes = await request(app)
    .post('/api/v1/auth/login')
    .set('Content-Type', 'application/json')
    .set('Accept', 'application/json')
    .send({
      email: userEmail,
      password: password
    });

  if (loginRes.status !== 200) {
    throw new Error(`User login failed: ${loginRes.body.message}`);
  }

  return {
    token: loginRes.body.data.token,
    user: loginRes.body.data.user,
    headers: { Cookie: `token=${loginRes.body.data.token}` }
  };
};

export const getPlayerToken = async () => {
  const admin = await models.Users.findOne({
    include: [{
      model: models.UserRolesCategories,
      include: [{
        model: models.Roles,
        where: { id: 4 }
      }]
    }]
  });

  if (!admin) {
    throw new Error("SuperAdmin non trouvé en base. Vérifie ton seeding.");
  }

  const loginAdmin = await request(app)
    .post('/api/v1/auth/login')
    .set('Content-Type', 'application/json')
    .set('Accept', 'application/json')
    .send({
      email: admin.email,
      password: process.env.ADMIN_PASSWORD
    });

  if (loginAdmin.status !== 200) {
    console.log("DEBUG LOGIN BODY:", loginAdmin.body);
    throw new Error(`Login admin failed: ${loginAdmin.body.message}`);
  }

  const adminToken = loginAdmin.body.data.token;

  const userEmail = `test-${Date.now()}@example.com`;
  const signupRes = await request(app)
    .post('/api/v1/auth/signup')
    .set('Content-Type', 'application/json')
    .set('Accept', 'application/json')
    .set('Cookie', [`token=${adminToken}`])
    .send({
      firstName: 'Test',
      lastName: 'User',
      email: userEmail,
      rolesCategories: [{ roleId: 1, categoryId: 1 }]
    });

  if (signupRes.status !== 201) {
    console.error('Erreur lors du signup de test:', signupRes.body);
    throw new Error(`Signup failed: ${signupRes.body.message}`);
  }

  const newUserId = signupRes.body.data.user.id;
  const password = 'Test1234!';

  const hashedPassword = await bcrypt.hash(password, 10);
  await models.Users.update({ isActive: true, password: hashedPassword }, { where: { id: newUserId } });

  const loginRes = await request(app)
    .post('/api/v1/auth/login')
    .set('Content-Type', 'application/json')
    .set('Accept', 'application/json')
    .send({
      email: userEmail,
      password: password
    });

  if (loginRes.status !== 200) {
    throw new Error(`User login failed: ${loginRes.body.message}`);
  }

  return {
    token: loginRes.body.data.token,
    user: loginRes.body.data.user,
    headers: { Cookie: `token=${loginRes.body.data.token}` }
  };
};

export const getCoachToken = async () => {
  const admin = await models.Users.findOne({
    include: [{
      model: models.UserRolesCategories,
      include: [{
        model: models.Roles,
        where: { id: 4 }
      }]
    }]
  });

  if (!admin) {
    throw new Error("SuperAdmin non trouvé en base. Vérifie ton seeding.");
  }

  const loginAdmin = await request(app)
    .post('/api/v1/auth/login')
    .set('Content-Type', 'application/json')
    .set('Accept', 'application/json')
    .send({
      email: admin.email,
      password: process.env.ADMIN_PASSWORD
    });

  if (loginAdmin.status !== 200) {
    console.log("DEBUG LOGIN BODY:", loginAdmin.body);
    throw new Error(`Login admin failed: ${loginAdmin.body.message}`);
  }

  const adminToken = loginAdmin.body.data.token;

  const userEmail = `test-${Date.now()}@example.com`;
  const signupRes = await request(app)
    .post('/api/v1/auth/signup')
    .set('Content-Type', 'application/json')
    .set('Accept', 'application/json')
    .set('Cookie', [`token=${adminToken}`])
    .send({
      firstName: 'Test',
      lastName: 'User',
      email: userEmail,
      rolesCategories: [{ roleId: 2, categoryId: 1 }]
    });

  if (signupRes.status !== 201) {
    console.error('Erreur lors du signup de test:', signupRes.body);
    throw new Error(`Signup failed: ${signupRes.body.message}`);
  }

  const newUserId = signupRes.body.data.user.id;
  const password = 'Test1234!';

  const hashedPassword = await bcrypt.hash(password, 10);
  await models.Users.update({ isActive: true, password: hashedPassword }, { where: { id: newUserId } });

  const loginRes = await request(app)
    .post('/api/v1/auth/login')
    .set('Content-Type', 'application/json')
    .set('Accept', 'application/json')
    .send({
      email: userEmail,
      password: password
    });

  if (loginRes.status !== 200) {
    throw new Error(`User login failed: ${loginRes.body.message}`);
  }

  return {
    token: loginRes.body.data.token,
    user: loginRes.body.data.user,
    headers: { Cookie: `token=${loginRes.body.data.token}` }
  };
};

export const getMemberToken = async () => {
  const admin = await models.Users.findOne({
    include: [{
      model: models.UserRolesCategories,
      include: [{
        model: models.Roles,
        where: { id: 4 }
      }]
    }]
  });

  if (!admin) {
    throw new Error("SuperAdmin non trouvé en base. Vérifie ton seeding.");
  }

  const loginAdmin = await request(app)
    .post('/api/v1/auth/login')
    .set('Content-Type', 'application/json')
    .set('Accept', 'application/json')
    .send({
      email: admin.email,
      password: process.env.ADMIN_PASSWORD
    });

  if (loginAdmin.status !== 200) {
    console.log("DEBUG LOGIN BODY:", loginAdmin.body);
    throw new Error(`Login admin failed: ${loginAdmin.body.message}`);
  }

  const adminToken = loginAdmin.body.data.token;

  const userEmail = `test-${Date.now()}@example.com`;
  const signupRes = await request(app)
    .post('/api/v1/auth/signup')
    .set('Content-Type', 'application/json')
    .set('Accept', 'application/json')
    .set('Cookie', [`token=${adminToken}`])
    .send({
      firstName: 'Test',
      lastName: 'User',
      email: userEmail,
      rolesCategories: [{ roleId: 3 }]
    });

  if (signupRes.status !== 201) {
    console.error('Erreur lors du signup de test:', signupRes.body);
    throw new Error(`Signup failed: ${signupRes.body.message}`);
  }

  const newUserId = signupRes.body.data.user.id;
  const password = 'Test1234!';

  const hashedPassword = await bcrypt.hash(password, 10);
  await models.Users.update({ isActive: true, password: hashedPassword }, { where: { id: newUserId } });

  const loginRes = await request(app)
    .post('/api/v1/auth/login')
    .set('Content-Type', 'application/json')
    .set('Accept', 'application/json')
    .send({
      email: userEmail,
      password: password
    });

  if (loginRes.status !== 200) {
    throw new Error(`User login failed: ${loginRes.body.message}`);
  }

  return {
    token: loginRes.body.data.token,
    user: loginRes.body.data.user,
    headers: { Cookie: `token=${loginRes.body.data.token}` }
  };
};