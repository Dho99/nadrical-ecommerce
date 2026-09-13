Navbar:
Improve responsive layout navbar supaya feasible untuk tampilan mobile (hapus baris sekunder menumpuk, strukturkan Sheet drawer)
Efek hover link navbar desktop bersih murni perubahan warna teks tanpa latar belakang kontras (no background contrast)

Home Page:

All Product Page:
Fitur Discount
Update mock data: Tambahkan diskon (discount_percent & badge SALE) pada berbagai produk di setiap kategori untuk mendukung filter discount
Implementasi fitur filter Discount Only dengan interactive toggle button di filter bar utama
Improve visual badge products (SALE, NEW, BEST SELLER, PRE-ORDER, & -% Diskon) dengan gradient vivid, bayangan, & Lucide icons tanpa emoji
Implementasi CRO Copywriting Badges (≤25 karakter) berbasis 4 psychological triggers (Direct Value, Scarcity/Urgency, Risk Reversal, Exclusivity)

Product Detail:
Tambahin “Low Stock”, jadi status ada 2 in stock & low stock
Kalau klik “Lihat Ulasan”, jangan ke page rating, buat scroll ke bawah aja ke section review
Fitur Discount
Bisa select specification (Variant product) 
Buat seed data untuk semua produk supaya mempunyai setidaknya 3 variant + 5 sub variant berbeda
Edit semua seed data supaya mempunyai variant dan subvariant minimal 5 buah each
Revisi Drawer untuk melihat foto produk secara Fullscreen & Responsif (Sheet Drawer bottom slide-in)
Fitur untuk pick variant, diproses ke checkout user, dan disimpan aman sebagai order history snapshot
Hilangkan Ships within 48h · 14-day returns · 2-year guarantee included
CRO Offer Lines (≤60 karakter) & real-time savings callout ("You save Rp XX.XXX (XX% off)")

Cart Page:
Hilangkan No SKU, ganti dengan in stock / low stock & category product
Tambahkan spec item / variant yang dipilih
Kalo udah input voucher, saat klik checkout, di checkout page voucher mengikuti yang udah diselect di cart page
CRO Cart Summary Trust Callout (≤60 karakter)

Checkout Page:
Step 2 shipping, pilihan espedisi dibuat 3/4 per row, tulisan "Choose a delivery service. Shipping is calculated from your destination postal code and order weight." buat 1 row terpisah dari services
Tambah tombol Download Invoice after checkout (OrderConfirmationCard)
CRO Checkout Guarantee & Risk Reversal Micro-Copy (≤60 karakter)

Account Page:
Hilangkan button arrow atas bawah di section list page
http://localhost:3000/profile section account card wishlist tidak tampil product yang di wishlist
Hilangkan vertical scrollbar pada tab selector Account | Order History | Address dengan Shadcn UI Tabs switcher
Gunakan Shadcn UI Tabs untuk filter status order (All | Processing | Shipped | Completed | Cancelled)
Highlight UI/UX aktif untuk order status tabs (active status dot ring scaling, bold title, & brand accent count badge)
Improve layout sidebar akun supaya 2-kolom dashboard UI/UX friendly

Order Detail Page:
tambahkan Item yang dibeli + spec / variant & harga
Shipment method tambahkan seperti JNE Standard
Modul beri rating dan review di riwayat pembelian untuk order berstatus completed (misal ORD-100010)
