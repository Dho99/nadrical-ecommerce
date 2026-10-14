// Google ID-token decoder only (payload is public, verified by Google).
// Session JWT is HttpOnly and never readable here — never verify auth
// client-side. Source of truth is GET /auth/profile via cookie.
export interface GoogleIdPayload {
    akun_uuid?: string;
    username?: string;
    email: string;
    roles?: string[];
    name?: string;
    email_verified?: boolean;
    exp?: number;
    iat?: number;
    nbf?: number;
    iss?: string;
    sub?: string;
}

export function decodeJWT(token: string): GoogleIdPayload | null {
    try {
        const parts = token.split(".");
        if (parts.length !== 3) return null;
        const payload = parts[1];
        const decoded = atob(payload.replace(/-/g, "+").replace(/_/g, "/"));
        return JSON.parse(decoded) as GoogleIdPayload;
    } catch {
        return null;
    }
}
