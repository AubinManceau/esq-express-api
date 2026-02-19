import { z } from 'zod';

export const deleteUserSchema = z.object({
  userId: z.coerce.number().int().positive()
});
