// src/services/verification.service.ts

import api from '@/lib/api';
import { ApiResponse, VerificationResult } from '@/types';

// ── Verification API calls ─────────────────────────────

// POST /verify/session
// Creates a liveness session on AWS via NestJS
// Returns a sessionId that gets sent back after images are ready
export async function createLivenessSession(): Promise<string> {
    const response = await api.post<ApiResponse<{ sessionId: string }>>(
        '/verify/session',
    );

    const sessionId = response.data.data?.sessionId;

    if (!sessionId) {
        throw new Error('Failed to create liveness session');
    }

    return sessionId;
}

// POST /verify
// Submits the full verification:
//   - liveness session ID (from createLivenessSession)
//   - ID card image file
//   - selfie image file
// Returns the composite score + breakdown
export async function submitVerification(
    livenessSessionId: string,
    idImage: File,
    selfieImage: File,
): Promise<VerificationResult> {
    // Must use FormData — NestJS endpoint expects multipart/form-data
    const formData = new FormData();
    formData.append('livenessSessionId', livenessSessionId);
    formData.append('idImage', idImage);
    formData.append('selfieImage', selfieImage);

    const response = await api.post<ApiResponse<VerificationResult>>(
        '/verify',
        formData,
        {
            // Let axios set the Content-Type boundary automatically
            // Never set multipart/form-data manually — boundary will be wrong
            headers: { 'Content-Type': 'multipart/form-data' },
        },
    );

    if (!response.data.data) {
        throw new Error('Verification returned no result');
    }

    return response.data.data;
}