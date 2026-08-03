import { type Request, type Response } from 'express';
import { prisma } from '../database/prisma';
import { AppError } from '../middleware/errorHandler';
import { revokeRefreshToken } from '../repositories/refreshTokenRepository';
import { recordAuditEvent } from '../services/auditService';

export const getSessions = async (req: Request, res: Response) => {
  if (!req.auth?.userId) {
    throw new AppError('Unauthorized', 401);
  }

  const sessions = await prisma.refreshToken.findMany({
    where: {
      userId: req.auth.userId,
      revokedAt: null,
      expiresAt: { gt: new Date() }
    },
    select: {
      id: true,
      ip: true,
      browser: true,
      os: true,
      country: true,
      createdAt: true,
      updatedAt: true
    },
    orderBy: { updatedAt: 'desc' }
  });

  res.status(200).json({ success: true, sessions });
};

export const revokeSession = async (req: Request, res: Response) => {
  if (!req.auth?.userId) {
    throw new AppError('Unauthorized', 401);
  }

  const { id } = req.params;

  const session = await prisma.refreshToken.findUnique({
    where: { id }
  });

  if (!session || session.userId !== req.auth.userId) {
    throw new AppError('Session not found', 404);
  }

  await revokeRefreshToken(session.tokenHash);
  
  await recordAuditEvent({
    userId: req.auth.userId,
    action: 'SESSION_REVOKED',
    entity: 'refreshToken',
    entityId: session.id,
    metadata: {
      ip: session.ip,
      browser: session.browser,
      os: session.os
    }
  });

  res.status(200).json({ success: true, message: 'Session revoked successfully' });
};
