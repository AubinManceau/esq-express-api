import { z } from 'zod';

export const createTeamSchema = z.object({
  name: z.string().min(1),
  division: z.string().min(1),
  categoryId: z.number().int().positive(),
  userCoachIds: z.array(z.number().int().positive()).optional(),
});

export const updateTeamSchema = z.object({
  name: z.string().min(1).optional(),
  division: z.string().min(1).optional(),
  categoryId: z.number().int().positive().optional(),
  userCoachIds: z.array(z.number().int().positive()).optional(),
});
