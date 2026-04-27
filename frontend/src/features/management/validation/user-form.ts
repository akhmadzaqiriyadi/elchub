import { z } from 'zod';

export const userFormSchema = z.object({
  name: z.string().optional().default(''),
  email: z
    .string()
    .email('Invalid email address')
    .describe('Email must be valid and unique'),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .describe('Password must be at least 8 characters'),
  confirmPassword: z
    .string()
    .min(8, 'Password must be at least 8 characters'),
  role: z
    .enum(['USER', 'ORGANIZER', 'MENTOR', 'ADMIN'])
    .default('USER'),
  isActive: z.boolean().default(true),
}).refine((data) => data.password === data.confirmPassword, {
  message: 'Passwords do not match',
  path: ['confirmPassword'],
});

export const userUpdateFormSchema = z.object({
  name: z.string().optional().default(''),
  email: z
    .string()
    .email('Invalid email address')
    .optional(),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .optional()
    .or(z.literal('')),
  confirmPassword: z
    .string()
    .optional()
    .or(z.literal('')),
  role: z
    .enum(['USER', 'ORGANIZER', 'MENTOR', 'ADMIN'])
    .optional(),
  isActive: z.boolean().optional(),
}).refine(
  (data) => {
    if (data.password && !data.confirmPassword) return false;
    if (!data.password && data.confirmPassword) return false;
    if (data.password && data.confirmPassword && data.password !== data.confirmPassword) {
      return false;
    }
    return true;
  },
  {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  },
);

export type UserFormInput = z.infer<typeof userFormSchema>;
export type UserUpdateFormInput = z.infer<typeof userUpdateFormSchema>;
