/**
 * ==============================================================
 * MÓDULO: main.js
 * SISTEMA CRUD CONCRETTA - Frontend
 * --------------------------------------------------------------
 * Centraliza a URL do backend e funções de comunicação.
 * ==============================================================
 */

const APP_URL =
  "https://script.google.com/macros/s/AKfycbwSawlfTWoSWHPA0rRRmaPfpCsNyHohS7bfTW2BaK15ytwrjN0h6v64bqq10VuyWEwfEw/exec";

/**
 * Requisição automática (GET ou POST) para o backend
 */
async function apiRequest(action, data = {}) {
  try {
    let url = APP_URL;
    let options = { method: "GET", mode: "cors" };

    const safeActions = [
      "ping",
      "authLogin",
      "info",
      "list",
      "get",
      "getImage",
      "getProdutoCompleto",
      "listProdutosComImagens"
    ];

    const useGet = safeActions.includes(action) || Object.keys(data).length === 0;

    if (useGet) {
      // 🔹 Ações simples via GET
      const params = new URLSearchParams({ action, ...data }).toString();
      url = `${APP_URL}?${params}`;
    } else {
      // 🔹 Envia como form-data (para evitar bloqueio CORS)
      const form = new URLSearchParams();
      form.append("action", action);
      for (const [k, v] of Object.entries(data)) {
        form.append(k, typeof v === "object" ? JSON.stringify(v) : v);
      }

      options = {
        method: "POST",
        mode: "cors",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: form.toString()
      };
    }

    const res = await fetch(url, options);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);

    const text = await res.text();
    try {
      return JSON.parse(text);
    } catch {
      console.warn("⚠️ Resposta não JSON:", text);
      return { status: "error", message: "Resposta inválida do servidor" };
    }
  } catch (err) {
    console.error("❌ Erro API:", err);
    return { status: "error", message: "Falha de comunicação com o servidor." };
  }
}

/**
 * Controle de login e sessão
 */
function verificarLogin() {
  const usuario = localStorage.getItem("usuario");
  if (!usuario) {
    window.location.href = "index.html";
    return false;
  }
  const el = document.getElementById("usuarioLogado");
  if (el) el.textContent = usuario;
  return true;
}

function logout() {
  localStorage.removeItem("usuario");
  window.location.href = "index.html";
}

