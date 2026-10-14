import { useEffect } from "react";
import { create } from "zustand";
import { persist } from "zustand/middleware";
import { authService, type UpdateProfileInput } from "../services/auth.service";
import { setAuthToken } from "../../../shared/lib/api";
import type { AuthStatus, AuthUser } from "../types/auth.type";

// UI-only auth state. No JWT/session token is stored here, in localStorage,
// or in memory — the session lives in an HttpOnly cookie set by the backend.
// `isAuthenticated` is a display hint; verification always happens via
// `GET /auth/profile` (cookie) on bootstrap and after login/register.
// One-time purge of legacy persisted store shapes (pre-cookie era).
// The raw JWT in localStorage "token" is intentionally KEPT: until the Go
// backend ships HttpOnly cookies it is the only credential the API accepts.
function purgeLegacyTokenArtifacts(): void {
    try {
        const raw = localStorage.getItem("store-auth");
        if (raw && raw.includes('"session"')) {
            localStorage.removeItem("store-auth");
        }
    } catch {
        // storage unavailable — ignore
    }
}

purgeLegacyTokenArtifacts();

interface AuthStore {
    user: AuthUser | null;
    isAuthenticated: boolean;
    status: AuthStatus;
    hydrated: boolean;
    login: (email: string, password: string) => Promise<string>;
    register: (name: string, email: string, password: string) => Promise<string>;
    googleLogin: (name: string, email: string) => Promise<string>;
    updateProfile: (input: UpdateProfileInput) => Promise<void>;
    bootstrap: () => Promise<void>;
    logout: () => Promise<void>;
}

export const useAuthStore = create<AuthStore>()(
    persist(
        (set) => ({
            user: null,
            isAuthenticated: false,
            status: "idle",
            hydrated: false,

            login: async (email, password) => {
                set({ status: "loading" });
                try {
                    const result = await authService.login(email, password);
                    // Confirm the cookie session before marking authenticated.
                    const confirmed =
                        (await authService.getProfile()) ?? result.user;
                    set({
                        user: confirmed,
                        isAuthenticated: true,
                        status: "authenticated",
                    });
                    return result.message;
                } catch (err) {
                    set({
                        user: null,
                        isAuthenticated: false,
                        status: "unauthenticated",
                    });
                    throw err;
                }
            },

            register: async (name, email, password) => {
                set({ status: "loading" });
                try {
                    const result = await authService.register(
                        name,
                        email,
                        password,
                    );
                    const confirmed =
                        (await authService.getProfile()) ?? result.user;
                    set({
                        user: confirmed,
                        isAuthenticated: true,
                        status: "authenticated",
                    });
                    return result.message;
                } catch (err) {
                    set({
                        user: null,
                        isAuthenticated: false,
                        status: "unauthenticated",
                    });
                    throw err;
                }
            },

            googleLogin: async (name, email) => {
                set({ status: "loading" });
                try {
                    const result = await authService.googleLogin(name, email);
                    const confirmed =
                        (await authService.getProfile()) ?? result.user;
                    set({
                        user: confirmed,
                        isAuthenticated: true,
                        status: "authenticated",
                    });
                    return result.message;
                } catch (err) {
                    set({
                        user: null,
                        isAuthenticated: false,
                        status: "unauthenticated",
                    });
                    throw err;
                }
            },

            updateProfile: async (input) => {
                const current = useAuthStore.getState().user;
                if (!current) return;
                const user = await authService.updateProfile(
                    current.id,
                    input,
                );
                set({ user });
            },

            bootstrap: async () => {
                set({ status: "loading" });
                const user = await authService.getProfile();
                if (user) {
                    set({
                        user,
                        isAuthenticated: true,
                        status: "authenticated",
                        hydrated: true,
                    });
                } else {
                    set({
                        user: null,
                        isAuthenticated: false,
                        status: "unauthenticated",
                        hydrated: true,
                    });
                }
            },

            logout: async () => {
                await authService.logout();
                setAuthToken(null);
                set({
                    user: null,
                    isAuthenticated: false,
                    status: "unauthenticated",
                    hydrated: true,
                });
            },
        }),
        {
            name: "store-auth",
            version: 2,
            // Drop legacy `{session:{token}}` payloads from pre-cookie era.
            migrate: (persisted: unknown) => {
                const p = (persisted ?? {}) as Record<string, unknown>;
                if ("session" in p || "token" in p) return {};
                return persisted as AuthStore;
            },
            // Persist public UI profile only — never a token.
            partialize: (s) => ({
                user: s.user,
                isAuthenticated: s.isAuthenticated,
            }) as AuthStore,
        },
    ),
);

export function useAuth() {
    const user = useAuthStore((s) => s.user);
    const isAuthed = useAuthStore((s) => s.isAuthenticated);
    const status = useAuthStore((s) => s.status);
    return {
        user,
        isAuthed,
        status,
        login: useAuthStore((s) => s.login),
        register: useAuthStore((s) => s.register),
        googleLogin: useAuthStore((s) => s.googleLogin),
        updateProfile: useAuthStore((s) => s.updateProfile),
        bootstrap: useAuthStore((s) => s.bootstrap),
        logout: useAuthStore((s) => s.logout),
    };
}

// Run once per app mount. Safe under StrictMode (idempotent bootstrap).
export function useInitializeAuth() {
    useEffect(() => {
        void useAuthStore.getState().bootstrap();
    }, []);
}
