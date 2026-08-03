import { apiClient } from './api';

export interface Session {
  id: string;
  ip: string | null;
  browser: string | null;
  os: string | null;
  country: string | null;
  createdAt: string;
  updatedAt: string;
}

export const getSessions = async (): Promise<Session[]> => {
  const { data } = await apiClient.get<{ success: boolean; sessions: Session[] }>('/sessions');
  return data.sessions;
};

export const revokeSession = async (id: string): Promise<void> => {
  await apiClient.delete(`/sessions/${id}`);
};
