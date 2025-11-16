document.addEventListener("DOMContentLoaded", async () => {
  if (!verificarLogin()) return;
  await carregarDepoimentos();
});

async function carregarDepoimentos() {
  const res = await apiRequest("list", { table: "Depoimentos" });
  const grid = document.querySelector(".testimonials-grid");
  if (res.status !== "ok") return (grid.innerHTML = `<div class="no-data">Erro ao carregar.</div>`);
  grid.innerHTML = "";
  res.data.forEach(dep => {
    grid.innerHTML += `
      <div class="testimonial-card">
        <img src="${dep.ImagemBase64 || "https://i.pravatar.cc/80"}" class="testimonial-image">
        <div class="testimonial-content">
          <p>"${dep.Texto || ""}"</p>
          <div class="testimonial-meta">— ${dep.Nome || "Anônimo"}</div>
        </div>
      </div>`;
  });
}

