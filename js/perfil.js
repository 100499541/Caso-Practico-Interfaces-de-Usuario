document.addEventListener("DOMContentLoaded", () => {
    
    // 1. VERIFICAR SESIÓN
    // Recuperamos el usuario activo. Si no existe, al login.
    let usuarioActivo = JSON.parse(localStorage.getItem("usuarioActivo"));

    if (!usuarioActivo) {
        alert("Debes iniciar sesión para ver tu perfil.");
        window.location.href = "inicioSesion.html";
        return;
    }

    // Elementos del DOM
    const vistaInfo = document.getElementById("vista-informacion");
    const vistaEditar = document.getElementById("vista-editar");
    
    const perfilNombre = document.getElementById("perfil-nombre");
    const perfilUsuario = document.getElementById("perfil-usuario");
    const perfilBio = document.getElementById("perfil-bio");
    const perfilImg = document.getElementById("perfil-img");
    
    // Inputs del formulario de edición
    const inputNombre = document.getElementById("edit-nombre");
    const inputApellidos = document.getElementById("edit-apellidos");
    const inputCorreo = document.getElementById("edit-correo");
    const inputBio = document.getElementById("edit-bio");
    const inputPass = document.getElementById("edit-pass");
    const inputFoto = document.getElementById("edit-foto");

    // 2. FUNCIÓN PARA RENDERIZAR DATOS (Funcionalidad 5)
    function renderizarPerfil() {
        perfilNombre.textContent = `${usuarioActivo.nombre} ${usuarioActivo.apellidos}`;
        perfilUsuario.textContent = `@${usuarioActivo.usuario}`;
        
        // Si no tiene bio, ponemos un texto por defecto
        if (usuarioActivo.bio && usuarioActivo.bio.trim() !== "") {
            perfilBio.innerHTML = `<p class="handwritten-text">${usuarioActivo.bio}</p>`;
        } else {
            perfilBio.innerHTML = `<p class="handwritten-text">¡Hola! Soy nuevo en Rutas del Mundo.</p>`;
        }

        // Si tiene foto, la ponemos
        if (usuarioActivo.foto) {
            perfilImg.src = usuarioActivo.foto;
        }
    }

    // Ejecutamos renderizado inicial
    renderizarPerfil();


    // 3. CARGAR CONTENIDO DEMO (Favoritos y Historial)
    // Esto es contenido simulado como pedía el diseño inicial, 
    // pero ya dentro de la estructura dinámica.
    cargarContenidoDemo();


    // 4. LÓGICA DE EDICIÓN (Funcionalidad 6)
    
    // Botones para mostrar formulario
    const btnPencil = document.getElementById("btn-pencil-edit");
    const btnLinkEdit = document.getElementById("link-editar-perfil");
    const btnMobileEdit = document.getElementById("btn-config-mobile-trigger");
    const btnCancelar = document.getElementById("btn-cancelar-edicion");

    // Función para mostrar/ocultar
    function toggleEdicion(mostrar) {
        if (mostrar) {
            vistaInfo.classList.add("hidden");
            vistaEditar.classList.remove("hidden");
            
            // Rellenar formulario con datos actuales
            inputNombre.value = usuarioActivo.nombre;
            inputApellidos.value = usuarioActivo.apellidos;
            inputCorreo.value = usuarioActivo.correo;
            inputBio.value = usuarioActivo.bio || "";
            inputPass.value = ""; // La contraseña no se muestra por seguridad
        } else {
            vistaInfo.classList.remove("hidden");
            vistaEditar.classList.add("hidden");
        }
    }

    // Event listeners para abrir edición
    btnPencil.addEventListener("click", () => toggleEdicion(true));
    btnLinkEdit.addEventListener("click", (e) => { e.preventDefault(); toggleEdicion(true); });
    if(btnMobileEdit) btnMobileEdit.addEventListener("click", () => toggleEdicion(true));
    
    // Cancelar edición
    btnCancelar.addEventListener("click", () => toggleEdicion(false));

    // GUARDAR CAMBIOS
    const formEditar = document.getElementById("form-editar-perfil");
    
    formEditar.addEventListener("submit", (e) => {
        e.preventDefault();

        // Actualizamos objeto local
        usuarioActivo.nombre = inputNombre.value.trim();
        usuarioActivo.apellidos = inputApellidos.value.trim();
        usuarioActivo.correo = inputCorreo.value.trim();
        usuarioActivo.bio = inputBio.value.trim();

        if (inputPass.value.trim() !== "") {
            usuarioActivo.contrasena = inputPass.value.trim();
        }

        // Función auxiliar para guardar en localStorage
        const guardarYSalir = () => {
            // 1. Actualizar usuarioActivo en Storage
            localStorage.setItem("usuarioActivo", JSON.stringify(usuarioActivo));

            // 2. Actualizar la lista de usuariosRegistrados (buscar por el usuario original)
            let usuariosRegistrados = JSON.parse(localStorage.getItem("usuariosRegistrados")) || [];
            
            // Buscamos el índice del usuario actual
            const index = usuariosRegistrados.findIndex(u => u.usuario === usuarioActivo.usuario);
            if (index !== -1) {
                usuariosRegistrados[index] = usuarioActivo;
                localStorage.setItem("usuariosRegistrados", JSON.stringify(usuariosRegistrados));
            }

            // 3. Actualizar UI y salir
            renderizarPerfil();
            toggleEdicion(false);
            alert("Datos actualizados correctamente.");
        };

        // Manejo de la foto
        if (inputFoto.files && inputFoto.files[0]) {
            const reader = new FileReader();
            reader.onload = function (e) {
                usuarioActivo.foto = e.target.result; // Base64
                guardarYSalir();
            };
            reader.readAsDataURL(inputFoto.files[0]);
        } else {
            // Si no cambia foto, guardamos directamente
            guardarYSalir();
        }
    });


    // 5. ELIMINAR CUENTA (Funcionalidad 6)
    const btnEliminar = document.getElementById("link-eliminar-cuenta");
    
    btnEliminar.addEventListener("click", (e) => {
        e.preventDefault();
        
        const confirmacion = confirm("¿Estás SEGURO de que quieres eliminar tu cuenta? Esta acción es irreversible.");
        
        if (confirmacion) {
            let usuariosRegistrados = JSON.parse(localStorage.getItem("usuariosRegistrados")) || [];
            
            // Filtrar para quitar al usuario actual
            const nuevosUsuarios = usuariosRegistrados.filter(u => u.usuario !== usuarioActivo.usuario);
            
            // Guardar nueva lista
            localStorage.setItem("usuariosRegistrados", JSON.stringify(nuevosUsuarios));
            
            // Borrar sesión activa
            localStorage.removeItem("usuarioActivo");
            
            alert("Tu cuenta ha sido eliminada. Esperamos verte pronto.");
            window.location.href = "index.html";
        }
    });


    // --- FUNCIONES AUXILIARES PARA RELLENAR CARDS (VISUAL) ---
    function cargarContenidoDemo() {
        const contenedorFavoritos = document.getElementById("grid-favoritos");
        const contenedorHistorial = document.getElementById("grid-historial");

        // Limpiar
        contenedorFavoritos.innerHTML = "";
        contenedorHistorial.innerHTML = "";

        // Cards de Favoritos
        const imagenesFavoritos = [
            "https://images.unsplash.com/photo-1516483638261-f4dbaf036963?auto=format&fit=crop&w=400", 
            "https://images.unsplash.com/photo-1523906834658-6e24ef2386f9?auto=format&fit=crop&w=400"
        ];
        
        imagenesFavoritos.forEach(url => {
            const card = document.createElement("div");
            card.className = "card-wireframe bg-x"; 
            card.innerHTML = `<img src="${url}" alt="Favorito">`;
            contenedorFavoritos.appendChild(card);
        });
        // Relleno vacíos
        for(let i=0; i<2; i++){
             const card = document.createElement("div");
             card.className = "card-wireframe bg-x";
             contenedorFavoritos.appendChild(card);
        }

        // Cards Historial
        const imagenesHistorial = [
            "https://images.unsplash.com/photo-1502602898657-3e91760cbb34?auto=format&fit=crop&w=400",
            "https://images.unsplash.com/photo-1525874684015-58379d421a52?auto=format&fit=crop&w=400"
        ];
        imagenesHistorial.forEach(url => {
            const card = document.createElement("div");
            card.className = "card-wireframe bg-x";
            card.innerHTML = `
                <img src="${url}" alt="Historial">
                <button class="btn-review">Escribir Reseña</button>
            `;
            contenedorHistorial.appendChild(card);
        });
        // Relleno vacíos
        for(let i=0; i<2; i++){
             const card = document.createElement("div");
             card.className = "card-wireframe bg-x";
             card.innerHTML = `<button class="btn-review">Escribir Reseña</button>`;
             contenedorHistorial.appendChild(card);
        }

        // Click en reseñas (demo)
        document.querySelectorAll(".btn-review").forEach(btn => {
            btn.addEventListener("click", () => alert("Funcionalidad de reseñas en desarrollo..."));
        });
    }

});