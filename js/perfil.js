document.addEventListener("DOMContentLoaded", () => {

    // -------------------------------
    // 1) CARGAR DATOS DEL USUARIO
    // -------------------------------
    const usuarioActivo = (() => {
        try { return JSON.parse(localStorage.getItem("usuarioActivo")); } catch { return null; }
    })();

    if (!usuarioActivo) {
        alert("Debes iniciar sesión.");
        window.location.href = "inicioSesion.html";
        return;
    }

    // Helpers storage (Mis Viajes)
    function cargarMapa(key) {
        try { return JSON.parse(localStorage.getItem(key)) || {}; } catch { return {}; }
    }
    function guardarMapa(key, obj) {
        localStorage.setItem(key, JSON.stringify(obj));
    }

    // -------------------------------
    // 2) PERFIL (PINTAR)
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
    // 3) MIS VIAJES (FAVORITOS / COMPRADOS)
    // -------------------------------
    function formatearFechaIso(iso) {
        if (!iso) return "";
        const d = new Date(iso);
        if (isNaN(d.getTime())) return "";
        return d.toLocaleDateString();
    }

    function crearCardViaje(item, { modo }) {
        // modo: "favorito" | "compra"
        const card = document.createElement("div");
        card.className = "card-wireframe bg-x";

        if (item?.imagen) {
            const img = document.createElement("img");
            img.src = item.imagen;
            img.alt = item.nombre || "Viaje";
            card.appendChild(img);
        }

        const btn = document.createElement("button");
        btn.className = "btn-review";
        btn.textContent = (modo === "favorito") ? "Quitar" : "Ver";
        card.appendChild(btn);

        btn.addEventListener("click", (e) => {
            e.stopPropagation();

            if (modo === "favorito") {
                const favs = cargarMapa("viajesFavoritos");
                const lista = favs[usuarioActivo.usuario] || [];
                const nueva = lista.filter(v =>
                    !(((v.ciudad || "").toLowerCase() === (item.ciudad || "").toLowerCase()) && v.nombre === item.nombre)
                );
                favs[usuarioActivo.usuario] = nueva;
                guardarMapa("viajesFavoritos", favs);
                cargarMisViajes();
                return;
            }

            const ciudad = item.ciudad || "";
            const nombre = item.nombre || "";
            const tipo = item.tipo || "hotel";
            const inicio = item.inicio || "";
            const fin = item.fin || "";
            window.location.href =
                `producto.html?ciudad=${encodeURIComponent(ciudad)}&nombre=${encodeURIComponent(nombre)}` +
                `&tipo=${encodeURIComponent(tipo)}&inicio=${encodeURIComponent(inicio)}&fin=${encodeURIComponent(fin)}`;
        });

        card.addEventListener("click", () => {
            const ciudad = item.ciudad || "";
            const nombre = item.nombre || "";
            const tipo = item.tipo || "hotel";
            const inicio = item.inicio || "";
            const fin = item.fin || "";
            window.location.href =
                `producto.html?ciudad=${encodeURIComponent(ciudad)}&nombre=${encodeURIComponent(nombre)}` +
                `&tipo=${encodeURIComponent(tipo)}&inicio=${encodeURIComponent(inicio)}&fin=${encodeURIComponent(fin)}`;
        });

        const titulo = item?.nombre ? `${item.nombre} · ${item.ciudad || ""}` : "Viaje";
        const fechas = (item?.inicio || item?.fin) ? ` (${item.inicio || ""} - ${item.fin || ""})` : "";
        const precio = (item?.precio != null) ? ` · ${item.precio} ${item.moneda || ""} pp` : "";
        const when =
            (modo === "compra")
                ? (item?.compradoEn ? ` · comprado: ${formatearFechaIso(item.compradoEn)}` : "")
                : (item?.guardadoEn ? ` · guardado: ${formatearFechaIso(item.guardadoEn)}` : "");

        card.title = `${titulo}${fechas}${precio}${when}`;

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
            favsGrid.innerHTML = `<div class="card-wireframe bg-x" title="Sin favoritos todavía"></div>`;
        } else {
            listaFavs.forEach(item => favsGrid.appendChild(crearCardViaje(item, { modo: "favorito" })));
        }

        if (listaCompras.length === 0) {
            histGrid.innerHTML = `<div class="card-wireframe bg-x" title="Sin compras todavía"></div>`;
        } else {
            listaCompras.forEach(item => histGrid.appendChild(crearCardViaje(item, { modo: "compra" })));
        }
    }

    // -------------------------------
    // 4) GESTIÓN DE VISTAS
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
    }

    function abrirConfigCuenta() {
        vistasPerfil.forEach(el => el.classList.add("hidden"));
        seccionEditarPerfil.classList.add("hidden");
        seccionConfigCuenta.classList.remove("hidden");

        inpCorreo.value = usuarioActivo.correo || "";
        inpPass.value = "";
        inpRePass.value = "";

        actualizarChecklistPassword(inpPass.value);
    }

    btnPencil.addEventListener("click", abrirEditarPerfil);
    linkEditarPerfil.addEventListener("click", (e) => { e.preventDefault(); abrirEditarPerfil(); });
    if (btnMobile) btnMobile.addEventListener("click", (e) => { e.preventDefault(); abrirEditarPerfil(); });
    linkConfigCuenta.addEventListener("click", (e) => { e.preventDefault(); abrirConfigCuenta(); });
    btnsCerrar.forEach(btn => btn.addEventListener("click", cerrarTodo));

    // -------------------------------
    // 5) CONTRASEÑA: MISMAS REGLAS QUE REGISTRO + CHECKLIST EN VIVO
    // -------------------------------
    const checklist = {
        len: document.getElementById("pass-req-len"),
        letras: document.getElementById("pass-req-letras"),
        mayus: document.getElementById("pass-req-mayus"),
        nums: document.getElementById("pass-req-nums"),
        esp: document.getElementById("pass-req-esp"),
    };

    function evaluarPassword(v) {
        const lenOK = v.length >= 8;
        const letrasOK = (v.match(/[A-Za-z]/g) || []).length >= 4;
        const mayusOK = (v.match(/[A-Z]/g) || []).length >= 1;
        const numsOK = (v.match(/[0-9]/g) || []).length >= 2;
        const espOK = (v.match(/[^A-Za-z0-9]/g) || []).length >= 1;
        return { lenOK, letrasOK, mayusOK, numsOK, espOK };
    }

    function validarContrasenaRegistroStyle(v) {
        if (!v || v.trim() === "") return ""; // opcional en perfil
        const r = evaluarPassword(v);
        if (!r.lenOK || !r.letrasOK || !r.mayusOK || !r.numsOK || !r.espOK) {
            return "Contraseña: 8+ chars, ≥4 letras, ≥1 mayúscula, ≥2 números, ≥1 especial";
        }
        return "";
    }

    function pintarReq(el, ok) {
        if (!el) return;
        el.classList.toggle("ok", !!ok);
        el.classList.toggle("fail", !ok);
    }

    function actualizarChecklistPassword(valor) {
        const r = evaluarPassword(valor || "");
        pintarReq(checklist.len, r.lenOK);
        pintarReq(checklist.letras, r.letrasOK);
        pintarReq(checklist.mayus, r.mayusOK);
        pintarReq(checklist.nums, r.numsOK);
        pintarReq(checklist.esp, r.espOK);
    }

    inpPass.addEventListener("input", () => {
        actualizarChecklistPassword(inpPass.value);
        const msg = validarContrasenaRegistroStyle(inpPass.value);
        inpPass.setCustomValidity(msg);
    });

    inpRePass.addEventListener("input", () => {
        const nueva = inpPass.value.trim();
        const rep = inpRePass.value.trim();
        if (nueva !== "" && rep !== "" && nueva !== rep) inpRePass.setCustomValidity("Las contraseñas no coinciden");
        else inpRePass.setCustomValidity("");
    });

    // -------------------------------
    // 6) GUARDAR PERFIL
    // -------------------------------
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

    // -------------------------------
    // 7) GUARDAR CUENTA
    // -------------------------------
    formCuenta.addEventListener("submit", (e) => {
        e.preventDefault();

        const nuevaPass = inpPass.value.trim();
        const repPass = inpRePass.value.trim();

        const errPass = validarContrasenaRegistroStyle(nuevaPass);
        if (errPass) {
            alert(errPass);
            inpPass.focus();
            return;
        }

        if (nuevaPass !== "" && nuevaPass !== repPass) {
            alert("Las contraseñas no coinciden.");
            inpRePass.focus();
            return;
        }

        usuarioActivo.correo = inpCorreo.value.trim();
        if (nuevaPass !== "") usuarioActivo.contrasena = nuevaPass;

        guardarCambios("Configuración de cuenta actualizada.");
    });

    // -------------------------------
    // 8) FUNCIÓN CENTRAL DE GUARDADO
    // -------------------------------
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

    // -------------------------------
    // 9) ELIMINAR CUENTA
    // -------------------------------
    document.getElementById("link-eliminar-cuenta").addEventListener("click", (e) => {
        e.preventDefault();
        if (!confirm("¿Estás seguro de ELIMINAR tu cuenta?")) return;

        let lista = (() => {
            try { return JSON.parse(localStorage.getItem("usuariosRegistrados")) || []; } catch { return []; }
        })();
        const nuevaLista = lista.filter(u => u.usuario !== usuarioActivo.usuario);
        localStorage.setItem("usuariosRegistrados", JSON.stringify(nuevaLista));
        localStorage.removeItem("usuarioActivo");

        const favs = cargarMapa("viajesFavoritos");
        const compras = cargarMapa("viajesComprados");
        delete favs[usuarioActivo.usuario];
        delete compras[usuarioActivo.usuario];
        guardarMapa("viajesFavoritos", favs);
        guardarMapa("viajesComprados", compras);

        alert("Cuenta eliminada.");
        window.location.href = "index.html";
    });

    // -------------------------------
    // INIT
    // -------------------------------
    pintarPerfil();
    cargarMisViajes();
    actualizarChecklistPassword("");
});
