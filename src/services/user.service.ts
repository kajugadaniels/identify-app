// src/services/user.service.ts

import api from '@/lib/api';
import { ApiResponse, User, VerificationHistoryItem } from '@/types';

// ── Update profile payload ─────────────────────────────
export interface UpdateProfilePayload {
  firstName?: string;
  lastName?:  string;
}

// ── User API calls ─────────────────────────────────────

// GET /users/profile
// Returns the logged-in user's profile
// Uses the JWT from the axios interceptor automatically
export async function getProfile(): Promise<User> {
  const response = await api.get<ApiResponse<User>>('/users/profile');

  if (!response.data.data) {
    throw new Error('Failed to load profile');
  }

  return response.data.data;
}

// PATCH /users/profile
// Updates firstName and/or lastName
// Returns the updated user object
export async function updateProfile(
  payload: UpdateProfilePayload,
): Promise<User> {
  const response = await api.patch<ApiResponse<User>>(
    '/users/profile',
    payload,
  );

  if (!response.data.data) {
    throw new Error('Failed to update profile');
  }

  return response.data.data;
}

// GET /users/verifications
// Returns the verification history for the logged-in user
// Sorted newest first by the backend
export async function getVerificationHistory(): Promise<VerificationHistoryItem[]> {
  const response = await api.get<ApiResponse<VerificationHistoryItem[]>>(
    '/users/verifications',
  );

  // Return empty array if no history yet — not an error
  return response.data.data ?? [];
}