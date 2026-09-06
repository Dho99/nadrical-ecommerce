# Store. — E-commerce Template

Template e-commerce **frontend** dengan nama "Store." — storefront lengkap: katalog, detail produk, keranjang, checkout, order management (detail/refund/tracking/invoice), live chat, akun/profile, dan currency IDR/USD. Area **back-office tidak disertakan** di repo ini (dikembangkan di aplikasi web terpisah).

Data berjalan mock-first via service layer: beberapa state persist di `localStorage`, sebagian lain in-memory (siap di-wire ke API), dengan fallback HTTP (axios) saat backend tersedia.

|                 |                                                                                          |
| --------------- | ---------------------------------------------------------------------------------------- |
| Build           | Vite 8 · React 19 · TypeScript 6 · React Compiler                                        |
| UI              | Tailwind CSS v4 · shadcn/ui · radix-ui · next-themes                                     |
| State & Data    | zustand 5 · react-router-dom 7 · react-hook-form 7 · zod 4 · axios · sonner              |
| Export & Realtime | jspdf (invoice PDF) · @react-oauth/google · Native WebSocket (Go server)               |

---

## Daftar Isi

1. [Tech Stack](#tech-stack)
2. [Fitur Utama](#fitur-utama)
3. [Arsitektur & Folder Structure](#arsitektur--folder-structure)
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
| `@fontsource/*`                       | Font display, sans, mono                                                                 |
| `tw-animate-css`                      | Animasi utility                                                                         |

### State, Routing & Data

| Teknologi                                 | Peran                                      |
| ----------------------------------------- | ------------------------------------------ |
| `zustand` ^5.0.14                         | State management + persist middleware      |
| `react-router-dom` ^7.18.2                | Routing (nested routes, guards)            |
| `react-hook-form` + `zod` + `zodResolver` | Form & validasi (wajib di tiap module)     |
| `axios`                                   | HTTP client (fallback/mock ke backend)     |
| `sonner`                                  | Toast notifications                        |

### Export & Realtime

| Teknologi                                  | Peran                                                                       |
| ------------------------------------------ | --------------------------------------------------------------------------- |
| `jspdf`                                    | Generate invoice PDF (download)                                             |
| `@react-oauth/google` ^0.13.5              | Google OAuth (Google Identity Services)                                     |
| Native WebSocket                           | Client bawaan browser → Go WebSocket server untuk chat real-time            |

> Catatan: `recharts` masih ada di `package.json` tapi tidak dipakai lagi pasca area dashboard (back-office) dipindah keluar repo.

---

## Fitur Utama

### Storefront

- **Home** — hero slider + kategori + featured products
- **Search dialog** — ikon search membuka dialog (debounce 300ms, skeleton, empty state, preview hasil)
- **Katalog** (`/products`) — filter kategori, sort, pencarian, filter harga/discount/in-stock, **infinite scroll** cursor pagination; container `max-w-7xl`
- **Detail produk** (`/products/:id`) — gallery, spec sheet, varian (harga/stok beda), qty stepper, Add to cart / Buy now, **Message** membuka livechat dengan konteks produk
- **Cart** (`/cart`) — authed only, ubah qty, hapus, ringkasan
- **Checkout** (`/checkout`) — 3 langkah; pilih **kurir** (Standard/Express/JNE/J&T/SiCepat), **payment accordion** (M-Banking/E-Money/Card), qty editable, total reactive (subtotal+ongkir+fee−diskon)
- **Currency** — switch IDR/USD dari user menu; seluruh nominal berubah tanpa reload
- **Wishlist** (`/profile/wishlist`) — simpan/hapus produk

### Akun (`/profile`)

- Overview + **Edit profile** (`/profile/edit`, 2 kolom, delete account dengan konfirmasi)
- **Order history** (`/profile/orders`) — tab status + kartu order
- **Order detail** (`/profile/orders/:id`) — journey, shipment accordion, resi + copy, tracking dialog, aksi per status, **Download invoice (PDF)**
- **Refund** (`/profile/orders/:id/refund`) — halaman penuh: alasan (wajib, highlight), catatan, upload bukti foto/video, status refund
- Address book, voucher, tab Wishlist

### Auth

- Register / Login (mock service)
- Google OAuth (jika `VITE_GOOGLE_CLIENT_ID` diset); placeholder Apple
- Guard `RequireAuth` untuk cart/checkout/profile

### Live chat

- Floating widget; guest (tanpa form, pesan sementara, info login) vs authenticated (riwayat, loading/sending/failed)
- Konteks produk otomatis ketika dari halaman detail produk

### Notifikasi

- Bell (authed) — order & sistem

---

## Arsitektur & Folder Structure

Pendekatan **Service-Based Layer Architecture** (aturan di `AGENTS.md`): tiap feature module mandiri.

```text
src/
├── app/
│   ├── layout/          # AppLayout, ProfileLayout, SiteHeader, SiteFooter, SearchDialog
│   ├── routes/          # Router config & halaman (RequireAuth untuk area privat)
│   └── providers/       # ThemeProvider, GoogleOAuthProvider, Toaster
│
├── modules/             # 13 module feature mandiri
│   ├── address/         # Buku alamat user
│   ├── auth/            # Register/login/Google, session (zustand persist)
│   ├── cart/            # Cart store + guard (useGuardedAdd, useBuyNow)
│   ├── chat/            # Live chat widget (guest/authed) + product context
│   ├── checkout/        # 3-step form, kurir/payment, qty, total, repository
│   ├── currency/        # Currency IDR/USD + format harga
│   ├── home/            # Hero slider & kategori home
│   ├── notifications/   # Bell notifikasi
│   ├── orders/          # Order detail, timeline, refund, tracking, invoice
│   ├── products/        # Katalog, detail, varian, specs, infinite scroll
│   ├── profile/         # Overview akun & order history
│   ├── voucher/         # Voucher diskon/ongkir
│   └── wishlist/        # Wishlist store/button/halaman
│
├── shared/              # Dipakai lintas module
│   ├── components/      # ui/ (shadcn) + ProductImage, OrderStatusBadge, ThemeProvider
│   ├── constants/       # chat event + product context contract
│   ├── hooks/           # useDebounce, useInfiniteScroll
│   ├── lib/             # api (axios), mock/mockApi/mockData, websocket, alert
│   ├── types/           # Product, Order, CursorPage, Database, dll.
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

- Prioritas `modules → shared`; shared tidak boleh mengimpor module.
- Module tidak saling bergantung langsung — komunikasi via shared contract/type (contoh: product context lewat `shared/constants/chat.constants`).
- Component tidak boleh request langsung — lewat service layer; hook memegang state/business logic.
- Schema validasi zod + react-hook-form + zodResolver di `schemas/`.
- Type module di `types/`, type lintas module di `shared/types/`.

### Alias

`@/` → `./src` (vite.config).

---

## Data & Storage

Mock-first. Sebagian state persist zustand (`localStorage`), sebagian lain in-memory.

| Key                      | Isi                                              |
| ------------------------ | ------------------------------------------------ |
| `store-auth`             | Session aktif (zustand persist)                  |
| `store-cart-v3`          | Keranjang user                                   |
| `store-wishlist`         | Daftar wishlist                                  |
| `store-currency`         | Preferensi currency (IDR/USD)                    |
| `store-voucher-v1`       | Voucher terpasang                                |
| `store-addresses-v1`     | Buku alamat                                      |
| `store-notifications-v1` | Notifikasi                                       |
| `store-chat-guest`       | ID guest chat                                    |

Catatan:

- Order history `/profile/orders` diambil dari **mock seed** (`generateUserOrders`) + order lokal sesi — tanpa fetch API, aman saat backend off.
- **Refund** tidak persist (in-memory) karena akan di-wire ke API; bukti upload berumur sesi.
- Invoice digenerate **di sisi klien** (jsPDF) — PDF statis, currency di-snapshot saat download.
- Katalog produk & chat memakai service layer mock dengan fallback axios (`VITE_USE_MOCK`).

---

## Setup & Menjalankan

### 1. Frontend
```bash
npm install
npm run dev        # http://localhost:5173
npm run build      # tsc -b && vite build
npm run preview
npm run lint
```

### 2. Go WebSocket Server (opsional, chat multi-browser)
```bash
cd server
go run main.go     # http://localhost:8080/ws
```

Build menghasilkan `dist/`.

---

## Environment Variables

Salin `.env.example` → `.env`:

```env
# API Base URL
VITE_API_BASE_URL=http://localhost:8080/api/v1

# WebSocket
VITE_WEBSOCKET_URL=ws://127.0.0.1:8080/ws
VITE_WS_HOST=127.0.0.1
VITE_WS_PORT=8080

# Use placeholder mock API while backend is not ready. false = real backend.
VITE_USE_MOCK=false

# Google OAuth
VITE_GOOGLE_CLIENT_ID=
```

Catatan: tanpa `VITE_GOOGLE_CLIENT_ID`, tombol Google tidak dirender. WebSocket client null-safe (auto reconnect tanpa crash).

---

## Akun Demo & Alur Tes

| Peran | Email | Password |
| ----- | ----- | -------- |
| Admin (web terpisah) | `admin@nadrical.my.id` | `Admin123#` |
| Customer (storefront) | `customer@store.dev` | `admin123` |

### Alur storefront

1. Login `customer@store.dev` / `admin123` (atau register/Google).
2. Jelajahi katalog → search dialog → detail produk → tambah cart / Buy now.
3. Coba ganti currency IDR ↔ USD (user menu) — semua harga berubah.
4. Checkout: isi alamat (postal code auto-fill), pilih kurir & metode bayar, ubah qty → Place order.
5. Buka `/profile/orders` → klik order → detail: journey, tracking (accordion/dialog), **Download invoice**, atau **Request refund** (upload bukti).
6. Wishlist: simpan produk → `/profile/wishlist`; live chat dari detail produk membawa konteks produk.

---

## Batasan

- **Mock-first**: order/refund belum terhubung backend; data lokal hilang saat storage dibersihkan (kecuali seed).
- **Refund & invoice** belum di-persist ke server (siap wire API).
- **Payment demo** — tidak ada kartu/uang asli yang ditagih.
- Area **back-office tidak ada di repo** ini.
- Google OAuth: butuh client ID valid; token di-decode client-side.
- WebSocket: jika Go server mati, chat fallback sync antar-tab.
- `recharts` dependency tersisa (tidak terpakai).

---

## Roadmap

- [ ] Wire refund/upload bukti & invoice ke backend/API
- [ ] Back-office terpisah (repo/web terpisah) dilanjutkan terpisah
- [ ] Payment gateway nyata (Midtrans/Xendit)
- [ ] Google OAuth dengan verifikasi token di server
- [ ] Upload gambar produk ke storage, bukan preset URL
- [ ] E2E test (Playwright) & unit test service layer

---

## Changelog

Laporan perubahan per fase tersedia di [`changelogs/`](./changelogs/).

---

## Lisensi

MIT License — silakan digunakan dan dimodifikasi secara bebas. Template pembelajaran & dasar pengembangan e-commerce.
