import { z } from 'zod';

export const createConvocationSchema = z.object({
  matchDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  matchHour: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]:[0-5][0-9]$/),
  convocationHour: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]:[0-5][0-9]$/),
  location: z.string().min(1),
  teamId: z.number().positive(),
  userPlayerIds: z.array(z.number().positive()).min(1),
});

export const updateConvocationSchema = z.object({
  matchDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  matchHour: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]:[0-5][0-9]$/).optional(),
  convocationHour: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]:[0-5][0-9]$/).optional(),
  location: z.string().min(1).optional(),
  teamId: z.number().positive().optional(),
  userPlayerIds: z.array(z.number().positive()).min(1).optional(),
});
