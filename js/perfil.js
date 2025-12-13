document.addEventListener("DOMContentLoaded", () => {
    
    // --- 1. CARGAR DATOS DEL USUARIO ---
    const usuarioActivo = JSON.parse(localStorage.getItem("usuarioActivo"));

    if (!usuarioActivo) {
        alert("Debes iniciar sesión.");
        window.location.href = "inicioSesion.html";
        return;
    }

    // Elementos Visuales (Perfil Público)
    const nombreEl = document.getElementById("perfil-nombre");
    const bioEl = document.getElementById("perfil-bio");
    const imgEl = document.getElementById("perfil-img");
    
    function pintarPerfil() {
        // Nombre
        if (usuarioActivo.nombre && usuarioActivo.apellidos) {
            nombreEl.textContent = `${usuarioActivo.nombre} ${usuarioActivo.apellidos}`;
        } else {
            nombreEl.textContent = usuarioActivo.usuario;
        }

        // Bio
        bioEl.innerHTML = ""; 
        const p = document.createElement("p");
        p.className = "handwritten-text";
        p.textContent = usuarioActivo.bio || "Bienvenido a mi perfil de viajero.";
        bioEl.appendChild(p);

        // Foto
        imgEl.src = usuarioActivo.foto || "/imagenes/default-profile.jpg";
    }

    pintarPerfil();
    cargarGridsDemo(); // Función auxiliar al final


    // --- 2. GESTIÓN DE VISTAS (Perfil vs Editar vs Configurar) ---

    // Contenedores
    const vistasPerfil = document.querySelectorAll(".vista-perfil");
    const seccionEditarPerfil = document.getElementById("seccion-editar-perfil");
    const seccionConfigCuenta = document.getElementById("seccion-configuracion-cuenta");

    // Botones Triggers
    const btnPencil = document.getElementById("btn-pencil-edit");
    const linkEditarPerfil = document.getElementById("link-editar-perfil");
    const btnMobile = document.getElementById("btn-config-mobile");
    const linkConfigCuenta = document.getElementById("link-configuracion");
    const btnsCerrar = document.querySelectorAll(".btn-cerrar-forms");

    // Inputs Formulario PERFIL
    const inpNombre = document.getElementById("edit-nombre");
    const inpApellidos = document.getElementById("edit-apellidos");
    const inpBio = document.getElementById("edit-bio");
    const inpFoto = document.getElementById("edit-foto");
    const formPerfil = document.getElementById("form-perfil");

    // Inputs Formulario CUENTA
    const inpCorreo = document.getElementById("conf-correo");
    const inpPass = document.getElementById("conf-pass");
    const inpRePass = document.getElementById("conf-repass");
    const formCuenta = document.getElementById("form-cuenta");

    // --- Feedback en tiempo real: requisitos contraseña (mismas reglas que registro) ---
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

        // Mostrar hints si el usuario ha empezado a escribir algo en cualquiera de los dos
        const show = pw.trim() !== "" || rep.trim() !== "";
        passHints.classList.toggle("hidden", !show);
        if (!show) return;

        const r = evaluarPassword(pw);

        // Pintar cada regla (menos 'match')
        Object.entries(r).forEach(([rule, ok]) => {
            const li = passHints.querySelector(`li[data-rule="${rule}"]`);
            if (!li) return;

            li.classList.toggle("ok", ok);
            li.classList.toggle("bad", !ok);

            // Reescribir icono sin tocar el texto
            const texto = li.textContent.replace(/^✅\s|^❌\s/, "");
            li.textContent = `${ok ? "✅" : "❌"} ${texto}`;
        });

        // Coincidencia (solo exigir cuando el usuario ya haya escrito en repetir)
        const liMatch = passHints.querySelector('li[data-rule="match"]');
        if (liMatch) {
            const ok = rep.trim() === "" ? true : (pw === rep);
            liMatch.classList.toggle("ok", ok);
            liMatch.classList.toggle("bad", !ok);
            liMatch.textContent = `${ok ? "✅" : "❌"} Las contraseñas coinciden`;
        }

        // Validity del navegador (mensajes al intentar enviar / reportValidity)
        const allOk = r.len && r.letters && r.upper && r.nums && r.special;

        if (pw.trim() !== "" && !allOk) {
            inpPass.setCustomValidity("La contraseña no cumple los requisitos.");
        } else {
            inpPass.setCustomValidity("");
        }

        if (rep.trim() !== "" && pw !== rep) {
            inpRePass.setCustomValidity("Las contraseñas no coinciden.");
        } else {
            inpRePass.setCustomValidity("");
        }
    }

    if (inpPass) inpPass.addEventListener("input", actualizarHints);
    if (inpRePass) inpRePass.addEventListener("input", actualizarHints);


    // --- FUNCIONES DE NAVEGACIÓN ---

    function cerrarTodo() {
        // Ocultar formularios
        seccionEditarPerfil.classList.add("hidden");
        seccionConfigCuenta.classList.add("hidden");
        // Mostrar perfil original
        vistasPerfil.forEach(el => el.classList.remove("hidden"));
    }

    function abrirEditarPerfil() {
        // Ocultar perfil y otros forms
        vistasPerfil.forEach(el => el.classList.add("hidden"));
        seccionConfigCuenta.classList.add("hidden");
        
        // Mostrar form perfil
        seccionEditarPerfil.classList.remove("hidden");

        // Rellenar datos
        inpNombre.value = usuarioActivo.nombre || "";
        inpApellidos.value = usuarioActivo.apellidos || "";
        inpBio.value = usuarioActivo.bio || "";
        inpFoto.value = ""; // Limpiar input file
    }

    function abrirConfigCuenta() {
        // Ocultar perfil y otros forms
        vistasPerfil.forEach(el => el.classList.add("hidden"));
        seccionEditarPerfil.classList.add("hidden");

        // Mostrar form cuenta
        seccionConfigCuenta.classList.remove("hidden");

        // Rellenar datos
        inpCorreo.value = usuarioActivo.correo || "";
        inpPass.value = "";
        inpRePass.value = "";

        // Reset hints/validity
        if (passHints) passHints.classList.add("hidden");
        inpPass.setCustomValidity("");
        inpRePass.setCustomValidity("");
    }

    // Event Listeners Navegación
    btnPencil.addEventListener("click", abrirEditarPerfil);
    linkEditarPerfil.addEventListener("click", (e) => { e.preventDefault(); abrirEditarPerfil(); });
    if(btnMobile) btnMobile.addEventListener("click", (e) => { e.preventDefault(); abrirEditarPerfil(); });
    
    linkConfigCuenta.addEventListener("click", (e) => { e.preventDefault(); abrirConfigCuenta(); });

    btnsCerrar.forEach(btn => {
        btn.addEventListener("click", cerrarTodo);
    });


    // --- 3. LOGICA GUARDAR: PERFIL (Foto, Nombre, Bio) ---

    formPerfil.addEventListener("submit", (e) => {
        e.preventDefault();

        // Actualizar objeto temporal
        usuarioActivo.nombre = inpNombre.value.trim();
        usuarioActivo.apellidos = inpApellidos.value.trim();
        usuarioActivo.bio = inpBio.value.trim();

        // Procesar foto
        if (inpFoto.files && inpFoto.files[0]) {
            const reader = new FileReader();
            reader.onload = function(evt) {
                usuarioActivo.foto = evt.target.result; // Base64
                guardarCambios("Perfil actualizado con foto.");
            };
            reader.readAsDataURL(inpFoto.files[0]);
        } else {
            // Guardar sin cambiar foto
            guardarCambios("Perfil actualizado correctamente.");
        }
    });


    // --- 4. LOGICA GUARDAR: CUENTA (Correo, Pass) ---

    formCuenta.addEventListener("submit", (e) => {
        e.preventDefault();

        const nuevaPass = inpPass.value.trim();
        const repPass = inpRePass.value.trim();

        // Si intenta cambiar contraseña
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

        // Actualizar correo (siempre)
        usuarioActivo.correo = inpCorreo.value.trim();

        guardarCambios("Configuración de cuenta actualizada.");
    });


    // --- 5. FUNCIÓN CENTRAL DE GUARDADO EN STORAGE ---
    function guardarCambios(mensaje) {
        // 1. Guardar en usuarioActivo
        localStorage.setItem("usuarioActivo", JSON.stringify(usuarioActivo));

        // 2. Sincronizar con usuariosRegistrados
        let lista = JSON.parse(localStorage.getItem("usuariosRegistrados")) || [];
        const index = lista.findIndex(u => u.usuario === usuarioActivo.usuario);
        
        if (index !== -1) {
            lista[index] = usuarioActivo;
            localStorage.setItem("usuariosRegistrados", JSON.stringify(lista));
        }

        // 3. Restaurar vista
        alert(mensaje);
        pintarPerfil();
        cerrarTodo();
    }


    // --- 6. ELIMINAR CUENTA ---
    document.getElementById("link-eliminar-cuenta").addEventListener("click", (e) => {
        e.preventDefault();
        if (confirm("¿Estás seguro de ELIMINAR tu cuenta?")) {
            let lista = JSON.parse(localStorage.getItem("usuariosRegistrados")) || [];
            const nuevaLista = lista.filter(u => u.usuario !== usuarioActivo.usuario);
            
            localStorage.setItem("usuariosRegistrados", JSON.stringify(nuevaLista));
            localStorage.removeItem("usuarioActivo");
            
            alert("Cuenta eliminada.");
            window.location.href = "index.html";
        }
    });

    // --- Auxiliares: Rellenar grids (Visual) ---
    function cargarGridsDemo() {
        const favs = document.getElementById("grid-favoritos");
        const hist = document.getElementById("grid-historial");
        
        // Limpiar para evitar duplicados si recarga
        favs.innerHTML = "";
        hist.innerHTML = "";

        // Favoritos
        const fImgs = [
            "https://images.unsplash.com/photo-1516483638261-f4dbaf036963?w=400",
            "https://images.unsplash.com/photo-1523906834658-6e24ef2386f9?w=400"
        ];
        fImgs.forEach(src => favs.innerHTML += `<div class="card-wireframe bg-x"><img src="${src}"></div>`);
        favs.innerHTML += `<div class="card-wireframe bg-x"></div><div class="card-wireframe bg-x"></div>`;

        // Historial
        hist.innerHTML += `
            <div class="card-wireframe bg-x">
                <img src="https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=400">
                <button class="btn-review">Escribir Reseña</button>
            </div>`;
        hist.innerHTML += `<div class="card-wireframe bg-x"><button class="btn-review">Escribir Reseña</button></div>`;
    }
});
