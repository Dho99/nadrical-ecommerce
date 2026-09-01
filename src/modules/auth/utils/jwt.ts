export interface JwtPayload {
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

export function decodeJWT(token: string): JwtPayload | null {
    try {
        const parts = token.split(".");
        if (parts.length !== 3) return null;
        const payload = parts[1];
        const decoded = atob(payload.replace(/-/g, "+").replace(/_/g, "/"));
        return JSON.parse(decoded) as JwtPayload;
    } catch {
        return null;
    }
}

export function isTokenExpired(token: string): boolean {
    const payload = decodeJWT(token);
    if (!payload?.exp) return true;
    return Date.now() >= payload.exp * 1000;
}

export function getTokenExpiration(token: string): Date | null {
    const payload = decodeJWT(token);
    if (!payload?.exp) return null;
    return new Date(payload.exp * 1000);
}
