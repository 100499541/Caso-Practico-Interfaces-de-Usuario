// js/perfil.js

document.addEventListener("DOMContentLoaded", () => {
    
    // 1. VERIFICAR AUTENTICACIÓN
    // Leemos el usuario activo
    let usuarioActivo = JSON.parse(localStorage.getItem("usuarioActivo"));

    if (!usuarioActivo) {
        alert("Debes iniciar sesión para ver tu perfil.");
        window.location.href = "inicioSesion.html";
        return;
    }

    // Elementos del DOM
    const nombreEl = document.getElementById("perfil-nombre");
    const bioEl = document.getElementById("perfil-bio");
    const imgEl = document.getElementById("perfil-imagen");
    
    // Modal elementos
    const modal = document.getElementById("modal-editar");
    const btnEditarRapido = document.getElementById("btn-editar-rapido");
    const btnEditarCompleto = document.getElementById("btn-editar-completo");
    const btnCerrarModal = document.getElementById("btn-cerrar-modal");
    const formEditar = document.getElementById("form-editar-perfil");
    
    // Inputs del form
    const inputNombre = document.getElementById("edit-nombre");
    const inputBio = document.getElementById("edit-bio");
    const inputFotoUrl = document.getElementById("edit-foto-url");
    const inputFotoFile = document.getElementById("edit-foto-input");

    // 2. FUNCIÓN PARA CARGAR DATOS EN LA INTERFAZ
    function cargarDatosPerfil() {
        nombreEl.textContent = `${usuarioActivo.nombre} ${usuarioActivo.apellidos || ''}`;
        
        // Cargar Bio (si no existe, poner default)
        if (usuarioActivo.bio) {
            // Dividimos por saltos de línea para mantener formato
            bioEl.innerHTML = usuarioActivo.bio.split('\n').map(line => `<p class="handwritten-text">${line}</p>`).join('');
        } else {
            bioEl.innerHTML = `<p class="handwritten-text">¡Hola! Soy nuevo en Rutas del Mundo.</p>`;
        }

        // Cargar Foto
        if (usuarioActivo.foto) {
            imgEl.src = usuarioActivo.foto;
        }
    }

    // Inicializar carga
    cargarDatosPerfil();

    // 3. RENDERIZADO DE CARDS (FAVORITOS / HISTORIAL) - (Datos simulados por ahora)
    const contenedorFavoritos = document.getElementById("grid-favoritos");
    const imagenesFavoritos = [
        "https://images.unsplash.com/photo-1516483638261-f4dbaf036963?auto=format&fit=crop&w=400",
        "https://images.unsplash.com/photo-1523906834658-6e24ef2386f9?auto=format&fit=crop&w=400"
    ];

    // Limpiar container
    contenedorFavoritos.innerHTML = '';
    
    // Render Favoritos
    imagenesFavoritos.forEach(url => {
        const card = document.createElement("div");
        card.className = "card-wireframe bg-x";
        card.innerHTML = `<img src="${url}" alt="Favorito">`;
        contenedorFavoritos.appendChild(card);
    });
    // Relleno wireframe
    for(let i=0; i<2; i++){
         const card = document.createElement("div");
         card.className = "card-wireframe bg-x";
         contenedorFavoritos.appendChild(card);
    }

    // Render Historial
    const contenedorHistorial = document.getElementById("grid-historial");
    contenedorHistorial.innerHTML = '';
    const imagenesHistorial = [
        "https://images.unsplash.com/photo-1502602898657-3e91760cbb34?auto=format&fit=crop&w=400", 
        "https://images.unsplash.com/photo-1525874684015-58379d421a52?auto=format&fit=crop&w=400"
    ];

    imagenesHistorial.forEach(url => {
        const card = document.createElement("div");
        card.className = "card-wireframe bg-x";
        card.innerHTML = `
            <img src="${url}" alt="Historial">
            <button class="btn-review">Ver Reseña</button>
        `;
        contenedorHistorial.appendChild(card);
    });


    // 4. LÓGICA DEL MODAL DE CONFIGURACIÓN
    const abrirModal = (e) => {
        if(e) e.preventDefault();
        
        // Pre-llenar datos en el formulario
        inputNombre.value = usuarioActivo.nombre; // Solo nombre de pila para editar
        inputBio.value = usuarioActivo.bio || "";
        inputFotoUrl.value = ""; // Limpiar url
        inputFotoFile.value = ""; // Limpiar archivo
        
        modal.classList.remove("hidden");
    };

    const cerrarModal = () => {
        modal.classList.add("hidden");
    };

    btnEditarRapido.addEventListener("click", abrirModal);
    btnEditarCompleto.addEventListener("click", abrirModal);
    btnCerrarModal.addEventListener("click", cerrarModal);

    // Cerrar al hacer clic fuera del modal
    modal.addEventListener("click", (e) => {
        if (e.target === modal) cerrarModal();
    });

    // 5. GUARDAR CAMBIOS (CONFIGURACIÓN)
    formEditar.addEventListener("submit", (e) => {
        e.preventDefault();

        // Actualizar datos en memoria
        usuarioActivo.nombre = inputNombre.value;
        usuarioActivo.bio = inputBio.value;

        // Función auxiliar para guardar y refrescar
        const guardarYRefrescar = () => {
            // 1. Actualizar usuarioActivo en localStorage
            localStorage.setItem("usuarioActivo", JSON.stringify(usuarioActivo));

            // 2. Actualizar la lista global de usuariosRegistrados (para que el login futuro funcione con nuevos datos)
            let usuariosRegistrados = JSON.parse(localStorage.getItem("usuariosRegistrados")) || [];
            const index = usuariosRegistrados.findIndex(u => u.usuario === usuarioActivo.usuario);
            if (index !== -1) {
                // Mantenemos contraseña y otros datos, actualizamos solo lo editado
                usuariosRegistrados[index] = { ...usuariosRegistrados[index], ...usuarioActivo };
                localStorage.setItem("usuariosRegistrados", JSON.stringify(usuariosRegistrados));
            }

            // 3. Refrescar interfaz
            cargarDatosPerfil();
            cerrarModal();
            alert("Perfil actualizado correctamente.");
            
            // Recargar para actualizar header (foto mini)
            location.reload(); 
        };

        // Manejo de la foto
        if (inputFotoFile.files && inputFotoFile.files[0]) {
            // Si subió archivo, convertir a Base64
            const reader = new FileReader();
            reader.onload = function (e) {
                usuarioActivo.foto = e.target.result;
                guardarYRefrescar();
            }
            reader.readAsDataURL(inputFotoFile.files[0]);
        } else if (inputFotoUrl.value.trim() !== "") {
            // Si puso URL
            usuarioActivo.foto = inputFotoUrl.value.trim();
            guardarYRefrescar();
        } else {
            // Si no cambió foto
            guardarYRefrescar();
        }
    });

    // 6. ELIMINAR CUENTA
    const btnEliminar = document.getElementById("btn-eliminar-cuenta");
    if(btnEliminar){
        btnEliminar.addEventListener("click", (e) => {
            e.preventDefault();
            const confirmacion = confirm("⚠ ¿ESTÁS SEGURO? \nEsta acción eliminará tu cuenta permanentemente y no podrás recuperarla.");
            
            if(confirmacion) {
                // Borrar de usuariosRegistrados
                let usuariosRegistrados = JSON.parse(localStorage.getItem("usuariosRegistrados")) || [];
                const nuevosUsuarios = usuariosRegistrados.filter(u => u.usuario !== usuarioActivo.usuario);
                localStorage.setItem("usuariosRegistrados", JSON.stringify(nuevosUsuarios));

                // Borrar sesión activa
                localStorage.removeItem("usuarioActivo");

                alert("Tu cuenta ha sido eliminada. Esperamos verte pronto.");
                window.location.href = "index.html";
            }
        });
    }
});