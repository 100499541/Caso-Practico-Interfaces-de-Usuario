// js/viajesCompartidos.js

document.addEventListener("DOMContentLoaded", () => {
    
    // DATOS DE EJEMPLO
    const viajes = [
        {
            titulo: "Mochileros en Tailandia",
            destino: "Chiang Mai",
            precio: "850€",
            fechas: "15 Ago - 30 Ago",
            desc: "Ruta de 15 días recorriendo el norte de Tailandia, templos, santuarios de elefantes y mucha comida callejera.",
            img: "https://images.unsplash.com/photo-1552465011-b4e21bf6e79a?auto=format&fit=crop&w=500",
            participantes: [
                "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=50",
                "https://images.unsplash.com/photo-1527980965255-d3b416303d12?auto=format&fit=crop&w=50",
                "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&w=50"
            ]
        },
        {
            titulo: "Ruta gastronómica Italia",
            destino: "Toscana",
            precio: "600€",
            fechas: "10 Sep - 17 Sep",
            desc: "Buscamos 2 personas más para alquilar una villa en la Toscana y recorrer viñedos en coche.",
            img: "https://images.unsplash.com/photo-1516483638261-f4dbaf036963?auto=format&fit=crop&w=500",
            participantes: [
                "https://images.unsplash.com/photo-1544725176-7c40e5a71c5e?auto=format&fit=crop&w=50",
                "https://images.unsplash.com/photo-1599566150163-29194dcaad36?auto=format&fit=crop&w=50"
            ]
        },
        {
            titulo: "Trekking Patagonia",
            destino: "Chile/Argentina",
            precio: "1200€",
            fechas: "Dic 2025",
            desc: "Aventura exigente para amantes de la montaña. Torres del Paine y Fitz Roy. Solo gente con experiencia.",
            img: "https://images.unsplash.com/photo-1518182170546-0766aaef31e2?auto=format&fit=crop&w=500",
            participantes: [
                "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=50"
            ]
        },
        {
            titulo: "Escapada a Marruecos",
            destino: "Chefchaouen",
            precio: "350€",
            fechas: "Puente Octubre",
            desc: "Viaje rápido de 4 días para perderse por la ciudad azul y dormir en el desierto.",
            img: "https://images.unsplash.com/photo-1569383746724-6f1b882b8f46?auto=format&fit=crop&w=500",
            participantes: [
                "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=50",
                "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=50",
                "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=50",
                "https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?auto=format&fit=crop&w=50"
            ]
        },
        {
            titulo: "Roadtrip Costa Oeste",
            destino: "EEUU",
            precio: "1500€",
            fechas: "Julio 2026",
            desc: "Planeando con tiempo. Alquiler de caravana desde Los Ángeles hasta San Francisco pasando por parques nacionales.",
            img: "https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?auto=format&fit=crop&w=500",
            participantes: [
                "https://images.unsplash.com/photo-1520813792240-56fc4a37b1a9?auto=format&fit=crop&w=50",
                "https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=50"
            ]
        }
    ];

    const contenedor = document.getElementById("contenedor-viajes");

    // GENERAR HTML
    viajes.forEach(viaje => {
        const card = document.createElement("div");
        card.className = "viaje-card";

        // Generar HTML de avatares
        let avataresHTML = "";
        viaje.participantes.forEach(img => {
            avataresHTML += `<img src="${img}" class="participante-avatar" alt="Participante">`;
        });

        card.innerHTML = `
            <div class="viaje-img-container">
                <img src="${viaje.img}" alt="${viaje.titulo}">
                <span class="etiqueta-estado">Abierto</span>
            </div>
            <div class="viaje-info">
                <div class="viaje-header">
                    <h3>${viaje.titulo}</h3>
                    <span class="viaje-precio">${viaje.precio}</span>
                </div>
                <div class="viaje-fechas">
                    <span>📅</span> ${viaje.fechas}
                </div>
                <p class="viaje-desc">${viaje.desc}</p>
                
                <div class="viaje-footer">
                    <div class="participantes">
                        ${avataresHTML}
                    </div>
                    <button class="btn-unirse">Unirse</button>
                </div>
            </div>
        `;

        contenedor.appendChild(card);
    });

    // INTERACTIVIDAD BOTONES
    document.querySelectorAll(".btn-unirse").forEach(btn => {
        btn.addEventListener("click", () => {
            alert("¡Solicitud enviada al organizador del grupo!");
        });
    });

    document.getElementById("btnCrear").addEventListener("click", () => {
        alert("Abriendo formulario para crear nuevo viaje...");
    });
});