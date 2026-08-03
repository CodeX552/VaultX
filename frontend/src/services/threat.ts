import { apiClient } from './api';
import { SecurityAlert, AuditLogEntry } from '../types/vault';

export interface ThreatStats {
  totalAttacks: number;
  highSeverityCount: number;
}

export const getThreats = async (): Promise<{ alerts: SecurityAlert[]; stats: ThreatStats }> => {
  const { data } = await apiClient.get('/threats');
  return data;
};

export const resolveThreat = async (id: string): Promise<void> => {
  await apiClient.patch(`/threats/${id}/resolve`);
};

export const getIncidentTimeline = async (ip: string): Promise<(SecurityAlert | AuditLogEntry)[]> => {
  const { data } = await apiClient.get('/threats/timeline', { params: { ip } });
  return data.timeline;
};

// Returns the full URL for downloading the SIEM export
export const getExportThreatsUrl = (): string => {
  return `${apiClient.defaults.baseURL}/threats/export`;
};

export interface AIAnalysisResult {
  analysis: string;
  mitreTechnique: string;
  confidence: string;
  recommendation: string;
  remediation: string[];
}

export const analyzeThreatWithAI = async (id: string): Promise<AIAnalysisResult> => {
  const { data } = await apiClient.get(`/threats/${id}/analyze`);
  return data.analysis;
};
