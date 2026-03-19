// src/types/index.ts

// ─────────────────────────────────────────────────────
// USER
// ─────────────────────────────────────────────────────

// Shape of a user returned from the NestJS gateway
// Password is never included — stripped server-side
export interface User {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    createdAt: string;
    updatedAt: string;
}

// ─────────────────────────────────────────────────────
// AUTH
// ─────────────────────────────────────────────────────

// Returned from both /auth/register and /auth/login
export interface AuthResponse {
    user: User;
    token: string; // JWT — stored in localStorage and zustand
}

// Payload sent to /auth/register
export interface RegisterPayload {
    firstName: string;
    lastName: string;
    email: string;
    password: string;
}

// Payload sent to /auth/login
export interface LoginPayload {
    email: string;
    password: string;
}

// ─────────────────────────────────────────────────────
// VERIFICATION
// ─────────────────────────────────────────────────────

// Individual sub-scores returned inside a VerificationResult
// These match the FastAPI ScoreBreakdown schema exactly
export interface ScoreBreakdown {
    liveness_score: number;  // 0–100 from AWS Face Liveness
    face_match_score: number;  // 0–100 from AWS CompareFaces
    ocr_passed: boolean; // whether DetectText succeeded
}

// Extracted data read from the ID card via OCR
// Both fields are optional — OCR may not find them on every ID format
export interface ExtractedIdData {
    name: string | null;
    dateOfBirth: string | null;
}

// Full result returned from POST /verify
// Matches the NestJS verification controller response shape
export interface VerificationResult {
    verificationId: string;
    compositeScore: number;   // 0–100 — the final weighted accuracy score
    passed: boolean;  // true if all thresholds were met
    message: string;   // human-readable result summary
    breakdown: ScoreBreakdown;
    extractedData: ExtractedIdData | null; // null if OCR failed
}

// A single row from GET /users/verifications
// Matches the Prisma Verification model fields returned by UsersService
export interface VerificationHistoryItem {
    id: string;
    livenessScore: number;
    faceMatchScore: number;
    ocrPassed: boolean;
    compositeScore: number;
    passed: boolean;
    createdAt: string;  // ISO date string from Postgres
}

// ─────────────────────────────────────────────────────
// API
// ─────────────────────────────────────────────────────

// Standard envelope shape used by every NestJS endpoint
// success: true  → data is present
// success: false → error is present
export interface ApiResponse<T> {
    success: boolean;
    message?: string;
    data?: T;
    error?: ApiError;
}

// Shape of the error object from HttpExceptionFilter
export interface ApiError {
    message: string | string[]; // string[] when ValidationPipe returns multiple errors
    statusCode?: number;
    timestamp?: string;
    path?: string;
}

// ─────────────────────────────────────────────────────
// UI STATE
// ─────────────────────────────────────────────────────

// The four steps on the /verify page
// Used to drive the StepIndicator and AnimatePresence conditionals
export type VerificationStep =
    | 'upload'      // step 0 — user uploads ID card
    | 'selfie'      // step 1 — user uploads selfie
    | 'processing'  // step 2 — waiting for result from FastAPI
    | 'result';     // step 3 — score displayed

// Button variant type — mirrors GlassButton variants
export type ButtonVariant =
    | 'primary'
    | 'secondary'
    | 'ghost'
    | 'danger';

// Generic async state — useful for hooks that fetch data
export interface AsyncState<T> {
    data: T | null;
    loading: boolean;
    error: string | null;
}