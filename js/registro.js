document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("registroForm");

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

  crearBtn.disabled = true;
  politica.addEventListener("change", () => {
    crearBtn.disabled = !politica.checked;
  });

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

  // Convertir imagen a Base64
  function convertirImagenABase64(file, callback) {
    const reader = new FileReader();
    reader.onload = () => callback(reader.result);
    reader.readAsDataURL(file);
  }

  // --- NUEVO: obtener amigos iniciales desde JSON externo ---
  async function obtenerAmigosIniciales() {
    try {
      const res = await fetch("/js/usuarios.json"); // ruta al JSON ficticio
      const data = await res.json();
      return data.usuarios.filter(u => u.amigoInicial).map(u => u.id);
    } catch (err) {
      console.error("Error cargando usuarios.json", err);
      return [];
    }
  }

  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    let firstInvalid = null;

    const uErr = validarUsuario(usuario.value);
    if (uErr) { setError(usuario, uErr); firstInvalid ||= usuario; } else clearError(usuario);

    const nErr = validarNombre(nombre.value);
    if (nErr) { setError(nombre, nErr); firstInvalid ||= nombre; } else clearError(nombre);

    const aErr = validarApellidos(apellidos.value);
    if (aErr) { setError(apellidos, aErr); firstInvalid ||= apellidos; } else clearError(apellidos);

    const cErr = validarContrasena(contrasena.value);
    if (cErr) { setError(contrasena, cErr); firstInvalid ||= contrasena; } else clearError(contrasena);

    const rcErr = validarRepetirContrasena(repetirContrasena.value, contrasena.value);
    if (rcErr) { setError(repetirContrasena, rcErr); firstInvalid ||= repetirContrasena; } else clearError(repetirContrasena);

    const coErr = validarCorreo(correo.value);
    if (coErr) { setError(correo, coErr); firstInvalid ||= correo; } else clearError(correo);

    const rcoErr = validarRepetirCorreo(repetirCorreo.value, correo.value);
    if (rcoErr) { setError(repetirCorreo, rcoErr); firstInvalid ||= repetirCorreo; } else clearError(repetirCorreo);

    const fErr = validarFecha(nacimiento.value);
    if (fErr) { setError(nacimiento, fErr); firstInvalid ||= nacimiento; } else clearError(nacimiento);

    const fotoErr = validarFoto(foto.files[0]);
    if (fotoErr) { setError(foto, fotoErr); firstInvalid ||= foto; } else clearError(foto);

    if (!politica.checked) {
      alert("Debes aceptar la política de privacidad y uso.");
      crearBtn.disabled = true;
      if (!firstInvalid) firstInvalid = politica;
    }

    if (firstInvalid) {
      firstInvalid.focus();
      form.reportValidity();
      return;
    }

    // Guardar usuario con foto en Base64 o por defecto
    const guardarUsuario = async (fotoFinal) => {
      const amigosIniciales = await obtenerAmigosIniciales();

      const nuevoUsuario = {
        usuario: usuario.value.trim(),
        nombre: nombre.value.trim(),
        apellidos: apellidos.value.trim(),
        contrasena: contrasena.value,
        correo: correo.value.trim(),
        nacimiento: nacimiento.value,
        foto: fotoFinal,
        amigos: amigosIniciales // <-- añadimos amigos iniciales desde JSON
      };

      const usuariosPrevios = JSON.parse(localStorage.getItem("usuariosRegistrados")) || [];
      usuariosPrevios.push(nuevoUsuario);
      localStorage.setItem("usuariosRegistrados", JSON.stringify(usuariosPrevios));
      localStorage.setItem("usuarioActivo", JSON.stringify(nuevoUsuario));

      window.location.href = "index.html";
    };

    if (foto.files[0]) {
      convertirImagenABase64(foto.files[0], guardarUsuario);
    } else {
      guardarUsuario("/imagenes/default-profile.jpg");
    }
  });

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