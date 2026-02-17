import { describe, it, expect, beforeEach } from 'vitest';
import request from 'supertest';
import { app } from '../../app.js';
import { getCoachToken, getPlayerToken, getMemberToken } from '../utils/auth.helper.js';
import redis from '../../config/redisClient.js'
import models from '../../models/index.js';

describe('Teams API', () => {
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

  it('devrait modifier une convocation et purger le cache', async () => {
    const { team } = await createTestTeam();
    const { convocation, player } = await createTestConvocation(team.id);

    const res = await request(app)
      .patch(`/api/v1/convocations/${convocation.id}`)
      .set(authHeaders)
      .send({
        matchDate: '2024-07-02',
        matchHour: '16:00:00',
        convocationHour: '15:00:00',
        location: 'Stade Municipal updated'
      });

    expect(res.status).toBe(200);
    const convocationId = res.body.data.convocation.id;
    expect(convocationId).toBe(convocation.id);

    const updated = await models.Convocations.findByPk(convocationId);
    expect(updated).not.toBeNull();
    expect(updated?.matchDate).toBe(res.body.data.convocation.matchDate);
    expect(updated?.matchHour).toBe(res.body.data.convocation.matchHour);
    expect(updated?.convocationHour).toBe(res.body.data.convocation.convocationHour);
    expect(updated?.location).toBe(res.body.data.convocation.location);
    expect(updated?.teamId).toBe(convocation.teamId);

    const playerInConvocation = res.body.data.players.find((p: any) => p.id === player.user.id);
    expect(playerInConvocation).toBeDefined();
    expect(playerInConvocation.firstName).toBe(player.user.firstName);
    expect(playerInConvocation.lastName).toBe(player.user.lastName);

    const playerConvocation = await models.UsersConvocation.findOne({
      where: {
        userId: player.user.id,
        convocationId: convocationId,
      } as any,
    });
    expect(playerConvocation).not.toBeNull();

    expect(redis.del).toHaveBeenCalledWith('convocations:{}{}');
  });

  it('devrait modifier une convocation, lier la team et purger le cache', async () => {
    const { team } = await createTestTeam();
    const { convocation } = await createTestConvocation(team.id);
    

    expect(redis.del).toHaveBeenCalledWith('teams:{}{}');
  });

  it('devrait modifier une convocation, lier les joueurs et purger le cache', async () => {
    const { team } = await createTestTeam();
    const { convocation } = await createTestConvocation(team.id);

    expect(redis.del).toHaveBeenCalledWith('teams:{}{}');
  });

  it('ne devrait pas modifié une convocation avec un utilisateur non authentifié', async () => {
    const {team} = await createTestTeam();
    const {convocation} = await createTestConvocation(team.id);

    const res = await request(app)
      .patch(`/api/v1/convocations/${convocation.id}`)
      .send({matchDate: '2024-07-03'});

    if (res.status !== 401) {
      console.error('Response body:', res.body);
    }
    expect(res.status).toBe(401);
    const convocationInDb = await models.Convocations.findByPk(convocation.id);
    expect(convocationInDb?.matchDate).not.toBe('2024-07-03');
    expect(convocationInDb?.matchDate).toBe(convocation.matchDate);
  });

  it('ne devrait pas modifié une convocation avec un utilisateur non autorisé', async () => {
    const {team} = await createTestTeam();
    const {convocation} = await createTestConvocation(team.id);

    const playerAuth = await getPlayerToken();

    const res = await request(app)
      .patch(`/api/v1/convocations/${convocation.id}`)
      .set(playerAuth.headers)
      .send({matchDate: '2024-07-04'});

    if (res.status !== 403) {
      console.error('Response body:', res.body);
    }
    expect(res.status).toBe(403);
    const convocationInDb = await models.Convocations.findByPk(convocation.id);
    expect(convocationInDb?.matchDate).not.toBe('2024-07-04');
    expect(convocationInDb?.matchDate).toBe(convocation.matchDate);
  });

  it('ne devrait pas modifié une convocation avec un utilisateur non coach de la team', async () => {
    const {team} = await createTestTeam();
    const {convocation} = await createTestConvocation(team.id);

    
  });

  it('ne devrait pas modifier une convocation avec un body invalide', async () => {
    const {team} = await createTestTeam();
    const {convocation} = await createTestConvocation(team.id);
    
  });

  it('ne devrait pas modifier une convocation avec une team inexistante', async () => {
    const {team} = await createTestTeam();
    const {convocation} = await createTestConvocation(team.id);

  });

  it('ne devrait pas modifier une convocation avec une des joueurs inexistants', async () => {
    const {team} = await createTestTeam();
    const {convocation} = await createTestConvocation(team.id);

  });

  it('ne devrait pas modifier une convocation inexistante', async () => {
    const convocationId = 9999;
    
    const res = await request(app)
      .patch(`/api/v1/convocations/${convocationId}`)
      .set(authHeaders)
      .send({matchDate: '2024-07-05'});

    if (res.status !== 404) {
      console.error('Response body:', res.body);
    }

    expect(res.status).toBe(404);
  });
});