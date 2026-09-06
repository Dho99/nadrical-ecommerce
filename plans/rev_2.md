PRD Addendum v1.1
E-Commerce Platform Revamp — Navigation & Checkout Enhancement

Document Status: Updated Requirement
Scope: Enhancement terhadap PRD v1.0
Affected Modules:

Navbar
Search
Wishlist
Checkout
Cart
Payment
Shipping
1. Navigation Enhancement
1.1 Navbar Search Dialog
Objective

Mengubah search navbar menjadi lebih clean dengan menggunakan dialog-based search experience.

Current Behavior

Search tampil langsung pada navbar.

New Requirement

Search hanya ditampilkan sebagai icon pada navbar.

Flow:

Navbar

[ 🔍 ]

↓

Click

↓

Search Dialog Open
Search Dialog Requirement

Dialog harus memiliki:

Input pencarian.
Search suggestion.
Recent search (optional).
Loading state.
Empty state.
Result preview.
UI Behavior

Desktop:

--------------------------------
|                              |
|       Search Product         |
|                              |
|  🔍 Nike Air Max             |
|  🔍 Adidas Shoes             |
|                              |
--------------------------------

Mobile:

Full screen dialog.

Acceptance Criteria
Search tidak mengambil space navbar.
Search hanya aktif ketika icon diklik.
Dialog dapat ditutup dengan:
Close button
Escape key
Click outside
Support loading state.
Support keyboard navigation.
2. Navbar Active State Improvement
Objective

Membuat status navigasi lebih jelas berdasarkan theme.

Light Theme
Inactive Navigation
color:
white
Active Navigation
color:
purple

font-weight:
bold
Dark Theme
Inactive Navigation
color:
white
Active Navigation
color:
red

font-weight:
bold
Requirement

Active state harus mengikuti:

Current pathname.
Theme mode.
Responsive navbar state.
Acceptance Criteria

Example:

Dark:

Home
Products(active)

Products:
red
bold

Light:

Home
Products(active)

Products:
purple
bold
3. Wishlist Route Migration
Objective

Menyatukan fitur wishlist dengan domain profile/account.

Current Route
/wishlist
New Route
/profile/wishlist
Requirement

Semua akses wishlist harus diarahkan ke:

/profile/wishlist
Update Flow

Before:

Navbar Wishlist Icon

↓

/wishlist

After:

Navbar Wishlist Icon

↓

/profile/wishlist
Module Impact

Affected:

modules/wishlist
modules/profile
Acceptance Criteria
Route /wishlist tidak digunakan lagi.
Redirect lama tetap tersedia untuk compatibility.
Wishlist tetap memiliki:
Remove item
Add to cart
Product navigation
4. Checkout Postal Code Debounce
Objective

Mengoptimalkan pencarian lokasi berdasarkan postal code.

Requirement

Input postal code pada checkout wajib menggunakan debounce.

Configuration
debounceTime = 300ms
Flow

User mengetik:

12345

System:

Wait 300ms

↓

Call postal service
Expected Behavior

Tidak melakukan request setiap keypress.

Bad:

1 request
12 request
123 request
1234 request
12345 request

Good:

12345

(wait 300ms)

1 request
Implementation Requirement

Logic berada pada:

modules/checkout/hooks/

Contoh:

usePostalCode.ts
Acceptance Criteria
Debounce berjalan 300ms.
Tidak ada duplicate API request.
Loading state tersedia.
Error state tersedia.
5. Checkout Shipping Section Enhancement
Objective

Membuat shipping section menjadi interaktif dan menghitung ongkir berdasarkan layanan tersedia.

Current Behavior

Shipping hanya informasi statis.

New Requirement

Shipping section menjadi clickable.

UI Flow
Shipping

↓

Click

↓

Show Available Services

--------------------------------

○ JNE REG

Rp15.000
2-3 days


○ J&T Express

Rp18.000
1-2 days


○ SiCepat

Rp20.000
1 day

--------------------------------

Select

↓

Calculate Shipping
Shipping Calculation

Perhitungan berdasarkan:

Origin location.
Destination postal code.
Weight.
Courier service.
Service Layer

Location:

modules/checkout/services/

Example:

shipping.service.ts

Responsible:

Fetch shipping option.
Calculate shipping cost.
Transform response.
Acceptance Criteria
Shipping option dapat dipilih.
Harga shipping berubah sesuai pilihan.
Total checkout otomatis update.
Loading tersedia ketika kalkulasi berlangsung.
6. Payment Method Enhancement
Objective

Membuat pilihan pembayaran lebih terstruktur.

Payment Section

Menggunakan accordion.

Structure:

Payment Method

▼ M-Banking

   ○ BCA
   ○ Mandiri
   ○ BNI
   ○ BRI


▼ E-Money

   ○ GoPay
   ○ OVO
   ○ Dana
   ○ ShopeePay


▼ Credit / Debit Card

   ○ Visa
   ○ Mastercard

Requirement

User dapat:

Membuka accordion.
Memilih metode pembayaran.
Melihat selected state.
Acceptance Criteria
Hanya satu payment method aktif.
Selected payment tersimpan.
Validasi dilakukan sebelum checkout.
7. Checkout Product Quantity Control
Objective

Memungkinkan user mengubah quantity langsung pada halaman checkout.

Current Behavior

Quantity hanya berasal dari cart.

New Requirement

Setiap product checkout memiliki:

Product Card

Product Name

[-]  1  [+]

Price
Subtotal
Quantity Action

Tambah:

+

Kurang:

-
Calculation

Example:

Initial:

Product A

Qty:
1

Price:
Rp100.000

Subtotal:
Rp100.000

Klik +

Qty:
2

Subtotal:
Rp200.000
Business Rules

Minimum:

quantity >= 1
Update Impact

Affected:

Cart state
Checkout summary
Total price
Discount calculation
8. Checkout Total Calculation

Total harus reactive terhadap:

Product quantity.
Product discount.
Shipping cost.
Payment fee (jika ada).

Formula:

Subtotal Product

+

Shipping Cost

+

Payment Fee

-

Discount

=

Grand Total
9. Architecture Impact

Tambahan module/service:

modules/

├── checkout/

│   ├── components/
│   │   ├── ShippingSection.tsx
│   │   ├── PaymentAccordion.tsx
│   │   ├── CheckoutProductItem.tsx
│   │
│   ├── hooks/
│   │   ├── useShipping.ts
│   │   ├── usePostalCode.ts
│   │   ├── useCheckoutCalculation.ts
│   │
│   ├── services/
│   │   ├── shipping.service.ts
│   │   └── payment.service.ts

10. Updated Definition of Done

Feature checkout dianggap selesai apabila:

Search
 Search menggunakan dialog.
 Responsive.
 Keyboard accessible.
 Loading tersedia.
Wishlist
 Route berpindah ke /profile/wishlist.
 Redirect lama tersedia.
Checkout
 Postal code menggunakan debounce 300ms.
 Shipping dapat dipilih.
 Ongkir dihitung dinamis.
 Payment menggunakan accordion.
 Quantity product dapat berubah.
 Total otomatis berubah.
 Skeleton dan error state tersedia.
11. Priority Update
P0 — Critical
Feature
Checkout quantity update
Shipping calculation
Payment selection
Currency total recalculation
P1 — Important
Feature
Search dialog
Wishlist route migration
Navbar active state
P2 — Enhancement
Feature
Search suggestion
Recent search
Advanced payment UI