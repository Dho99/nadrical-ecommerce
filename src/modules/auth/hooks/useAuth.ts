import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { authService } from '../services/auth.service'
import type { AuthSession } from '../types/auth.type'

interface AuthStore {
  session: AuthSession | null
  login: (email: string, password: string) => Promise<void>
  register: (name: string, email: string, password: string) => Promise<void>
  logout: () => void
}

export const useAuthStore = create<AuthStore>()(
  persist(
    (set) => ({
      session: null,

      login: async (email, password) => {
        const session = await authService.login(email, password)
        set({ session })
      },

      register: async (name, email, password) => {
        const session = await authService.register(name, email, password)
        set({ session })
      },

      logout: () => set({ session: null }),
    }),
    { name: 'store-auth' },
  ),
)

export function useAuth() {
  const session = useAuthStore((s) => s.session)
  return {
    user: session?.user ?? null,
    isAuthed: session !== null,
    login: useAuthStore((s) => s.login),
    register: useAuthStore((s) => s.register),
    logout: useAuthStore((s) => s.logout),
  }
}
