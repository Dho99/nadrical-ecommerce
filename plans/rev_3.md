
---

# PRD Addendum v1.2

# E-Commerce Platform Revamp — UX Refinement & Checkout Stabilization

**Document Status:** Additional Requirement
**Related Document:** PRD v1.0 + PRD Addendum v1.1

---

# 1. Livechat Experience Enhancement

## 1.1 Objective

Meningkatkan pengalaman livechat berdasarkan status autentikasi user serta memberikan konteks percakapan berdasarkan halaman produk yang sedang dikunjungi.

---

# 1.2 Guest User Livechat

## Requirement

Untuk user yang belum login/authenticated:

Livechat hanya menampilkan:

* Conversation area.
* Informational message.
* Input sederhana.
* Submit button.

---

## Layout Requirement

Livechat harus menggunakan:

```text
height: fit-content
```

Tidak menggunakan fixed height besar.

---

## Example Flow

```text
User belum login

↓

Open Livechat

↓

--------------------------------

Halo, silakan masukkan pesan Anda

[ Input message ]

[ Submit ]

--------------------------------
```

---

## Submit Behavior

Ketika guest submit:

System harus:

* Menyimpan temporary message.
* Memberikan informasi bahwa login diperlukan untuk melanjutkan conversation history.

---

## Acceptance Criteria

* Livechat tidak mengambil area berlebihan.
* Tombol submit selalu tersedia.
* Input dapat digunakan tanpa authentication.
* UI tetap responsive.

---

# 1.3 Authenticated User Livechat

## Requirement

Jika user sudah login:

Tampilkan full chat composer.

Komponen:

```text
Message Input

+

Send Button
```

---

Flow:

```text
Authenticated User

↓

Livechat

↓

[ Type message ]

[ Send ]

↓

Message sent
```

---

## Required State

Livechat harus memiliki:

* Loading state.
* Sending state.
* Failed sending state.
* Message history.

---

# 1.4 Product Context Injection ke Livechat

## Objective

Memberikan konteks produk ketika user bertanya melalui livechat dari halaman detail produk.

---

## Trigger

Route:

```text
/products/:id
```

---

Ketika user klik:

```text
Ask about this product
```

atau:

```text
Message button
```

---

System mengirim product context ke livechat.

---

## Product Context Data

Minimal:

```typescript
{
 id,
 name,
 price,
 currency,
 category,
 availability,
 description,
 image
}
```

---

## Example Conversation

System:

```text
User sedang melihat:
Nike Air Max 2026

Harga:
Rp2.000.000

Kategori:
Shoes
```

---

Kemudian user bertanya:

```text
Apakah tersedia ukuran 42?
```

AI/livechat memiliki konteks produk.

---

## Architecture Requirement

Product module tidak boleh langsung mengakses livechat.

Communication melalui:

```text
shared/types
```

atau:

```text
application layer
```

---

# 2. Navigation Active State Correction

## Objective

Memperbaiki active navigation agar sesuai dengan route yang sedang dikunjungi.

---

# Current Issue

Menu active tidak mengikuti lokasi user.

---

# Requirement

Active state harus berdasarkan:

```text
Current pathname
```

---

# Dark Mode

## Regular Nav Item

```text
color:
white
```

---

## Active Nav Item

```text
color:
red

font-weight:
bold
```

---

Example:

```text
Home
Products(active)
Cart


Products:
red + bold
```

---

# Light Mode

## Regular Nav Item

```text
color:
purple
```

---

## Active Nav Item

```text
color:
red

font-weight:
bold
```

---

## Acceptance Criteria

* Active mengikuti URL.
* Nested route tetap terdeteksi.

Example:

```text
/products/iphone

Products tetap active
```

---

# 3. Banner Slider Theme Support

## Objective

Memperbaiki pagination/button slider agar konsisten dengan theme.

---

## Requirement

Slider controls harus support:

* Light mode.
* Dark mode.

---

# Light Mode

Button:

* Kontras terhadap background.
* Tetap terlihat pada image terang.

---

# Dark Mode

Button:

* Tidak menyatu dengan background.
* Memiliki contrast cukup.

---

## Acceptance Criteria

* Tidak ada button invisible.
* Hover state tersedia.
* Active pagination terlihat.

---

# 4. Checkout Product Image Restoration

## Objective

Mengembalikan gambar product pada section "Your Order".

---

## Current Issue

Product image hilang.

---

## Requirement

Checkout summary harus menampilkan:

```text
--------------------------------

[Image]

Product Name

Variant

Quantity

Price

--------------------------------
```

---

## Acceptance Criteria

Setiap product checkout wajib memiliki:

* Product thumbnail.
* Product name.
* Quantity.
* Price.
* Subtotal.

---

# 5. Checkout Shipping Active State Fix

## Current Issue

Shipping method selalu stuck pada:

```text
Standard
```

---

## Requirement

Selected shipping method harus mengikuti pilihan user.

---

## Example

Before:

```text
Standard
(active)

Express clicked

Standard
(active)
```

---

After:

```text
Express clicked

Express
(active)
```

---

## UI State

Active shipping:

```css
border-color:
purple
```

---

## State Management Requirement

Selected service harus berasal dari:

```typescript
selectedShippingMethod
```

---

## Acceptance Criteria

* Click shipping option update active state.
* Border berubah.
* Price berubah.
* Total checkout berubah.

---

# 6. Checkout Payment Accordion Selection Fix

## Objective

Memperbaiki payment accordion selection behavior.

---

# Current Issue

Child item payment tidak bisa menjadi active dengan benar.

---

# Requirement

Semua child payment item harus clickable.

---

Structure:

```text
Payment

▼ M-Banking

   BCA
   Mandiri
   BNI


▼ E-Money

   GoPay
   Dana


▼ Credit Card

   Visa
   Mastercard
```

---

## Active State

Selected:

```text
border:
purple

background:
active state
```

---

## Example

User memilih:

```text
GoPay
```

Result:

```text
E-Money

GoPay
(active)
```

---

## Acceptance Criteria

* Semua child dapat dipilih.
* Accordion tetap berjalan normal.
* Selected payment tersimpan.
* Checkout summary update.

---

# 7. Global Container Width Standardization

## Objective

Membuat seluruh halaman memiliki konsistensi lebar konten.

---

# Requirement

Semua section wajib menggunakan:

```css
container
max-w-7xl
mx-auto
```

---

Affected:

* Home section.
* Product listing.
* Product detail.
* Checkout.
* Profile.
* Wishlist.
* Order history.
* Cart.

---

## Example

Before:

```text
Section A
full width

Section B
different width
```

---

After:

```text
--------------------------------
        max-w-7xl

        content

--------------------------------
```

---

## Acceptance Criteria

* Semua halaman memiliki alignment konsisten.
* Tidak ada section overflow.
* Responsive tetap berjalan.

---

# 8. Order History Restoration

## Objective

Mengembalikan fungsi order history agar dapat ditampilkan kembali.

---

## Current Issue

Order history tidak muncul.

---

# Requirement

Order history harus dapat menampilkan:

* List transaksi.
* Detail order.
* Status.
* Product information.
* Total pembayaran.

---

## Route

Contoh:

```text
/profile/orders
```

atau route existing yang digunakan.

---

# Order Card

Structure:

```text
--------------------------------

Order #12345

Date

Products:

[Image]
Product Name
Qty


Status:

Delivered


Total:

Rp xxx.xxx

--------------------------------
```

---

## States

Order history wajib support:

### Loading

Skeleton.

---

### Empty

```text
No orders found
```

---

### Error

Retry action.

---

# 9. Architecture Impact

Affected Modules:

```text
src/modules/

├── livechat/

│   ├── components/
│   │   ├── ChatInput.tsx
│   │   ├── ChatWindow.tsx
│   │   └── ProductContextPreview.tsx
│   │
│   ├── hooks/
│   │   └── useLivechat.ts
│   │
│   ├── services/
│   │   └── livechat.service.ts
│   │
│   ├── types/


├── checkout/

│   ├── components/
│   │   ├── ShippingSection.tsx
│   │   ├── PaymentAccordion.tsx
│   │   └── OrderSummary.tsx
│
│   ├── hooks/


├── orders/

│   ├── components/
│   ├── hooks/
│   ├── services/


├── navigation/

│   ├── hooks/
│   └── utils/
```

---

# 10. Updated Definition of Done

## Livechat

* [ ] Guest user dapat submit pesan.
* [ ] Auth user memiliki composer lengkap.
* [ ] Product context dapat dikirim.
* [ ] Loading/error state tersedia.

---

## Navigation

* [ ] Active route akurat.

* [ ] Dark mode:

  * inactive putih
  * active merah bold

* [ ] Light mode:

  * inactive ungu
  * active merah bold

---

## Checkout

* [ ] Product image kembali muncul.
* [ ] Shipping active state bekerja.
* [ ] Payment child selection bekerja.
* [ ] Quantity update tetap berjalan.
* [ ] Total checkout reactive.

---

## Layout

* [ ] Semua section menggunakan container standard.

---

## Orders

* [ ] History dapat tampil.
* [ ] Detail tersedia.
* [ ] Loading/error/empty state tersedia.

---

# 11. Priority Update

## P0 — Bug Fix Critical

| Feature                        |
| ------------------------------ |
| Checkout shipping active state |
| Payment selection              |
| Order history restoration      |
| Product image checkout         |

---

## P1 — UX Improvement

| Feature                      |
| ---------------------------- |
| Livechat authentication flow |
| Product context chat         |
| Navigation active state      |
| Container consistency        |

---

## P2 — Visual Enhancement

| Feature                  |
| ------------------------ |
| Banner theme adaptation  |
| Advanced chat experience |

---

