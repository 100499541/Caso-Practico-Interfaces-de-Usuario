// js/perfil.js

document.addEventListener("DOMContentLoaded", () => {
    
    // 1. RELLENAR FAVORITOS
    const contenedorFavoritos = document.getElementById("grid-favoritos");
    const imagenesFavoritos = [
        "https://images.unsplash.com/photo-1516483638261-f4dbaf036963?auto=format&fit=crop&w=400", // Italia
        "https://images.unsplash.com/photo-1523906834658-6e24ef2386f9?auto=format&fit=crop&w=400"  // Venecia
    ];

    imagenesFavoritos.forEach(url => {
        const card = document.createElement("div");
        card.className = "card-wireframe bg-x"; // bg-x es para el fondo de wireframe
        card.innerHTML = `<img src="${url}" alt="Favorito">`;
        contenedorFavoritos.appendChild(card);
    });

    // Añadir cards vacías si queremos que se vea exactamente como el wireframe (4 huecos)
    for(let i=0; i<2; i++){
         const card = document.createElement("div");
         card.className = "card-wireframe bg-x";
         // Sin imagen, solo la X de fondo
         contenedorFavoritos.appendChild(card);
    }


    // 2. RELLENAR HISTORIAL DE COMPRAS
    const contenedorHistorial = document.getElementById("grid-historial");
    const imagenesHistorial = [
        "https://images.unsplash.com/photo-1502602898657-3e91760cbb34?auto=format&fit=crop&w=400", // Paris
        "https://images.unsplash.com/photo-1525874684015-58379d421a52?auto=format&fit=crop&w=400"  // Kyoto
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
     // Añadir cards vacías historial
    for(let i=0; i<2; i++){
         const card = document.createElement("div");
         card.className = "card-wireframe bg-x";
         card.innerHTML = `<button class="btn-review">Escribir Reseña</button>`;
         contenedorHistorial.appendChild(card);
    }

    // Funcionalidad botones
    document.querySelectorAll(".btn-review").forEach(btn => {
        btn.addEventListener("click", () => {
            alert("Abriendo formulario de reseña...");
        });
    });

    document.querySelector(".btn-edit-pencil").addEventListener("click", () => {
        const bio = document.querySelector(".user-bio");
        const nuevoTexto = prompt("Edita tu biografía:", "Amante de la fotografía y los viajes.");
        if(nuevoTexto) {
            bio.innerHTML = `<p class="handwritten-text">${nuevoTexto}</p>`;
        }
    });

    // Alert al borrar cuenta
    document.querySelector(".delete-account a").addEventListener("click", (e) => {
        e.preventDefault();
        if(confirm("¿Estás seguro de que quieres eliminar tu cuenta? Esta acción no se puede deshacer.")) {
            alert("Cuenta eliminada.");
            window.location.href = "index.html";
        }
    });
});