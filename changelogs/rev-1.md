# Changelog — Rev 1

**Acuan:** PRD v1.0 (`plans/rev_1.md`)
**Status:** Implementasi

## Fitur yang ditambahkan / diubah

### Currency system
- Modul baru `src/modules/currency/` (types, constants, hooks, index).
- `formatPrice` (`src/shared/utils/format.ts`) kini currency-aware (baca store currency, konversi USD base → IDR/USD).
- Switch IDR/USD di user dropdown navbar; seluruh tampilan harga ikut berubah tanpa reload (ProductCard, SpecSheet, HomeHero, Wishlist, Cart, OrderSummary, admin).

### Navbar redesign
- Kanan hanya ikon: Search, Wishlist, Cart, User menu dropdown (Profile, Wishlist, Theme, Currency, Logout).
- Wishlist icon → navigasi, bukan dialog.
- Active state manual via `useLocation`; tema light ungu (`#39258d`)/dark putih → aktif **pink `#f34e7b` bold** (penyesuaian akhir di sesi).
- `WishlistDialog` dilepas dari header.

### Produk
- Grid 3 kolom (desktop), 2 (tablet), 1 (mobile); kontainer `max-w-7xl` (Home, Products).
- Breadcrumb detail: SKU → nama produk.
- Discount badge & coret harga (ProductCard), data produk sebagian ber-diskon.
- Banner slider: tinggi 75–80vh, touch swipe + mouse drag, dots theme-aware.

### Profile & auth
- `/profile/edit` layout 2 kolom desktop; tombol **Delete account** (AlertDialog) menggantikan logout.
- Tab Wishlist di `ProfileLayout` (+ `ProfileWishlistPage`, route `/profile/wishlist`).
- Login/Register: divider OR, tombol Continue with Google & Apple (Apple placeholder).
- Seed demo `admin@store.dev` → `customer@store.dev`, role `user`, nama `User`.

## Keputusan
- Wallet harga disimpan dalam satuan USD; tampilan dikonversi per currency aktif.

## Catatan
- Apple OAuth belum di-wire (placeholder).
- Inkonsistensi role "Admin" vs "Customer" di beberapa label sempat berubah saat proses rename global (dibereskan di ad-hoc).
