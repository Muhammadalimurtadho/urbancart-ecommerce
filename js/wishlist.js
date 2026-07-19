document.addEventListener("DOMContentLoaded", () => {
  const list = document.querySelector("#wishlistList");
  const clear = document.querySelector("#clearWishlist");

  function render() {
    const wishlist = UrbanCart.getWishlist();
    if (!wishlist.length) {
      list.innerHTML = `<div class="empty-state"><h2>Wishlist masih kosong</h2><p>Simpan produk favorit dari katalog untuk melihatnya di sini.</p><a class="btn btn-dark" href="products.html">Cari Produk</a></div>`;
      return;
    }
    list.innerHTML = wishlist.map((id) => {
      const product = UrbanCart.getProduct(id);
      if (!product) return "";
      return `
        <article class="wishlist-item" data-id="${product.id}">
          <img src="${product.images[0]}" alt="${product.name}">
          <div>
            <h3>${product.name}</h3>
            <p>${product.category} · ${UrbanCart.formatCurrency(product.price)}</p>
            ${UrbanCart.renderRating(product)}
          </div>
          <div class="cart-actions">
            <button class="btn btn-dark" type="button" data-move-cart>Pindahkan ke Keranjang</button>
            <button class="btn btn-ghost" type="button" data-remove-wishlist>Hapus</button>
          </div>
        </article>`;
    }).join("");
  }

  list.addEventListener("click", (event) => {
    const item = event.target.closest("[data-id]");
    if (!item) return;
    const id = Number(item.dataset.id);
    if (event.target.closest("[data-move-cart]")) UrbanCart.addToCart(id);
    if (event.target.closest("[data-remove-wishlist]")) {
      UrbanCart.saveWishlist(UrbanCart.getWishlist().filter((savedId) => savedId !== id));
      UrbanCart.toast("Produk dihapus dari wishlist", "info");
      render();
    }
  });

  clear.addEventListener("click", () => {
    UrbanCart.saveWishlist([]);
    UrbanCart.toast("Wishlist dikosongkan", "info");
    render();
  });

  render();
});
