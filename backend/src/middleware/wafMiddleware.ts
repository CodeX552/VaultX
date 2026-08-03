import { type Request, type Response, type NextFunction } from 'express';
import { prisma } from '../database/prisma';
import { logger } from '../config/logger';

// Very basic regex rules for WAF
const wafRules = [
  {
    type: 'SQLi',
    mitreId: 'T1190',
    severity: 'HIGH',
    regex: /(?:'|")\s*(?:OR|AND)\s*(?:\d+=\d+|'[^']*'='[^']*'|"[^"]*"="[^"]*")/i
  },
  {
    type: 'SQLi',
    mitreId: 'T1190',
    severity: 'HIGH',
    regex: /UNION\s+SELECT/i
  },
  {
    type: 'XSS',
    mitreId: 'T1190',
    severity: 'MEDIUM',
    regex: /<script\b[^>]*>[\s\S]*?<\/script>|javascript:/i
  },
  {
    type: 'Path Traversal',
    mitreId: 'T1190',
    severity: 'HIGH',
    regex: /(?:\.\.\/|\.\.\\|%2e%2e%2f)/i
  },
  {
    type: 'Command Injection',
    mitreId: 'T1059',
    severity: 'CRITICAL',
    regex: /(?:;|\|\||&&)\s*(?:cat|ls|wget|curl|powershell|bash|sh|ping)/i
  }
];

export const wafMiddleware = async (req: Request, res: Response, next: NextFunction) => {
  // Combine all inputs to inspect
  const payloadToInspect = [
    req.originalUrl,
    JSON.stringify(req.body || {}),
    JSON.stringify(req.query || {}),
    JSON.stringify(req.headers || {})
  ].join(' ');

  for (const rule of wafRules) {
    const match = payloadToInspect.match(rule.regex);
    if (match) {
      const ip = req.ip || req.socket.remoteAddress || '127.0.0.1';
      logger.warn(`[WAF] Blocked malicious request from ${ip}: ${rule.type}`);
      
      // Log to database asynchronously so we don't block the request failure heavily
      prisma.securityAlert.create({
        data: {
          userId: req.auth?.userId || null, // Will only exist if auth middleware ran first
          attackType: rule.type,
          mitreId: rule.mitreId,
          severity: rule.severity,
          ip: ip,
          payload: match[0],
          url: req.originalUrl,
          method: req.method,
          headers: JSON.stringify(req.headers)
        }
      }).catch(err => logger.error('[WAF] Failed to log security alert', err));

      return res.status(403).json({
        success: false,
        message: 'Forbidden: Malicious payload detected.'
      });
    }
  }

  next();
};
