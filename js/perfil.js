document.addEventListener("DOMContentLoaded", () => {

  // -------------------------------
  // 1) SESIÓN
  // -------------------------------
  const usuarioActivo = (() => {
    try { return JSON.parse(localStorage.getItem("usuarioActivo")); } catch { return null; }
  })();

  if (!usuarioActivo) {
    alert("Debes iniciar sesión.");
    window.location.href = "inicioSesion.html";
    return;
  }

  // -------------------------------
  // 2) HELPERS STORAGE
  // -------------------------------
  function cargarMapa(key) {
    try { return JSON.parse(localStorage.getItem(key)) || {}; } catch { return {}; }
  }
  function guardarMapa(key, obj) {
    localStorage.setItem(key, JSON.stringify(obj));
  }

  function keyViaje(item) {
    return `${(item.ciudad || "").toLowerCase()}||${item.nombre || ""}`;
  }

  function cargarResenas() {
    return cargarMapa("resenasViajes"); // { username: { keyViaje: {rating, texto, fecha} } }
  }

  function guardarResenas(obj) {
    guardarMapa("resenasViajes", obj);
  }

  // -------------------------------
  // 3) PERFIL (PINTAR)
  // -------------------------------
  const nombreEl = document.getElementById("perfil-nombre");
  const bioEl = document.getElementById("perfil-bio");
  const imgEl = document.getElementById("perfil-img");

  function pintarPerfil() {
    if (usuarioActivo.nombre && usuarioActivo.apellidos) {
      nombreEl.textContent = `${usuarioActivo.nombre} ${usuarioActivo.apellidos}`;
    } else {
      nombreEl.textContent = usuarioActivo.usuario;
    }

    bioEl.innerHTML = "";
    const p = document.createElement("p");
    p.className = "handwritten-text";
    p.textContent = usuarioActivo.bio || "Bienvenido a mi perfil de viajero.";
    bioEl.appendChild(p);

    imgEl.src = usuarioActivo.foto || "/imagenes/default-profile.jpg";
  }

  // -------------------------------
  // 4) MIS VIAJES (FAVS / COMPRAS)
  // -------------------------------
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

  function escribirResena(item) {
    const resenas = cargarResenas();
    const user = usuarioActivo.usuario;

    const existente = (resenas[user] && resenas[user][keyViaje(item)]) ? resenas[user][keyViaje(item)] : null;

    const ratingStr = prompt("Puntuación (1 a 5):", existente ? String(existente.rating) : "");
    if (ratingStr === null) return;

    const rating = parseInt(ratingStr, 10);
    if (isNaN(rating) || rating < 1 || rating > 5) {
      alert("La puntuación debe ser un número entre 1 y 5.");
      return;
    }

    const texto = prompt("Escribe tu reseña (texto corto):", existente ? existente.texto : "");
    if (texto === null) return;

    if (!resenas[user]) resenas[user] = {};
    resenas[user][keyViaje(item)] = {
      rating,
      texto: texto.trim(),
      fecha: new Date().toISOString()
    };

    guardarResenas(resenas);
    alert("¡Reseña guardada!");
    cargarMisViajes();
  }

  function crearCardViaje(item, { modo }) {
    const card = document.createElement("div");
    card.className = "card-wireframe";

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
      const resenas = cargarResenas();
      const user = usuarioActivo.usuario;
      const yaResenado = !!(resenas[user] && resenas[user][keyViaje(item)]);

      const btnResena = document.createElement("button");
      btnResena.className = "card-btn";
      btnResena.textContent = yaResenado ? "Editar reseña" : "Escribir reseña";
      actions.appendChild(btnResena);

      btnResena.addEventListener("click", (e) => {
        e.stopPropagation();
        escribirResena(item);
      });
    }

    // Clicks
    btnMain.addEventListener("click", (e) => {
      e.stopPropagation();

      if (modo === "favorito") {
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

    card.addEventListener("click", () => abrirProducto(item));
    return card;
  }

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
    } else {
      listaFavs.forEach(item => favsGrid.appendChild(crearCardViaje(item, { modo: "favorito" })));
    }

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
      listaCompras.forEach(item => histGrid.appendChild(crearCardViaje(item, { modo: "compra" })));
    }
  }

  // -------------------------------
  // 5) GESTIÓN DE VISTAS (PERFIL / EDITAR / CUENTA)
  // -------------------------------
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

  function cerrarTodo() {
    seccionEditarPerfil.classList.add("hidden");
    seccionConfigCuenta.classList.add("hidden");
    vistasPerfil.forEach(el => el.classList.remove("hidden"));
  }

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

  btnPencil.addEventListener("click", abrirEditarPerfil);
  linkEditarPerfil.addEventListener("click", (e) => { e.preventDefault(); abrirEditarPerfil(); });
  if (btnMobile) btnMobile.addEventListener("click", (e) => { e.preventDefault(); abrirEditarPerfil(); });

  linkConfigCuenta.addEventListener("click", (e) => { e.preventDefault(); abrirConfigCuenta(); });

  btnsCerrar.forEach(btn => btn.addEventListener("click", () => {
    cerrarTodo();
    cerrarDrawer(); // móvil
  }));

  // -------------------------------
  // 6) CONTRASEÑA: REGLAS REGISTRO + CHECKLIST EN VIVO
  // -------------------------------
  const passHints = document.getElementById("pass-hints");

  function evaluarPassword(pw) {
    return {
      len: pw.length >= 8,
      letters: (pw.match(/[A-Za-z]/g) || []).length >= 4,
      upper: (pw.match(/[A-Z]/g) || []).length >= 1,
      nums: (pw.match(/[0-9]/g) || []).length >= 2,
      special: (pw.match(/[^A-Za-z0-9]/g) || []).length >= 1
    };
  }

  function actualizarHints() {
    if (!passHints) return;

    const pw = (inpPass.value || "");
    const rep = (inpRePass.value || "");

    const show = pw.trim() !== "" || rep.trim() !== "";
    passHints.classList.toggle("hidden", !show);
    if (!show) return;

    const r = evaluarPassword(pw);

    Object.entries(r).forEach(([rule, ok]) => {
      const li = passHints.querySelector(`li[data-rule="${rule}"]`);
      if (!li) return;
      li.classList.toggle("ok", ok);
      li.classList.toggle("bad", !ok);
      const texto = li.textContent.replace(/^✅\s|^❌\s/, "");
      li.textContent = `${ok ? "✅" : "❌"} ${texto}`;
    });

    const liMatch = passHints.querySelector('li[data-rule="match"]');
    if (liMatch) {
      const ok = rep.trim() === "" ? true : (pw === rep);
      liMatch.classList.toggle("ok", ok);
      liMatch.classList.toggle("bad", !ok);
      liMatch.textContent = `${ok ? "✅" : "❌"} Las contraseñas coinciden`;
    }

    const allOk = r.len && r.letters && r.upper && r.nums && r.special;
    if (pw.trim() !== "" && !allOk) inpPass.setCustomValidity("La contraseña no cumple los requisitos.");
    else inpPass.setCustomValidity("");

    if (rep.trim() !== "" && pw !== rep) inpRePass.setCustomValidity("Las contraseñas no coinciden.");
    else inpRePass.setCustomValidity("");
  }

  if (inpPass) inpPass.addEventListener("input", actualizarHints);
  if (inpRePass) inpRePass.addEventListener("input", actualizarHints);

  // Guardar Perfil
  formPerfil.addEventListener("submit", (e) => {
    e.preventDefault();

    usuarioActivo.nombre = inpNombre.value.trim();
    usuarioActivo.apellidos = inpApellidos.value.trim();
    usuarioActivo.bio = inpBio.value.trim();

    if (inpFoto.files && inpFoto.files[0]) {
      const reader = new FileReader();
      reader.onload = function (evt) {
        usuarioActivo.foto = evt.target.result;
        guardarCambios("Perfil actualizado con foto.");
      };
      reader.readAsDataURL(inpFoto.files[0]);
    } else {
      guardarCambios("Perfil actualizado correctamente.");
    }
  });

  // Guardar Cuenta
  formCuenta.addEventListener("submit", (e) => {
    e.preventDefault();

    const nuevaPass = inpPass.value.trim();
    const repPass = inpRePass.value.trim();

    if (nuevaPass !== "" || repPass !== "") {
      const r = evaluarPassword(nuevaPass);
      const allOk = r.len && r.letters && r.upper && r.nums && r.special;

      if (!allOk) {
        actualizarHints();
        inpPass.reportValidity();
        return;
      }

      if (nuevaPass !== repPass) {
        actualizarHints();
        inpRePass.reportValidity();
        return;
      }

      usuarioActivo.contrasena = nuevaPass;
    }

    usuarioActivo.correo = inpCorreo.value.trim();
    guardarCambios("Configuración de cuenta actualizada.");
  });

  function guardarCambios(mensaje) {
    localStorage.setItem("usuarioActivo", JSON.stringify(usuarioActivo));

    let lista = (() => {
      try { return JSON.parse(localStorage.getItem("usuariosRegistrados")) || []; } catch { return []; }
    })();

    const index = lista.findIndex(u => u.usuario === usuarioActivo.usuario);
    if (index !== -1) {
      lista[index] = usuarioActivo;
      localStorage.setItem("usuariosRegistrados", JSON.stringify(lista));
    }

    alert(mensaje);
    pintarPerfil();
    cargarMisViajes();
    cerrarTodo();
  }

  // Eliminar cuenta
  document.getElementById("link-eliminar-cuenta").addEventListener("click", (e) => {
    e.preventDefault();
    if (!confirm("¿Estás seguro de ELIMINAR tu cuenta?")) return;

    let lista = (() => {
      try { return JSON.parse(localStorage.getItem("usuariosRegistrados")) || []; } catch { return []; }
    })();

    localStorage.setItem("usuariosRegistrados", JSON.stringify(lista.filter(u => u.usuario !== usuarioActivo.usuario)));
    localStorage.removeItem("usuarioActivo");

    const favs = cargarMapa("viajesFavoritos");
    const compras = cargarMapa("viajesComprados");
    const resenas = cargarResenas();

    delete favs[usuarioActivo.usuario];
    delete compras[usuarioActivo.usuario];
    delete resenas[usuarioActivo.usuario];

    guardarMapa("viajesFavoritos", favs);
    guardarMapa("viajesComprados", compras);
    guardarResenas(resenas);

    alert("Cuenta eliminada.");
    window.location.href = "index.html";
  });

  // -------------------------------
  // 7) DRAWER MÓVIL PERFIL
  // -------------------------------
  const drawerBtn = document.getElementById("perfilDrawerBtn");
  const drawer = document.getElementById("perfilDrawer");
  const overlay = document.getElementById("perfilDrawerOverlay");

  function abrirDrawer() {
    if (!drawer) return;
    drawer.classList.add("open");
    if (overlay) overlay.classList.add("show");
    if (drawerBtn) drawerBtn.setAttribute("aria-expanded", "true");
  }

  function cerrarDrawer() {
    if (!drawer) return;
    drawer.classList.remove("open");
    if (overlay) overlay.classList.remove("show");
    if (drawerBtn) drawerBtn.setAttribute("aria-expanded", "false");
  }

  if (drawerBtn) drawerBtn.addEventListener("click", () => {
    if (drawer && drawer.classList.contains("open")) cerrarDrawer();
    else abrirDrawer();
  });

  if (overlay) overlay.addEventListener("click", cerrarDrawer);

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") cerrarDrawer();
  });

  // -------------------------------
  // INIT
  // -------------------------------
  pintarPerfil();
  cargarMisViajes();
});
