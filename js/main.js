(function () {
  const storageKeys = {
    cart: "urbancart_cart",
    wishlist: "urbancart_wishlist",
    theme: "urbancart_theme",
    newsletters: "urbancart_newsletters",
    view: "urbancart_catalog_view",
    orders: "urbancart_orders",
    promos: "urbancart_promos",
  };

  const formatter = new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: STORE_CONFIG.currency,
    maximumFractionDigits: 0,
  });

  function getStorage(key, fallback) {
    try {
      const raw = localStorage.getItem(key);
      return raw ? JSON.parse(raw) : fallback;
    } catch (error) {
      console.warn("UrbanCart storage read failed", error);
      return fallback;
    }
  }

  function setStorage(key, value) {
    localStorage.setItem(key, JSON.stringify(value));
  }

  function formatCurrency(value) {
    return formatter.format(Number(value || 0));
  }

  function getProduct(id) {
    return UC_PRODUCTS.find((product) => product.id === Number(id));
  }

  function getCart() {
    return getStorage(storageKeys.cart, []);
  }

  function saveCart(cart) {
    setStorage(storageKeys.cart, cart);
    updateHeaderCounts();
  }

  function getWishlist() {
    return getStorage(storageKeys.wishlist, []);
  }

  function saveWishlist(wishlist) {
    setStorage(storageKeys.wishlist, wishlist);
    updateHeaderCounts();
    document.querySelectorAll("[data-wishlist]").forEach((button) => {
      const id = Number(button.dataset.wishlist);
      button.classList.toggle("is-active", wishlist.includes(id));
      button.setAttribute("aria-pressed", String(wishlist.includes(id)));
    });
  }

  function getCartTotals(extraPromos) {
    const cart = getCart();
    const subtotal = cart.reduce((sum, item) => {
      const product = getProduct(item.id);
      return sum + (product ? product.price * item.quantity : 0);
    }, 0);
    const usedPromos = extraPromos || getStorage(storageKeys.promos, []);
    let promoDiscount = 0;
    let freeShip = false;

    usedPromos.forEach((code) => {
      if (code === "URBAN10") promoDiscount += Math.round(subtotal * 0.1);
      if (code === "NEWUSER") promoDiscount += 25000;
      if (code === "FREESHIP") freeShip = true;
    });

    const itemDiscount = cart.reduce((sum, item) => {
      const product = getProduct(item.id);
      if (!product || !product.compareAt) return sum;
      return sum + (product.compareAt - product.price) * item.quantity;
    }, 0);

    const shipping = subtotal >= STORE_CONFIG.freeShippingMinimum || freeShip || subtotal === 0 ? 0 : STORE_CONFIG.shippingCost;
    const service = subtotal > 0 ? STORE_CONFIG.serviceFee : 0;
    const totalDiscount = Math.min(itemDiscount + promoDiscount, subtotal);
    return {
      subtotal,
      itemDiscount,
      promoDiscount,
      discount: totalDiscount,
      shipping,
      service,
      total: Math.max(0, subtotal - totalDiscount + shipping + service),
      count: cart.reduce((sum, item) => sum + item.quantity, 0),
    };
  }

  function toast(message, type = "info") {
    const wrap = document.querySelector(".toast-wrap") || createToastWrap();
    const item = document.createElement("div");
    item.className = `toast toast-${type}`;
    item.setAttribute("role", "status");
    item.innerHTML = `<span>${message}</span><button type="button" aria-label="Tutup notifikasi">&times;</button>`;
    item.querySelector("button").addEventListener("click", () => item.remove());
    wrap.appendChild(item);
    window.setTimeout(() => item.remove(), 4200);
  }

  function createToastWrap() {
    const wrap = document.createElement("div");
    wrap.className = "toast-wrap";
    document.body.appendChild(wrap);
    return wrap;
  }

  function renderIcon(name) {
    const icons = {
      search: "<path d='m21 21-4.35-4.35'/><circle cx='11' cy='11' r='7'/>",
      heart: "<path d='M20.8 4.6a5.4 5.4 0 0 0-7.6 0L12 5.8l-1.2-1.2a5.4 5.4 0 1 0-7.6 7.6L12 21l8.8-8.8a5.4 5.4 0 0 0 0-7.6Z'/>",
      cart: "<circle cx='9' cy='20' r='1.8'/><circle cx='18' cy='20' r='1.8'/><path d='M3 4h2l2.2 11.2a2 2 0 0 0 2 1.6h8.7a2 2 0 0 0 2-1.6L21 8H7'/>",
      menu: "<path d='M4 7h16M4 12h16M4 17h16'/>",
      sun: "<circle cx='12' cy='12' r='4'/><path d='M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41'/>",
      moon: "<path d='M21 12.8A8.5 8.5 0 1 1 11.2 3 6.6 6.6 0 0 0 21 12.8Z'/>",
      user: "<circle cx='12' cy='8' r='4'/><path d='M4 21a8 8 0 0 1 16 0'/>",
      truck: "<path d='M3 7h11v10H3zM14 10h4l3 3v4h-7z'/><circle cx='7' cy='19' r='2'/><circle cx='17' cy='19' r='2'/>",
      shield: "<path d='M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10Z'/><path d='m9 12 2 2 4-5'/>",
      refresh: "<path d='M21 12a9 9 0 0 1-15.4 6.4L3 16M3 12A9 9 0 0 1 18.4 5.6L21 8'/><path d='M3 21v-5h5M21 3v5h-5'/>",
      headset: "<path d='M4 14v-2a8 8 0 0 1 16 0v2'/><path d='M4 14a2 2 0 0 0 2 2h1v-5H6a2 2 0 0 0-2 2v1ZM20 14a2 2 0 0 1-2 2h-1v-5h1a2 2 0 0 1 2 2v1ZM14 20h1a5 5 0 0 0 5-5'/>",
    };
    return `<svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">${icons[name] || ""}</svg>`;
  }

  function initTheme() {
    const stored = localStorage.getItem(storageKeys.theme);
    const preferred = window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
    document.documentElement.dataset.theme = stored || preferred;
  }

  function toggleTheme() {
    const next = document.documentElement.dataset.theme === "dark" ? "light" : "dark";
    document.documentElement.dataset.theme = next;
    localStorage.setItem(storageKeys.theme, next);
  }

  function renderShell() {
    const header = document.querySelector("#site-header");
    const footer = document.querySelector("#site-footer");
    if (header) {
      header.innerHTML = `
        <header class="site-header" data-header>
          <a class="brand" href="index.html" aria-label="UrbanCart Home">UrbanCart</a>
          <nav class="desktop-nav" aria-label="Navigasi utama">
            <a href="index.html">Home</a>
            <a href="products.html">Products</a>
            <a href="products.html?badge=New">New Arrivals</a>
            <a href="products.html?badge=Best%20Seller">Best Seller</a>
            <a href="about.html">About</a>
            <a href="contact.html">Contact</a>
          </nav>
          <div class="header-actions">
            <a class="icon-button" href="products.html" aria-label="Cari produk">${renderIcon("search")}</a>
            <a class="icon-button count-button" href="wishlist.html" aria-label="Buka wishlist">${renderIcon("heart")}<span data-wishlist-count>0</span></a>
            <a class="icon-button count-button" href="cart.html" aria-label="Buka keranjang">${renderIcon("cart")}<span data-cart-count>0</span></a>
            <button class="icon-button" type="button" data-theme-toggle aria-label="Ganti tema">${renderIcon("moon")}</button>
            <button class="icon-button mobile-toggle" type="button" data-menu-toggle aria-label="Buka menu">${renderIcon("menu")}</button>
          </div>
        </header>
        <div class="mobile-panel" data-mobile-panel aria-hidden="true">
          <div class="mobile-panel-head">
            <span class="brand">UrbanCart</span>
            <button class="icon-button" type="button" data-menu-close aria-label="Tutup menu">&times;</button>
          </div>
          <a href="index.html">Home</a>
          <a href="products.html">Products</a>
          <a href="products.html?badge=New">New Arrivals</a>
          <a href="products.html?badge=Best%20Seller">Best Seller</a>
          <a href="wishlist.html">Wishlist</a>
          <a href="cart.html">Cart</a>
          <a href="about.html">About</a>
          <a href="contact.html">Contact</a>
        </div>
        <div class="overlay" data-overlay></div>`;
    }

    if (footer) {
      footer.innerHTML = `
        <footer class="site-footer">
          <div class="footer-grid">
            <div>
              <a class="brand footer-brand" href="index.html">UrbanCart</a>
              <p>Toko fashion dan lifestyle modern untuk outfit harian yang clean, nyaman, dan siap dipakai.</p>
              <form class="footer-newsletter" data-newsletter-form>
                <label for="footer-email">Newsletter</label>
                <div class="inline-form">
                  <input id="footer-email" name="email" type="email" placeholder="email@contoh.com" autocomplete="email">
                  <button class="btn btn-light" type="submit">Subscribe</button>
                </div>
                <p class="form-message" data-newsletter-message></p>
              </form>
            </div>
            <div>
              <h3>Navigasi</h3>
              <a href="products.html">Products</a>
              <a href="products.html?badge=New">New Arrivals</a>
              <a href="wishlist.html">Wishlist</a>
              <a href="orders.html">Riwayat Pesanan</a>
            </div>
            <div>
              <h3>Kategori</h3>
              ${UC_CATEGORIES.map((category) => `<a href="products.html?category=${encodeURIComponent(category)}">${category}</a>`).join("")}
            </div>
            <div>
              <h3>Customer Service</h3>
              <p>Senin - Sabtu, 09.00 - 20.00 WIB</p>
              <p>${STORE_CONFIG.address}</p>
              <p>${STORE_CONFIG.supportEmail}</p>
              <p>${STORE_CONFIG.supportPhone}</p>
              <div class="social-links">
                <a href="#" aria-label="Instagram">IG</a>
                <a href="#" aria-label="TikTok">TT</a>
                <a href="#" aria-label="X">X</a>
              </div>
            </div>
          </div>
          <div class="footer-bottom">Copyright <span data-year></span> UrbanCart. All rights reserved.</div>
        </footer>`;
    }
  }

  function bindShellEvents() {
    const header = document.querySelector("[data-header]");
    const panel = document.querySelector("[data-mobile-panel]");
    const overlay = document.querySelector("[data-overlay]");
    const openMenu = () => {
      panel?.classList.add("is-open");
      overlay?.classList.add("is-visible");
      panel?.setAttribute("aria-hidden", "false");
      document.body.classList.add("no-scroll");
    };
    const closeMenu = () => {
      panel?.classList.remove("is-open");
      overlay?.classList.remove("is-visible");
      panel?.setAttribute("aria-hidden", "true");
      document.body.classList.remove("no-scroll");
    };

    document.addEventListener("scroll", () => {
      header?.classList.toggle("is-scrolled", window.scrollY > 12);
      document.querySelector("[data-back-top]")?.classList.toggle("is-visible", window.scrollY > 400);
    });
    document.querySelector("[data-theme-toggle]")?.addEventListener("click", toggleTheme);
    document.querySelector("[data-menu-toggle]")?.addEventListener("click", openMenu);
    document.querySelector("[data-menu-close]")?.addEventListener("click", closeMenu);
    overlay?.addEventListener("click", () => {
      closeMenu();
      closeQuickView();
    });
    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape") {
        closeMenu();
        closeQuickView();
      }
    });
    document.querySelectorAll("[data-year]").forEach((item) => {
      item.textContent = new Date().getFullYear();
    });
    document.querySelectorAll("[data-newsletter-form]").forEach((form) => {
      form.addEventListener("submit", handleNewsletter);
    });
  }

  function updateHeaderCounts() {
    const totals = getCartTotals();
    const wishlist = getWishlist();
    document.querySelectorAll("[data-cart-count]").forEach((item) => {
      item.textContent = totals.count;
      item.classList.add("bump");
      window.setTimeout(() => item.classList.remove("bump"), 300);
    });
    document.querySelectorAll("[data-wishlist-count]").forEach((item) => {
      item.textContent = wishlist.length;
    });
  }

  function renderRating(product) {
    const rounded = Math.round(product.rating);
    return `<div class="rating" aria-label="Rating ${product.rating} dari 5">
      <span>${"★".repeat(rounded)}${"☆".repeat(5 - rounded)}</span>
      <small>${product.rating} (${product.reviews})</small>
    </div>`;
  }

  function discountPercent(product) {
    if (!product.compareAt) return 0;
    return Math.round(((product.compareAt - product.price) / product.compareAt) * 100);
  }

  function renderProductCard(product, options = {}) {
    const wishlist = getWishlist();
    const isSaved = wishlist.includes(product.id);
    const listClass = options.list ? " product-card-list" : "";
    return `
      <article class="product-card${listClass} reveal" data-product-card data-id="${product.id}">
        <a class="product-media" href="product-detail.html?id=${product.id}" aria-label="Lihat ${product.name}">
          <img src="${product.images[0]}" alt="${product.name}" loading="lazy">
          <span class="badge">${product.badge}</span>
          ${!product.inStock ? `<span class="stock-badge">Out of stock</span>` : ""}
        </a>
        <div class="product-info">
          <div class="product-topline">
            <span>${product.category}</span>
            <button class="icon-button wishlist-button ${isSaved ? "is-active" : ""}" type="button" data-wishlist="${product.id}" aria-label="Toggle wishlist ${product.name}" aria-pressed="${isSaved}">${renderIcon("heart")}</button>
          </div>
          <h3><a href="product-detail.html?id=${product.id}">${product.name}</a></h3>
          <p>${product.description}</p>
          ${renderRating(product)}
          <div class="price-row">
            <strong>${formatCurrency(product.price)}</strong>
            ${product.compareAt ? `<del>${formatCurrency(product.compareAt)}</del><span>-${discountPercent(product)}%</span>` : ""}
          </div>
          <div class="card-actions">
            <button class="btn btn-dark" type="button" data-add-cart="${product.id}" ${product.inStock ? "" : "disabled"}>Add to Cart</button>
            <button class="btn btn-ghost" type="button" data-quick-view="${product.id}">Quick View</button>
          </div>
        </div>
      </article>`;
  }

  function toggleWishlist(productId) {
    const product = getProduct(productId);
    if (!product) return;
    const wishlist = getWishlist();
    const exists = wishlist.includes(product.id);
    const next = exists ? wishlist.filter((id) => id !== product.id) : [...wishlist, product.id];
    saveWishlist(next);
    toast(exists ? "Produk dihapus dari wishlist" : "Produk ditambahkan ke wishlist", exists ? "info" : "success");
  }

  function addToCart(productId, options = {}) {
    const product = getProduct(productId);
    if (!product) return false;
    if (!product.inStock) {
      toast("Produk sedang kehabisan stok", "warning");
      return false;
    }
    const size = options.size || product.sizes[0];
    const color = options.color || product.colors[0];
    const quantity = Math.max(1, Number(options.quantity || 1));
    if (!size || !color) {
      toast("Pilih ukuran dan warna terlebih dahulu", "warning");
      return false;
    }
    const cart = getCart();
    const existing = cart.find((item) => item.id === product.id && item.size === size && item.color === color);
    if (existing) existing.quantity += quantity;
    else cart.push({ id: product.id, size, color, quantity });
    saveCart(cart);
    toast("Produk ditambahkan ke keranjang", "success");
    return true;
  }

  function handleNewsletter(event) {
    event.preventDefault();
    const form = event.currentTarget;
    const email = form.email.value.trim();
    const message = form.querySelector("[data-newsletter-message]");
    const isValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    if (!isValid) {
      if (message) message.textContent = "Masukkan email yang valid.";
      toast("Email newsletter belum valid", "error");
      return;
    }
    const emails = getStorage(storageKeys.newsletters, []);
    if (!emails.includes(email)) emails.push(email);
    setStorage(storageKeys.newsletters, emails);
    form.reset();
    if (message) message.textContent = "Terima kasih, email berhasil disimpan.";
    toast("Berhasil subscribe newsletter", "success");
  }

  function openQuickView(productId) {
    const product = getProduct(productId);
    if (!product) return;
    let modal = document.querySelector("[data-quick-modal]");
    if (!modal) {
      modal = document.createElement("div");
      modal.className = "quick-modal";
      modal.dataset.quickModal = "";
      document.body.appendChild(modal);
    }
    modal.innerHTML = `
      <div class="quick-dialog" role="dialog" aria-modal="true" aria-label="Quick view ${product.name}">
        <button class="modal-close" type="button" data-modal-close aria-label="Tutup modal">&times;</button>
        <img src="${product.images[0]}" alt="${product.name}">
        <div>
          <span class="badge">${product.badge}</span>
          <h2>${product.name}</h2>
          ${renderRating(product)}
          <div class="price-row"><strong>${formatCurrency(product.price)}</strong>${product.compareAt ? `<del>${formatCurrency(product.compareAt)}</del>` : ""}</div>
          <p>${product.description}</p>
          <form data-quick-form>
            <label>Ukuran
              <select name="size">${product.sizes.map((size) => `<option value="${size}">${size}</option>`).join("")}</select>
            </label>
            <label>Warna
              <select name="color">${product.colors.map((color) => `<option value="${color}">${color}</option>`).join("")}</select>
            </label>
            <label>Jumlah
              <input type="number" name="quantity" min="1" value="1">
            </label>
            <div class="modal-actions">
              <button class="btn btn-dark" type="submit" ${product.inStock ? "" : "disabled"}>Add to Cart</button>
              <a class="btn btn-ghost" href="product-detail.html?id=${product.id}">Detail Produk</a>
            </div>
          </form>
        </div>
      </div>`;
    document.body.classList.add("no-scroll");
    document.querySelector("[data-overlay]")?.classList.add("is-visible");
    modal.classList.add("is-open");
    modal.querySelector("[data-modal-close]").addEventListener("click", closeQuickView);
    modal.querySelector("[data-quick-form]").addEventListener("submit", (event) => {
      event.preventDefault();
      const form = event.currentTarget;
      if (addToCart(product.id, { size: form.size.value, color: form.color.value, quantity: form.quantity.value })) closeQuickView();
    });
    modal.querySelector("button, a, input, select")?.focus();
  }

  function closeQuickView() {
    const modal = document.querySelector("[data-quick-modal]");
    modal?.classList.remove("is-open");
    document.querySelector("[data-overlay]")?.classList.remove("is-visible");
    if (!document.querySelector("[data-mobile-panel]")?.classList.contains("is-open")) {
      document.body.classList.remove("no-scroll");
    }
  }

  function bindGlobalProductActions() {
    document.addEventListener("click", (event) => {
      const wishlistButton = event.target.closest("[data-wishlist]");
      const cartButton = event.target.closest("[data-add-cart]");
      const quickButton = event.target.closest("[data-quick-view]");
      const topButton = event.target.closest("[data-back-top]");
      if (wishlistButton) toggleWishlist(Number(wishlistButton.dataset.wishlist));
      if (cartButton) addToCart(Number(cartButton.dataset.addCart));
      if (quickButton) openQuickView(Number(quickButton.dataset.quickView));
      if (topButton) window.scrollTo({ top: 0, behavior: "smooth" });
    });
  }

  function initReveal() {
    const items = document.querySelectorAll(".reveal");
    if (!("IntersectionObserver" in window)) {
      items.forEach((item) => item.classList.add("is-visible"));
      return;
    }
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12 }
    );
    items.forEach((item) => observer.observe(item));
  }

  function initLoader() {
    const loader = document.querySelector("[data-loader]");
    if (!loader) return;
    window.setTimeout(() => loader.classList.add("is-hidden"), 450);
  }

  function initHome() {
    const arrivals = document.querySelector("[data-new-arrivals]");
    const best = document.querySelector("[data-best-seller]");
    if (arrivals) arrivals.innerHTML = UC_PRODUCTS.slice().sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)).slice(0, 8).map(renderProductCard).join("");
    if (best) best.innerHTML = UC_PRODUCTS.slice().sort((a, b) => b.sold - a.sold).slice(0, 4).map(renderProductCard).join("");
    initCountdown();
    initTestimonials();
  }

  function initCountdown() {
    const wrap = document.querySelector("[data-countdown]");
    if (!wrap) return;
    const target = new Date();
    target.setDate(target.getDate() + 12);
    target.setHours(23, 59, 59, 999);
    const render = () => {
      const diff = Math.max(0, target - new Date());
      const days = Math.floor(diff / 86400000);
      const hours = Math.floor((diff % 86400000) / 3600000);
      const minutes = Math.floor((diff % 3600000) / 60000);
      const seconds = Math.floor((diff % 60000) / 1000);
      wrap.innerHTML = [
        ["Hari", days],
        ["Jam", hours],
        ["Menit", minutes],
        ["Detik", seconds],
      ].map(([label, value]) => `<span><strong>${String(value).padStart(2, "0")}</strong>${label}</span>`).join("");
    };
    render();
    window.setInterval(render, 1000);
  }

  function initTestimonials() {
    const slider = document.querySelector("[data-testimonial-slider]");
    if (!slider) return;
    const items = Array.from(slider.querySelectorAll(".testimonial"));
    const dots = document.querySelector("[data-testimonial-dots]");
    let index = 0;
    let timer;
    const render = () => {
      items.forEach((item, itemIndex) => item.classList.toggle("is-active", itemIndex === index));
      if (dots) dots.innerHTML = items.map((_, dotIndex) => `<button type="button" class="${dotIndex === index ? "is-active" : ""}" data-dot="${dotIndex}" aria-label="Testimoni ${dotIndex + 1}"></button>`).join("");
    };
    const move = (step) => {
      index = (index + step + items.length) % items.length;
      render();
    };
    const start = () => {
      timer = window.setInterval(() => move(1), 4500);
    };
    const stop = () => window.clearInterval(timer);
    document.querySelector("[data-testimonial-prev]")?.addEventListener("click", () => move(-1));
    document.querySelector("[data-testimonial-next]")?.addEventListener("click", () => move(1));
    dots?.addEventListener("click", (event) => {
      const dot = event.target.closest("[data-dot]");
      if (dot) {
        index = Number(dot.dataset.dot);
        render();
      }
    });
    slider.addEventListener("mouseenter", stop);
    slider.addEventListener("mouseleave", start);
    render();
    start();
  }

  function boot() {
    initTheme();
    renderShell();
    bindShellEvents();
    bindGlobalProductActions();
    updateHeaderCounts();
    initLoader();
    if (document.body.dataset.page === "home") initHome();
    window.setTimeout(initReveal, 50);
    document.body.insertAdjacentHTML("beforeend", `<button class="back-top" type="button" data-back-top aria-label="Kembali ke atas">↑</button>`);
  }

  window.UrbanCart = {
    storageKeys,
    getStorage,
    setStorage,
    formatCurrency,
    getProduct,
    getCart,
    saveCart,
    getWishlist,
    saveWishlist,
    getCartTotals,
    renderProductCard,
    renderRating,
    discountPercent,
    addToCart,
    toast,
    renderIcon,
    initReveal,
  };

  document.addEventListener("DOMContentLoaded", boot);
})();
