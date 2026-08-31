import { create } from "zustand";
import { persist } from "zustand/middleware";
import { authService, type UpdateProfileInput } from "../services/auth.service";
import { setAuthToken, getAuthToken } from "../../../shared/lib/api";
import type { AuthSession, AuthUser } from "../types/auth.type";

interface AuthStore {
    session: AuthSession | null;
    login: (email: string, password: string) => Promise<void>;
    register: (name: string, email: string, password: string) => Promise<void>;
    googleLogin: (name: string, email: string) => Promise<void>;
    updateProfile: (input: UpdateProfileInput) => Promise<void>;
    logout: () => void;
}

export const useAuthStore = create<AuthStore>()(
    persist(
        (set, get) => ({
            session: null,

            login: async (email, password) => {
                const session = await authService.login(email, password);
                setAuthToken(session.token);
                set({ session });
            },

            register: async (name, email, password) => {
                const session = await authService.register(
                    name,
                    email,
                    password,
                );
                setAuthToken(session.token);
                set({ session });
            },

            googleLogin: async (_name, _email) => {
                throw new Error("Google login not supported");
            },

            updateProfile: async (input) => {
                const session = get().session;
                if (!session) return;
                const user = await authService.updateProfile(
                    session.user.id,
                    input,
                );
                set({ session: { ...session, user } });
            },

            logout: () => {
                localStorage.removeItem("token");
                sessionStorage.removeItem("token");
                set({ session: null });
            },
        }),
        {
            name: "store-auth",
            onRehydrateStorage: () => (state) => {
                if (state?.session?.token) setAuthToken(state.session.token);
            },
        },
    ),
);

export function useAuth() {
    const session = useAuthStore((s) => s.session);
    return {
        user: session?.user ?? null,
        isAuthed: session !== null,
        login: useAuthStore((s) => s.login),
        register: useAuthStore((s) => s.register),
        googleLogin: useAuthStore((s) => s.googleLogin),
        updateProfile: useAuthStore((s) => s.updateProfile),
        logout: useAuthStore((s) => s.logout),
    };
}
