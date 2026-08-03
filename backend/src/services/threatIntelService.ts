import axios from 'axios';
import { logger } from '../config/logger';

export interface ThreatIntelResult {
  isMalicious: boolean;
  score: number;
  reason?: string;
}

/**
 * Checks an IP address against AbuseIPDB (or falls back to default if no API key).
 * @param ip The IP address to check
 * @returns ThreatIntelResult containing risk score (0-100)
 */
export const checkIpReputation = async (ip: string): Promise<ThreatIntelResult> => {
  // Ignore local IPs
  if (ip === '127.0.0.1' || ip === '::1' || ip.startsWith('192.168.') || ip.startsWith('10.')) {
    return { isMalicious: false, score: 0 };
  }

  const apiKey = process.env.ABUSEIPDB_API_KEY;

  if (!apiKey) {
    logger.warn('ABUSEIPDB_API_KEY is not set. Skipping threat intelligence check.');
    return { isMalicious: false, score: 0, reason: 'Threat Intel disabled (No API Key)' };
  }

  try {
    const response = await axios.get('https://api.abuseipdb.com/api/v2/check', {
      params: {
        ipAddress: ip,
        maxAgeInDays: 90
      },
      headers: {
        'Accept': 'application/json',
        'Key': apiKey
      },
      timeout: 3000 // fail fast if API is slow
    });

    const data = response.data?.data;
    if (data) {
      const score = data.abuseConfidenceScore || 0;
      return {
        isMalicious: score > 50,
        score,
        reason: score > 50 ? `AbuseIPDB Confidence Score: ${score}` : undefined
      };
    }
  } catch (error) {
    logger.error(`Error checking IP reputation for ${ip}:`, error);
  }

  return { isMalicious: false, score: 0 };
};
