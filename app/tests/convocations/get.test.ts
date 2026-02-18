import { describe, it, expect, beforeEach } from 'vitest';
import request from 'supertest';
import { app } from '../../app.js';
import { getCoachToken, getPlayerToken } from '../utils/auth.helper.js';
import models from '../../models/index.js';

describe('Convocations API', () => {
  let authHeaders: { Cookie: string };
  let coach: { user: any };

  beforeEach(async () => {
    const auth = await getCoachToken();
    authHeaders = auth.headers;
    coach = auth;
  });

  const createTestTeam = async (overrides = {}) => {
    const team = await models.Teams.create({
        name: 'team A',
        division: 'division A',
        categoryId: 1,
        ...overrides
    });
    const coachInTeam = await models.UsersCoachTeam.create({
      userCoachId: coach.user.id,
      teamId: team.id,
      ...overrides
    });
    return { team, coachInTeam };
  };

  const createTestConvocation = async (teamId: number, overrides = {}) => {
    const player = await getPlayerToken();
    const convocation = await models.Convocations.create({
        matchDate: '2024-07-01',
        matchHour: '15:00:00',
        convocationHour: '14:00:00',
        location: 'Stade Municipal',
        teamId,
        ...overrides
    });
    
    await models.UsersConvocation.create({
        userId: player.user.id,
        convocationId: convocation.id
    });
    return { convocation, player };
  }

  it('devrait afficher toutes les convocations', async () => {
    const { team } = await createTestTeam();
    const { convocation, player } = await createTestConvocation(team.id);

    const res = await request(app)
        .get('/api/v1/convocations')
        .set(authHeaders);

    if (res.status !== 200) {
        console.error('Response body:', res.body);
    }

    expect(res.status).toBe(200);
    expect(res.body.status).toBe('success');
    expect(Array.isArray(res.body.data.convocations)).toBe(true);

    const convocationInRes = res.body.data.convocations.find((c: any) => c.id === convocation.id);
    expect(convocationInRes).toBeDefined();
    expect(convocationInRes.matchDate).toBe(convocation.matchDate);
    expect(convocationInRes.matchHour).toBe(convocation.matchHour);
    expect(convocationInRes.convocationHour).toBe(convocation.convocationHour);
    expect(convocationInRes.location).toBe(convocation.location);
    expect(convocationInRes.teamId).toBe(team.id);

    expect(convocationInRes.Team).toBeDefined();
    expect(convocationInRes.Team.id).toBe(team.id);
    expect(convocationInRes.Team.name).toBe(team.name);

    expect(Array.isArray(convocationInRes.Users)).toBe(true);
    const playerInRes = convocationInRes.Users.find((u: any) => u.id === player.user.id);
    expect(playerInRes).toBeDefined();
    expect(playerInRes.firstName).toBe(player.user.firstName);
    expect(playerInRes.lastName).toBe(player.user.lastName);
  }); 

  it('devrait afficher toutes les convocations de la catégorie', async () => {
    const { team } = await createTestTeam();
    const { convocation, player } = await createTestConvocation(team.id);

    const res = await request(app)
      .get(`/api/v1/convocations?_category=${team.categoryId}`)
      .set(authHeaders);

    if (res.status !== 200) console.error('Response body:', res.body);

    expect(res.status).toBe(200);
    expect(res.body.status).toBe('success');
    expect(Array.isArray(res.body.data.convocations)).toBe(true);

    const convocationInRes = res.body.data.convocations.find((c: any) => c.id === convocation.id);
    expect(convocationInRes).toBeDefined();
    expect(convocationInRes.teamId).toBe(team.id);

    expect(convocationInRes.Team).toBeDefined();
    expect(convocationInRes.Team.id).toBe(team.id);
    expect(convocationInRes.Team.name).toBe(team.name);

    expect(Array.isArray(convocationInRes.Users)).toBe(true);
    const playerInRes = convocationInRes.Users.find((u: any) => u.id === player.user.id);
    expect(playerInRes).toBeDefined();
    expect(playerInRes.firstName).toBe(player.user.firstName);
    expect(playerInRes.lastName).toBe(player.user.lastName);
  });

  it('devrait afficher la convocation la plus récente de chaque équipe de la catégorie', async () => {
    const { team } = await createTestTeam();
    const { convocation: old } = await createTestConvocation(team.id, { matchDate: '2024-05-30' });
    const { convocation: latest, player } = await createTestConvocation(team.id);

    const res = await request(app)
      .get(`/api/v1/convocations?_category=${team.categoryId}&_date=2024-06-30`)
      .set(authHeaders);

    if (res.status !== 200) console.error('Response body:', res.body);

    expect(res.status).toBe(200);
    expect(res.body.status).toBe('success');
    expect(Array.isArray(res.body.data.convocations)).toBe(true);

    const convocationsForTeam = res.body.data.convocations.filter((c: any) => c.teamId === team.id);
    expect(convocationsForTeam.length).toBe(1);
    expect(convocationsForTeam[0].id).toBe(latest.id);

    const oldInRes = res.body.data.convocations.find((c: any) => c.id === old.id);
    expect(oldInRes).toBeUndefined();

    expect(convocationsForTeam[0].Team).toBeDefined();
    expect(convocationsForTeam[0].Team.id).toBe(team.id);

    expect(Array.isArray(convocationsForTeam[0].Users)).toBe(true);
    const playerInRes = convocationsForTeam[0].Users.find((u: any) => u.id === player.user.id);
    expect(playerInRes).toBeDefined();
  });

  it('ne devrait pas afficher les convocations d\'une catégorie inexistante', async () => {
    const res = await request(app)
      .get('/api/v1/convocations?_category=9999')
      .set(authHeaders);

    if (res.status !== 404) console.error('Response body:', res.body);

    expect(res.status).toBe(404);
    expect(res.body.status).toBe('error');
  });

  it('ne devrait pas afficher les convocations avec une date sans résultat', async () => {
    const { team } = await createTestTeam();
    await createTestConvocation(team.id);

    const res = await request(app)
      .get('/api/v1/convocations?_date=2024-08-01')
      .set(authHeaders);

    if (res.status !== 404) console.error('Response body:', res.body);

    expect(res.status).toBe(404);
    expect(res.body.status).toBe('error');
  });
  
  it('ne devrait pas afficher toutes les convocations avec un paramètre invalide', async () => {
    const res = await request(app)
      .get('/api/v1/convocations?_category=invalid&_date=invalid')
      .set(authHeaders)

    if (res.status !== 400) {
      console.error('Response body:', res.body);
    }

    expect(res.status).toBe(400);
  });

  it('ne devrait pas afficher toutes les convocations avec un utilisateur non authentifié', async () => {
    const res = await request(app)
      .get(`/api/v1/convocations`)

    if (res.status !== 401) {
      console.error('Response body:', res.body);
    }
    expect(res.status).toBe(401);
  });

  it('ne devrait pas afficher toutes les convocations avec un utilisateur non autorisé', async () => {
    const playerAuth = await getPlayerToken();

    const res = await request(app)
      .get(`/api/v1/convocations`)
      .set(playerAuth.headers)

    if (res.status !== 403) {
      console.error('Response body:', res.body);
    }
    expect(res.status).toBe(403);
  });

  it('devrait afficher la convocation', async () => {
    const { team } = await createTestTeam();
    const { convocation, player } = await createTestConvocation(team.id);

    const res = await request(app)
      .get(`/api/v1/convocations/${convocation.id}`)
      .set(authHeaders);

    if (res.status !== 200) console.error('Response body:', res.body);

    expect(res.status).toBe(200);
    expect(res.body.status).toBe('success');
    expect(res.body.data.convocation).toBeDefined();
    expect(res.body.data.convocation.id).toBe(convocation.id);
    expect(res.body.data.convocation.matchDate).toBe(convocation.matchDate);
    expect(res.body.data.convocation.matchHour).toBe(convocation.matchHour);
    expect(res.body.data.convocation.convocationHour).toBe(convocation.convocationHour);
    expect(res.body.data.convocation.location).toBe(convocation.location);
    expect(res.body.data.convocation.teamId).toBe(convocation.teamId);

    expect(res.body.data.convocation.Team).toBeDefined();
    expect(res.body.data.convocation.Team.id).toBe(team.id);
    expect(res.body.data.convocation.Team.name).toBe(team.name);

    expect(Array.isArray(res.body.data.convocation.Users)).toBe(true);
    const playerInRes = res.body.data.convocation.Users.find((u: any) => u.id === player.user.id);
    expect(playerInRes).toBeDefined();
    expect(playerInRes.firstName).toBe(player.user.firstName);
    expect(playerInRes.lastName).toBe(player.user.lastName);
  });

  it('ne devrait pas afficher une convocation inexistante', async () => {
    const teamId = 9999;

    const res = await request(app)
      .get(`/api/v1/convocations/${teamId}`)
      .set(authHeaders)

    if (res.status !== 404) {
      console.error('Response body:', res.body);
    }

    expect(res.status).toBe(404);
    expect(res.body.status).toBe('error');
  });

  it('ne devrait pas afficher une convocation avec un utilisateur non authentifié', async () => {
    const { team } = await createTestTeam();

    const res = await request(app)
      .get(`/api/v1/convocations/${team.id}`)

    if (res.status !== 401) {
      console.error('Response body:', res.body);
    }
    expect(res.status).toBe(401);
  });
});