import { prisma } from '../database/prisma';

export function findUserByEmail(email: string) {
  // Login aur registration checks me email-based lookup use hota hai.
  return prisma.user.findUnique({
    where: { email }
  });
}

export function findUserById(id: string) {
  // User profile ya auth flows ke liye id-based lookup.
  return prisma.user.findUnique({
    where: { id }
  });
}

export function createUser(data: { name: string; email: string; passwordHash: string }) {
  // Naya user master password hash ke saath store hota hai.
  return prisma.user.create({
    data
  });
}
