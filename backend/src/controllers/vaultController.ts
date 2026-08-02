import { type Request, type Response } from 'express';
import { AppError } from '../middleware/errorHandler';
import { createVaultSchema, vaultIdParamsSchema, vaultQuerySchema, updateVaultSchema } from '../validators/vaultValidators';
import { createVault, exportVaultCsv, getVaultPassword, getVaultPasswordHistory, importVaultCsv, listVault, removeVault, updateVault } from '../services/vaultService';

function requireUserId(request: Request) {
  // Har protected vault action se pehle user context chahiye hota hai.
  if (!request.auth?.userId) {
    throw new AppError('Unauthorized', 401);
  }

  return request.auth.userId;
}

export async function getVaultItems(request: Request, response: Response): Promise<void> {
  // Query params validate karke filtered vault list return karte hain.
  const userId = requireUserId(request);
  const parsed = vaultQuerySchema.safeParse(request.query);

  if (!parsed.success) {
    throw new AppError('Validation failed', 400);
  }

  const vaultItems = await listVault(userId, parsed.data);
  response.json({ success: true, data: vaultItems });
}

export async function addVaultItem(request: Request, response: Response): Promise<void> {
  // Naya encrypted vault entry create hota hai.
  const userId = requireUserId(request);
  const parsed = createVaultSchema.safeParse(request.body);

  if (!parsed.success) {
    throw new AppError('Validation failed', 400);
  }

  const vaultItem = await createVault(userId, parsed.data);
  response.status(201).json({ success: true, data: vaultItem });
}

export async function editVaultItem(request: Request, response: Response): Promise<void> {
  // Existing entry update aur password rotation dono yahan handle hote hain.
  const userId = requireUserId(request);
  const params = vaultIdParamsSchema.safeParse(request.params);
  const body = updateVaultSchema.safeParse(request.body);

  if (!params.success || !body.success) {
    throw new AppError('Validation failed', 400);
  }

  const vaultItem = await updateVault(userId, params.data.id, body.data);
  response.json({ success: true, data: vaultItem });
}

export async function deleteVaultItem(request: Request, response: Response): Promise<void> {
  // Sirf owner apni entry delete kar sakta hai.
  const userId = requireUserId(request);
  const params = vaultIdParamsSchema.safeParse(request.params);

  if (!params.success) {
    throw new AppError('Validation failed', 400);
  }

  await removeVault(userId, params.data.id);
  response.json({ success: true });
}

export async function viewVaultPassword(request: Request, response: Response): Promise<void> {
  // Password sirf click par decrypt hota hai, list view me nahi.
  const userId = requireUserId(request);
  const params = vaultIdParamsSchema.safeParse(request.params);

  if (!params.success) {
    throw new AppError('Validation failed', 400);
  }

  const payload = await getVaultPassword(userId, params.data.id);
  response.json({ success: true, data: payload });
}

export async function viewVaultHistory(request: Request, response: Response): Promise<void> {
  // Purane rotated passwords dekhne ke liye history endpoint.
  const userId = requireUserId(request);
  const params = vaultIdParamsSchema.safeParse(request.params);

  if (!params.success) {
    throw new AppError('Validation failed', 400);
  }

  const payload = await getVaultPasswordHistory(userId, params.data.id);
  response.json({ success: true, data: payload });
}

export async function exportVault(request: Request, response: Response): Promise<void> {
  // CSV export direct download ke form me bhejte hain.
  const userId = requireUserId(request);
  const csv = await exportVaultCsv(userId);
  response.setHeader('Content-Type', 'text/csv');
  response.setHeader('Content-Disposition', 'attachment; filename="vaultx-export.csv"');
  response.send(csv);
}

export async function importVault(request: Request, response: Response): Promise<void> {
  // CSV text ko backend me parse karke bulk import karte hain.
  const userId = requireUserId(request);
  const payload = request.body as { csv?: string };

  if (!payload.csv || typeof payload.csv !== 'string') {
    throw new AppError('CSV content is required', 400);
  }

  const result = await importVaultCsv(userId, payload.csv);
  response.status(201).json({ success: true, data: result });
}
