# Plan rev_7 — LOCKED: Audit API Integration Follow-up (Frontend Only)

**Status:** LOCKED — eksekusi P0→P1 berurutan, tidak boleh melebar ke repo sibling.
**Scope:** `D:\projects\nadrical\ecommerce-template` SAJA (lihat `.opencode/guardrail.md`).
**Non-goal:** edit `nadrical-compro-admin/**`, `nadrical-compro-be/**`. BE hanya via `VITE_API_BASE_URL`.
**Referensi:** hasil audit 20 modul (11 integrasi + sub-modul produk + currency/tax + mobile).

## P0 — Kritis (blok rilis)

1. **Logo & Banner wiring** — `SiteHeader.tsx` pakai `bannerService.getLogo()/useLogo` (ganti `/logo.svg` hardcoded); `HomeBanner.tsx` pakai `useBannerImages` (ganti `BANNERS[5]` hardcoded). Fix unwrap `res.data as BannerSetting` → `unwrapData` seperti `site-settings.service`. Test parse JSON `hero_banner`.
2. **Review Create → API** — `ReviewFormDialog.tsx`: `userReviewStorage.addReview` → `reviewService.createReview(productId,{rating,comment})`. Tangani guard `isUuid`, error via `getErrorMessage`, invalidate `useReviews`. Hapus path localStorage-only.
3. **List Customer** — module baru `src/modules/customers/` (service/get-list + pagination/filter) + route `/admin/customers`. Perlu endpoint BE baru (`GET /users|/customers`); jika belum ada, expose error state + catat dependency BE, JANGAN buat di repo BE.
4. **Chat real** — selaraskan `VITE_WEBSOCKET_URL` (`ws://127.0.0.1:8080/ws` vs server `:8085` vs prod `wss://demo-be-eco...`); ganti `localStorage+bot timer` → `POST /chat/messages` + routing WS per `conversation_id` + auth. Tanpa BE chat, minimal perbaiki URL + tandai mock.
5. **Dashboard Export** — implement `dashboard.service.exportData()`: `GET /dashboard/export?type=&format=` bila BE ready, else client-side `Blob+createObjectURL` (ikuti pola `invoice.service` jsPDF). Hilangkan `throw` stub.

## P1 — Tinggi

6. **PromoDialog** — `unwrapData<PromoDialog[]>`, mount global di `AppProviders` (kini hanya `HomePage`).
7. **Loyalty** — `loyalty.service` pakai `unwrapData`, error UI di `LoyaltyDisplay`, pagination `transactions?page=&limit=`.
8. **Urutan Product** — kolom `display_order` + `PUT /ecommerce/products/reorder` + UI drag-drop admin (`@dnd-kit/sortable`). Perlu BE; tanpa BE, catat dependency.
9. **Review lanjutan** — halaman moderasi admin (`approve/hide/delete`), hilangkan silent `catch{}`, kirim `rating` sebagai param BE.
10. **Order Refund** — `refund.service` memory → `POST /ecommerce/orders/:id/refund` persist; hapus `user-order.seed.ts` dead.

## P2 — Cleanup

11. Gate dead mock (`mock-data.ts`, `product.repository.ts`, `review.mock.generateMockReviews`, `shared/lib/mockData.ts`) di belakang `VITE_USE_MOCK` atau hapus.
12. Lengkapi payload `product create/update` (`specs/variants/images/badge/is_preorder/sku`) + validasi `product.schema.ts`.
13. Pagination benar (`unwrapMeta`, `limit/page`) untuk voucher/loyalty/review.
14. Currency: integrasi `GET /currency/rates` atau cabut fitur (Tax sudah ✅).
15. Mobile QA: snapshot e2e `Sheet` Android 5" + iOS Safari.

## Definition of Done per item

- [ ] Zero `mock/dummy/hardcoded` array untuk data yang sudah ada endpoint-nya.
- [ ] `loading` + `error` + `empty` state tampil (no silent `catch{}`).
- [ ] `unwrapData` konsisten; response mapping cocok kontrak `{success,message,data}`.
- [ ] `git diff --name-only` hanya file dalam repo ini; guardrail `.opencode/guardrail.md` + `opencode.json` permission tetap utuh.

## Verifikasi

```powershell
git -C D:\projects\nadrical\ecommerce-template status --short
git -C D:\projects\nadrical\ecommerce-template diff --name-only
npm run build  # wajib hijau tiap P0 selesai
```
