# UrbanCart

UrbanCart is a modern fashion and lifestyle e-commerce website built as a frontend portfolio project. This project simulates a complete online shopping experience using HTML, CSS, and vanilla JavaScript without any backend, database, framework, or external JavaScript library.

## Live Demo

https://muhammadalimurtadho.github.io/urbancart-ecommerce/

## GitHub Repository

https://github.com/Muhammadalimurtadho/urbancart-ecommerce

## Features

- Modern homepage with hero section, categories, new arrivals, best sellers, sale countdown, testimonials, and newsletter section.
- Product catalog with 20+ dummy products.
- Live search by product name, category, type, and description.
- Advanced product filtering by category, price, rating, discount, stock, color, and size.
- Product sorting by newest, lowest price, highest price, highest rating, name A-Z, and biggest discount.
- Grid view and list view with LocalStorage preference.
- Product pagination with 8 products per page.
- Product detail page using URL parameter, for example `product-detail.html?id=1`.
- Product image gallery, simple zoom, size/color selection, quantity control, information tabs, dummy reviews, and related products.
- Quick view modal with Escape key, overlay click, and close button support.
- Wishlist feature using LocalStorage.
- Shopping cart with quantity update, subtotal, discount, shipping fee, service fee, free shipping progress, and promo code support.
- Dummy promo codes: `URBAN10`, `NEWUSER`, and `FREESHIP`.
- Checkout form with complete validation.
- Simulated shipping and payment method selection.
- WhatsApp checkout integration using `wa.me`.
- Order success page and order history using LocalStorage.
- Light mode and dark mode with saved user preference.
- Toast notifications for success, error, warning, and info messages.
- Loading screen, catalog skeleton loading, smooth scroll, reveal animation, back to top button, and mobile slide menu.
- Fully responsive layout for desktop, laptop, tablet, mobile, and small mobile screens.
- Basic SEO meta tags on each page.

## Tech Stack

- HTML5
- CSS3
- Vanilla JavaScript
- LocalStorage
- Local SVG Assets

## Folder Structure

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

## How to Run

Open `index.html` directly in your browser, or run the project using a static server such as Live Server.

You can also run it with:

```bash
npx serve .
```

This project does not require any build step.

## How to Change the WhatsApp Number

Open `js/products.js`, then update the following value:

```javascript
const STORE_CONFIG = {
  whatsappNumber: "6281234567890"
};
```

Use the international phone number format without the `+` symbol.

## How to Add a New Product

Open `js/products.js`, then add a new object to the `UC_PRODUCTS` array. Make sure each product has a unique `id`, name, category, price, rating, stock data, size, color, image, description, details, created date, sold count, and SKU.

Example:

```javascript
{
  id: 21,
  name: "New Product Name",
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
  description: "Product description.",
  details: ["First detail", "Second detail"],
  createdAt: "2026-07-14",
  sold: 10,
  sku: "URB-NEW-021"
}
```

## Project Purpose

This project was created to practice frontend development skills by building a practical, user-focused e-commerce interface. It demonstrates multi-page layout structure, DOM manipulation, responsive design, product filtering, cart management, form validation, and LocalStorage-based state management.

## Author

Muhammad Ali Murtadho

- GitHub: https://github.com/Muhammadalimurtadho
