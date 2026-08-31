import type { StandardResponse } from "../types/api.response";
import { handleMockRequest } from "./mockApi";

const BASE_URL: string = import.meta.env.VITE_API_BASE_URL || "/api/v1";
const USE_MOCK: boolean = import.meta.env.VITE_USE_MOCK === "true";

let _token: string | null = null;

export function setAuthToken(token: string | null): void {
    _token = token;
}

export function getAuthToken(): string | null {
    return _token;
}

interface ApiRequestOptions extends RequestInit {
    params?: Record<string, string>;
    skipAuth?: boolean;
}

function buildURL(url: string, params?: Record<string, string>): string {
    const full = url.startsWith("http") ? url : `${BASE_URL}${url}`;
    if (!params || Object.keys(params).length === 0) return full;
    const controller = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== "") {
            controller.append(key, value);
        }
    });
    const qs = controller.toString();
    return qs ? `${full}?${qs}` : full;
}

async function request<T>(
    url: string,
    options: ApiRequestOptions = {},
): Promise<T> {
    const { params, skipAuth = false, ...fetchOptions } = options;

    if (USE_MOCK) {
        const method = fetchOptions.method ?? "GET";
        const body =
            typeof fetchOptions.body === "string"
                ? JSON.parse(fetchOptions.body)
                : fetchOptions.body;
        const mockData = await handleMockRequest({
            method,
            path: url,
            params,
            body,
        });
        if (!mockData.success) {
            throw new Error(mockData.message || "Mock request failed");
        }
        return mockData.data as T;
    }

    const config: RequestInit = {
        ...fetchOptions,
        credentials: "include",
        headers: {
            "Content-Type": "application/json",
            ...(fetchOptions.headers as Record<string, string> | undefined),
        },
    };

    if (!skipAuth && _token) {
        config.headers = {
            ...(config.headers as Record<string, string>),
            Authorization: `Bearer ${_token}`,
        };
    }

    const fullURL = buildURL(url, params);

    const response = await fetch(fullURL, config);

    if (!response.ok) {
        let errorData: unknown;
        try {
            errorData = await response.json();
        } catch {
            errorData = { message: response.statusText };
        }
        const sr = errorData as StandardResponse;
        throw new Error(sr.message || `HTTP ${response.status}`);
    }

    const data: StandardResponse<T> = await response.json();

    if (!data.success) {
        throw new Error(data.message || "Request failed");
    }

    return data.data as T;
}

export const api = {
    get: <T>(
        url: string,
        params?: Record<string, string>,
        options?: ApiRequestOptions,
    ) => request<T>(url, { ...options, params, method: "GET" }),

    post: <T>(url: string, body?: unknown, options?: ApiRequestOptions) =>
        request<T>(url, {
            ...options,
            method: "POST",
            body: body ? JSON.stringify(body) : undefined,
        }),

    put: <T>(url: string, body?: unknown, options?: ApiRequestOptions) =>
        request<T>(url, {
            ...options,
            method: "PUT",
            body: body ? JSON.stringify(body) : undefined,
        }),

    patch: <T>(url: string, body?: unknown, options?: ApiRequestOptions) =>
        request<T>(url, {
            ...options,
            method: "PATCH",
            body: body ? JSON.stringify(body) : undefined,
        }),

    delete: <T>(url: string, options?: ApiRequestOptions) =>
        request<T>(url, { ...options, method: "DELETE" }),

    upload: <T>(url: string, formData: FormData, options?: ApiRequestOptions) =>
        request<T>(url, {
            ...options,
            method: "POST",
            headers: {
                ...((options?.headers as Record<string, string>) || {}),
                // Do not set Content-Type for FormData, browser sets it with boundary
            },
            body: formData,
        }),
};

export type { ApiRequestOptions };
