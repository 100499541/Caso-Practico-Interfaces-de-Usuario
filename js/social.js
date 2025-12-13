// js/social.js

document.addEventListener("DOMContentLoaded", async () => {
    
    // 1. Rellenar "Viajeros Similares" (demo estático por ahora)
    const viajerosContainer = document.getElementById("viajeros-similares");
    const avatares = [
        "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=100",
        "https://images.unsplash.com/photo-1527980965255-d3b416303d12?auto=format&fit=crop&w=100",
        "https://images.unsplash.com/photo-1544725176-7c40e5a71c5e?auto=format&fit=crop&w=100",
        "https://images.unsplash.com/photo-1599566150163-29194dcaad36?auto=format&fit=crop&w=100",
        "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&w=100"
    ];

    avatares.forEach(url => {
        const div = document.createElement("div");
        div.className = "avatar-item";
        div.innerHTML = `
            <div class="avatar-circle">
                <img src="${url}" alt="Usuario">
            </div>
            <div class="avatar-placeholder-lines"></div>
        `;
        viajerosContainer.appendChild(div);
    });


    // 2. Rellenar "Tus Amigos" (Sidebar) desde LocalStorage + JSON
    const amigosContainer = document.getElementById("lista-amigos");

    async function cargarUsuariosFicticios() {
        try {
            const res = await fetch("js/usuarios.json"); // ruta al JSON ficticio
            const data = await res.json();
            return data.usuarios;
        } catch (err) {
            console.error("Error cargando usuarios.json", err);
            return [];
        }
    }

    async function mostrarAmigos() {
        const usuarioActivo = JSON.parse(localStorage.getItem("usuarioActivo"));
        if (!usuarioActivo || !usuarioActivo.amigos) return;

        const usuariosFicticios = await cargarUsuariosFicticios();
        amigosContainer.innerHTML = "";

        usuarioActivo.amigos.forEach(amigoId => {
            const amigo = usuariosFicticios.find(u => u.id === amigoId);
            if (amigo) {
                const div = document.createElement("div");
                div.className = "friend-avatar";
                div.innerHTML = `
                    <img src="${amigo.foto}" alt="${amigo.nombre}" style="width:50px; height:50px; border-radius:50%; object-fit:cover;">
                    <span style="font-size:0.8em; margin-top:4px; text-align:center;">${amigo.nombre}</span>
                `;
                amigosContainer.appendChild(div);
            }
        });
    }

    await mostrarAmigos();


    // 3. Rellenar "Anuncios Oficiales" desde JSON
    async function cargarAnuncios() {
        try {
            const res = await fetch("js/anuncios-oficiales.json"); // ruta al JSON de anuncios
            const data = await res.json();
            const anuncios = data.anunciosOficiales || [];
            const carrusel = document.getElementById("carrusel-anuncios");
            if (!carrusel) return;

            carrusel.innerHTML = "";

            anuncios.forEach(anuncio => {
                const card = document.createElement("div");
                card.className = "anuncio-card";
                card.innerHTML = `
                    <div class="anuncio-img">
                        <img src="${anuncio.imagen}" alt="${anuncio.titulo}">
                    </div>
                    <div class="anuncio-info">
                        <h4>${anuncio.titulo}</h4>
                        <p>${anuncio.descripcion}</p>
                        <span class="anuncio-fecha">${anuncio.fecha}</span>
                    </div>
                `;
                carrusel.appendChild(card);
            });

        } catch (err) {
            console.error("Error cargando anuncios-oficiales.json", err);
        }
    }

    await cargarAnuncios();


    // 4. Rellenar "Chats" (Sidebar Vertical) (demo estático)
    const chatContainer = document.getElementById("lista-chats");
    const nombres = ["Grupo Mochileros", "Ana López", "Carlos Viajero", "Marta Guía", "Juan", "Grupo Japón 2025", "Soporte"];
    
    nombres.forEach((nombre, index) => {
        const chatItem = document.createElement("div");
        chatItem.className = "chat-item";
        // Alternar imágenes
        const imgUrl = avatares[index % avatares.length];
        
        chatItem.innerHTML = `
            <div class="chat-avatar">
                <img src="${imgUrl}" alt="${nombre}">
            </div>
            <div class="chat-info">
                <span class="chat-name">${nombre}</span>
                <div class="chat-preview"></div> <!-- Línea simulada -->
            </div>
        `;
        chatContainer.appendChild(chatItem);
    });

    // Funcionalidad básica botones (Alerts)
    document.querySelectorAll(".action-btn").forEach(btn => {
        btn.addEventListener("click", () => {
            const action = btn.querySelector("span").textContent;
            alert(`Abriendo sección: ${action}`);
            // Aquí podrías ocultar el feed y mostrar solo la sección correspondiente en móvil
        });
    });
});
