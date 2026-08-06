import axios from 'axios';
import { logger } from '../config/logger';
import { AppError } from '../middleware/errorHandler';

export interface HeaderScanResult {
  url: string;
  grade: string;
  score: number;
  headers: Record<string, string>;
  missingHeaders: string[];
  findings: string[];
}

export const scanHeaders = async (url: string): Promise<HeaderScanResult> => {
  try {
    const response = await axios.get(url, { timeout: 5000 });
    const headers = response.headers as Record<string, string>;
    
    let score = 100;
    const findings: string[] = [];
    const missingHeaders: string[] = [];

    const securityHeaders = [
      { name: 'strict-transport-security', penalty: 20, reason: 'Missing HSTS (Strict-Transport-Security)' },
      { name: 'content-security-policy', penalty: 25, reason: 'Missing CSP (Content-Security-Policy)' },
      { name: 'x-frame-options', penalty: 15, reason: 'Missing Clickjacking Protection (X-Frame-Options)' },
      { name: 'x-content-type-options', penalty: 10, reason: 'Missing MIME Sniffing Protection (X-Content-Type-Options)' },
      { name: 'referrer-policy', penalty: 10, reason: 'Missing Referrer-Policy' },
      { name: 'permissions-policy', penalty: 10, reason: 'Missing Permissions-Policy' }
    ];

    for (const rule of securityHeaders) {
      if (!headers[rule.name]) {
        score -= rule.penalty;
        missingHeaders.push(rule.name);
        findings.push(rule.reason);
      }
    }

    // Determine Grade
    let grade = 'F';
    if (score >= 90) grade = 'A';
    else if (score >= 80) grade = 'B';
    else if (score >= 70) grade = 'C';
    else if (score >= 60) grade = 'D';

    return {
      url,
      grade,
      score,
      headers,
      missingHeaders,
      findings
    };
  } catch (error) {
    logger.error(`Failed to scan headers for ${url}`, error);
    throw new AppError('Failed to fetch the provided URL for scanning', 400);
  }
};
