# UrbanCart

UrbanCart adalah project website toko online fashion dan lifestyle modern untuk portfolio frontend web developer. Website ini dibuat sebagai simulasi e-commerce lengkap tanpa backend, database, framework, atau library JavaScript.

## Fitur

- Homepage modern dengan hero, kategori, produk terbaru, best seller, countdown sale, testimonial slider, dan newsletter.
- Katalog produk dengan minimal 20 data produk dummy.
- Pencarian live berdasarkan nama, kategori, tipe, dan deskripsi.
- Filter gabungan berdasarkan kategori, harga, rating, diskon, stok, warna, dan ukuran.
- Sorting produk: terbaru, harga terendah, harga tertinggi, rating tertinggi, nama A-Z, dan diskon terbesar.
- Grid view dan list view yang tersimpan di LocalStorage.
- Pagination maksimal 8 produk per halaman.
- Halaman detail produk berdasarkan parameter URL `product-detail.html?id=1`.
- Image gallery, zoom sederhana, pilihan ukuran/warna, quantity, tab informasi, review dummy, dan produk terkait.
- Quick view modal dengan Escape key, klik overlay, dan close button.
- Wishlist dengan LocalStorage, counter header, hapus, hapus semua, dan pindahkan ke keranjang.
- Keranjang belanja dengan update quantity, subtotal, diskon, ongkir, biaya layanan, progress gratis ongkir, dan kode promo.
- Kode promo dummy: `URBAN10`, `NEWUSER`, dan `FREESHIP`.
- Checkout form dua kolom dengan validasi lengkap.
- Metode pengiriman dan pembayaran simulasi.
- Checkout WhatsApp menggunakan `wa.me`.
- Halaman pesanan berhasil dan riwayat pesanan di LocalStorage.
- Dark mode dan light mode tersimpan di LocalStorage.
- Toast notification success, error, warning, dan info.
- Loading screen, skeleton katalog, smooth scroll, reveal animation, back to top, dan mobile menu slide.
- Responsive untuk desktop, laptop, tablet, smartphone, dan smartphone kecil.
- SEO dasar pada setiap halaman.

## Teknologi

- HTML5
- CSS3
- JavaScript Vanilla
- LocalStorage
- SVG assets lokal

## Struktur Folder

```text
urbancart/
├── index.html
├── products.html
├── product-detail.html
├── cart.html
├── checkout.html
├── wishlist.html
├── about.html
├── contact.html
├── order-success.html
├── orders.html
├── README.md
├── css/
│   ├── style.css
│   ├── responsive.css
│   └── animations.css
├── js/
│   ├── products.js
│   ├── main.js
│   ├── catalog.js
│   ├── product-detail.js
│   ├── cart.js
│   ├── wishlist.js
│   ├── checkout.js
│   ├── contact.js
│   └── home-icons.js
└── assets/
    ├── images/
    └── icons/
```

## Cara Menjalankan

Buka file `index.html` langsung di browser, atau jalankan dengan Live Server/static server:

```bash
npx serve .
```

Project ini tidak membutuhkan build step.

## Cara Mengganti Nomor WhatsApp

Buka file `js/products.js`, lalu ubah nilai berikut:

```javascript
const STORE_CONFIG = {
  whatsappNumber: "6281234567890"
};
```

Gunakan format nomor internasional tanpa tanda `+`.

## Cara Menambahkan Produk

Buka `js/products.js`, lalu tambahkan object baru ke array `UC_PRODUCTS`. Pastikan setiap produk memiliki `id` unik, nama, kategori, harga, rating, stok, ukuran, warna, gambar, deskripsi, detail, tanggal, jumlah terjual, dan SKU.

Contoh singkat:

```javascript
{
  id: 21,
  name: "Nama Produk Baru",
  category: "Men",
  type: "Shirt",
  price: 199000,
  compareAt: 249000,
  rating: 4.7,
  reviews: 20,
  inStock: true,
  stock: 12,
  badge: "New",
  colors: ["Black", "White"],
  sizes: ["S", "M", "L"],
  images: ["assets/images/product-shirt.svg"],
  description: "Deskripsi produk.",
  details: ["Detail pertama", "Detail kedua"],
  createdAt: "2026-07-14",
  sold: 10,
  sku: "URB-NEW-021"
}
```

## Screenshot Placeholder

Tambahkan screenshot project setelah website dipublikasikan:

```text
assets/screenshots/homepage.png
assets/screenshots/catalog.png
assets/screenshots/checkout.png
```

## Link Demo Placeholder

```text
https://Muhammadalimurtadho.github.io/urbancart-ecommerce/
```
