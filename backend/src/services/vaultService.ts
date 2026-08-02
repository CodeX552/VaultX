import { decryptVaultPassword, encryptVaultPassword } from '../crypto/vaultCrypto';
import { AppError } from '../middleware/errorHandler';
import { createManyVaultItems, createVaultItem, deleteVaultItem, findVaultItemById, listAllVaultItems, listVaultItems, listVaultItemsForExport, updateVaultItemById } from '../repositories/vaultRepository';
import { createPasswordHistory } from '../repositories/passwordHistoryRepository';
import { recordAuditEvent } from './auditService';
import { listPasswordHistory } from '../repositories/passwordHistoryRepository';
import { escapeCsvValue, parseCsv } from '../utils/csv';

// DB model ko frontend-friendly vault shape me map karte hain.
function toVaultItemResponse(item: {
  id: string;
  website: string;
  username: string;
  email: string;
  notes: string | null;
  category: 'SOCIAL' | 'BANK' | 'WORK' | 'SHOPPING' | 'EDUCATION' | 'CUSTOM';
  createdAt: Date;
  updatedAt: Date;
}) {
  return {
    id: item.id,
    website: item.website,
    username: item.username,
    email: item.email,
    notes: item.notes,
    category: item.category,
    createdAt: item.createdAt,
    updatedAt: item.updatedAt
  };
}

// Password ki strength aur entropy ka lightweight score nikalte hain.
function calculateStrength(password: string) {
  const hasLowercase = /[a-z]/.test(password);
  const hasUppercase = /[A-Z]/.test(password);
  const hasNumber = /[0-9]/.test(password);
  const hasSymbol = /[^A-Za-z0-9]/.test(password);
  const variety = [hasLowercase, hasUppercase, hasNumber, hasSymbol].filter(Boolean).length;
  const entropy = Math.round(password.length * Math.log2(Math.max(1, variety * 8)));

  if (password.length >= 16 && variety === 4) {
    return { label: 'VERY_STRONG', entropy };
  }

  if (password.length >= 12 && variety >= 3) {
    return { label: 'STRONG', entropy };
  }

  if (password.length >= 8 && variety >= 2) {
    return { label: 'MEDIUM', entropy };
  }

  return { label: 'WEAK', entropy };
}

export async function createVault(userId: string, input: { website: string; username: string; email: string; password: string; notes?: string | null; category: 'SOCIAL' | 'BANK' | 'WORK' | 'SHOPPING' | 'EDUCATION' | 'CUSTOM' }) {
  // Vault password ko AES-GCM se encrypt karke store karte hain.
  const encrypted = encryptVaultPassword(input.password);

  const item = await createVaultItem({
    userId,
    website: input.website,
    username: input.username,
    email: input.email,
    encryptedPassword: encrypted.encryptedPassword,
    iv: encrypted.iv,
    authTag: encrypted.authTag,
    notes: input.notes ?? null,
    category: input.category
  });

  await recordAuditEvent({ userId, action: 'VAULT_CREATE', entity: 'vaultItem', entityId: item.id, metadata: { website: item.website, category: item.category } });

  return toVaultItemResponse(item);
}

export async function listVault(userId: string, filters: { search?: string; category?: 'SOCIAL' | 'BANK' | 'WORK' | 'SHOPPING' | 'EDUCATION' | 'CUSTOM' }) {
  // Search aur category filters ko DB query me pass kiya jata hai.
  const items = await listVaultItems(userId, filters);
  return items.map(toVaultItemResponse);
}

export async function getVaultPassword(userId: string, itemId: string) {
  // Reveal action par hi decrypted password return hota hai.
  const item = await findVaultItemById(itemId, userId);

  if (!item) {
    throw new AppError('Vault item not found', 404);
  }

  await recordAuditEvent({ userId, action: 'VAULT_VIEW_PASSWORD', entity: 'vaultItem', entityId: item.id });

  return {
    id: item.id,
    password: decryptVaultPassword({
      encryptedPassword: item.encryptedPassword,
      iv: item.iv,
      authTag: item.authTag
    })
  };
}

export async function updateVault(userId: string, itemId: string, input: { website?: string; username?: string; email?: string; password?: string; notes?: string | null; category?: 'SOCIAL' | 'BANK' | 'WORK' | 'SHOPPING' | 'EDUCATION' | 'CUSTOM' }) {
  // Existing item ko safely update karte waqt old password history me save hota hai.
  const existing = await findVaultItemById(itemId, userId);

  if (!existing) {
    throw new AppError('Vault item not found', 404);
  }

  const encrypted = input.password ? encryptVaultPassword(input.password) : undefined;

  if (input.password) {
    await createPasswordHistory({
      vaultItemId: existing.id,
      encryptedPassword: existing.encryptedPassword,
      iv: existing.iv,
      authTag: existing.authTag
    });
  }

  await updateVaultItemById(itemId, userId, {
    ...(input.website ? { website: input.website } : {}),
    ...(input.username ? { username: input.username } : {}),
    ...(input.email ? { email: input.email } : {}),
    ...(typeof input.notes !== 'undefined' ? { notes: input.notes } : {}),
    ...(input.category ? { category: input.category } : {}),
    ...(encrypted
      ? {
          encryptedPassword: encrypted.encryptedPassword,
          iv: encrypted.iv,
          authTag: encrypted.authTag
        }
      : {})
  });

  const updated = await findVaultItemById(itemId, userId);

  if (!updated) {
    throw new AppError('Vault item not found', 404);
  }

  await recordAuditEvent({ userId, action: 'VAULT_UPDATE', entity: 'vaultItem', entityId: itemId, metadata: { passwordRotated: Boolean(input.password) } });

  return toVaultItemResponse(updated);
}

export async function removeVault(userId: string, itemId: string) {
  // Delete se pehle ownership verify kar rahe hain.
  const existing = await findVaultItemById(itemId, userId);

  if (!existing) {
    throw new AppError('Vault item not found', 404);
  }

  await deleteVaultItem(itemId, userId);

  await recordAuditEvent({ userId, action: 'VAULT_DELETE', entity: 'vaultItem', entityId: itemId });

  return { success: true };
}

export async function getVaultPasswordHistory(userId: string, itemId: string) {
  // Pichle encrypted password versions ko decrypt karke history me bhejte hain.
  const item = await findVaultItemById(itemId, userId);

  if (!item) {
    throw new AppError('Vault item not found', 404);
  }

  const history = await listPasswordHistory(itemId);

  return history.map((entry: { id: string; createdAt: Date; encryptedPassword: string; iv: string; authTag: string }) => ({
    id: entry.id,
    createdAt: entry.createdAt,
    password: decryptVaultPassword({
      encryptedPassword: entry.encryptedPassword,
      iv: entry.iv,
      authTag: entry.authTag
    })
  }));
}

export async function getDashboard(userId: string) {
  // Dashboard ke summary metrics yahan aggregate hote hain.
  const items = await listAllVaultItems(userId);
  const categorizedCounts = items.reduce<Record<string, number>>((accumulator, item) => {
    accumulator[item.category] = (accumulator[item.category] ?? 0) + 1;
    return accumulator;
  }, {});

  const passwordEntries = items.map((item) => ({
    ...item,
    password: decryptVaultPassword({
      encryptedPassword: item.encryptedPassword,
      iv: item.iv,
      authTag: item.authTag
    })
  }));

  const passwordStrengths = passwordEntries.map((item) => calculateStrength(item.password));
  const weakCount = passwordStrengths.filter((item) => item.label === 'WEAK').length;
  const strongCount = passwordStrengths.filter((item) => item.label === 'STRONG' || item.label === 'VERY_STRONG').length;

  return {
    totalPasswords: items.length,
    weakPasswordCount: weakCount,
    strongPasswordCount: strongCount,
    recentlyAdded: items.slice(0, 5).map(toVaultItemResponse),
    categoryStatistics: categorizedCounts
  };
}

export async function exportVaultCsv(userId: string) {
  // Export ke liye vault entries ko CSV rows me convert karte hain.
  const items = await listVaultItemsForExport(userId);
  const headers = ['website', 'username', 'email', 'notes', 'category', 'password'];
  const rows = items.map((item) => [
    escapeCsvValue(item.website),
    escapeCsvValue(item.username),
    escapeCsvValue(item.email),
    escapeCsvValue(item.notes),
    escapeCsvValue(item.category),
    escapeCsvValue(decryptVaultPassword({
      encryptedPassword: item.encryptedPassword,
      iv: item.iv,
      authTag: item.authTag
    }))
  ].join(','));

  return [headers.join(','), ...rows].join('\n');
}

export async function importVaultCsv(userId: string, csvText: string) {
  // CSV import me har row validate karke encrypted vault entries create hoti hain.
  const rows = parseCsv(csvText);

  if (!rows.length) {
    throw new AppError('CSV file is empty', 400);
  }

  const preparedRows = rows.map((row) => {
    if (!row.website || !row.username || !row.email || !row.password) {
      throw new AppError('CSV file must include website, username, email, and password columns', 400);
    }

    const encrypted = encryptVaultPassword(row.password);

    return {
      userId,
      website: row.website,
      username: row.username,
      email: row.email,
      notes: row.notes ?? null,
      category: (row.category?.toUpperCase() as 'SOCIAL' | 'BANK' | 'WORK' | 'SHOPPING' | 'EDUCATION' | 'CUSTOM') || 'CUSTOM',
      encryptedPassword: encrypted.encryptedPassword,
      iv: encrypted.iv,
      authTag: encrypted.authTag
    };
  });

  await createManyVaultItems(preparedRows);

  await recordAuditEvent({
    userId,
    action: 'VAULT_IMPORT_CSV',
    entity: 'vaultItem',
    metadata: { importedCount: preparedRows.length }
  });

  return { success: true, importedCount: preparedRows.length };
}
