# Changelog — Rev 3

**Acuan:** PRD Addendum v1.2 (`plans/rev_3.md`)
**Status:** Implementasi

## Fitur yang ditambahkan / diubah

### Livechat
- Komponen baru `ChatWindow`, `ChatInput`, `ProductContextPreview` (`src/modules/chat/components/`).
- **Guest**: tanpa form gate Nama/HP; jendela fit-content; pesan tersimpan sementara (state + localStorage); info "Masuk untuk lanjut riwayat".
- **Authenticated**: composer penuh, riwayat, loading/sending/**failed** + retry.
- **Product context**: contract bersama `shared/constants/chat.constants.ts` (`CHAT_OPEN_EVENT`, `ProductChatContext`); `SpecSheet` mengirim konteks produk (nama/harga/currency/kategori/availabilitas/gambar); livechat menampilkan preview.
- Module boundary: products tidak import chat langsung — lewat shared event/type.

### Navigation active state & warna
- Light: item regular samakan wordmark (`#39258d`), dark: putih; aktif **pink `#f34e7b`** bold di kedua tema (`SiteHeader.tsx`).
- Nested `/products/:id` tetap menandai group Products.

### Checkout stabilization
- Product image kembali di "Your Order" (`CheckoutProductItem`).
- Shipping single source `selectedShippingMethod` (runtime store) — kartu/border/harga/total sinkron.
- Payment child (BCA/GoPay/dll) bisa dipilih & ber-highlight; summary payment-fee reactive.

### Layout
- Standardisasi kontainer → `mx-auto w-full max-w-7xl` di halaman situs (Home, Products, Detail, Ratings, Cart, Checkout, Profile, Wishlist, Footer/Header).

### Order history restoration
- `profileService.getOrderHistory`: filter hasil backend by email; mapping `user_id` prioritaskan `account.email`.

### Lainnya
- HomeBanner: kontrol dots/arrow kontras + hover, tidak invisible di kedua tema.

## Keputusan
- Product context lintas modul lewat shared constant/type (bukan import antar modul).

## Catatan
- Module `chat` tetap bernama `chat` (bukan `livechat`); `orders` & `navigation` tidak dibuat sebagai modul terpisah saat itu (orders menyusul di rev_4).
