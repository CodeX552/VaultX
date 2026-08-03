import geoip from 'geoip-lite';
import { UAParser } from 'ua-parser-js';
import { checkIpReputation } from './threatIntelService';
import { prisma } from '../database/prisma';

export interface TelemetryData {
  ip: string;
  userAgent: string;
  userId?: string;
}

export interface RiskAnalysisResult {
  score: number;
  factors: string[];
  isHighRisk: boolean;
  browser: string;
  os: string;
  country: string;
}

/**
 * Calculates a risk score for a given login attempt.
 */
export const analyzeLoginRisk = async (telemetry: TelemetryData): Promise<RiskAnalysisResult> => {
  let score = 0;
  const factors: string[] = [];

  // 1. Parse User Agent
  const parser = new UAParser(telemetry.userAgent);
  const browser = parser.getBrowser().name || 'Unknown';
  const os = parser.getOS().name || 'Unknown';

  // Basic User Agent anomalies
  if (browser === 'Unknown') {
    score += 15;
    factors.push('Unknown Browser');
  }
  if (telemetry.userAgent.toLowerCase().includes('curl') || telemetry.userAgent.toLowerCase().includes('postman')) {
    score += 50;
    factors.push('Automated Tool / Script Detected');
  }

  // 2. Geolocation
  let country = 'Unknown';
  const geo = geoip.lookup(telemetry.ip);
  if (geo) {
    country = geo.country;
  }

  // 3. Threat Intel (AbuseIPDB)
  const intel = await checkIpReputation(telemetry.ip);
  if (intel.score > 0) {
    score += Math.floor(intel.score * 0.8); // Add up to 80 points based on abuse score
    factors.push(`IP Abuse Score: ${intel.score}`);
  }

  // 4. Historical Anomaly Detection (if userId is provided)
  if (telemetry.userId) {
    const recentLogins = await prisma.auditLog.findMany({
      where: {
        userId: telemetry.userId,
        action: 'LOGIN_SUCCESS',
        createdAt: { gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) } // last 30 days
      },
      orderBy: { createdAt: 'desc' },
      take: 10
    });

    if (recentLogins.length > 0) {
      // Check if new country
      const knownCountries = new Set(recentLogins.map(l => l.country).filter(Boolean));
      if (country !== 'Unknown' && !knownCountries.has(country)) {
        score += 30;
        factors.push(`Login from new country: ${country}`);
      }

      // Check if new device (browser/os combo)
      const knownDevices = new Set(recentLogins.map(l => `${l.browser}-${l.os}`));
      if (!knownDevices.has(`${browser}-${os}`)) {
        score += 15;
        factors.push(`Login from new device: ${browser} on ${os}`);
      }
    }
  }

  // Cap score at 100
  score = Math.min(score, 100);

  return {
    score,
    factors,
    isHighRisk: score >= 80,
    browser,
    os,
    country
  };
};
