document.addEventListener("DOMContentLoaded", () => {
  const detail = document.querySelector("#productDetail");
  const tabs = document.querySelector("#productTabs");
  const related = document.querySelector("#relatedProducts");
  const productId = new URLSearchParams(window.location.search).get("id");
  const product = UrbanCart.getProduct(productId);

  if (!product) {
    detail.innerHTML = `<div class="empty-state"><h1>Produk tidak ditemukan</h1><p>Produk yang kamu cari tidak tersedia.</p><a class="btn btn-dark" href="products.html">Kembali ke Katalog</a></div>`;
    return;
  }

  document.title = `${product.name} - UrbanCart`;

  function optionInputs(name, values) {
    return values.map((value) => `
      <label>
        <input type="radio" name="${name}" value="${value}" required>
        <span>${value}</span>
      </label>`).join("");
  }

  detail.innerHTML = `
    <nav class="breadcrumb" aria-label="Breadcrumb"><a href="index.html">Home</a> / <a href="products.html">Products</a> / ${product.name}</nav>
    <div class="detail-grid">
      <div>
        <div class="gallery-main"><img id="mainImage" src="${product.images[0]}" alt="${product.name}"></div>
        <div class="thumbnail-row">
          ${product.images.map((image, index) => `<button type="button" class="${index === 0 ? "is-active" : ""}" data-thumb="${image}" aria-label="Gambar ${index + 1}"><img src="${image}" alt="${product.name} ${index + 1}"></button>`).join("")}
        </div>
      </div>
      <div class="detail-copy">
        <span class="badge">${product.badge}</span>
        <h1>${product.name}</h1>
        ${UrbanCart.renderRating(product)}
        <div class="price-row">
          <strong>${UrbanCart.formatCurrency(product.price)}</strong>
          ${product.compareAt ? `<del>${UrbanCart.formatCurrency(product.compareAt)}</del><span>-${UrbanCart.discountPercent(product)}%</span>` : ""}
        </div>
        <p>${product.description}</p>
        <p><strong>Status:</strong> ${product.inStock ? `Tersedia (${product.stock} stok)` : "Stok habis"}</p>
        <form id="detailForm">
          <label>Warna<div class="option-row">${optionInputs("color", product.colors)}</div></label>
          <label>Ukuran<div class="option-row">${optionInputs("size", product.sizes)}</div></label>
          <label>Jumlah
            <div class="quantity-control">
              <button type="button" data-qty="-1" aria-label="Kurangi jumlah">−</button>
              <input name="quantity" type="number" min="1" value="1">
              <button type="button" data-qty="1" aria-label="Tambah jumlah">+</button>
            </div>
          </label>
          <div class="form-actions">
            <button class="btn btn-dark" type="submit" ${product.inStock ? "" : "disabled"}>Add to Cart</button>
            <button class="btn btn-accent" type="button" data-buy-now ${product.inStock ? "" : "disabled"}>Buy Now</button>
            <button class="btn btn-ghost" type="button" data-wishlist="${product.id}">Add to Wishlist</button>
          </div>
          <p class="form-message" id="detailMessage"></p>
        </form>
        <div class="info-list">
          <div><strong>Pengiriman:</strong> Regular, Express, dan Same Day tersedia.</div>
          <div><strong>Pengembalian:</strong> Retur maksimal 7 hari setelah diterima.</div>
          <div><strong>SKU:</strong> ${product.sku}</div>
          <div><strong>Kategori:</strong> ${product.category} / ${product.type}</div>
          <div><strong>Bagikan:</strong> <button class="btn btn-ghost" type="button" data-share>Copy Link</button></div>
        </div>
      </div>
    </div>`;

  tabs.innerHTML = `
    <div class="tab-buttons" role="tablist">
      <button class="is-active" type="button" data-tab="description">Description</button>
      <button type="button" data-tab="details">Product Details</button>
      <button type="button" data-tab="reviews">Reviews</button>
    </div>
    <div class="tab-panel is-active" data-panel="description"><p>${product.description}</p></div>
    <div class="tab-panel" data-panel="details"><ul>${product.details.map((item) => `<li>${item}</li>`).join("")}</ul></div>
    <div class="tab-panel" data-panel="reviews">
      <article><strong>Nadia</strong><p>Bahan sesuai deskripsi dan jahitannya rapi. Pengiriman cepat.</p></article>
      <article><strong>Ardi</strong><p>Fit-nya enak dipakai, warna produk juga mirip dengan foto.</p></article>
      <article><strong>Salma</strong><p>Packaging bagus dan produk terasa premium untuk harganya.</p></article>
    </div>`;

  related.innerHTML = UC_PRODUCTS
    .filter((item) => item.category === product.category && item.id !== product.id)
    .slice(0, 4)
    .map((item) => UrbanCart.renderProductCard(item))
    .join("");

  detail.addEventListener("click", (event) => {
    const thumb = event.target.closest("[data-thumb]");
    const qty = event.target.closest("[data-qty]");
    if (thumb) {
      document.querySelector("#mainImage").src = thumb.dataset.thumb;
      document.querySelectorAll("[data-thumb]").forEach((button) => button.classList.toggle("is-active", button === thumb));
    }
    if (qty) {
      const input = document.querySelector("#detailForm [name='quantity']");
      input.value = Math.max(1, Number(input.value || 1) + Number(qty.dataset.qty));
    }
    if (event.target.closest("[data-share]")) {
      navigator.clipboard?.writeText(window.location.href);
      UrbanCart.toast("Link produk disalin", "success");
    }
  });

  tabs.addEventListener("click", (event) => {
    const button = event.target.closest("[data-tab]");
    if (!button) return;
    tabs.querySelectorAll("[data-tab]").forEach((item) => item.classList.toggle("is-active", item === button));
    tabs.querySelectorAll("[data-panel]").forEach((panel) => panel.classList.toggle("is-active", panel.dataset.panel === button.dataset.tab));
  });

  function collectOptions() {
    const form = document.querySelector("#detailForm");
    const message = document.querySelector("#detailMessage");
    const size = form.querySelector("[name='size']:checked")?.value;
    const color = form.querySelector("[name='color']:checked")?.value;
    if (!size || !color) {
      message.textContent = "Pilih ukuran dan warna sebelum menambahkan produk.";
      UrbanCart.toast("Ukuran dan warna wajib dipilih", "warning");
      return null;
    }
    message.textContent = "";
    return { size, color, quantity: form.quantity.value };
  }

  document.querySelector("#detailForm").addEventListener("submit", (event) => {
    event.preventDefault();
    const options = collectOptions();
    if (options) UrbanCart.addToCart(product.id, options);
  });

  document.querySelector("[data-buy-now]").addEventListener("click", () => {
    const options = collectOptions();
    if (options && UrbanCart.addToCart(product.id, options)) window.location.href = "checkout.html";
  });

  UrbanCart.initReveal();
});
