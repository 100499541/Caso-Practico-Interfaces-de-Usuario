document.getElementById("registroForm").addEventListener("submit", function(e){
  e.preventDefault();

  const password = document.getElementById("password").value;
  const repassword = document.getElementById("repassword").value;
  const email = document.getElementById("email").value;
  const reemail = document.getElementById("reemail").value;

  if(password !== repassword){
    alert("Las contraseñas no coinciden");
    return;
  }

  if(email !== reemail){
    alert("Los correos electrónicos no coinciden");
    return;
  }

  // Aquí iría la lógica de envío al servidor o almacenamiento
  alert("Cuenta creada correctamente!");
  this.reset();
});