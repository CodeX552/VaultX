export type VaultCategory = 'SOCIAL' | 'BANK' | 'WORK' | 'SHOPPING' | 'EDUCATION' | 'CUSTOM';

export interface VaultItem {
  id: string;
  website: string;
  username: string;
  email: string;
  notes: string | null;
  category: VaultCategory;
  createdAt: string;
  updatedAt: string;
}

export interface VaultPasswordResponse {
  success: boolean;
  data: {
    id: string;
    password: string;
  };
}

export interface DashboardStats {
  totalPasswords: number;
  weakPasswordCount: number;
  strongPasswordCount: number;
  recentlyAdded: VaultItem[];
  categoryStatistics: Record<string, number>;
}



export interface VaultHistoryEntry {
  id: string;
  createdAt: string;
  password: string;
}

export interface AuditLogEntry {
  id: string;
  userId: string | null;
  action: string;
  entity: string;
  entityId: string | null;
  metadata: any | null;
  ip: string | null;
  userAgent: string | null;
  browser: string | null;
  os: string | null;
  country: string | null;
  riskScore: number | null;
  createdAt: string;
}

export interface SecurityAlert {
  id: string;
  userId: string | null;
  attackType: string;
  mitreId: string;
  severity: string;
  ip: string | null;
  payload: string | null;
  url: string | null;
  method: string | null;
  headers: any | null;
  resolved: boolean;
  createdAt: string;
  updatedAt: string;
}
