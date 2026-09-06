# Product Requirement Document (PRD)

# E-Commerce Platform Revamp & Architecture Refactoring

**Document Version:** 1.0
**Status:** Draft for Implementation
**Objective:** Improve user experience, scalability, maintainability, and architecture consistency of the existing e-commerce system.

---

# 1. Overview

## 1.1 Background

Sistem e-commerce saat ini membutuhkan peningkatan pada sisi:

* User experience pada navigasi dan discovery produk.
* Konsistensi tampilan responsive.
* Kemudahan pengelolaan currency.
* Optimasi product browsing.
* Perbaikan account management.
* Persiapan scalability melalui modular architecture.

Revisi ini bertujuan melakukan improvement menyeluruh terhadap aplikasi dengan pendekatan **Service-Based Layer Architecture**, sehingga setiap domain bisnis dapat berkembang secara independen tanpa coupling antar fitur.

---

# 2. Goals & Objectives

## Primary Goals

1. Membuat pengalaman navigasi lebih sederhana dan modern.
2. Meningkatkan kemampuan user dalam mencari, memfilter, dan membeli produk.
3. Menambahkan fleksibilitas currency IDR/USD pada seluruh sistem.
4. Meningkatkan performa dengan infinite pagination dan skeleton loading.
5. Memisahkan business logic, service, validation, dan UI secara modular.
6. Mempersiapkan aplikasi agar scalable untuk fitur berikutnya.

---

# 3. Scope Overview

## Included Scope

### UI/UX Improvement

* Navbar redesign
* Search improvement
* User menu improvement
* Profile redesign
* Product grid optimization
* Product filtering
* Banner slider improvement
* Wishlist page
* Discount display

### Commerce Improvement

* Currency conversion
* Infinite pagination
* Product discount
* Product filtering

### Architecture Improvement

* Feature-based modular architecture
* Service layer implementation
* Hook separation
* Schema validation standardization
* Type isolation

---

# 4. Technical Architecture Requirement

## 4.1 Architecture Pattern

Sistem wajib menggunakan:

# Service-Based Layer Architecture

Tujuan:

* Feature memiliki boundary yang jelas.
* Business logic tidak bercampur dengan UI.
* Module dapat dikembangkan secara independen.
* Mempermudah maintenance.
* Mempermudah AI agent memahami ownership code.

---

# 5. Folder Structure Requirement

Struktur utama:

```text
src/

├── app/
│   ├── layout/
│   ├── routes/
│   └── providers/

├── modules/

│   ├── home/
│   │   ├── components/
│   │   ├── hooks/
│   │   ├── services/
│   │   ├── schemas/
│   │   ├── types/
│   │   ├── constants/
│   │   ├── utils/
│   │   └── index.ts

│   ├── products/
│   ├── cart/
│   ├── checkout/
│   ├── auth/
│   ├── profile/
│   ├── wishlist/
│   └── currency/

├── shared/

│   ├── components/
│   │   └── ui/

│   ├── hooks/
│   ├── types/
│   ├── utils/
│   ├── constants/
│   └── lib/

└── assets/
```

---

# 6. Module Responsibility Rules

## General Rule

Setiap module hanya bertanggung jawab terhadap domainnya sendiri.

---

## Example:

## Products Module

Responsible:

* Product listing
* Product detail
* Product search
* Product filtering
* Product validation
* Product API interaction

Tidak boleh:

* Mengatur cart state.
* Mengatur checkout.
* Mengakses wishlist secara langsung.

---

# 7. Component Rules

## Module Component

Component dalam module hanya digunakan oleh module tersebut.

Contoh:

```text
modules/products/components/ProductCard.tsx
```

Tidak boleh digunakan:

```text
modules/cart
modules/profile
```

---

Jika digunakan lintas domain:

Pindahkan:

```text
shared/components
```

---

# 8. Service Layer Rules

Setiap module wajib memiliki service.

Contoh:

```text
modules/products/services/product.service.ts
```

Responsibility:

* API request
* Data transformation
* External integration

Contoh:

```typescript
export const productService = {

 getProducts(),

 getProductById(),

 searchProducts()

}
```

---

Component tidak diperbolehkan:

```typescript
fetch("/products")
```

atau melakukan business logic langsung.

---

# 9. Hook Layer Rules

Hook bertanggung jawab terhadap:

* State management
* Business logic
* Service integration
* UI state

Contoh:

```text
modules/cart/hooks/useCart.ts
```

Component hanya menerima:

```typescript
{
 data,
 actions,
 loading,
 error
}
```

---

# 10. Schema Rules

Semua validation wajib menggunakan:

* Zod
* React Hook Form
* zodResolver

Lokasi:

```text
modules/{feature}/schemas/
```

Contoh:

```text
modules/auth/schemas/login.schema.ts
```

---

# 11. Type Rules

Module specific:

```text
modules/products/types/
```

Global:

```text
shared/types/
```

Tidak diperbolehkan membuat type domain di shared jika hanya digunakan satu module.

---

# 12. Dependency Rules

Dependency direction:

```
modules

↓

shared
```

Tidak diperbolehkan:

```
shared

↓

modules
```

---

Module tidak boleh:

```
products → cart

cart → wishlist

profile → auth
```

Komunikasi menggunakan:

* Shared contract
* Service abstraction
* Application layer

---

# 13. Feature Requirements

---

# 13.1 Navbar Redesign

## Objective

Membuat navbar lebih minimal dan modern.

---

## Requirement

Navbar kanan hanya memiliki:

```
Search
Cart
Wishlist
User
```

---

## Search

Saat default:

```
🔍
```

Hanya icon.

Klik icon:

Menampilkan search interface.

---

## Acceptance Criteria

* Search tidak memenuhi navbar.
* Icon berada di kanan.
* Responsive pada mobile.
* Search memiliki loading state.

---

# 13.2 User Dropdown Menu

Menu user harus berisi:

```
Profile
Wishlist
Theme
Currency Switch
Logout
```

---

Theme:

Support:

* Light mode
* Dark mode

---

Currency:

Support:

* IDR
* USD

---

# 13.3 Currency System

## Objective

Semua nominal dalam sistem dapat berubah berdasarkan currency.

---

## Supported Currency

```
IDR
USD
```

---

## Coverage

Currency harus berlaku pada:

* Product listing
* Product detail
* Cart
* Checkout
* Order
* Invoice
* Semua komponen yang menampilkan nominal.

---

## Currency Module

Structure:

```text
modules/currency/

components/
hooks/
services/
types/
constants/
utils/
```

---

## Acceptance Criteria

User mengganti:

```
IDR → USD
```

maka seluruh harga berubah tanpa reload halaman.

---

# 13.4 Navbar Active State

## Requirement

Active menu harus:

Normal:

```
white
```

Active:

```
red
bold
```

atau:

```
red background
```

---

Acceptance:

* Current route selalu terlihat jelas.
* Support dark mode.

---

# 13.5 User Credential Update

Replace:

```
admin@store.dev
```

menjadi:

```
customer@store.dev

Name:
User
```

---

# 13.6 Profile Edit Page

Route:

```
/profile/edit
```

---

Desktop:

Layout 2 kolom.

Contoh:

```
--------------------------------
| Profile Form | Account Panel |
--------------------------------
```

---

Responsive:

Desktop:
2 column

Tablet:
stack

Mobile:
single column

---

# 13.7 Delete Account

Pada profile:

Replace:

```
Logout
```

menjadi:

```
Delete Account
```

---

Requirement:

* Confirmation dialog.
* Warning message.
* Secure action.

---

# 13.8 Authentication Improvement

Login page:

Tambahkan:

```
Login manually

OR

Continue with Google

Continue with Apple
```

---

Support:

* Manual login
* Google OAuth
* Apple OAuth

---

# 13.9 Product Grid

Semua product showcase:

Before:

```
4 columns
```

After:

```
3 columns
```

---

Container:

```
max-w-7xl
```

---

Responsive:

Desktop:

```
3 columns
```

Tablet:

```
2 columns
```

Mobile:

```
1 column
```

---

# 13.10 Banner Slider

## Requirement

Hero slider:

Height:

```
75-80vh
```

---

Support:

* Mouse drag
* Touch swipe
* Responsive image
* Smooth transition

---

Pagination:

Harus mengikuti theme:

Light mode:

visible light contrast

Dark mode:

visible dark contrast

---

# 13.11 Infinite Product Pagination

Semua product listing wajib support:

Infinite scrolling.

Flow:

```
Products

↓

Loading Skeleton

↓

More Products
```

---

Tidak menggunakan traditional pagination.

---

# 13.12 Product Filtering

Route:

```
/products
```

---

Remove:

Sticky sidebar filter.

---

Replace:

Filter dialog.

Flow:

```
Products

[ Filter Button ]

↓

Dialog

Category
Price
Rating
Discount

↓

Apply
```

---

# 13.13 Skeleton Loading

Semua async component wajib memiliki skeleton.

Coverage:

* Product card
* Product grid
* Product detail
* Banner
* Profile
* Wishlist
* Cart
* Fetching state

---

# 13.14 Product Discount Badge

Product yang memiliki discount harus menampilkan:

Example:

```
20% OFF
```

---

Product display:

```
Rp120.000

Rp150.000
```

---

Product data harus diperbarui agar sebagian product memiliki discount.

---

# 13.15 Breadcrumb Improvement

Remove:

```
SKU
```

Replace:

```
Product Name
```

Example:

Before:

```
Home > Product > SKU001
```

After:

```
Home > Product > Nike Air Max
```

---

# 13.16 Wishlist Page

Create:

```
/wishlist
```

---

Remove:

Wishlist dialog dari navbar.

---

Flow:

```
Navbar Wishlist Icon

↓

/wishlist
```

---

Features:

* Product listing
* Remove wishlist
* Add cart

---

# 13.17 Profile Wishlist Tab

Tambah:

```
Profile

├── Account
├── Orders
├── Wishlist
└── Settings
```

---

Wishlist harus reuse service abstraction.

---

# 14. Non Functional Requirement

## Performance

System harus:

* Lazy load component berat.
* Menghindari unnecessary rerender.
* Menggunakan pagination efficient.

---

## Accessibility

Requirement:

* Keyboard navigation.
* Proper aria label.
* Dialog accessible.

---

## Responsive

Support:

* Desktop
* Tablet
* Mobile

---

# 15. Loading & Error Handling

Semua module async wajib memiliki:

Loading:

```
Skeleton
```

Error:

```
Error state component
```

Empty:

```
Empty state component
```

---

# 16. Definition of Done

Feature dianggap selesai apabila:

## Architecture

* [ ] Berada pada module yang benar.
* [ ] Tidak melanggar dependency rule.
* [ ] Memiliki service layer.
* [ ] Memiliki hooks jika ada business logic.
* [ ] Memiliki types.
* [ ] Memiliki schemas jika ada form.

---

## UI

* [ ] Responsive.
* [ ] Dark mode compatible.
* [ ] Loading state tersedia.
* [ ] Error state tersedia.
* [ ] Empty state tersedia.

---

## Commerce

* [ ] Currency support.
* [ ] Discount support.
* [ ] Pagination support.
* [ ] Filtering support.

---

# 17. Priority Matrix

## P0 — Critical

| Feature                    |
| -------------------------- |
| Service-based architecture |
| Navbar redesign            |
| Currency system            |
| Product grid update        |
| Infinite pagination        |
| Skeleton loading           |
| Product filtering          |

---

## P1 — Important

| Feature            |
| ------------------ |
| Wishlist page      |
| Profile redesign   |
| Discount badge     |
| Login provider     |
| Banner improvement |

---

## P2 — Enhancement

| Feature                        |
| ------------------------------ |
| Additional theme customization |
| Advanced profile settings      |
| Extended commerce features     |

---

# 18. Expected Outcome

Setelah implementasi selesai:

* User mendapatkan navigasi yang lebih sederhana.
* Product discovery menjadi lebih cepat.
* Sistem mendukung multi currency.
* Account management lebih lengkap.
* Codebase memiliki struktur scalable.
* Feature dapat dikembangkan tanpa dependency antar domain.
* Sistem siap untuk pengembangan fitur e-commerce lanjutan.
