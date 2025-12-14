document.addEventListener("DOMContentLoaded", () => {
  const contenedor = document.querySelector(".resultados-scroll");

  const params = new URLSearchParams(window.location.search);
  const tipo = params.get("tipo");
  const destino = params.get("destino"); // ciudad
  const inicio = params.get("inicio");
  const fin = params.get("fin");

  // Mostrar destino en título
  const titulo = document.querySelector(".resultados-scroll h3");
  if (destino) {
    titulo.textContent = `Resultados para ${destino} (${inicio} - ${fin})`;
  }

  // Función para calcular estrellas según la puntuación
  function generarEstrellas(puntuacion) {
    const estrellas = Math.round(puntuacion / 2);
    return "★".repeat(estrellas) + "☆".repeat(5 - estrellas);
  }

  // --- Función para centrar el mapa en un país ---
function centrarPaisEnMapa(paisNombre) {
  const svg = document.querySelector("#mapa-container svg");
  if (!svg) return;

  // Buscar el país por id o por class
  let pais = document.getElementById(paisNombre);
  if (!pais) pais = svg.querySelector(`.${paisNombre}`);
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

  svg.setAttribute("viewBox", `${x} ${y} ${width} ${height}`);
  svg.removeAttribute("preserveAspectRatio"); // ← clave para que se aplique el zoom

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
              paisDelDestino = country.name; // ← capturamos el país directamente
            }
          });
        });
      });

      // Renderizar cards con enlace a producto.html
      if (resultados.length === 0) {
        contenedor.innerHTML = "<p>No se encontraron alojamientos para este destino.</p>";
        return;
      }

      resultados.forEach(a => {
        const estrellas = generarEstrellas(a.puntuacion);

        const card = document.createElement("a");
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
        contenedor.appendChild(card);
      });

      // --- Centrar el mapa en el país del destino ---
      if (paisDelDestino) {
        centrarPaisEnMapa(paisDelDestino);
      }
    })
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

  const resultados = document.querySelector(".resultados-scroll h3");
  if (destino) {
    resultados.textContent = `Resultados para ${destino} (${inicio} - ${fin})`;
  }
});