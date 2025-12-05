// js/destinos.js

// 1. DATOS DEL JSON ORIGINAL (Integrados aquí para que funcione directo)
const datosMundo = {
  "continents": [
    {
      "name": "Europa",
      "countries": [
        {
          "name": "Austria",
          "cities": [{ "name": "Viena", "description": "Ciudad imperial con museos y música clásica...", "image": { "url": "https://images.unsplash.com/photo-1731223832507-ebe5373129e6?w=500" } }]
        },
        {
          "name": "España",
          "cities": [
            { "name": "Barcelona", "description": "Modernismo de Gaudí, mar y montaña...", "image": { "url": "https://images.unsplash.com/photo-1630219694734-fe47ab76b15e?w=500" } },
            { "name": "Sevilla", "description": "Casco histórico monumental y flamenco...", "image": { "url": "https://images.unsplash.com/photo-1559564477-6e8582270002?w=500" } }
          ]
        },
        {
          "name": "Francia",
          "cities": [{ "name": "París", "description": "Romance urbano: Sena, bulevares...", "image": { "url": "https://plus.unsplash.com/premium_photo-1661919210043-fd847a58522d?w=500" } }]
        },
        {
            "name": "Italia",
            "cities": [
                { "name": "Roma", "description": "La Ciudad Eterna combina ruinas y vida...", "image": { "url": "https://images.unsplash.com/photo-1529154036614-a60975f5c760?w=500" } },
                { "name": "Venecia", "description": "Canales, palacios y puentes...", "image": { "url": "https://plus.unsplash.com/premium_photo-1661963047742-dabc5a735357?w=500" } }
            ]
        },
        {
            "name": "Alemania", // Agrego Alemania manualmente para coincidir con tu Wireframe
            "cities": [
                { "name": "Berlín", "description": "Historia, arte urbano y cultura underground.", "image": { "url": "https://images.unsplash.com/photo-1560969184-10fe8719e047?w=500" } },
                { "name": "Múnich", "description": "Tradición bávara y arquitectura clásica.", "image": { "url": "https://images.unsplash.com/photo-1595867865312-70b3a985a539?w=500" } }
            ]
        }
      ]
    },
    {
        "name": "Asia",
        "countries": [
            { "name": "Japón", "cities": [{ "name": "Kioto", "description": "Templos y santuarios.", "image": { "url": "https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?w=500" } }] },
            { "name": "China", "cities": [{ "name": "Beijing", "description": "Capital imperial.", "image": { "url": "https://plus.unsplash.com/premium_photo-1723433351351-0f6cd5d21537?w=500" } }] }
        ]
    },
    {
        "name": "América del Norte",
        "countries": [
            { "name": "Estados Unidos", "cities": [{ "name": "Nueva York", "description": "La ciudad que nunca duerme.", "image": { "url": "https://images.unsplash.com/photo-1485871981521-5b1fd3805eee?w=500" } }] }
        ]
    }
  ]
};

// 2. DATOS EXTRA PARA SIMULAR EL WIREFRAME (Capital, Pob, Idioma)
const metadataPaises = {
    "Austria": { capital: "Viena", pob: "9M", idioma: "Alemán" },
    "España": { capital: "Madrid", pob: "47M", idioma: "Español" },
    "Francia": { capital: "París", pob: "67M", idioma: "Francés" },
    "Italia": { capital: "Roma", pob: "60M", idioma: "Italiano" },
    "Alemania": { capital: "Berlín", pob: "83,5M", idioma: "Alemán" },
    "Japón": { capital: "Tokio", pob: "125M", idioma: "Japonés" },
    "China": { capital: "Beijing", pob: "1400M", idioma: "Mandarín" },
    "Estados Unidos": { capital: "Washington D.C.", pob: "331M", idioma: "Inglés" }
};

document.addEventListener("DOMContentLoaded", () => {
    const selectCont = document.getElementById("select-continente");
    const selectPais = document.getElementById("select-pais");
    const sectionSelector = document.getElementById("selector-section");
    const sectionDetalle = document.getElementById("detalle-pais");
    const btnVolver = document.getElementById("btn-volver");
    const breadCurrent = document.getElementById("bread-current");

    // Llenar continentes
    datosMundo.continents.forEach(cont => {
        const option = document.createElement("option");
        option.value = cont.name;
        option.textContent = cont.name;
        selectCont.appendChild(option);
    });

    // Evento Cambio de Continente
    selectCont.addEventListener("change", (e) => {
        const continenteSel = e.target.value;
        const continenteData = datosMundo.continents.find(c => c.name === continenteSel);
        
        // Limpiar y habilitar pais
        selectPais.innerHTML = '<option value="" disabled selected>Elige un país</option>';
        selectPais.disabled = false;

        if (continenteData) {
            continenteData.countries.forEach(pais => {
                const option = document.createElement("option");
                option.value = pais.name;
                option.textContent = pais.name;
                selectPais.appendChild(option);
            });
        }
    });

    // Evento Cambio de País (Navegación al detalle)
    selectPais.addEventListener("change", (e) => {
        const paisNombre = e.target.value;
        const continenteSel = selectCont.value;
        
        // Buscar datos del país
        const contData = datosMundo.continents.find(c => c.name === continenteSel);
        const paisData = contData.countries.find(p => p.name === paisNombre);
        const metaData = metadataPaises[paisNombre] || { capital: "-", pob: "-", idioma: "-" };

        if (paisData) {
            cargarDetallePais(paisData, metaData);
            sectionSelector.classList.add("hidden");
            sectionDetalle.classList.remove("hidden");
            breadCurrent.textContent = `Destinos > ${paisNombre}`;
        }
    });

    // Botón Volver
    btnVolver.addEventListener("click", () => {
        sectionDetalle.classList.add("hidden");
        sectionSelector.classList.remove("hidden");
        selectPais.value = ""; // Resetear selección
        breadCurrent.textContent = "Destinos";
    });

    // Función para pintar el HTML del detalle
    function cargarDetallePais(pais, meta) {
        document.getElementById("pais-nombre").textContent = pais.name;
        
        // Usar la primera imagen de ciudad como Hero si existe
        if (pais.cities.length > 0) {
            document.getElementById("pais-img-principal").src = pais.cities[0].image.url;
            document.getElementById("pais-descripcion").textContent = `Descubre ${pais.name}, un destino increíble conocido por sus paisajes y cultura. ${pais.cities[0].description}`;
        }

        // Llenar Estadísticas
        document.getElementById("dato-capital").textContent = meta.capital;
        document.getElementById("dato-poblacion").textContent = meta.pob;
        document.getElementById("dato-idioma").textContent = meta.idioma;

        // Llenar Grid de Ciudades (Experiencias)
        const grid = document.getElementById("grid-ciudades");
        grid.innerHTML = ""; // Limpiar anterior

        pais.cities.forEach(ciudad => {
            const card = document.createElement("div");
            card.className = "card-simple";
            card.innerHTML = `
                <img src="${ciudad.image.url}" alt="${ciudad.name}">
                <h4>${ciudad.name}</h4>
                <p>${ciudad.description.substring(0, 60)}...</p>
            `;
            grid.appendChild(card);
        });
    }
});