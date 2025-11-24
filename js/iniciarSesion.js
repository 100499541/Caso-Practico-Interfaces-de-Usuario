document.addEventListener("DOMContentLoaded", function () {
  const loginForm = document.querySelector(".login-form");
  const btnRegistrar = document.querySelector(".btn-registrar");
  const usuarioInput = document.getElementById("usuario");
  const passwordInput = document.getElementById("contraseña");

  // Manejar inicio de sesión
  loginForm.addEventListener("submit", function (e) {
    e.preventDefault();
    const usuario = usuarioInput.value.trim();
    const contraseña = passwordInput.value.trim();

    if(usuario === "" || contraseña === "") {
      alert("Por favor, rellena ambos campos.");
      return;
    }

    // Aquí iría la lógica de login (API, localStorage, etc.)
    alert(`Bienvenido, ${usuario}!`);
  });

  // Manejar botón de registrarse
  btnRegistrar.addEventListener("click", function () {
    alert("Redirigiendo a la página de registro...");
    // Aquí se podría hacer window.location.href = "/registro.html";
  });
});