import { describe, it, expect, beforeAll } from 'vitest';
import request from 'supertest';
import { app } from '../../app.js';
import { getCoachToken, getMemberToken } from '../utils/auth.helper.js';
import models from '../../models/index.js';

describe('Teams API', () => {
  let authHeaders: { Cookie: string };

  beforeAll(async () => {
    const auth = await getMemberToken();
    authHeaders = auth.headers;
  });
    
  const createTestTeam = async (overrides = {}) => {
    const coach = await getCoachToken();
    const team = await models.Teams.create({
        name: 'team A',
        division: 'division A',
        categoryId: 1,
        ...overrides
    });
    const coachInTeam = await models.UsersCoachTeam.create({
      userCoachId: coach.user.id,
      teamId: team.id,
    });
    return { team, coachInTeam };
  };

  it('devrait afficher toutes les teams', async () => {
    const {team} = await createTestTeam();

    const res = await request(app)
      .get('/api/v1/teams')
      .set(authHeaders)

    if (res.status !== 200) {
      console.error('Response body:', res.body);
    }

    expect(res.status).toBe(200);
    expect(res.body.status).toBe('success');
    expect(Array.isArray(res.body.data)).toBe(true);

    const categoryData = res.body.data.find((cat: any) => 
        cat.Teams && cat.Teams.some((t: any) => t.id === team.id)
    );

    expect(categoryData).toBeDefined();
    expect(categoryData.id).toBe(team.categoryId);

    const teamInRes = categoryData.Teams.find((t: any) => t.id === team.id);
    
    expect(teamInRes.name).toBe(team.name);
    expect(teamInRes.division).toBe(team.division);

    expect(Array.isArray(teamInRes.Users)).toBe(true);
    expect(teamInRes.Users.length).toBe(1);
    
    const coach = teamInRes.Users[0];
    expect(coach).toHaveProperty('firstName');
    expect(coach).toHaveProperty('lastName');
  });

  it('devrait afficher toutes les teams de la catégorie', async () => {
    const {team} = await createTestTeam();

    const res = await request(app)
      .get(`/api/v1/teams?_category=${team.categoryId}`)
      .set(authHeaders)

    if (res.status !== 200) {
      console.error('Response body:', res.body);
    }

    expect(res.status).toBe(200);
    expect(res.body.status).toBe('success');
    expect(Array.isArray(res.body.data)).toBe(true);

    const categoryData = res.body.data.find((cat: any) => 
        cat.Teams && cat.Teams.some((t: any) => t.id === team.id)
    );

    expect(categoryData).toBeDefined();
    expect(categoryData.id).toBe(team.categoryId);

    const teamInRes = categoryData.Teams.find((t: any) => t.id === team.id);
    
    expect(teamInRes.name).toBe(team.name);
    expect(teamInRes.division).toBe(team.division);
    expect(Array.isArray(teamInRes.Users)).toBe(true);
    expect(teamInRes.Users.length).toBe(1);
    
    const coach = teamInRes.Users[0];
    expect(coach).toHaveProperty('firstName');
    expect(coach).toHaveProperty('lastName');
  });

  it('ne devrait pas afficher toutes les teams de la catégorie inexistante', async () => {
    const res = await request(app)
      .get('/api/v1/teams?_category=9999')
      .set(authHeaders)

    if (res.status !== 404) {
      console.error('Response body:', res.body);
    }

    expect(res.status).toBe(404);
  });

  it('ne devrait pas afficher toutes les teams avec un utilisateur non authentifié', async () => {
    const res = await request(app)
      .get(`/api/v1/teams`)

    if (res.status !== 401) {
      console.error('Response body:', res.body);
    }
    expect(res.status).toBe(401);
  });

  it('ne devrait pas afficher toutes les teams avec un utilisateur non autorisé', async () => {
    const coachAuth = await getCoachToken();

    const res = await request(app)
      .get(`/api/v1/teams`)
      .set(coachAuth.headers)

    if (res.status !== 403) {
      console.error('Response body:', res.body);
    }
    expect(res.status).toBe(403);
  });

  it('devrait afficher la team', async () => {
    const { team } = await createTestTeam();

    const res = await request(app)
      .get(`/api/v1/teams/${team.id}`)
      .set(authHeaders)

    if (res.status !== 200) {
      console.error('Response body:', res.body);
    }

    expect(res.status).toBe(200);
    expect(res.body.status).toBe('success');

    const teamInRes = res.body.data.team;
    expect(teamInRes).toBeDefined();

    expect(teamInRes.id).toBe(team.id);
    expect(teamInRes.name).toBe(team.name);
    expect(teamInRes.division).toBe(team.division);
    
    expect(teamInRes.Category).toBeDefined();
    expect(teamInRes.Category.id).toBe(team.categoryId);
    expect(teamInRes.Category).toHaveProperty('name');

    expect(Array.isArray(teamInRes.Users)).toBe(true);
    expect(teamInRes.Users.length).toBe(1);
    
    const coach = teamInRes.Users[0];
    expect(coach).toHaveProperty('firstName');
    expect(coach).toHaveProperty('lastName');
  });

  it('ne devrait pas afficher un training inexistant', async () => {
    const trainingId = 9999;

    const res = await request(app)
      .get(`/api/v1/teams/${trainingId}`)
      .set(authHeaders)

    if (res.status !== 404) {
      console.error('Response body:', res.body);
    }

    expect(res.status).toBe(404);
    expect(res.body.status).toBe('error');
  });

  it('ne devrait pas afficher le training avec un utilisateur non authentifié', async () => {
    const { team } = await createTestTeam();

    const res = await request(app)
      .get(`/api/v1/teams/${team.id}`)

    if (res.status !== 401) {
      console.error('Response body:', res.body);
    }
    expect(res.status).toBe(401);
  });
});