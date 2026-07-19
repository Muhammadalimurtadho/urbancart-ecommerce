document.addEventListener("DOMContentLoaded", () => {
  const form = document.querySelector("#contactForm");
  const message = document.querySelector("#contactMessage");
  if (!form) return;
  form.addEventListener("submit", (event) => {
    event.preventDefault();
    const data = new FormData(form);
    const isComplete = ["name", "email", "subject", "message"].every((key) => String(data.get(key) || "").trim());
    const email = String(data.get("email") || "");
    if (!isComplete || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      message.textContent = "Lengkapi form dengan email yang valid.";
      UrbanCart.toast("Form kontak belum lengkap", "error");
      return;
    }
    const messages = UrbanCart.getStorage("urbancart_contact_messages", []);
    messages.unshift({ ...Object.fromEntries(data.entries()), date: new Date().toISOString() });
    UrbanCart.setStorage("urbancart_contact_messages", messages);
    form.reset();
    message.textContent = "Pesan berhasil disimpan sebagai simulasi.";
    UrbanCart.toast("Pesan berhasil dikirim", "success");
  });
});
