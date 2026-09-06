# Changelog — Rev 2

**Acuan:** PRD Addendum v1.1 (`plans/rev_2.md`)
**Status:** Implementasi

## Fitur yang ditambahkan / diubah

### Search dialog
- `src/app/layout/SearchDialog.tsx`: ikon search → dialog pencarian penuh.
- Input debounce 300ms, loading skeleton, empty state, result preview, navigasi produk; tutup via tombol/Escape/klik luar; mobile full-screen-ish.
- `SiteHeader.tsx`: search tidak lagi mengambil space navbar.

### Navbar active state
- Aktif mengikuti current pathname; nested `/products/:id` tetap menandai Products.
- Tema: light aktif ungu, dark aktif merah (disempurnakan lagi di sesi ke warna logo — lihat ad-hoc).

### Wishlist route migration
- Route utama pindah `/profile/wishlist`; `/wishlist` → redirect.
- Header/user menu arah ke `/profile/wishlist`.

### Checkout
- `modules/checkout/services/shipping.service.ts`: daftar kurir JNE REG / J&T Express / SiCepat + Standard/Express, quote ongkir, ETA.
- `ShippingMethod` diperlebar (`jne/jnt/sicepat`); `StepShipping` kartu interaktif radio + harga live.
- `PaymentAccordion` (`payment.service.ts`): grup M-Banking / E-Money / Credit-Debit; child pilihan; fee E-Money.
- `CheckoutProductItem`: qty stepper di ringkasan (min 1), subtotal live.
- `useCheckoutRuntime` (zustand) + `useCheckoutCalculation` → total reactive (subtotal + ongkir + fee − diskon voucher).
- Schema checkout: `payment_method` + validasi kartu bersyarat (superRefine).
- Postal code lookup debounce 400→**300ms** (`postal.constants.ts`).

## Keputusan
- State shipping/payment pakai runtime store agar kolom form & ringkasan satu sumber kebenaran.

## Catatan
- ETA/status courier masih turunan deterministik; belum live courier API.
