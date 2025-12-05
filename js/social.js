// js/social.js

document.addEventListener("DOMContentLoaded", () => {
    
    // 1. Rellenar "Viajeros Similares"
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


    // 2. Rellenar "Tus Amigos" (Sidebar)
    const amigosContainer = document.getElementById("lista-amigos");
    // Reusamos los mismos avatares para demo
    avatares.slice(0, 4).forEach(url => {
        const div = document.createElement("div");
        div.className = "avatar-item";
        div.innerHTML = `
            <div class="avatar-circle" style="width:50px; height:50px;">
                <img src="${url}" alt="Amigo">
            </div>
            <div class="avatar-placeholder-lines" style="width:30px;"></div>
        `;
        amigosContainer.appendChild(div);
    });


    // 3. Rellenar "Chats" (Sidebar Vertical)
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