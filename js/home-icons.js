document.addEventListener("DOMContentLoaded", () => {
  document.querySelectorAll("[data-icon]").forEach((item) => {
    item.innerHTML = UrbanCart.renderIcon(item.dataset.icon);
  });
});
