import { apiClient } from './api';
import type { AuthResponse } from '../types/auth';

export interface RegisterPayload {
  name: string;
  email: string;
  password: string;
}

export interface LoginPayload {
  email: string;
  password: string;
}

// Auth ke liye backend ke dedicated endpoints ko wrap kiya gaya hai.
export async function registerRequest(payload: RegisterPayload) {
  const response = await apiClient.post<AuthResponse>('/register', payload);
  return response.data;
}

export async function loginRequest(payload: LoginPayload) {
  const response = await apiClient.post<AuthResponse>('/login', payload);
  return response.data;
}

export async function refreshRequest() {
  const response = await apiClient.post<AuthResponse>('/refresh', {});
  return response.data;
}

export async function logoutRequest() {
  // Server side refresh cookie revoke ho sake isliye yeh call zaroori hai.
  await apiClient.post('/logout', {});
}

export async function forgotPasswordRequest(email: string) {
  const response = await apiClient.post<{ success: boolean; message: string; resetToken?: string }>('/forgot-password', { email });
  return response.data;
}

export async function resetPasswordRequest(payload: { email: string; resetToken: string; newPassword: string }) {
  const response = await apiClient.post<{ success: boolean }>('/reset-password', payload);
  return response.data;
}

export async function changeMasterPasswordRequest(payload: { currentPassword: string; newPassword: string }) {
  const response = await apiClient.put<{ success: boolean }>('/change-password', payload);
  return response.data;
}
