import axios, {
  type AxiosError,
  type AxiosResponse,
  type InternalAxiosRequestConfig,
} from "axios";
import type { ApiError, PaginationMeta } from "../types/api.response";

export const api = axios.create({
    baseURL:
        import.meta.env.VITE_API_BASE_URL || "http://localhost:8080/api/v1",
    headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
    },
    timeout: 10000,
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
    return localStorage.getItem("token") || sessionStorage.getItem("token");
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
    if (ax.message) return { status, message: ax.message, raw: error };
    if (error instanceof Error) return { message: error.message, raw: error };
    return { message: "Unexpected error", raw: error };
}

export function getErrorMessage(error: unknown, fallback = "Request failed"): string {
    return parseApiError(error).message || fallback;
}

api.interceptors.request.use(
    (config: InternalAxiosRequestConfig) => {
        let token = getAuthToken();
        if (!token) {
            try {
                const rawAuth = localStorage.getItem("store-auth");
                if (rawAuth) {
                    const parsed = JSON.parse(rawAuth) as {
                        state?: { session?: { token?: string } };
                        session?: { token?: string };
                    };
                    token =
                        parsed?.state?.session?.token || parsed?.session?.token || null;
                }
            } catch {
                // ignore parse error
            }
        }
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
            localStorage.removeItem("token");
            sessionStorage.removeItem("token");
            localStorage.removeItem("store-auth");
            delete api.defaults.headers.common.Authorization;
        }
        return Promise.reject(error);
    },
);

export default api;
