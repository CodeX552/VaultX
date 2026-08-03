import { Router, type Request, type Response } from 'express';
import { prisma } from '../database/prisma';
import { logger } from '../config/logger';

const router = Router();

// A generic handler that records a honeypot trigger
const handleHoneypot = async (req: Request, res: Response) => {
  const ip = req.ip || req.socket.remoteAddress || '127.0.0.1';
  
  logger.warn(`[HONEYPOT] Triggered by ${ip} on ${req.originalUrl}`);

  await prisma.securityAlert.create({
    data: {
      attackType: 'Honeypot Triggered',
      mitreId: 'T1078', // Valid Accounts (attempting to use admin panels)
      severity: 'CRITICAL',
      ip: ip,
      payload: JSON.stringify({ body: req.body, query: req.query }),
      url: req.originalUrl,
      method: req.method,
      headers: JSON.stringify(req.headers)
    }
  }).catch(err => logger.error('[HONEYPOT] Failed to log alert', err));

  // Return a generic deceptive response
  // 401 Unauthorized makes scanners think the page exists but requires login.
  res.status(401).json({
    success: false,
    message: 'Unauthorized access. Authentication required.'
  });
};

// Common paths attackers scan for
router.all('/admin/login', handleHoneypot);
router.all('/admin', handleHoneypot);
router.all('/phpmyadmin', handleHoneypot);
router.all('/config.bak', handleHoneypot);
router.all('/.git/config', handleHoneypot);

export default router;
