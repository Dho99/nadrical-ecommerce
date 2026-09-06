# Changelog — Rev 4

**Acuan:** PRD Addendum v1.3 (`plans/rev_4.md`)
**Status:** Implementasi (sebagian P2 di luar scope)

## Modul baru

`src/modules/orders/`
- `types/` — order, refund (`RefundStatus`), shipment, invoice.
- `schemas/refund.schema.ts` — reason (zod enum, wajib), note optional.
- `services/` — `shipment.service.ts`, `refund.service.ts`, `invoice.service.ts`.
- `hooks/` — `useRefund`, `useShipmentTracking`.
- `components/` — `OrderTimeline`, `ShipmentAccordion`, `ShipmentDialog`, `InvoiceButton`, `RefundRequestForm`.
- Seed demo `user-order.seed.ts` dipindah ke sini dari `modules/profile`.

## Fitur

### Order detail — `/profile/orders/:id`
- Header (nomor, tanggal, status badge) + order journey timeline.
- Shipment accordion per state (Payment/Processing/Shipped/Delivered) dengan detail + resi + copy.
- Items: gambar, nama, qty, variant (SKU disembunyikan).
- Shipping info: kurir, resi, alamat.
- Actions sesuai status: Cancel (PAID/PROCESSING), Track (SHIPPED), Refund + Reorder (DELIVERED/COMPLETED), Invoice (COMPLETED).
- Skeleton/empty/error.

### Refund
- Awal: dialog; kemudian pindah **halaman penuh** `/profile/orders/:id/refund` (lihat ad-hoc) agar upload bukti tidak terbatas dimensi dialog.
- Reason di-highlight saat terpilih.
- Bukti foto & video (multi, preview, remove).
- Refund status: PENDING (mock in-memory, tanpa localStorage — siap wire API).

### Shipment tracking
- `shipmentService`: kurir label, nomor resi (dari order / deterministic fallback), status, event perjalanan (package received / in transit / out for delivery / delivered) dengan timestamp & lokasi.
- `ShipmentDialog` timeline lokasi; status badge.

### Invoice
- Tombol Download invoice → PDF via **jsPDF**.
- Lihat `ad-hoc` untuk blueprint v2 final.

## Keputusan
- Data order tetap mock seed; invoice/tracking deterministik dari order.
- Tracking number fallback di-generate agar selalu tersedia untuk demo.

## Catatan
- Map tracking & live courier update (P2) belum.
- Advanced refund workflow & digital signature (P2) belum.
