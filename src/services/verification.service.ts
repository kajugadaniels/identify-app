// src/services/verification.service.ts

import api from '@/lib/api';
import { ApiResponse, VerificationResult } from '@/types';

// ── Verification API calls ─────────────────────────────

// POST /verify
// Submits the full verification:
//   - ID card image file
//   - selfie image file
// Returns the composite score + breakdown.
//
// liveness_session_id is intentionally omitted — the NestJS gateway
// and FastAPI engine both treat it as optional. When absent, the
// liveness check is bypassed and face-match + OCR are still evaluated.
export async function submitVerification(
    idImage: File,
    selfieImage: File,
): Promise<VerificationResult> {
    // Must use FormData — NestJS endpoint expects multipart/form-data.
    const formData = new FormData();
    formData.append('idImage', idImage);
    formData.append('selfieImage', selfieImage);

    // IMPORTANT: do NOT set Content-Type manually.
    // The axios instance has a default Content-Type: application/json.
    // Using transformRequest to delete it lets the browser's XHR set
    // Content-Type: multipart/form-data; boundary=... automatically,
    // which is the only way multer on the NestJS side can parse the body.
    const response = await api.post<ApiResponse<VerificationResult>>(
        '/verify',
        formData,
        {
            transformRequest: [(_data, headers) => {
                if (headers) delete headers['Content-Type'];
                return formData;
            }],
        },
    );

    if (!response.data.data) {
        throw new Error('Verification returned no result');
    }

    return response.data.data;
}
