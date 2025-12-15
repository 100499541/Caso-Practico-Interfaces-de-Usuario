// Este código gestiona la página de perfil de usuario, incluyendo la visualización y edición del perfil,
// la gestión de viajes favoritos y compras, así como la eliminación de la cuenta.

// Primero, esperamos a que el DOM esté completamente cargado
document.addEventListener("DOMContentLoaded", () => {

  // 1) SESIÓN
  // Comprobar si hay un usuario activo
  const usuarioActivo = (() => {
    try { return JSON.parse(localStorage.getItem("usuarioActivo")); } catch { return null; }
  })();

  // Si no hay usuario activo, redirigir al inicio de sesión
  if (!usuarioActivo) {
    alert("Debes iniciar sesión.");
    window.location.href = "inicioSesion.html";
    return;
  }

  // 2) HELPERS STORAGE
  // Funciones para cargar y guardar mapas en localStorage
  function cargarMapa(key) {
    try { return JSON.parse(localStorage.getItem(key)) || {}; } catch { return {}; }
  }
  // Guardar mapa en localStorage
  function guardarMapa(key, obj) {
    localStorage.setItem(key, JSON.stringify(obj));
  }

  // Función para generar clave única de viaje
  function keyViaje(item) {
    return `${(item.ciudad || "").toLowerCase()}||${item.nombre || ""}`;
  }

  // Funciones para cargar y guardar reseñas
  function cargarResenas() {
    return cargarMapa("resenasViajes"); // { username: { keyViaje: {rating, texto, fecha} } }
  }

  function guardarResenas(obj) {
    guardarMapa("resenasViajes", obj);
  }

  // 3) PERFIL (PINTAR)
  // Elementos del perfil
  const nombreEl = document.getElementById("perfil-nombre");
  const bioEl = document.getElementById("perfil-bio");
  const imgEl = document.getElementById("perfil-img");

  // Función para pintar el perfil del usuario
  function pintarPerfil() {
    if (usuarioActivo.nombre && usuarioActivo.apellidos) {
      nombreEl.textContent = `${usuarioActivo.nombre} ${usuarioActivo.apellidos}`;
    } else {
      nombreEl.textContent = usuarioActivo.usuario;
    }

    // Biografía 
    bioEl.innerHTML = "";
    const p = document.createElement("p");
    p.className = "handwritten-text";
    p.textContent = usuarioActivo.bio || "Bienvenido a mi perfil de viajero.";
    bioEl.appendChild(p);

    // Imagen de perfil
    imgEl.src = usuarioActivo.foto || "/imagenes/default-profile.jpg";
  }

  // 4) MIS VIAJES (FAVS / COMPRAS)
  // Funciones para gestionar viajes favoritos y compras
  function abrirProducto(item) {
    const ciudad = item.ciudad || "";
    const nombre = item.nombre || "";
    const tipo = item.tipo || "hotel";
    const inicio = item.inicio || "";
    const fin = item.fin || "";
    window.location.href =
      `producto.html?ciudad=${encodeURIComponent(ciudad)}&nombre=${encodeURIComponent(nombre)}` +
      `&tipo=${encodeURIComponent(tipo)}&inicio=${encodeURIComponent(inicio)}&fin=${encodeURIComponent(fin)}`;
  }

  // Función para escribir o editar una reseña 
  function escribirResena(item) {
    // Obtener reseñas actuales
    const resenas = cargarResenas();
    const user = usuarioActivo.usuario;

    // Rellenar datos si ya existe reseña
    const existente = (resenas[user] && resenas[user][keyViaje(item)]) ? resenas[user][keyViaje(item)] : null;

    // Pedir datos al usuario
    const ratingStr = prompt("Puntuación (1 a 5):", existente ? String(existente.rating) : "");
    if (ratingStr === null) return;

    // Validar rating
    const rating = parseInt(ratingStr, 10);
    if (isNaN(rating) || rating < 1 || rating > 5) {
      alert("La puntuación debe ser un número entre 1 y 5.");
      return;
    }

    // Pedir texto de la reseña
    const texto = prompt("Escribe tu reseña (texto corto):", existente ? existente.texto : "");
    if (texto === null) return;

    // Guardar reseña
    if (!resenas[user]) resenas[user] = {};
    resenas[user][keyViaje(item)] = {
      rating,
      texto: texto.trim(),
      fecha: new Date().toISOString()
    };

    // Guardar en localStorage
    guardarResenas(resenas);
    alert("¡Reseña guardada!");
    cargarMisViajes();
  }

  // Función para crear una card de viaje (favorito o compra)
  function crearCardViaje(item, { modo }) {
    const card = document.createElement("div");
    card.className = "card-wireframe";

    // Si es una imagen válida, añadirla
    if (item?.imagen) {
      const img = document.createElement("img");
      img.src = item.imagen;
      img.alt = item.nombre || "Viaje";
      card.appendChild(img);
    } else {
      card.classList.add("bg-x");
    }

    // Acciones
    const actions = document.createElement("div");
    actions.className = "card-actions";
    card.appendChild(actions);

    // Botón principal
    const btnMain = document.createElement("button");
    btnMain.className = "card-btn primary";
    btnMain.textContent = (modo === "favorito") ? "Quitar" : "Ver";
    actions.appendChild(btnMain);

    // Botón reseña SOLO en compras
    if (modo === "compra") {
      // Añadir botón de reseña
      const resenas = cargarResenas();
      const user = usuarioActivo.usuario;
      const yaResenado = !!(resenas[user] && resenas[user][keyViaje(item)]);

      const btnResena = document.createElement("button");
      btnResena.className = "card-btn";
      btnResena.textContent = yaResenado ? "Editar reseña" : "Escribir reseña";
      actions.appendChild(btnResena);

      // Manejador del botón de reseña
      btnResena.addEventListener("click", (e) => {
        e.stopPropagation();
        escribirResena(item);
      });
    }

    // Clicks
    btnMain.addEventListener("click", (e) => {
      e.stopPropagation();

      if (modo === "favorito") {
        // Quitar de favoritos
        const favs = cargarMapa("viajesFavoritos");
        const lista = favs[usuarioActivo.usuario] || [];
        favs[usuarioActivo.usuario] = lista.filter(v =>
          !(((v.ciudad || "").toLowerCase() === (item.ciudad || "").toLowerCase()) && v.nombre === item.nombre)
        );
        guardarMapa("viajesFavoritos", favs);
        cargarMisViajes();
        return;
      }

      abrirProducto(item);
    });

    // Click en la card
    card.addEventListener("click", () => abrirProducto(item));
    return card;
  }

  // Función para cargar y pintar los viajes favoritos y compras
  function cargarMisViajes() {
    const favsGrid = document.getElementById("grid-favoritos");
    const histGrid = document.getElementById("grid-historial");
    if (!favsGrid || !histGrid) return;

    favsGrid.innerHTML = "";
    histGrid.innerHTML = "";

    const favs = cargarMapa("viajesFavoritos");
    const compras = cargarMapa("viajesComprados");

    const listaFavs = favs[usuarioActivo.usuario] || [];
    const listaCompras = compras[usuarioActivo.usuario] || [];

    // Si no hay favoritos o compras, mostrar estado vacío
    if (listaFavs.length === 0) {
      favsGrid.innerHTML = `
        <div class="empty-state">
          <div class="empty-inner">
            <div class="empty-icon">⭐</div>
            <div class="empty-title">Aún no tienes favoritos</div>
            <div class="empty-sub">Guarda alojamientos para planificar tu viaje.</div>
          </div>
        </div>
      `;
      // De lo contrario, pintar las cards
    } else {
      listaFavs.forEach(item => favsGrid.appendChild(crearCardViaje(item, { modo: "favorito" })));
    }

    // Si no hay compras, mostrar estado vacío
    if (listaCompras.length === 0) {
      histGrid.innerHTML = `
        <div class="empty-state">
          <div class="empty-inner">
            <div class="empty-icon">🧾</div>
            <div class="empty-title">Aún no tienes compras</div>
            <div class="empty-sub">Cuando compres un alojamiento aparecerá aquí.</div>
          </div>
        </div>
      `;
    } else {
      // De lo contrario, pintar las cards
      listaCompras.forEach(item => histGrid.appendChild(crearCardViaje(item, { modo: "compra" })));
    }
  }

  // 5) GESTIÓN DE VISTAS (PERFIL / EDITAR / CUENTA)

  // Elementos del DOM
  const vistasPerfil = document.querySelectorAll(".vista-perfil");
  const seccionEditarPerfil = document.getElementById("seccion-editar-perfil");
  const seccionConfigCuenta = document.getElementById("seccion-configuracion-cuenta");

  const btnPencil = document.getElementById("btn-pencil-edit");
  const linkEditarPerfil = document.getElementById("link-editar-perfil");
  const btnMobile = document.getElementById("btn-config-mobile");
  const linkConfigCuenta = document.getElementById("link-configuracion");
  const btnsCerrar = document.querySelectorAll(".btn-cerrar-forms");

  const inpNombre = document.getElementById("edit-nombre");
  const inpApellidos = document.getElementById("edit-apellidos");
  const inpBio = document.getElementById("edit-bio");
  const inpFoto = document.getElementById("edit-foto");
  const formPerfil = document.getElementById("form-perfil");

  const inpCorreo = document.getElementById("conf-correo");
  const inpPass = document.getElementById("conf-pass");
  const inpRePass = document.getElementById("conf-repass");
  const formCuenta = document.getElementById("form-cuenta");

  // Funciones para abrir/cerrar vistas
  function cerrarTodo() {
    seccionEditarPerfil.classList.add("hidden");
    seccionConfigCuenta.classList.add("hidden");
    vistasPerfil.forEach(el => el.classList.remove("hidden"));
  }

  // Abrir editar perfil
  function abrirEditarPerfil() {
    vistasPerfil.forEach(el => el.classList.add("hidden"));
    seccionConfigCuenta.classList.add("hidden");
    seccionEditarPerfil.classList.remove("hidden");

    inpNombre.value = usuarioActivo.nombre || "";
    inpApellidos.value = usuarioActivo.apellidos || "";
    inpBio.value = usuarioActivo.bio || "";
    inpFoto.value = "";
    cerrarDrawer(); // móvil
  }

  // Abrir configuración de cuenta
  function abrirConfigCuenta() {
    vistasPerfil.forEach(el => el.classList.add("hidden"));
    seccionEditarPerfil.classList.add("hidden");
    seccionConfigCuenta.classList.remove("hidden");

    inpCorreo.value = usuarioActivo.correo || "";
    inpPass.value = "";
    inpRePass.value = "";
    if (passHints) passHints.classList.add("hidden");
    inpPass.setCustomValidity("");
    inpRePass.setCustomValidity("");
    cerrarDrawer(); // móvil
  }

  // Manejadores de eventos
  btnPencil.addEventListener("click", abrirEditarPerfil);
  linkEditarPerfil.addEventListener("click", (e) => { e.preventDefault(); abrirEditarPerfil(); });
  if (btnMobile) btnMobile.addEventListener("click", (e) => { e.preventDefault(); abrirEditarPerfil(); });

  // Configuración de cuenta
  linkConfigCuenta.addEventListener("click", (e) => { e.preventDefault(); abrirConfigCuenta(); });

  btnsCerrar.forEach(btn => btn.addEventListener("click", () => {
    cerrarTodo();
    cerrarDrawer(); // móvil
  }));

  // 6) CONTRASEÑA: REGLAS REGISTRO + CHECKLIST EN VIVO
  // Elementos del DOM
  const passHints = document.getElementById("pass-hints");

  // Funciones para evaluar la contraseña y actualizar la checklist
  function evaluarPassword(pw) {
    return {
      len: pw.length >= 8,
      letters: (pw.match(/[A-Za-z]/g) || []).length >= 4,
      upper: (pw.match(/[A-Z]/g) || []).length >= 1,
      nums: (pw.match(/[0-9]/g) || []).length >= 2,
      special: (pw.match(/[^A-Za-z0-9]/g) || []).length >= 1
    };
  }

  // Actualizar checklist de contraseña
  function actualizarHints() {
    if (!passHints) return;

    const pw = (inpPass.value || "");
    const rep = (inpRePass.value || "");

    const show = pw.trim() !== "" || rep.trim() !== "";
    passHints.classList.toggle("hidden", !show);
    if (!show) return;

    const r = evaluarPassword(pw);

    // Actualizar cada regla en la lista
    Object.entries(r).forEach(([rule, ok]) => {
      const li = passHints.querySelector(`li[data-rule="${rule}"]`);
      if (!li) return;
      li.classList.toggle("ok", ok);
      li.classList.toggle("bad", !ok);
      const texto = li.textContent.replace(/^✅\s|^❌\s/, "");
      li.textContent = `${ok ? "✅" : "❌"} ${texto}`;
    });

    // Regla de coincidencia de contraseñas
    const liMatch = passHints.querySelector('li[data-rule="match"]');
    if (liMatch) {
      const ok = rep.trim() === "" ? true : (pw === rep);
      liMatch.classList.toggle("ok", ok);
      liMatch.classList.toggle("bad", !ok);
      liMatch.textContent = `${ok ? "✅" : "❌"} Las contraseñas coinciden`;
    }

    // Validaciones de los inputs
    const allOk = r.len && r.letters && r.upper && r.nums && r.special;
    if (pw.trim() !== "" && !allOk) inpPass.setCustomValidity("La contraseña no cumple los requisitos.");
    else inpPass.setCustomValidity("");

    if (rep.trim() !== "" && pw !== rep) inpRePass.setCustomValidity("Las contraseñas no coinciden.");
    else inpRePass.setCustomValidity("");
  }

  // Manejadores de eventos para inputs de contraseña
  if (inpPass) inpPass.addEventListener("input", actualizarHints);
  if (inpRePass) inpRePass.addEventListener("input", actualizarHints);

  // Guardar Perfil
  formPerfil.addEventListener("submit", (e) => {
    e.preventDefault();

    // Actualizar datos del usuario activo
    usuarioActivo.nombre = inpNombre.value.trim();
    usuarioActivo.apellidos = inpApellidos.value.trim();
    usuarioActivo.bio = inpBio.value.trim();

    // Si se ha seleccionado una foto, leerla como Data URL
    if (inpFoto.files && inpFoto.files[0]) {
      const reader = new FileReader();
      reader.onload = function (evt) {
        usuarioActivo.foto = evt.target.result;
        guardarCambios("Perfil actualizado con foto.");
      };
      reader.readAsDataURL(inpFoto.files[0]);
      // De lo contrario, guardar sin cambiar la foto
    } else {
      guardarCambios("Perfil actualizado correctamente.");
    }
  });

  // Guardar Cuenta
  formCuenta.addEventListener("submit", (e) => {
    e.preventDefault();

    const nuevaPass = inpPass.value.trim();
    const repPass = inpRePass.value.trim();

    // Si se ha introducido nueva contraseña, validarla
    if (nuevaPass !== "" || repPass !== "") {
      const r = evaluarPassword(nuevaPass);
      const allOk = r.len && r.letters && r.upper && r.nums && r.special;

      // Si no cumple las reglas o no coinciden, no guardar
      if (!allOk) {
        actualizarHints();
        inpPass.reportValidity();
        return;
      }

      // Si la contraseña antigua y nueva no coinciden avisa
      if (nuevaPass !== repPass) {
        actualizarHints();
        inpRePass.reportValidity();
        return;
      }

      // Actualizar la contraseña
      usuarioActivo.contrasena = nuevaPass;
    }

    // Actualizar el correo
    usuarioActivo.correo = inpCorreo.value.trim();
    guardarCambios("Configuración de cuenta actualizada.");
  });

  // Función para guardar cambios en el usuario activo y en la lista de usuarios
  function guardarCambios(mensaje) {
    localStorage.setItem("usuarioActivo", JSON.stringify(usuarioActivo));

    // Actualizar en la lista de usuarios registrados
    let lista = (() => {
      try { return JSON.parse(localStorage.getItem("usuariosRegistrados")) || []; } catch { return []; }
    })();

    // Buscar y actualizar
    const index = lista.findIndex(u => u.usuario === usuarioActivo.usuario);
    if (index !== -1) {
      lista[index] = usuarioActivo;
      localStorage.setItem("usuariosRegistrados", JSON.stringify(lista));
    }

    // Avisar y actualizar vista
    alert(mensaje);
    pintarPerfil();
    cargarMisViajes();
    cerrarTodo();
  }

  // Eliminar cuenta
  document.getElementById("link-eliminar-cuenta").addEventListener("click", (e) => {
    e.preventDefault();
    // Confirmar eliminación
    if (!confirm("¿Estás seguro de ELIMINAR tu cuenta?")) return;

    // Eliminar de la lista de usuarios registrados
    let lista = (() => {
      try { return JSON.parse(localStorage.getItem("usuariosRegistrados")) || []; } catch { return []; }
    })();

    // Eliminar datos relacionados
    localStorage.setItem("usuariosRegistrados", JSON.stringify(lista.filter(u => u.usuario !== usuarioActivo.usuario)));
    localStorage.removeItem("usuarioActivo");

    const favs = cargarMapa("viajesFavoritos");
    const compras = cargarMapa("viajesComprados");
    const resenas = cargarResenas();

    // Eliminar entradas del usuario
    delete favs[usuarioActivo.usuario];
    delete compras[usuarioActivo.usuario];
    delete resenas[usuarioActivo.usuario];

    // Guardar cambios
    guardarMapa("viajesFavoritos", favs);
    guardarMapa("viajesComprados", compras);
    guardarResenas(resenas);

    // Avisar y redirigir
    alert("Cuenta eliminada.");
    window.location.href = "index.html";
  });

  // 7) DRAWER MÓVIL PERFIL
  // Elementos del DOM
  const drawerBtn = document.getElementById("perfilDrawerBtn");
  const drawer = document.getElementById("perfilDrawer");
  const overlay = document.getElementById("perfilDrawerOverlay");

  // Funciones para abrir/cerrar el drawer
  function abrirDrawer() {
    if (!drawer) return;
    drawer.classList.add("open");
    if (overlay) overlay.classList.add("show");
    if (drawerBtn) drawerBtn.setAttribute("aria-expanded", "true");
  }

  // Cerrar drawer
  function cerrarDrawer() {
    if (!drawer) return;
    drawer.classList.remove("open");
    if (overlay) overlay.classList.remove("show");
    if (drawerBtn) drawerBtn.setAttribute("aria-expanded", "false");
  }

  // Manejadores de eventos
  if (drawerBtn) drawerBtn.addEventListener("click", () => {
    if (drawer && drawer.classList.contains("open")) cerrarDrawer();
    else abrirDrawer();
  });

  // Cerrar al clicar fuera
  if (overlay) overlay.addEventListener("click", cerrarDrawer);

  // Cerrar con Escape
  document.addEventListener("keydown", (e) => {
    // Si se pulsa la letra escape, cerrar el drawer
    if (e.key === "Escape") cerrarDrawer();
  });

  // INICIALIZAR PÁGINA
  pintarPerfil();
  cargarMisViajes();
});
