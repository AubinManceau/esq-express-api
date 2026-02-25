import path from 'node:path';
import { z } from 'zod';

const passwordValidation = new RegExp(
  /^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%^&*(),.?":{}|<>]).+$/
);

export const updateUserSchema = z.object({
    email: z.email().optional(),
    phone: z.string().regex(/^\d{10}$/).optional(),
    firstName: z.string().min(1).optional(),
    lastName: z.string().min(1).optional(),
});

export const updateUserPasswordSchema = z
.object({
    oldPassword: z.string().min(8).regex(passwordValidation),
    newPassword: z.string().min(8).regex(passwordValidation),
    confirmPassword: z.string().min(8).regex(passwordValidation),
})
.refine((data) => data.newPassword === data.confirmPassword, {
    path: ['confirmPassword'],
});

