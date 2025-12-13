// js/destinos.js

document.addEventListener("DOMContentLoaded", () => {
    const selectCont = document.getElementById("select-continente");
    const selectPais = document.getElementById("select-pais");
    const sectionSelector = document.getElementById("selector-section");
    const sectionDetalle = document.getElementById("detalle-pais");
    const btnVolver = document.getElementById("btn-volver");
    const breadCurrent = document.getElementById("bread-current");

    // 1. Cargar JSON externo
    fetch("/js/ciudades-del-mundo.json")
      .then(res => res.json())
      .then(datosMundo => {
          inicializar(datosMundo);
          cargarPorParametros(datosMundo); // <-- nueva función para parámetros en URL
      })
      .catch(err => console.error("Error cargando JSON:", err));

    function inicializar(datosMundo) {
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

            // Resetear select de países
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

        // Evento Cambio de País
        selectPais.addEventListener("change", (e) => {
            const paisNombre = e.target.value;
            const continenteSel = selectCont.value;

            const contData = datosMundo.continents.find(c => c.name === continenteSel);
            const paisData = contData.countries.find(p => p.name === paisNombre);

            if (paisData) {
                cargarDetallePais(paisData);
                sectionSelector.classList.add("hidden");
                sectionDetalle.classList.remove("hidden");
                breadCurrent.textContent = `Destinos > ${paisNombre}`;
                document.getElementById("bread-pais-name").textContent = paisNombre;
            }
        });

        // Botón Volver
        btnVolver.addEventListener("click", () => {
            sectionDetalle.classList.add("hidden");
            sectionSelector.classList.remove("hidden");
            selectPais.value = "";
            breadCurrent.textContent = "Destinos";
        });
    }

    // Función para pintar el detalle del país
    function cargarDetallePais(pais) {
        document.getElementById("pais-nombre").textContent = pais.name;

        // Imagen principal y descripción
        if (pais.cities.length > 0) {
            document.getElementById("pais-img-principal").src = pais.cities[0].image.url;
            document.getElementById("pais-img-principal").alt = pais.cities[0].image.alt;
            document.getElementById("pais-descripcion").textContent = pais.cities[0].description;
        }

        // Mostrar capital, población e idioma desde el JSON
        document.getElementById("dato-capital").textContent = pais.capital || "-";
        document.getElementById("dato-poblacion").textContent = pais.population || "-";
        document.getElementById("dato-idioma").textContent = pais.language || "-";

        // Grid de ciudades
        const grid = document.getElementById("grid-ciudades");
        grid.innerHTML = "";

        pais.cities.forEach(ciudad => {
            const card = document.createElement("div");
            card.className = "card-simple";
            card.innerHTML = `
                <img src="${ciudad.image.url}" alt="${ciudad.image.alt}">
                <h4>${ciudad.name}</h4>
                <p>${ciudad.description.substring(0, 100)}...</p>
            `;
            grid.appendChild(card);
        });
    }

    // NUEVA FUNCIÓN: cargar destino directamente desde parámetros de la URL
    function cargarPorParametros(datosMundo) {
        const params = new URLSearchParams(window.location.search);
        const ciudadParam = params.get("ciudad");
        const paisParam = params.get("pais");

        if (!ciudadParam || !paisParam) return;

        let paisData = null;

        datosMundo.continents.forEach(cont => {
            cont.countries.forEach(country => {
                if (country.name.toLowerCase() === paisParam.toLowerCase()) {
                    paisData = country;
                }
            });
        });

        if (paisData) {
            cargarDetallePais(paisData);
            sectionSelector.classList.add("hidden");
            sectionDetalle.classList.remove("hidden");
            breadCurrent.textContent = `Destinos > ${paisData.name}`;
            document.getElementById("bread-pais-name").textContent = paisData.name;
        }
    }
});