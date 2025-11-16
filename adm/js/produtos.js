/**
 * ==============================================================
 * MÓDULO: produtos.js
 * --------------------------------------------------------------
 * CRUD completo de produtos.
 * ==============================================================
 */
let produtos = [];
let novasImagens = [];
let produtoAtual = null;

document.addEventListener("DOMContentLoaded", async () => {
  if (!verificarLogin()) return;
  await carregarProdutos();
  inicializarEventosImagens();
});

async function carregarProdutos() {
  const res = await apiRequest("listProdutosComImagens");
  if (res.status === "ok") {
    produtos = res.data;
    renderTabela(produtos);
  } else {
    console.error(res.message);
  }
}

function renderTabela(lista) {
  const tbody = document.getElementById("produtosBody");
  tbody.innerHTML = "";
  if (!lista.length) {
    tbody.innerHTML = `<tr><td colspan="7" class="text-muted" style="text-align:center;">Nenhum produto encontrado.</td></tr>`;
    return;
  }

  lista.forEach(p => {
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>${p.ID}</td>
      <td class="img-cell">${p.ImagemPrincipal ? `<img src="${p.ImagemPrincipal}" class="thumb">` : `—`}</td>
      <td>${p.Nome}</td>
      <td>${p.Categoria}</td>
      <td>${p.Preco || "-"}</td>
      <td>${p.Destaque}</td>
      <td class="table-actions">
        <button class="btn btn-sm btn-outline" onclick="editarProduto(${p.ID})">Editar</button>
        <button class="btn btn-sm btn-danger" onclick="removerProduto(${p.ID})">Excluir</button>
      </td>`;
    tbody.appendChild(tr);
  });
}

async function editarProduto(id) {
  const res = await apiRequest("getProdutoCompleto", { id });
  if (res.status !== "ok") return alert("Erro ao buscar produto.");
  produtoAtual = res.produto;
  abrirModalProduto(res.produto, res.imagens);
}

function abrirModalProduto(produto = {}, imagens = []) {
  document.getElementById("modalProduto").classList.add("active");
  document.getElementById("modalTitle").textContent = produto.ID ? "Editar Produto" : "Novo Produto";
  document.getElementById("produtoId").value = produto.ID || "(automático)";
  document.getElementById("produtoNome").value = produto.Nome || "";
  document.getElementById("produtoDescricao").value = produto.Descrição || "";
  document.getElementById("produtoCategoria").value = produto.Categoria || "";
  document.getElementById("produtoPreco").value = produto.Preco || "";
  document.getElementById("produtoDestaque").value = produto.Destaque || "Não";
  novasImagens = imagens || [];
  renderImagens();
}

function fecharModal() {
  document.getElementById("modalProduto").classList.remove("active");
}

async function salvarProduto() {
  const produto = {
    ID: document.getElementById("produtoId").value === "(automático)" ? "" : document.getElementById("produtoId").value,
    Nome: document.getElementById("produtoNome").value,
    Descrição: document.getElementById("produtoDescricao").value,
    Categoria: document.getElementById("produtoCategoria").value,
    Preco: document.getElementById("produtoPreco").value,
    Destaque: document.getElementById("produtoDestaque").value
  };

  const res = await apiRequest("upsert", { table: "Produtos", record: produto });
  if (res.status === "ok") {
    if (novasImagens.length > 0) {
      await apiRequest("batchInsertImages", {
        images: novasImagens.map(img => ({ Nome: img.nome, Base64: img.base64 }))
      });
    }
    alert("Produto salvo com sucesso!");
    fecharModal();
    await carregarProdutos();
  } else {
    alert("Erro ao salvar: " + res.message);
  }
}

async function removerProduto(id) {
  if (!confirm("Deseja remover este produto?")) return;
  const res = await apiRequest("deleteProdutoCompleto", { id });
  if (res.status === "ok") {
    alert("Produto removido!");
    await carregarProdutos();
  } else {
    alert(res.message);
  }
}

function inicializarEventosImagens() {
  const dropZone = document.getElementById("dropZone");
  dropZone.addEventListener("click", () => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = "image/*";
    input.multiple = true;
    input.onchange = (e) => adicionarImagens(e.target.files);
    input.click();
  });
  dropZone.addEventListener("dragover", e => e.preventDefault());
  dropZone.addEventListener("drop", e => {
    e.preventDefault();
    adicionarImagens(e.dataTransfer.files);
  });
}

async function adicionarImagens(files) {
  const id = document.getElementById("produtoId").value || "novo";
  const imgs = await processFilesForProduct(files, id);
  novasImagens.push(...imgs);
  renderImagens();
}

function renderImagens() {
  const grid = document.getElementById("imagensGrid");
  grid.innerHTML = "";
  novasImagens.forEach((img, i) => {
    const div = document.createElement("div");
    div.className = "image-thumb";
    div.innerHTML = `<img src="${img.Base64 || img.base64}"><button onclick="removerImagem(${i})">×</button>`;
    grid.appendChild(div);
  });
}

function removerImagem(i) {
  novasImagens.splice(i, 1);
  renderImagens();
}

