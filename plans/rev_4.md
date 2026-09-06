
---

# PRD Addendum v1.3

# Order Detail, Refund, Shipment Tracking & Invoice Enhancement

**Affected Module**

```text
modules/orders
modules/profile
modules/invoice
modules/shipping
```

---

# 1. Order Detail Experience Improvement

## Objective

Mengubah halaman order history menjadi halaman pengelolaan pesanan yang lengkap.

User tidak hanya melihat status, tetapi dapat:

* Melacak pengiriman.
* Melihat detail perjalanan barang.
* Request refund.
* Download invoice.
* Melihat informasi ekspedisi.

---

# 2. Order Detail Layout Improvement

## Current Issue

Saat ini informasi terlalu flat:

```
Status

Product

Shipping

Total
```

User sulit mengetahui:

* Produk sudah sampai tahap mana.
* Nomor resi.
* Kurir.
* Apa yang bisa dilakukan.

---

# New Layout Recommendation

```text
------------------------------------------------

ORDER HEADER

ORD-100003

Sep 6, 2026

Status:
PAID


------------------------------------------------

ORDER JOURNEY


✓ Payment Completed
  Sep 6, 10:20


● Preparing Order
  Seller preparing your package


○ Shipped


○ Delivered


------------------------------------------------

ITEMS

[image]

Crew Neck Cotton Tee

Qty 2

Rp758.400


------------------------------------------------

SHIPPING


Courier:
JNE Express


Tracking Number:

JP123456789


[Track Shipment]


------------------------------------------------

ORDER ACTION


[Download Invoice]

[Request Refund]


------------------------------------------------

TOTAL

Rp1.011.200


------------------------------------------------
```

---

# 3. Refund Feature

## Route

Tetap berada pada:

```
/profile/orders/:id
```

---

# Objective

Memberikan user kemampuan mengajukan refund berdasarkan order tertentu.

---

# Trigger

Pada order action:

```text
[ Request Refund ]
```

---

Membuka:

```text
Refund Dialog
```

---

# Refund Dialog Structure

## Step 1

### Order Information

```
Order:

ORD-100003


Products:

✓ Crew Neck Cotton Tee

Qty: 2

Amount:
Rp758.400
```

---

## Step 2

### Refund Reason

Required dropdown:

```
Select reason

○ Product damaged

○ Wrong item received

○ Item not as expected

○ Size issue

○ Other
```

---

## Step 3

### Additional Note

Textarea:

```
Explain your problem
(optional)
```

Example:

```
Product arrived with damaged packaging.
```

---

## Step 4

Submit

```
[Submit Refund Request]
```

---

# Refund Status

Order harus memiliki status baru:

```typescript
RefundStatus

PENDING
APPROVED
REJECTED
COMPLETED
```

---

# Refund Timeline Example

```
Refund Requested

Sep 10, 2026

↓

Under Review

↓

Approved

↓

Refund Completed
```

---

# Acceptance Criteria

* User dapat request refund.
* Alasan wajib dipilih.
* Catatan optional.
* Refund hanya tersedia untuk order tertentu.
* Status refund terlihat.

---

# 4. Shipment Tracking Accordion

## Objective

Membuat tracking lebih informatif dibanding timeline sederhana.

---

# Current

```
PAYMENT
PAID
PROCESSING
SHIPPED
DONE
```

---

# Improvement

Setiap state menjadi accordion.

---

## Example

```
Shipping Timeline


▼ Payment Completed

   Payment confirmed

   Sep 6, 2026
   10:20


▼ Order Processing

   Seller preparing your order

   Sep 7, 2026


▶ Shipped


▶ Delivered
```

---

# State Detail

## Payment

Information:

```
Payment method

Bank Transfer

Paid at

Sep 6, 2026
```

---

## Processing

Information:

```
Your order is being prepared.

Seller:
Store Name

Estimated:
1-2 days
```

---

## Shipped

Information:

```
Courier:

JNE Express


Tracking Number:

JP123456789
```

Button:

```
[View Shipment Location]
```

---

## Delivered

Information:

```
Delivered at:

Sep 12, 2026

Received by:

User
```

---

# 5. Shipment Location Dialog

## Objective

Memberikan detail lokasi perjalanan barang.

---

# Trigger

Button:

```
View Shipment Location
```

---

Open:

```
Shipment Tracking Dialog
```

---

# Dialog Layout

```
---------------------------------

JNE Express


Tracking Number

JP123456789


---------------------------------

Shipment Journey


● Package received

Jakarta Hub

10:30


● In Transit

Bekasi Sorting Center

15:40


● Out for Delivery

Jakarta Selatan

09:10


○ Delivered


---------------------------------

[Close]

---------------------------------
```

---

# UI Recommendation

Tambahkan:

* Map preview (optional)
* Timeline location
* Timestamp
* Status badge

---

# 6. Courier & Tracking Information

## Requirement

Setiap shipped order wajib memiliki:

```
Courier Name

Tracking Number

Shipment Status
```

---

Example:

```
Courier:

JNE Express


Tracking Number:

JP123456789


Status:

On Delivery
```

---

# Copy Feature

Tambahkan:

```
[Copy]
```

untuk nomor resi.

---

# 7. Invoice Export Feature

## Objective

User dapat mengunduh invoice transaksi.

---

# Trigger

Order action:

```
[Download Invoice]
```

---

# Output

Format:

Priority:

```
PDF
```

Optional:

```
Excel
```

---

# Invoice Content

```
STORE NAME

INVOICE

Invoice No:
INV-100003


Customer:

Demo User


Order:

ORD-100003


Items:

Crew Neck Cotton Tee

Qty 2

Rp758.400


Shipping:

Express

Rp50.000


Total:

Rp1.011.200


Payment:

Paid


Date:

Sep 6, 2026
```

---

# 8. Order Action Improvement

Current:

```
Express

[Reorder]

Cancel
```

---

Improved:

```
Order Actions


[Reorder]

[Download Invoice]

[Track Shipment]

[Request Refund]
```

---

Action availability berdasarkan status.

---

## Status Rules

| Status     | Action         |
| ---------- | -------------- |
| PAID       | Cancel         |
| PROCESSING | Cancel         |
| SHIPPED    | Track Shipment |
| DELIVERED  | Refund         |
| DELIVERED  | Reorder        |
| COMPLETED  | Invoice        |

---

# 9. Product Section Improvement

## Current

```
Crew Neck Cotton Tee
×2 - SKU-2001
```

---

Replace:

```
Crew Neck Cotton Tee

Qty:
2

Variant:
Black / L
```

---

SKU:

Hidden.

Tidak relevan untuk customer.

---

# 10. Architecture Requirement

Tambah module:

```text
src/modules/


orders/

├── components/

│   ├── OrderCard.tsx
│   ├── OrderTimeline.tsx
│   ├── ShipmentAccordion.tsx
│   ├── RefundDialog.tsx
│   ├── InvoiceButton.tsx
│   └── ShipmentDialog.tsx


├── hooks/

│   ├── useOrders.ts
│   ├── useRefund.ts
│   └── useShipmentTracking.ts


├── services/

│   ├── order.service.ts
│   ├── refund.service.ts
│   ├── shipment.service.ts
│   └── invoice.service.ts


├── schemas/

│   └── refund.schema.ts


├── types/

│   ├── order.type.ts
│   ├── refund.type.ts
│   └── shipment.type.ts
```

---

# 11. UX Improvement Summary

## Before

```
PAID

Product

Shipping

Total
```

User hanya tahu status.

---

## After

```
ORDER JOURNEY

↓

Shipment Timeline

↓

Tracking Detail

↓

Courier Information

↓

Actions

Refund
Invoice
Reorder
```

User memiliki kontrol penuh.

---

# 12. Definition of Done

## Refund

* [ ] Refund button tersedia sesuai status.
* [ ] Dialog refund tersedia.
* [ ] Reason wajib.
* [ ] Note tersedia.
* [ ] Refund status tersimpan.

---

## Shipment Tracking

* [ ] Accordion tiap state.
* [ ] Detail status tersedia.
* [ ] Courier tampil.
* [ ] Tracking number tampil.
* [ ] Location dialog tersedia.

---

## Invoice

* [ ] Export PDF.
* [ ] Informasi lengkap.
* [ ] Download berhasil.

---

## Order Detail

* [ ] Product image tampil.
* [ ] Product information lengkap.
* [ ] Action sesuai status.
* [ ] Responsive.
* [ ] Skeleton tersedia.

---

# Priority

## P0 — Core Commerce

| Feature             |
| ------------------- |
| Tracking number     |
| Courier information |
| Shipment accordion  |
| Invoice export      |

---

## P1 — Customer Experience

| Feature                  |
| ------------------------ |
| Refund flow              |
| Shipment location dialog |
| Order action improvement |

---

## P2 — Enhancement

| Feature                  |
| ------------------------ |
| Map tracking             |
| Live courier update      |
| Advanced refund workflow |

---

