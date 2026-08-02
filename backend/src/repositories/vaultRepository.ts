import { prisma } from '../database/prisma';

// Export me encrypted fields ke saath vault item select karna padta hai.
const vaultSelect = {
  id: true,
  userId: true,
  website: true,
  username: true,
  email: true,
  encryptedPassword: true,
  iv: true,
  authTag: true,
  notes: true,
  category: true,
  createdAt: true,
  updatedAt: true
} as const;

export function createVaultItem(data: {
  userId: string;
  website: string;
  username: string;
  email: string;
  encryptedPassword: string;
  iv: string;
  authTag: string;
  notes?: string | null;
  category: 'SOCIAL' | 'BANK' | 'WORK' | 'SHOPPING' | 'EDUCATION' | 'CUSTOM';
}) {
  // Naya vault record seedha Prisma se insert hota hai.
  return prisma.vaultItem.create({
    data
  });
}

export function findVaultItemById(id: string, userId: string) {
  // Ownership check ke saath single item find karte hain.
  return prisma.vaultItem.findFirst({
    where: { id, userId }
  });
}

export function listVaultItems(userId: string, filters: { search?: string; category?: 'SOCIAL' | 'BANK' | 'WORK' | 'SHOPPING' | 'EDUCATION' | 'CUSTOM' }) {
  // Search, category, aur sort order ko query me apply karte hain.
  return prisma.vaultItem.findMany({
    where: {
      userId,
      ...(filters.category ? { category: filters.category } : {}),
      ...(filters.search
        ? {
            OR: [
              { website: { contains: filters.search, mode: 'insensitive' } },
              { username: { contains: filters.search, mode: 'insensitive' } },
              { email: { contains: filters.search, mode: 'insensitive' } }
            ]
          }
        : {})
    },
    orderBy: { updatedAt: 'desc' }
  });
}

export function updateVaultItem(
  id: string,
  userId: string,
  data: Partial<{
    website: string;
    username: string;
    email: string;
    encryptedPassword: string;
    iv: string;
    authTag: string;
    notes: string | null;
    category: 'SOCIAL' | 'BANK' | 'WORK' | 'SHOPPING' | 'EDUCATION' | 'CUSTOM';
  }>
) {
  // UpdateMany isliye use hota hai taaki ownership-safe update ho sake.
  return prisma.vaultItem.updateMany({
    where: { id, userId },
    data
  });
}

export function updateVaultItemById(id: string, userId: string, data: Partial<{
  website: string;
  username: string;
  email: string;
  encryptedPassword: string;
  iv: string;
  authTag: string;
  notes: string | null;
  category: 'SOCIAL' | 'BANK' | 'WORK' | 'SHOPPING' | 'EDUCATION' | 'CUSTOM';
}>) {
  // Prisma update se updated row wapas milta hai.
  return prisma.vaultItem.update({
    where: { id },
    data
  });
}

export function deleteVaultItem(id: string, userId: string) {
  // Ownership verify karke deleteMany chalaya jata hai.
  return prisma.vaultItem.deleteMany({
    where: { id, userId }
  });
}

export function listAllVaultItems(userId: string) {
  // Dashboard stats ke liye saari entries load hoti hain.
  return prisma.vaultItem.findMany({
    where: { userId },
    orderBy: { createdAt: 'desc' }
  });
}

export function listVaultItemsForExport(userId: string) {
  // CSV export ke liye select fields ke saath data lana hota hai.
  return prisma.vaultItem.findMany({
    where: { userId },
    orderBy: { createdAt: 'desc' },
    select: vaultSelect
  });
}

export function createManyVaultItems(data: Array<{
  userId: string;
  website: string;
  username: string;
  email: string;
  encryptedPassword: string;
  iv: string;
  authTag: string;
  notes?: string | null;
  category: 'SOCIAL' | 'BANK' | 'WORK' | 'SHOPPING' | 'EDUCATION' | 'CUSTOM';
}>) {
  // CSV import ko fast banane ke liye bulk insert use kiya gaya hai.
  return prisma.vaultItem.createMany({
    data
  });
}
