// /js/registro.js
document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("registroForm");

  // Inputs según tu HTML
  const usuario = document.getElementById("usuario");
  const nombre = document.getElementById("nombre");
  const apellidos = document.getElementById("apellidos");
  const contrasena = document.getElementById("password");
  const repetirContrasena = document.getElementById("repassword");
  const correo = document.getElementById("email");
  const repetirCorreo = document.getElementById("reemail");
  const nacimiento = document.getElementById("fechaNacimiento");
  const foto = document.getElementById("foto");
  const politica = document.getElementById("acepto");
  const crearBtn = document.getElementById("crearCuenta");

  // Deshabilitar botón hasta marcar la política
  crearBtn.disabled = true;
  politica.addEventListener("change", () => {
    crearBtn.disabled = !politica.checked;
  });

  // Helpers
  const isEmpty = (v) => !v || v.trim() === "";
  const soloLetras = /^[A-Za-zÁÉÍÓÚáéíóúÑñ]+$/;

  function validarUsuario(v) {
    if (isEmpty(v)) return "Campo obligatorio";
    if (v.length < 5) return "El usuario debe tener al menos 5 caracteres";
    return "";
  }

  function validarNombre(v) {
    if (isEmpty(v)) return "Campo obligatorio";
    if (v.length < 2) return "El nombre debe tener al menos 2 letras";
    if (!soloLetras.test(v)) return "El nombre solo puede contener letras";
    return "";
  }

  function validarApellidos(v) {
    if (isEmpty(v)) return "Campo obligatorio";
    const partes = v.trim().split(/\s+/);
    if (partes.length < 2) return "Introduce al menos 2 apellidos";
    if (!partes.every(p => soloLetras.test(p))) return "Los apellidos no pueden contener números";
    return "";
  }

  function validarContrasena(v) {
    if (isEmpty(v)) return "Campo obligatorio";
    const lenOK = v.length >= 8;
    const letrasOK = (v.match(/[A-Za-z]/g) || []).length >= 4;
    const mayusOK = (v.match(/[A-Z]/g) || []).length >= 1;
    const numsOK = (v.match(/[0-9]/g) || []).length >= 2;
    const espOK = (v.match(/[^A-Za-z0-9]/g) || []).length >= 1;
    if (!lenOK || !letrasOK || !mayusOK || !numsOK || !espOK) {
      return "Contraseña: 8+ chars, ≥4 letras, ≥1 mayúscula, ≥2 números, ≥1 especial";
    }
    return "";
  }

  function validarRepetirContrasena(rep, orig) {
    if (isEmpty(rep)) return "Campo obligatorio";
    if (rep !== orig) return "Las contraseñas no coinciden";
    return "";
  }

  function validarCorreo(v) {
    if (isEmpty(v)) return "Campo obligatorio";
    const ok = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
    return ok ? "" : "Formato de correo inválido";
  }

  function validarRepetirCorreo(rep, orig) {
    const base = validarCorreo(rep);
    if (base) return base;
    if (rep !== orig) return "Los correos no coinciden";
    return "";
  }

  function validarFecha(v) {
    if (isEmpty(v)) return "Campo obligatorio";
    const d = new Date(v);
    if (isNaN(d.getTime())) return "Fecha inválida";
    const hoy = new Date();
    d.setHours(0,0,0,0);
    hoy.setHours(0,0,0,0);
    if (d >= hoy) return "La fecha debe ser anterior a hoy";
    return "";
  }

  function validarFoto(file) {
    if (!file) return ""; // opcional
    const ext = (file.name.split(".").pop() || "").toLowerCase();
    const tipo = (file.type || "").toLowerCase();
    const ok = ["jpg","jpeg","png"].includes(ext) || tipo === "image/jpeg" || tipo === "image/png";
    return ok ? "" : "La foto debe ser JPG o PNG";
  }

  function setError(input, mensaje) {
    input.setCustomValidity(mensaje);
    input.reportValidity();
    input.classList.add("error");
  }

  function clearError(input) {
    input.setCustomValidity("");
    input.classList.remove("error");
  }

  // Validar y mostrar errores en submit
  form.addEventListener("submit", (e) => {
    e.preventDefault();

    let firstInvalid = null;

    // Usuario
    const uErr = validarUsuario(usuario.value);
    if (uErr) { setError(usuario, uErr); firstInvalid ||= usuario; } else clearError(usuario);

    // Nombre
    const nErr = validarNombre(nombre.value);
    if (nErr) { setError(nombre, nErr); firstInvalid ||= nombre; } else clearError(nombre);

    // Apellidos
    const aErr = validarApellidos(apellidos.value);
    if (aErr) { setError(apellidos, aErr); firstInvalid ||= apellidos; } else clearError(apellidos);

    // Contraseña
    const cErr = validarContrasena(contrasena.value);
    if (cErr) { setError(contrasena, cErr); firstInvalid ||= contrasena; } else clearError(contrasena);

    // Repetir contraseña
    const rcErr = validarRepetirContrasena(repetirContrasena.value, contrasena.value);
    if (rcErr) { setError(repetirContrasena, rcErr); firstInvalid ||= repetirContrasena; } else clearError(repetirContrasena);

    // Correo
    const coErr = validarCorreo(correo.value);
    if (coErr) { setError(correo, coErr); firstInvalid ||= correo; } else clearError(correo);

    // Repetir correo
    const rcoErr = validarRepetirCorreo(repetirCorreo.value, correo.value);
    if (rcoErr) { setError(repetirCorreo, rcoErr); firstInvalid ||= repetirCorreo; } else clearError(repetirCorreo);

    // Fecha
    const fErr = validarFecha(nacimiento.value);
    if (fErr) { setError(nacimiento, fErr); firstInvalid ||= nacimiento; } else clearError(nacimiento);

    // Foto (opcional)
    const fotoErr = validarFoto(foto.files[0]);
    if (fotoErr) { setError(foto, fotoErr); firstInvalid ||= foto; } else clearError(foto);

    // Política
    if (!politica.checked) {
      alert("Debes aceptar la política de privacidad y uso.");
      crearBtn.disabled = true;
      if (!firstInvalid) firstInvalid = politica;
    }

    // Si hay algún error, enfocar el primero y no continuar
    if (firstInvalid) {
      firstInvalid.focus();
      form.reportValidity();
      return;
    }

    // Guardar y redirigir
    const usuarioObj = {
      usuario: usuario.value.trim(),
      nombre: nombre.value.trim(),
      apellidos: apellidos.value.trim(),
      contrasena: contrasena.value,
      correo: correo.value.trim(),
      nacimiento: nacimiento.value,
      foto: foto.files[0] ? URL.createObjectURL(foto.files[0]) : null
    };

    localStorage.setItem("usuarioActivo", JSON.stringify(usuarioObj));
    window.location.href = "index.html";
  });

  // Validación inmediata en blur para mejor feedback
  [
    [usuario, validarUsuario],
    [nombre, validarNombre],
    [apellidos, validarApellidos],
    [contrasena, validarContrasena],
    [repetirContrasena, (v) => validarRepetirContrasena(v, contrasena.value)],
    [correo, validarCorreo],
    [repetirCorreo, (v) => validarRepetirCorreo(v, correo.value)],
    [nacimiento, validarFecha],
  ].forEach(([input, fn]) => {
    input.addEventListener("blur", () => {
      const err = fn(input.value);
      if (err) setError(input, err); else clearError(input);
    });
  });

  foto.addEventListener("change", () => {
    const err = validarFoto(foto.files[0]);
    if (err) setError(foto, err); else clearError(foto);
  });
});