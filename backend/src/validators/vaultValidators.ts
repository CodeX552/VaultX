import { z } from 'zod';

export const vaultCategorySchema = z.enum(['SOCIAL', 'BANK', 'WORK', 'SHOPPING', 'EDUCATION', 'CUSTOM']);

export const createVaultSchema = z.object({
  website: z.string().trim().min(1).max(255),
  username: z.string().trim().min(1).max(255),
  email: z.string().trim().email(),
  password: z.string().min(1, 'Password is required'),
  notes: z.string().trim().max(2000).optional().nullable(),
  category: vaultCategorySchema.default('CUSTOM')
});

export const updateVaultSchema = z.object({
  website: z.string().trim().min(1).max(255).optional(),
  username: z.string().trim().min(1).max(255).optional(),
  email: z.string().trim().email().optional(),
  password: z.string().min(1).optional(),
  notes: z.string().trim().max(2000).optional().nullable(),
  category: vaultCategorySchema.optional()
});

export const vaultQuerySchema = z.object({
  search: z.string().trim().optional(),
  category: vaultCategorySchema.optional()
});

export const vaultIdParamsSchema = z.object({
  id: z.string().min(1)
});

export type CreateVaultInput = z.infer<typeof createVaultSchema>;
export type UpdateVaultInput = z.infer<typeof updateVaultSchema>;
export type VaultQueryInput = z.infer<typeof vaultQuerySchema>;
