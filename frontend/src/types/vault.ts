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
  action: string;
  entity: string;
  entityId: string | null;
  metadata: unknown;
  createdAt: string;
}

