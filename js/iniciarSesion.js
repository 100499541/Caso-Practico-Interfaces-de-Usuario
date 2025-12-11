document.addEventListener("DOMContentLoaded", () => {
  const form = document.querySelector(".login-form");
  const usuarioInput = document.getElementById("usuario");
  const contrasenaInput = document.getElementById("contraseña");

  // Crear contenedor de mensajes de error
  const errorMsg = document.createElement("p");
  errorMsg.classList.add("error-msg");
  form.appendChild(errorMsg);

  form.addEventListener("submit", (e) => {
    e.preventDefault();

    const usuario = usuarioInput.value.trim();
    const contrasena = contrasenaInput.value;

    // Caso 1: campos vacíos
    if (!usuario || !contrasena) {
      errorMsg.textContent = "Por favor, introduce usuario y contraseña.";
      return;
    }

    // Recuperar lista de usuarios registrados
    const usuariosRegistrados = JSON.parse(localStorage.getItem("usuariosRegistrados")) || [];

    // Buscar coincidencia
    const usuarioEncontrado = usuariosRegistrados.find(
      u => u.usuario === usuario && u.contrasena === contrasena
    );

    // Caso 2: datos incorrectos
    if (!usuarioEncontrado) {
      errorMsg.textContent = "Usuario o contraseña incorrectos.";
      return;
    }

    // Caso 3: login correcto
    localStorage.setItem("usuarioActivo", JSON.stringify(usuarioEncontrado));
    window.location.href = "index.html";
  });
});