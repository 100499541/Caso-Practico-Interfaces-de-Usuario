// js/destinos.js

document.addEventListener("DOMContentLoaded", () => {
  const selectCont = document.getElementById("select-continente");
  const selectPais = document.getElementById("select-pais");
  const sectionSelector = document.getElementById("selector-section");
  const sectionDetalle = document.getElementById("detalle-pais");
  const btnVolver = document.getElementById("btn-volver");

  const breadPaisName = document.getElementById("bread-pais-name");

  fetch("/js/ciudades-del-mundo.json")
    .then(res => res.json())
    .then(datosMundo => {
      inicializar(datosMundo);
      cargarPorParametros(datosMundo);
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
        if (breadPaisName) breadPaisName.textContent = paisNombre;
      }
    });

    // Botón Volver
    btnVolver.addEventListener("click", () => {
      sectionDetalle.classList.add("hidden");
      sectionSelector.classList.remove("hidden");
      selectPais.value = "";
      if (breadPaisName) breadPaisName.textContent = "Destinos";
    });
  }

  function cargarDetallePais(pais) {
    document.getElementById("pais-nombre").textContent = pais.name;

    // Imagen principal del país
    const img = document.getElementById("pais-img-principal");
    if (pais.image && pais.image.url) {
      img.src = pais.image.url;
      img.alt = pais.image.alt || pais.name;
    } else {
      img.src = "imagenes/default.jpg";
      img.alt = pais.name;
    }

    // Descripción del país
    document.getElementById("pais-descripcion").textContent = pais.description || "";
    document.getElementById("texto-eventos-pais").textContent = pais.calendarInfo || "";

    // Datos estadísticos
    document.getElementById("dato-capital").textContent = pais.capital || "-";
    document.getElementById("dato-poblacion").textContent = pais.population || "-";
    document.getElementById("dato-idioma").textContent = pais.language || "-";

    paisSeleccionado = pais; // Guardar país activo
    actualizarCalendario(pais.highlightedDates || []);

    // Breadcrumb dinámico
    if (breadPaisName) breadPaisName.textContent = pais.name;

    // Grid de ciudades
    const grid = document.getElementById("grid-ciudades");
    grid.innerHTML = "";

    pais.cities.forEach(ciudad => {
    const card = document.createElement("div");
    card.className = "card-simple";
    card.innerHTML = `
        <div class="card-img">
        <img src="${ciudad.image?.url || 'imagenes/default.jpg'}" alt="${ciudad.image?.alt || ciudad.name}">
        </div>
        <div class="card-info">
        <h4>${ciudad.name}</h4>
        <p class="ciudad-descripcion">${ciudad.description || 'Descripción no disponible.'}</p>
        </div>
    `;
    grid.appendChild(card);
    });
  }

  function cargarPorParametros(datosMundo) {
    const params = new URLSearchParams(window.location.search);
    const paisParam = params.get("pais");

    if (!paisParam) return;

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
      if (breadPaisName) breadPaisName.textContent = paisData.name;
    }
  }
});

let mesActual = 5; // Mayo por defecto
const meses = ["Enero","Febrero","Marzo","Abril","Mayo","Junio","Julio","Agosto","Septiembre","Octubre","Noviembre","Diciembre"];

function actualizarCalendario(fechasDestacadas = []) {
  const diasGrid = document.getElementById("calendar-days");
  diasGrid.innerHTML = "";

  // Número de días por mes (simplificado, sin años bisiestos)
  const diasPorMes = [31,28,31,30,31,30,31,31,30,31,30,31];
  const diasEnMes = diasPorMes[mesActual-1];

  // Actualizar etiqueta del mes
  document.getElementById("calendar-month-label").textContent = meses[mesActual-1];

  // Pintar días
  for (let d = 1; d <= diasEnMes; d++) {
    const span = document.createElement("span");
    span.textContent = d;

    const fechaFormateada = `${String(mesActual).padStart(2,'0')}-${String(d).padStart(2,'0')}`;
    if (fechasDestacadas.includes(fechaFormateada)) {
      span.classList.add("event");
    }

    diasGrid.appendChild(span);
  }
}

document.getElementById("prev-month").addEventListener("click", () => {
  mesActual = mesActual === 1 ? 12 : mesActual - 1;
  actualizarCalendario(paisSeleccionado.highlightedDates || []);
});

document.getElementById("next-month").addEventListener("click", () => {
  mesActual = mesActual === 12 ? 1 : mesActual + 1;
  actualizarCalendario(paisSeleccionado.highlightedDates || []);
});

