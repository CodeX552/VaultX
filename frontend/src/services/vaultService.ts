import { apiClient } from './api';
import type { AuditLogEntry, DashboardStats, VaultCategory, VaultHistoryEntry, VaultItem, VaultPasswordResponse } from '../types/vault';

export interface VaultPayload {
  website: string;
  username: string;
  email: string;
  password: string;
  notes?: string | null;
  category: VaultCategory;
}

// Vault related CRUD aur utility calls yahan se centralize hote hain.
export async function getVaultItems(search?: string, category?: VaultCategory) {
  const response = await apiClient.get<{ success: boolean; data: VaultItem[] }>('/vault', {
    params: { search, category }
  });
  return response.data.data;
}

export async function createVaultItem(payload: VaultPayload) {
  const response = await apiClient.post<{ success: boolean; data: VaultItem }>('/vault', payload);
  return response.data.data;
}

export async function updateVaultItem(id: string, payload: Partial<VaultPayload>) {
  const response = await apiClient.put<{ success: boolean; data: VaultItem }>(`/vault/${id}`, payload);
  return response.data.data;
}

export async function deleteVaultItem(id: string) {
  await apiClient.delete(`/vault/${id}`);
}

export async function viewVaultPassword(id: string) {
  // Password ko sirf reveal action ke time fetch karte hain.
  const response = await apiClient.get<VaultPasswordResponse>(`/vault/${id}/password`);
  return response.data.data.password;
}

export async function getDashboardStats() {
  const response = await apiClient.get<{ success: boolean; data: DashboardStats }>('/dashboard');
  return response.data.data;
}

export async function getVaultPasswordHistory(id: string) {
  const response = await apiClient.get<{ success: boolean; data: VaultHistoryEntry[] }>(`/vault/${id}/history`);
  return response.data.data;
}

export async function getAuditLogs() {
  const response = await apiClient.get<{ success: boolean; data: AuditLogEntry[] }>('/audit-logs');
  return response.data.data;
}

export async function exportVaultCsv() {
  // CSV export binary blob ke form me aata hai.
  const response = await apiClient.get('/vault/export', {
    responseType: 'blob'
  });

  return response.data as Blob;
}

export async function importVaultCsv(csv: string) {
  // CSV text backend ko bhejke bulk import karte hain.
  const response = await apiClient.post<{ success: boolean; data: { importedCount: number } }>('/vault/import', { csv });
  return response.data.data;
}
