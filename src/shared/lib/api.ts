import axios, {
  type AxiosError,
  type AxiosResponse,
  type InternalAxiosRequestConfig,
} from "axios";
import type { ApiError, PaginationMeta } from "../types/api.response";

const RAW_BASE =
    import.meta.env.VITE_API_BASE_URL || "http://localhost:8080/api/v1";

// Strip trailing slashes: prevents `.../api/v1//auth/login` (404/CORS hang).
const BASE_URL = RAW_BASE.replace(/\/+$/, "");

export const api = axios.create({
    baseURL: BASE_URL,
    headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
    },
    // Cookie session is opt-in: enable ONLY when the Go backend actually sets
    // an HttpOnly session cookie (today it does not — it returns the token in
    // the JSON body). Sending credentialed cross-site requests without any
    // cookie to carry only triggers the strictest browser handling (Brave
    // Shields, third-party-cookie blocking) and can leave the request with no
    // usable response. Flip via VITE_API_WITH_CREDENTIALS=true when BE ships
    // Set-Cookie (HttpOnly, Secure, SameSite) + explicit CORS origins.
    withCredentials:
        import.meta.env.VITE_API_WITH_CREDENTIALS === "true",
    timeout: 15000,
});

export function setAuthToken(token: string | null): void {
    if (token) {
        localStorage.setItem("token", token);
        api.defaults.headers.common.Authorization = `Bearer ${token}`;
    } else {
        localStorage.removeItem("token");
        delete api.defaults.headers.common.Authorization;
    }
}

export function getAuthToken(): string | null {
    return localStorage.getItem("token");
}

export function unwrapData<T>(body: unknown): T | undefined {
    if (!body || typeof body !== 'object') return undefined;
    const b = body as Record<string, unknown>;
    if ('data' in b) return b.data as T | undefined;
    return body as T;
}

export function unwrapMeta(body: unknown): PaginationMeta | undefined {
    if (!body || typeof body !== 'object') return undefined;
    const b = body as Record<string, unknown>;
    if ('meta' in b) return b.meta as PaginationMeta | undefined;
    return undefined;
}

export function extractData<T>(payload: unknown): T | undefined {
    if (payload === null || payload === undefined) return undefined;
    if (typeof payload === "object" && payload !== null && "data" in (payload as Record<string, unknown>)) {
        const inner = (payload as { data?: unknown }).data;
        if (inner !== undefined) return inner as T;
    }
    return payload as T;
}

export function parseApiError(error: unknown): ApiError {
    const ax = error as AxiosError<{ message?: string; errors?: unknown; success?: boolean }>;
    const status = ax.response?.status;
    const body = ax.response?.data;
    if (body?.message) return { status, message: body.message, errors: body.errors, raw: body };
    if (body?.errors) {
        const msg = typeof body.errors === "string" ? body.errors : Array.isArray(body.errors) ? body.errors.join(", ") : JSON.stringify(body.errors);
        return { status, message: msg, errors: body.errors, raw: body };
    }
    // Transport failure (no response object at all): CORS block, Brave Shields,
    // offline, or server unreachable — NOT a credential error. Surface it as
    // such so login UI never reports "wrong password" for a network problem.
    if (!ax.response) {
        if (ax.code === "ECONNABORTED" || /timeout/i.test(ax.message ?? "")) {
            return { status, message: "Backend tidak merespons (timeout). Cek koneksi / CORS / Brave Shields, lalu coba lagi.", raw: error };
        }
        if (/network error/i.test(ax.message ?? "")) {
            return { status, message: "Gagal mencapai backend (network/CORS diblokir browser). Coba browser lain atau cek Console.", raw: error };
        }
    }
    if (ax.message) return { status, message: ax.message, raw: error };
    if (error instanceof Error) return { message: error.message, raw: error };
    return { message: "Unexpected error", raw: error };
}

export function getErrorMessage(error: unknown, fallback = "Request failed"): string {
    return parseApiError(error).message || fallback;
}

api.interceptors.request.use(
    (config: InternalAxiosRequestConfig) => {
        const token = getAuthToken();
        if (token && config.headers) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error: AxiosError) => Promise.reject(error),
);

api.interceptors.response.use(
    (response: AxiosResponse) => response,
    (error: AxiosError) => {
        if (error.response?.status === 401) {
            // Token rejected/expired: drop it so later calls don't reuse it.
            setAuthToken(null);
            // Mark UI logged out without a static import cycle
            // (api <- auth store <- auth service <- api): lazy dynamic import.
            void import("../../modules/auth/hooks/useAuth").then((m) => {
                m.useAuthStore.setState({
                    user: null,
                    isAuthenticated: false,
                    status: "unauthenticated",
                });
            });
        }
        return Promise.reject(error);
    },
);

export default api;
