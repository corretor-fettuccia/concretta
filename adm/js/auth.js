/**
 * ==============================================================
 * MÓDULO: auth.js
 * --------------------------------------------------------------
 * Responsável pelo login de usuários.
 * ==============================================================
 */
document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("formLogin");
  const msg = document.getElementById("msgLogin");

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    msg.textContent = "Verificando...";

    const usuario = document.getElementById("usuario").value.trim();
    const senha = document.getElementById("senha").value.trim();

    const res = await apiRequest("authLogin", { usuario, senha });

    if (res.status === "ok") {
      localStorage.setItem("usuario", res.usuario);
      msg.textContent = "Login bem-sucedido! Redirecionando...";
      msg.style.color = "green";
      setTimeout(() => (window.location.href = "produtos.html"), 600);
    } else {
      msg.textContent = res.message || "Usuário ou senha incorretos.";
      msg.style.color = "red";
    }
  });
});

