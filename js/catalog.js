document.addEventListener("DOMContentLoaded", () => {
  const form = document.querySelector("#filterForm");
  const grid = document.querySelector("#catalogGrid");
  const skeleton = document.querySelector("#catalogSkeleton");
  const pagination = document.querySelector("#pagination");
  const resultInfo = document.querySelector("#resultInfo");
  const searchInput = document.querySelector("#searchInput");
  const sortSelect = document.querySelector("#sortSelect");
  const viewButtons = document.querySelectorAll("[data-view]");
  const perPage = 8;
  let currentPage = 1;
  let activeBadge = "";
  let viewMode = localStorage.getItem(UrbanCart.storageKeys.view) || "grid";

  function unique(values) {
    return [...new Set(values.flat().filter(Boolean))].sort();
  }

  function hydrateFilters() {
    const params = new URLSearchParams(window.location.search);
    activeBadge = params.get("badge") || "";
    const categorySelect = form.category;
    UC_CATEGORIES.forEach((category) => categorySelect.add(new Option(category, category)));
    unique(UC_PRODUCTS.map((product) => product.colors)).forEach((color) => form.color.add(new Option(color, color)));
    unique(UC_PRODUCTS.map((product) => product.sizes)).forEach((size) => form.size.add(new Option(size, size)));
    if (params.get("category")) form.category.value = params.get("category");
    if (params.get("q")) searchInput.value = params.get("q");
    updateViewButtons();
  }

  function getFilteredProducts() {
    const data = new FormData(form);
    const query = searchInput.value.trim().toLowerCase();
    let products = UC_PRODUCTS.filter((product) => {
      const haystack = `${product.name} ${product.category} ${product.type} ${product.description}`.toLowerCase();
      const [minPrice, maxPrice] = (data.get("price") || "-").split("-").map(Number);
      const matchQuery = !query || haystack.includes(query);
      const matchBadge = !activeBadge || product.badge === activeBadge;
      const matchCategory = !data.get("category") || product.category === data.get("category");
      const matchPrice = !data.get("price") || (product.price >= minPrice && product.price <= maxPrice);
      const matchRating = !data.get("rating") || product.rating >= Number(data.get("rating"));
      const matchDiscount = !data.get("discount") || Boolean(product.compareAt);
      const matchStock = !data.get("stock") || product.inStock;
      const matchColor = !data.get("color") || product.colors.includes(data.get("color"));
      const matchSize = !data.get("size") || product.sizes.includes(data.get("size"));
      return matchQuery && matchBadge && matchCategory && matchPrice && matchRating && matchDiscount && matchStock && matchColor && matchSize;
    });

    products = products.sort((a, b) => {
      if (sortSelect.value === "low") return a.price - b.price;
      if (sortSelect.value === "high") return b.price - a.price;
      if (sortSelect.value === "rating") return b.rating - a.rating;
      if (sortSelect.value === "az") return a.name.localeCompare(b.name);
      if (sortSelect.value === "discount") return UrbanCart.discountPercent(b) - UrbanCart.discountPercent(a);
      return new Date(b.createdAt) - new Date(a.createdAt);
    });
    return products;
  }

  function render() {
    const products = getFilteredProducts();
    const totalPages = Math.max(1, Math.ceil(products.length / perPage));
    if (currentPage > totalPages) currentPage = totalPages;
    const start = (currentPage - 1) * perPage;
    const pageItems = products.slice(start, start + perPage);
    grid.classList.toggle("is-list", viewMode === "list");
    resultInfo.textContent = `${products.length} produk ditemukan${activeBadge ? ` untuk ${activeBadge}` : ""}.`;
    grid.innerHTML = pageItems.length
      ? pageItems.map((product) => UrbanCart.renderProductCard(product, { list: viewMode === "list" })).join("")
      : `<div class="empty-state"><h2>Produk tidak ditemukan</h2><p>Coba ubah kata kunci, filter, atau reset katalog.</p><button class="btn btn-dark" type="button" data-reset-empty>Reset Filter</button></div>`;
    pagination.innerHTML = products.length > perPage
      ? Array.from({ length: totalPages }, (_, index) => `<button type="button" class="${index + 1 === currentPage ? "is-active" : ""}" data-page="${index + 1}">${index + 1}</button>`).join("")
      : "";
    UrbanCart.initReveal();
  }

  function delayedRender() {
    skeleton.style.display = "grid";
    grid.innerHTML = "";
    window.setTimeout(() => {
      skeleton.style.display = "none";
      render();
    }, 240);
  }

  function updateViewButtons() {
    viewButtons.forEach((button) => button.classList.toggle("is-active", button.dataset.view === viewMode));
  }

  form.addEventListener("input", () => {
    currentPage = 1;
    activeBadge = activeBadge;
    delayedRender();
  });
  form.addEventListener("reset", () => {
    window.setTimeout(() => {
      activeBadge = "";
      currentPage = 1;
      delayedRender();
    });
  });
  searchInput.addEventListener("input", () => {
    currentPage = 1;
    delayedRender();
  });
  sortSelect.addEventListener("change", delayedRender);
  viewButtons.forEach((button) => {
    button.addEventListener("click", () => {
      viewMode = button.dataset.view;
      localStorage.setItem(UrbanCart.storageKeys.view, viewMode);
      updateViewButtons();
      render();
    });
  });
  pagination.addEventListener("click", (event) => {
    const button = event.target.closest("[data-page]");
    if (!button) return;
    currentPage = Number(button.dataset.page);
    render();
    window.scrollTo({ top: 0, behavior: "smooth" });
  });
  grid.addEventListener("click", (event) => {
    if (event.target.closest("[data-reset-empty]")) {
      form.reset();
      searchInput.value = "";
      activeBadge = "";
      currentPage = 1;
      delayedRender();
    }
  });

  hydrateFilters();
  delayedRender();
});
