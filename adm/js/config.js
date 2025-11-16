document.addEventListener("DOMContentLoaded", async () => {
  if (!verificarLogin()) return;
  await carregarConfiguracoes();
});

async function carregarConfiguracoes() {
  const res = await apiRequest("list", { table: "Configurações" });
  if (res.status === "ok" && res.data.length) {
    const c = res.data[0];
    document.getElementById("empresaNome").value = c.Nome || "";
    document.getElementById("empresaEmail").value = c.Email || "";
    document.getElementById("empresaTelefone").value = c.Telefone || "";
  }
}

async function salvarConfiguracoes() {
  const registro = {
    Nome: document.getElementById("empresaNome").value,
    Email: document.getElementById("empresaEmail").value,
    Telefone: document.getElementById("empresaTelefone").value
  };
  const res = await apiRequest("upsert", { table: "Configurações", record: registro });
  alert(res.status === "ok" ? "Configurações salvas!" : "Erro: " + res.message);
}

