# Plan rev_8 — LOCKED: better-auth React Integration (consume Go BE via VITE_API_BASE_URL)

**Status:** LOCKED — frontend only, guardrail private (`opencode.json` + `.opencode/` gitignored).
**Non-goal:** edit `nadrical-compro-admin/**`, `nadrical-compro-be/**`. BE hanya consume via `VITE_API_BASE_URL` (`src/shared/lib/api.ts`).

## Audit result

- ❌ `better-auth` belum dipakai. Auth = custom `zustand persist store-auth` + `axios POST /auth/register|/auth/login`, `GET/PUT /auth/profile`, `Bearer localStorage token`, Google `GoogleOAuthProvider` stub.
- `package.json` belum ada `better-auth`; `react 19.2.8` + `react-router-dom 7.18` compat (better-auth peer `react ^18||^19` ✅).

## Keputusan integrasi

- Pakai `better-auth/react` `createAuthClient` sebagai façade, **bridge via `customFetchImpl`** ke Go endpoints agar tidak butuh BE `/api/auth/*` ala better-auth server. Flow: `authClient.signIn.email({email,password})` → `customFetch` → `fetch(${VITE_API_BASE_URL}/auth/login, {identifier,password})`, `signUp.email` → `/auth/register`, `get-session` → `/auth/profile` + map ke `{session,user}`, `signOut` → local clear. Valid di `src/shared/lib/auth-client.ts:getBaseURL` → default `http://localhost:8080/api/v1`.
- Keep `Bearer` header + `localStorage token` + `zustand store-auth` untuk compat `api` interceptor + `RequireAuth`. Optional future: cookie `credentials: include` jika BE migrasi better-auth server.
- Google: keep `@react-oauth/google` sementara; better-auth social `google` butuh BE OAuth config — belum di BE, catat P2. `auth.service.googleLogin` tetap throw.
- `src/modules/auth/hooks/useAuth.ts` delegate `login/register/logout` ke `authClient` lalu sync ke `authService`+`setAuthToken`+`store-auth` (dual-write). `RequireAuth` tetap cek `useAuth().isAuthed`.

## File map (repo-scoped only)

```
src/shared/lib/auth-client.ts      NEW — createAuthClient({baseURL, fetchOptions:{customFetchImpl: goCustomFetch}})
src/modules/auth/hooks/useAuth.ts  EDIT — import authClient, login→signIn.email, register→signUp.email, logout→signOut
src/shared/lib/api.ts              KEEP — Bearer interceptor, VITE_API_BASE_URL
src/vite-env.d.ts                  (no new env; doc: reuse VITE_API_BASE_URL)
src/app/providers/AppProviders.tsx KEEP — no provider needed for react client (useSession via authClient)
src/app/routes/* & RequireAuth     KEEP — isAuthed dari useAuth
```

## Verifikasi

```powershell
npm i better-auth   # done 1.7.7
npx vite build      # wajib hijau (vite ok, tsc pre-existing inputmask TS7016 isolated)
git check-ignore opencode.json .opencode/guardrail.md  # private
git -C D:/projects/nadrical/nadrical-compro-be diff --name-only  # must empty
```

## P2 follow-up (optional, need BE)

- BE expose `better-auth` server `/api/auth/*` native (replace customFetch map).
- Google social via better-auth `socialProviders: [google]` + `VITE_GOOGLE_CLIENT_ID` → BE google verifier.
- Drop zustand `store-auth` once `authClient.useSession()` stabil; migrate `RequireAuth` → `authClient.useSession().data`.
