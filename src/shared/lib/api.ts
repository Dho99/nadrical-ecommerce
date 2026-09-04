import axios, {
  type AxiosError,
  type AxiosResponse,
  type InternalAxiosRequestConfig,
} from "axios";

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
        }
        return Promise.reject(error);
    },
);

export default api;
