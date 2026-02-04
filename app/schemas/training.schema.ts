import { z } from 'zod';

export const createTrainingSchema = z.object({
  type: z.enum(['training', 'match']),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  startTime: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]:[0-5][0-9]$/),
  status: z.enum(['active', 'canceled']).optional(),
  categoryId: z.number().int().positive(),
});

export const updateTrainingInput = z.object({
  type: z.enum(['training', 'match']).optional(),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  startTime: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]:[0-5][0-9]$/).optional(),
  status: z.enum(['active', 'canceled']).optional(),
  categoryId: z.number().int().positive().optional(),
});
