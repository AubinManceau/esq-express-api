import { z } from 'zod';

export const createArticleSchema = z.object({
  title: z.string().min(1),
  content: z.string().min(1),
  status: z.enum(['draft', 'published', 'archived']),
});

export const updateArticleSchema = z.object({
  title: z.string().min(1).optional(),
  content: z.string().min(1).optional(),
  status: z.enum(['draft', 'published', 'archived']).optional(),
});
