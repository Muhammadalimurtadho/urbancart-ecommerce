document.addEventListener("DOMContentLoaded", () => {
  const shippingOptions = [
    { id: "regular", name: "Regular", estimate: "2-4 hari", extra: 0 },
    { id: "express", name: "Express", estimate: "1-2 hari", extra: 15000 },
    { id: "same-day", name: "Same Day", estimate: "Hari yang sama", extra: 30000 },
  ];
  const paymentOptions = ["Bank Transfer", "E-Wallet", "QRIS", "Cash on Delivery"];
  const form = document.querySelector("#checkoutForm");
  const summary = document.querySelector("#checkoutSummary");
  const successPanel = document.querySelector("#successPanel");
  const orderHistory = document.querySelector("#orderHistory");

  function dateId() {
    const now = new Date();
    return `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, "0")}${String(now.getDate()).padStart(2, "0")}`;
  }

  function makeOrderId() {
    return `URB-${dateId()}-${Math.floor(1000 + Math.random() * 9000)}`;
  }

  function selectedShippingId() {
    return form?.querySelector("[name='shipping']:checked")?.value || "regular";
  }

  function checkoutTotals() {
    const base = UrbanCart.getCartTotals();
    const chosen = shippingOptions.find((item) => item.id === selectedShippingId()) || shippingOptions[0];
    const free = base.subtotal >= STORE_CONFIG.freeShippingMinimum || UrbanCart.getStorage(UrbanCart.storageKeys.promos, []).includes("FREESHIP");
    const shipping = base.subtotal === 0 || free ? 0 : STORE_CONFIG.shippingCost + chosen.extra;
    return { ...base, shipping, total: Math.max(0, base.subtotal - base.discount + shipping + base.service), shippingName: chosen.name, shippingEstimate: chosen.estimate };
  }

  function renderCheckoutControls() {
    const shippingWrap = document.querySelector("#shippingMethods");
    const paymentWrap = document.querySelector("#paymentMethods");
    if (!shippingWrap || !paymentWrap) return;
    shippingWrap.innerHTML = shippingOptions.map((item, index) => `
      <label class="radio-card">
        <input type="radio" name="shipping" value="${item.id}" ${index === 0 ? "checked" : ""}>
        <span><strong>${item.name}</strong><br><small>${item.estimate} · ${item.extra ? `+${UrbanCart.formatCurrency(item.extra)}` : "Standar"}</small></span>
      </label>`).join("");
    paymentWrap.innerHTML = paymentOptions.map((item, index) => `
      <label class="radio-card">
        <input type="radio" name="payment" value="${item}" ${index === 0 ? "checked" : ""}>
        <span><strong>${item}</strong><br><small>Simulasi pembayaran tanpa backend.</small></span>
      </label>`).join("");
  }

  function renderSummary() {
    if (!summary) return;
    const cart = UrbanCart.getCart();
    const totals = checkoutTotals();
    summary.innerHTML = `
      <h2>Ringkasan Pesanan</h2>
      <div class="order-list">
        ${cart.length ? cart.map((item) => {
          const product = UrbanCart.getProduct(item.id);
          return product ? `<div class="summary-row"><span>${product.name}<br><small>${item.quantity}x · ${item.size} · ${item.color}</small></span><strong>${UrbanCart.formatCurrency(product.price * item.quantity)}</strong></div>` : "";
        }).join("") : `<div class="empty-state"><p>Keranjang kosong.</p></div>`}
      </div>
      <div class="summary-row"><span>Subtotal</span><strong>${UrbanCart.formatCurrency(totals.subtotal)}</strong></div>
      <div class="summary-row"><span>Diskon</span><strong>-${UrbanCart.formatCurrency(totals.discount)}</strong></div>
      <div class="summary-row"><span>Ongkir</span><strong>${totals.shipping ? UrbanCart.formatCurrency(totals.shipping) : "Gratis"}</strong></div>
      <div class="summary-row"><span>Biaya layanan</span><strong>${UrbanCart.formatCurrency(totals.service)}</strong></div>
      <div class="summary-row total"><span>Total</span><strong>${UrbanCart.formatCurrency(totals.total)}</strong></div>`;
  }

  function validateCheckout() {
    const message = document.querySelector("#checkoutMessage");
    const data = new FormData(form);
    const required = ["name", "phone", "email", "province", "city", "district", "address", "postal"];
    const missing = required.some((key) => !String(data.get(key) || "").trim());
    const phone = String(data.get("phone") || "").replace(/\D/g, "");
    const email = String(data.get("email") || "");
    if (!UrbanCart.getCart().length) {
      message.textContent = "Keranjang masih kosong.";
      UrbanCart.toast("Keranjang masih kosong", "warning");
      return null;
    }
    if (missing) {
      message.textContent = "Lengkapi seluruh data pembeli.";
      UrbanCart.toast("Form belum lengkap", "error");
      return null;
    }
    if (phone.length < 9 || phone.length > 15) {
      message.textContent = "Nomor WhatsApp hanya boleh angka dan panjangnya harus wajar.";
      UrbanCart.toast("Nomor WhatsApp belum valid", "error");
      return null;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      message.textContent = "Format email belum valid.";
      UrbanCart.toast("Email belum valid", "error");
      return null;
    }
    message.textContent = "";
    return Object.fromEntries(data.entries());
  }

  function buildWhatsAppMessage(order, buyer) {
    const lines = [
      "Halo UrbanCart, saya ingin melakukan pemesanan.",
      "",
      "Data Pembeli:",
      `Nama: ${buyer.name}`,
      `Nomor WhatsApp: ${buyer.phone}`,
      `Alamat: ${buyer.address}, ${buyer.district}, ${buyer.city}, ${buyer.province} ${buyer.postal}`,
      "",
      "Detail Pesanan:",
      ...order.items.flatMap((item, index) => [
        `${index + 1}. ${item.name}`,
        `   Ukuran: ${item.size}`,
        `   Warna: ${item.color}`,
        `   Jumlah: ${item.quantity}`,
        `   Harga: ${UrbanCart.formatCurrency(item.price)}`,
      ]),
      "",
      `Subtotal: ${UrbanCart.formatCurrency(order.totals.subtotal)}`,
      `Diskon: ${UrbanCart.formatCurrency(order.totals.discount)}`,
      `Ongkir: ${order.totals.shipping ? UrbanCart.formatCurrency(order.totals.shipping) : "Gratis"}`,
      `Total: ${UrbanCart.formatCurrency(order.totals.total)}`,
      "",
      `Metode Pengiriman: ${order.shipping} (${order.shippingEstimate})`,
      `Metode Pembayaran: ${order.payment}`,
      `Catatan: ${buyer.note || "-"}`,
    ];
    return lines.join("\n");
  }

  function createOrder(buyer) {
    const totals = checkoutTotals();
    const cart = UrbanCart.getCart();
    const order = {
      id: makeOrderId(),
      date: new Date().toISOString(),
      status: "Menunggu Pembayaran",
      buyer,
      shipping: totals.shippingName,
      shippingEstimate: totals.shippingEstimate,
      payment: buyer.payment,
      totals,
      items: cart.map((item) => {
        const product = UrbanCart.getProduct(item.id);
        return { ...item, name: product.name, price: product.price, image: product.images[0] };
      }),
    };
    const orders = UrbanCart.getStorage(UrbanCart.storageKeys.orders, []);
    orders.unshift(order);
    UrbanCart.setStorage(UrbanCart.storageKeys.orders, orders);
    return order;
  }

  function handleCheckout(event) {
    event.preventDefault();
    const buyer = validateCheckout();
    if (!buyer) return;
    const order = createOrder(buyer);
    const message = buildWhatsAppMessage(order, buyer);
    window.open(`https://wa.me/${STORE_CONFIG.whatsappNumber}?text=${encodeURIComponent(message)}`, "_blank");
    UrbanCart.saveCart([]);
    UrbanCart.setStorage(UrbanCart.storageKeys.promos, []);
    window.location.href = `order-success.html?order=${encodeURIComponent(order.id)}`;
  }

  function renderSuccess() {
    if (!successPanel) return;
    const id = new URLSearchParams(window.location.search).get("order");
    const orders = UrbanCart.getStorage(UrbanCart.storageKeys.orders, []);
    const order = orders.find((item) => item.id === id) || orders[0];
    if (!order) {
      successPanel.innerHTML = `<h1>Belum ada pesanan</h1><p>Riwayat pesanan akan muncul setelah checkout.</p><a class="btn btn-dark" href="products.html">Belanja Sekarang</a>`;
      return;
    }
    successPanel.innerHTML = `
      <span class="eyebrow">Pesanan Berhasil</span>
      <h1>Terima kasih!</h1>
      <p>Nomor pesanan kamu adalah <strong>${order.id}</strong>.</p>
      <div class="summary-row"><span>Total</span><strong>${UrbanCart.formatCurrency(order.totals.total)}</strong></div>
      <div class="summary-row"><span>Jumlah produk</span><strong>${order.items.reduce((sum, item) => sum + item.quantity, 0)}</strong></div>
      <div class="summary-row"><span>Status</span><strong>${order.status}</strong></div>
      <div class="form-actions">
        <a class="btn btn-dark" href="products.html">Kembali Berbelanja</a>
        <a class="btn btn-ghost" href="orders.html">Lihat Pesanan</a>
      </div>`;
  }

  function renderOrders() {
    if (!orderHistory) return;
    const orders = UrbanCart.getStorage(UrbanCart.storageKeys.orders, []);
    if (!orders.length) {
      orderHistory.innerHTML = `<div class="empty-state"><h2>Belum ada riwayat pesanan</h2><p>Riwayat checkout simulasi akan tersimpan di browser.</p><a class="btn btn-dark" href="products.html">Belanja Sekarang</a></div>`;
      return;
    }
    const statuses = ["Menunggu Pembayaran", "Diproses", "Dikirim", "Selesai"];
    orderHistory.innerHTML = orders.map((order, index) => `
      <article class="history-card">
        <h2>${order.id}</h2>
        <p>${new Date(order.date).toLocaleString("id-ID")}</p>
        <div class="summary-row"><span>Total</span><strong>${UrbanCart.formatCurrency(order.totals.total)}</strong></div>
        <div class="summary-row"><span>Jumlah produk</span><strong>${order.items.reduce((sum, item) => sum + item.quantity, 0)}</strong></div>
        <div class="summary-row"><span>Status</span><strong>${statuses[index % statuses.length]}</strong></div>
      </article>`).join("");
  }

  if (form) {
    renderCheckoutControls();
    renderSummary();
    form.addEventListener("change", renderSummary);
    form.addEventListener("submit", handleCheckout);
  }
  renderSuccess();
  renderOrders();
});
