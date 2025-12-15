// Este codigo se encarga de cargar y mostrar los resultados de búsqueda de productos (alojamientos)
// basados en los parámetros de la URL (tipo, destino, fechas) y de centrar el mapa SVG en el país correspondiente.

// Espera a que el DOM esté completamente cargado
document.addEventListener("DOMContentLoaded", () => {
  const contenedor = document.querySelector(".resultados-scroll");

  // Obtener parámetros de la URL
  const params = new URLSearchParams(window.location.search);
  const tipo = params.get("tipo");
  const destino = params.get("destino"); // ciudad
  const inicio = params.get("inicio");
  const fin = params.get("fin");

  // Mostrar destino en título
  const titulo = document.querySelector(".resultados-scroll h3");

  // Actualizar el título con el destino y fechas
  if (destino) {
    titulo.textContent = `Resultados para ${destino} (${inicio} - ${fin})`;
  }

  // Función para calcular estrellas según la puntuación
  function generarEstrellas(puntuacion) {
    const estrellas = Math.round(puntuacion / 2);
    return "★".repeat(estrellas) + "☆".repeat(5 - estrellas);
  }

  // Función para centrar el mapa en un país
function centrarPaisEnMapa(paisNombre) {
  const svg = document.querySelector("#mapa-container svg");
  if (!svg) return;

  // Buscar el país por id o por class
  let pais = document.getElementById(paisNombre);

  // Si no se encuentra por id, buscar por class
  if (!pais) pais = svg.querySelector(`.${paisNombre}`);

  // Si no se encuentra el país, salir
  if (!pais) {
    console.warn("No se encontró país en el SVG:", paisNombre);
    return;
  }

  // Obtener bounding box del path
  const bbox = pais.getBBox();

  // Ajustar viewBox para centrar y hacer zoom
  const margen = 20;
  const x = bbox.x - margen;
  const y = bbox.y - margen;
  const width = bbox.width + margen * 2;
  const height = bbox.height + margen * 2;

  // Aplicar nuevo viewBox
  svg.setAttribute("viewBox", `${x} ${y} ${width} ${height}`);
  svg.removeAttribute("preserveAspectRatio"); // clave para que se aplique el zoom

  // Resaltar el país
  pais.classList.add("highlight");
}

  // Cargar alojamientos desde el JSON
  fetch("/js/alojamientos-del-mundo.json")
    .then(res => res.json())
    .then(data => {
      let resultados = [];
      let paisDelDestino = null;

      // Recorrer continentes → países → ciudades
      data.continents.forEach(cont => {
        cont.countries.forEach(country => {
          country.cities.forEach(city => {
            if (city.name.toLowerCase() === destino.toLowerCase()) {
              resultados = city.alojamientos;
              paisDelDestino = country.name; // capturamos el país directamente
            }
          });
        });
      });

      // Renderizar cards con enlace a producto.html
      if (resultados.length === 0) {
        contenedor.innerHTML = "<p>No se encontraron alojamientos para este destino.</p>";
        return;
      }

      // Limpiar contenedor antes de agregar resultados
      resultados.forEach(a => {
        const estrellas = generarEstrellas(a.puntuacion);

        const card = document.createElement("a");

        // Crear card de resultado
        card.classList.add("resultado-card");
        card.href = `producto.html?ciudad=${encodeURIComponent(destino)}&nombre=${encodeURIComponent(a.nombre)}`;
        card.innerHTML = `
          <img src="${a.imagen}" alt="${a.nombre}">
          <div class="resultado-info">
            <h4>${a.nombre}</h4>
            <div class="rating">
              <span class="estrellas">${estrellas}</span>
              <span class="valor-numerica">${a.puntuacion}</span>
              <span class="valor-texto">${a.rating}</span>
              <span class="valoraciones">(${a.valoraciones} valoraciones)</span>
            </div>
            <div class="precio">${a.precio} ${a.moneda} pp</div>
            <p class="descripcion">${a.descripcion}</p>
          </div>
        `;

        // Agregar card al contenedor
        contenedor.appendChild(card);
      });

      // --- Centrar el mapa en el país del destino ---
      if (paisDelDestino) {
        centrarPaisEnMapa(paisDelDestino);
      }
    })

    // Manejo de errores en la carga del JSON
    .catch(err => {
      console.error("Error cargando alojamientos:", err);
      contenedor.innerHTML = "<p>Error al cargar los alojamientos.</p>";
    });
});

// Consola para pruebas
document.addEventListener("DOMContentLoaded", () => {
  const params = new URLSearchParams(window.location.search);
  const tipo = params.get("tipo");
  const destino = params.get("destino");
  const inicio = params.get("inicio");
  const fin = params.get("fin");

  console.log("Tipo:", tipo);
  console.log("Destino:", destino);
  console.log("Inicio:", inicio);
  console.log("Fin:", fin);

  // Mostrar en el título para verificar
  const resultados = document.querySelector(".resultados-scroll h3");
  if (destino) {
    resultados.textContent = `Resultados para ${destino} (${inicio} - ${fin})`;
  }
});