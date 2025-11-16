/**
 * ==============================================================
 * MÓDULO: about.js
 * SISTEMA CRUD CONCRETTA - Frontend
 * --------------------------------------------------------------
 * Permite editar informações da aba "Sobre" na planilha.
 * ==============================================================
 */

document.addEventListener("DOMContentLoaded", async () => {
  if (!verificarLogin()) return;
  await carregarSobre();
});

async function carregarSobre() {
  const res = await apiRequest("list", { table: "Sobre" });
  if (res.status === "ok" && res.data.length) {
    const dados = res.data[0];
    document.getElementById("sobreMissao").value = dados.Missao || "";
    document.getElementById("sobreVisao").value = dados.Visao || "";
    document.getElementById("sobreValores").value = dados.Valores || "";
  } else {
    console.warn("Nenhum registro na aba Sobre.");
  }
}

async function salvarSobre() {
  const record = {
    Missao: document.getElementById("sobreMissao").value,
    Visao: document.getElementById("sobreVisao").value,
    Valores: document.getElementById("sobreValores").value,
  };

  const res = await apiRequest("upsert", { table: "Sobre", record });
  if (res.status === "ok") {
    alert("Informações atualizadas com sucesso!");
  } else {
    alert("Erro ao salvar: " + res.message);
  }
}

