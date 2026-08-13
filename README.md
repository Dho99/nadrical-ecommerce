# Store. — E-commerce Template

Template e-commerce **frontend-only** dengan nama "Store." — lengkap dari storefront, keranjang, checkout, hingga panel admin. Seluruh data berjalan di `localStorage` dengan service layer mock (artificial delay + random failure), sehingga langsung bisa dijalankan tanpa backend.

|                 |                                                                                  |
| --------------- | -------------------------------------------------------------------------------- |
| Build           | Vite 8 · React 19 · TypeScript 6 · React Compiler                                |
| UI              | Tailwind CSS v4 · shadcn/ui · radix-ui · next-themes                             |
| State & Data    | zustand 5 · react-router-dom 7 · react-hook-form 7 · zod 4 · recharts 3 · sonner |
| Auth & Realtime | @react-oauth/google · laravel-echo 2 + pusher-js (Laravel Reverb-ready)          |

---

## Daftar Isi

1. [Tech Stack](#tech-stack)
2. [Fitur Utama](#fitur-utama)
3. [Arsitektur & Folder Structure](#arsitektur--folder-structures)
4. [Data & Storage](#data--storage)
5. [Setup & Menjalankan](#setup--menjalankan)
6. [Environment Variables](#environment-variables)
7. [Akun Demo & Alur Tes](#akun-demo--alur-tes)
8. [Batasan](#batasan)
9. [Roadmap](#roadmap)
10. [Lisensi](#lisensi)

---

## Tech Stack

### Core

| Teknologi                                      | Versi   | Peran                                                    |
| ---------------------------------------------- | ------- | -------------------------------------------------------- |
| [Vite](https://vite.dev)                       | ^8.2.0  | Build tool & dev server                                  |
| [React](https://react.dev)                     | ^19.2.8 | UI framework                                             |
| [TypeScript](https://www.typescriptlang.org)   | ~6.0.2  | Static typing                                            |
| React Compiler (`babel-plugin-react-compiler`) | ^1.0.0  | Otomatis memoize komponen (via `@rolldown/plugin-babel`) |

### UI & Styling

| Teknologi                             | Peran                                                                                   |
| ------------------------------------- | --------------------------------------------------------------------------------------- |
| Tailwind CSS v4 (`@tailwindcss/vite`) | Utility-first styling                                                                   |
| shadcn/ui + `radix-ui` (unified)      | Komponen aksesibel (Dialog, Sheet, Tabs, Select, dll.)                                  |
| `next-themes`                         | Dark/light mode                                                                         |
| `lucide-react`                        | Ikon                                                                                    |
| `@fontsource/*`                       | Space Grotesk Variable (display), Archivo, IBM Plex Mono (mono), Big Shoulders Variable |
| `tw-animate-css`                      | Animasi utility                                                                         |

### State, Routing & Data

| Teknologi                                 | Peran                                      |
| ----------------------------------------- | ------------------------------------------ |
| `zustand` ^5.0.14                         | State management + persist middleware      |
| `react-router-dom` ^7.18.2                | Routing (nested routes, guards)            |
| `react-hook-form` + `zod` + `zodResolver` | Form & validasi (wajib di tiap module)     |
| `recharts` ^3.8.0                         | Chart admin (revenue area, kategori donut) |
| `sonner`                                  | Toast notifications                        |

### Auth & Realtime

| Teknologi                                  | Peran                                                                       |
| ------------------------------------------ | --------------------------------------------------------------------------- |
| `@react-oauth/google` ^0.13.5              | Google OAuth (Google Identity Services)                                     |
| `laravel-echo` ^2.4.0 + `pusher-js` ^8.6.0 | WebSocket client, kompatibel dengan **Laravel Reverb** (Pusher protocol v7) |

---

## Fitur Utama

### Storefront

- **Home** — hero grid produk + indeks kategori + featured products
- **Katalog** (`/products`) — filter kategori, sort (featured/price/stock), pencarian (nama & SKU), in-stock filter, **infinite scroll** dengan cursor pagination
- **Detail produk** (`/products/:id`) — gallery dengan zoom dialog, spec sheet, varian produk (harga & stok berbeda), qty stepper, tombol **Add to cart** & **Buy now**
- **Cart** (`/cart`) — **hanya untuk user authenticated** (guest diarahkan ke login), ubah qty, hapus item, ringkasan total
- **Checkout** (`/checkout`) — 3 langkah (Delivery → Shipping → Payment), email terkunci dari akun, validasi zod per langkah, confirmation card, order tersimpan ke history
- **Profile** (`/profile`) — ringkasan akun (avatar inisial, role, statistik orders & total belanja) + **Order history** (`/profile/orders`) dengan status badge

### Admin (`/admin`, role `admin`)

- **Dashboard** — KPI cards (revenue, orders, AOV, low stock), revenue chart, kategori chart, recent orders, low stock list, **broadcast announcement**
- **Produk** — tabel dengan cursor pagination, create/edit via form (gambar preset, specs dinamis, varian maks. 10), delete dengan konfirmasi, reset katalog
- **Orders** — list + pagination, status otomatis (Processing → Shipped → Delivered)
- **Chat inbox** — balas percakapan customer secara real-time (event `storage`)
- **Guard** — area admin hanya untuk role `admin`

### Auth

- Register / Login (mock service, tersimpan di `localStorage`)
- **Google OAuth** — tombol "Sign in with Google" (muncul jika `VITE_GOOGLE_CLIENT_ID` diset), upsert akun otomatis
- Guard: `RequireAuth` (cart, checkout, profile) & `AdminGuard`

### Notifikasi

- Bell di header (hanya authed) dengan badge unread
- Sumber: **order status** (confirmed → shipped → delivered) + **announcement broadcast** dari admin
- Panel Sheet: mark read, mark all read, clear, time-ago

### Lainnya

- **Live chat widget** (floating, bottom-right) — auto-reply bot, identitas user/guest, tersimpan di `localStorage`
- Dark/light mode, aksesibilitas (aria, semantic), layout `container mx-auto`

---

## Arsitektur & Folder Structure

Menggunakan pendekatan **Service-Based Layer Architecture** (aturan detail di `AGENTS.md`): setiap feature berdiri sebagai module mandiri dengan dependency internalnya sendiri.

```text
src/
├── app/
│   ├── layout/          # AppLayout, AdminLayout, SiteHeader, ProfileLayout, dll.
│   ├── routes/          # Router config, halaman, guards (RequireAuth, AdminGuard)
│   └── providers/       # ThemeProvider, GoogleOAuthProvider, Toaster
│
├── modules/             # 9 module feature mandiri
│   ├── admin/           # Dashboard, CRUD produk, orders, chat inbox, broadcast
│   ├── auth/            # Register/login/Google, session (zustand persist)
│   ├── cart/            # Cart store + guards (useGuardedAdd, useBuyNow)
│   ├── chat/            # Live chat widget + bot
│   ├── checkout/        # 3-step form, order placement, repository
│   ├── home/            # Hero & kategori home
│   ├── notifications/   # Bell, order status + announcement
│   ├── products/        # Katalog, detail, varian, specs, infinite scroll
│   └── profile/         # Ringkasan akun & order history
│
├── shared/              # Dipakai lintas module
│   ├── components/      # ui/ (shadcn) + ProductImage, ThemeProvider
│   ├── hooks/           # useInfiniteScroll
│   ├── lib/             # mock helpers, echo (Reverb client)
│   ├── types/           # Product, Order, CursorPage, dll.
│   └── utils/           # cn, format, order-status, unsplash
│
└── assets/
```

### Struktur wajib tiap module

```text
module-name/
├── components/
├── hooks/
├── services/
├── schemas/
├── types/
├── constants/
├── utils/
└── index.ts
```

### Aturan dependency

- Prioritas: `modules → shared` — **shared tidak boleh mengimpor module**
- Module **tidak boleh saling bergantung langsung** (komunikasi via shared types / service abstraction)
- Komponen module hanya untuk module itu; yang lintas module pindah ke `shared/components`
- Component **tidak boleh request langsung** ke storage/API — harus lewat service layer
- Hook menangani state & business logic; component hanya menerima data dan action
- Semua schema validasi wajib zod + react-hook-form + zodResolver di `schemas/`
- Type spesifik module di `types/`; type lintas module di `shared/types/`

### Alias

`@/` → `./src` (dikonfigurasi di `vite.config.ts`).

---

## Data & Storage

Tidak ada backend — semua data tersimpan di `localStorage` browser dengan prefix `store-`.

| Key                      | Isi                                                |
| ------------------------ | -------------------------------------------------- |
| `store-products-v1`      | Katalog produk (seed 18 produk)                    |
| `store-orders-v1`        | Order dari checkout + seed demo admin (~130 order) |
| `store-cart-v2`          | Keranjang user                                     |
| `store-users`            | Akun terdaftar (password plain, mock)              |
| `store-auth`             | Session aktif (zustand persist)                    |
| `store-chat-v1`          | Percakapan live chat                               |
| `store-chat-guest`       | ID guest chat                                      |
| `store-notifications-v1` | Notifikasi + baseline status order                 |

### Pola service layer

- Semua interaksi storage melalui service: `load/save` via repository + `mockDelay()` (artificial latency) + `mockFail()` (random failure ~2–5%) agar meniru kondisi API nyata
- **Status order berbasis waktu**: `Processing` (< 2 jam), `Shipped` (< 5 hari), `Delivered` — dihitung dari `placedAt` via `shared/utils/order-status.ts` (membuat notifikasi dan dashboard live tanpa backend)
- **Pagination cursor**: `CursorPage<T> { items, total, nextCursor, prevCursor }` — storefront 12 item, admin 10, orders 10, chat 15

---

## Setup & Menjalankan

```bash
npm install        # install dependencies
npm run dev        # dev server (HMR) — http://localhost:5173
npm run build      # production build (tsc -b && vite build)
npm run preview    # preview hasil build
npm run lint       # eslint
```

Build menghasilkan bundle di `dist/` (catatan: ada warning chunk > 500 kB yang non-blocking).

---

## Environment Variables

Salin `.env.example` menjadi `.env` lalu isi sesuai kebutuhan:

```env
# Laravel Reverb (WebSocket) — opsional, scaffold saja
VITE_REVERB_APP_KEY=your-reverb-app-key
VITE_REVERB_HOST=127.0.0.1
VITE_REVERB_PORT=8080
VITE_REVERB_SCHEME=http

# Google OAuth (Google Cloud Console > Credentials > OAuth client ID)
VITE_GOOGLE_CLIENT_ID=your-client-id.apps.googleusercontent.com
```

Catatan:

- Tanpa `VITE_GOOGLE_CLIENT_ID`, tombol Google tidak dirender.
- Client Echo (Reverb) di `shared/lib/echo.ts` bersifat **null-safe**: tanpa env lengkap, `getEcho()` mengembalikan `null` dan aplikasi tetap berjalan normal.

---

## Akun Demo & Alur Tes

| Peran | Email             | Password   |
| ----- | ----------------- | ---------- |
| Admin | `admin@store.dev` | `admin123` |

### Alur storefront

1. Register akun baru (atau Google sign-in jika env diset)
2. Buka katalog → detail produk → pilih varian/qty → **Add to cart** atau **Buy now**
3. Checkout (email sudah terkunci dari akun) → place order
4. Buka `/profile/orders` → order muncul; buka bell → notifikasi **"Order confirmed"**
5. (Setelah threshold waktu) notifikasi shipped/delivered muncul otomatis

### Alur admin

1. Login `admin@store.dev` / `admin123` → `/admin`
2. Dashboard → **Broadcast to customers** (muncul di bell semua user)
3. Products → create/edit/delete produk
4. Chat → balas percakapan customer
5. Orders → lihat semua order + status

---

## Batasan

- **Mock-only**: data hilang saat `localStorage` dibersihkan; tidak ada persistensi server
- **Satu browser**: akun & keranjang dibagi antar tab browser yang sama
- **Google OAuth**: butuh client ID valid; token di-decode client-side tanpa verifikasi server
- **Reverb**: hanya scaffold client (`laravel-echo` + `pusher-js`); perlu backend Laravel + Reverb server untuk benar-benar konek
- **Status order berbasis waktu**: status tidak dari event server, melainkan dihitung dari umur order
- **Password disimpan plain** di localStorage (murni demo, jangan untuk produksi)

---

## Roadmap

- [ ] Integrasi backend Laravel (API + auth sanctum, migrasi service mock → HTTP)
- [ ] WebSocket real-time via Laravel Reverb (chat, notifikasi, stock live)
- [ ] Google OAuth dengan verifikasi token di server
- [ ] Upload gambar produk (S3/storage Laravel) menggantikan preset URL
- [ ] Payment gateway (Midtrans/Xendit) menggantikan kartu demo
- [ ] Pagination storefront ganti offset-cursor dengan cursor asli (id-based)
- [ ] E2E test (Playwright) & unit test untuk service layer

---

## Lisensi

MIT License — silakan digunakan dan dimodifikasi secara bebas. Dibuat sebagai template pembelajaran & dasar pengembangan e-commerce.
