import { PrismaClient } from '@prisma/client';

declare global {
  // Dev mode me global prisma reuse karke extra connections avoid karte hain.
  // eslint-disable-next-line no-var
  var prisma: PrismaClient | undefined;
}

// Single Prisma client instance poore backend me share hota hai.
export const prisma = global.prisma ?? new PrismaClient();

if (process.env.NODE_ENV !== 'production') {
  // Local development me hot reload ke saath same client reuse karte hain.
  global.prisma = prisma;
}
