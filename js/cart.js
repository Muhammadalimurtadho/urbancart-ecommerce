document.addEventListener("DOMContentLoaded", () => {
  const list = document.querySelector("#cartList");
  const summary = document.querySelector("#cartSummary");
  const clearButton = document.querySelector("#clearCart");

  function renderCart() {
    const cart = UrbanCart.getCart();
    if (!cart.length) {
      list.innerHTML = `<div class="empty-state"><h2>Keranjang masih kosong</h2><p>Mulai pilih produk dari katalog UrbanCart.</p><a class="btn btn-dark" href="products.html">Belanja Sekarang</a></div>`;
    } else {
      list.innerHTML = cart.map((item, index) => {
        const product = UrbanCart.getProduct(item.id);
        if (!product) return "";
        return `
          <article class="cart-item" data-index="${index}">
            <img src="${product.images[0]}" alt="${product.name}">
            <div>
              <h3>${product.name}</h3>
              <p>Ukuran: ${item.size} · Warna: ${item.color}</p>
              <p>${UrbanCart.formatCurrency(product.price)} / item</p>
              <div class="quantity-control">
                <button type="button" data-cart-qty="-1" aria-label="Kurangi jumlah">−</button>
                <input type="number" value="${item.quantity}" min="1" aria-label="Jumlah produk">
                <button type="button" data-cart-qty="1" aria-label="Tambah jumlah">+</button>
              </div>
            </div>
            <div>
              <strong>${UrbanCart.formatCurrency(product.price * item.quantity)}</strong>
              <button class="btn btn-ghost" type="button" data-remove-cart>Hapus</button>
            </div>
          </article>`;
      }).join("");
    }
    renderSummary();
  }

  function renderSummary() {
    const totals = UrbanCart.getCartTotals();
    const remaining = Math.max(0, STORE_CONFIG.freeShippingMinimum - totals.subtotal);
    const progress = Math.min(100, (totals.subtotal / STORE_CONFIG.freeShippingMinimum) * 100);
    const promos = UrbanCart.getStorage(UrbanCart.storageKeys.promos, []);
    summary.innerHTML = `
      <h2>Ringkasan</h2>
      <div class="free-ship">
        <p>${remaining > 0 ? `Belanja ${UrbanCart.formatCurrency(remaining)} lagi untuk mendapatkan gratis ongkir.` : "Kamu mendapatkan gratis ongkir."}</p>
        <progress class="progress" max="100" value="${progress}" aria-label="Progress gratis ongkir"></progress>
      </div>
      <form id="promoForm">
        <label for="promoCode">Kode promo</label>
        <div class="inline-form">
          <input id="promoCode" name="code" type="text" placeholder="URBAN10">
          <button class="btn btn-dark" type="submit">Apply</button>
        </div>
        <p class="form-message">${promos.length ? `Promo aktif: ${promos.join(", ")}` : "Coba URBAN10, NEWUSER, atau FREESHIP."}</p>
      </form>
      <div class="summary-row"><span>Subtotal</span><strong>${UrbanCart.formatCurrency(totals.subtotal)}</strong></div>
      <div class="summary-row"><span>Diskon</span><strong>-${UrbanCart.formatCurrency(totals.discount)}</strong></div>
      <div class="summary-row"><span>Ongkir</span><strong>${totals.shipping ? UrbanCart.formatCurrency(totals.shipping) : "Gratis"}</strong></div>
      <div class="summary-row"><span>Biaya layanan</span><strong>${UrbanCart.formatCurrency(totals.service)}</strong></div>
      <div class="summary-row total"><span>Total</span><strong>${UrbanCart.formatCurrency(totals.total)}</strong></div>
      <a class="btn btn-dark" href="checkout.html">Checkout</a>`;
  }

  function updateCart(index, delta) {
    const cart = UrbanCart.getCart();
    if (!cart[index]) return;
    cart[index].quantity += delta;
    if (cart[index].quantity <= 0) cart.splice(index, 1);
    UrbanCart.saveCart(cart);
    renderCart();
  }

  function applyPromo(code) {
    const normalized = code.trim().toUpperCase();
    const totals = UrbanCart.getCartTotals([]);
    const promos = UrbanCart.getStorage(UrbanCart.storageKeys.promos, []);
    const validCodes = {
      URBAN10: totals.subtotal >= 200000,
      NEWUSER: totals.subtotal >= 150000,
      FREESHIP: totals.subtotal >= 250000,
    };
    if (!validCodes[normalized]) {
      UrbanCart.toast("Kode promo tidak valid atau minimum belanja belum terpenuhi", "error");
      return;
    }
    if (promos.includes(normalized)) {
      UrbanCart.toast("Kode promo sudah digunakan", "warning");
      return;
    }
    promos.push(normalized);
    UrbanCart.setStorage(UrbanCart.storageKeys.promos, promos);
    UrbanCart.toast("Kode promo berhasil digunakan", "success");
    renderSummary();
  }

  list.addEventListener("click", (event) => {
    const item = event.target.closest("[data-index]");
    if (!item) return;
    const index = Number(item.dataset.index);
    const qty = event.target.closest("[data-cart-qty]");
    if (qty) updateCart(index, Number(qty.dataset.cartQty));
    if (event.target.closest("[data-remove-cart]")) {
      const cart = UrbanCart.getCart();
      cart.splice(index, 1);
      UrbanCart.saveCart(cart);
      UrbanCart.toast("Produk dihapus dari keranjang", "info");
      renderCart();
    }
  });
  summary.addEventListener("submit", (event) => {
    event.preventDefault();
    if (event.target.id === "promoForm") applyPromo(event.target.code.value);
  });
  clearButton.addEventListener("click", () => {
    UrbanCart.saveCart([]);
    UrbanCart.setStorage(UrbanCart.storageKeys.promos, []);
    UrbanCart.toast("Keranjang dikosongkan", "info");
    renderCart();
  });
  renderCart();
});
