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

  // Cargar alojamientos desde el JSON
  fetch("/js/alojamientos-del-mundo.json")
    .then(res => res.json())
    .then(data => {
      let resultados = [];

      // Recorrer continentes → países → ciudades
      data.continents.forEach(cont => {
        cont.countries.forEach(country => {
          country.cities.forEach(city => {
            if (city.name.toLowerCase() === destino.toLowerCase()) {
              resultados = city.alojamientos;
            }
          });
        });
      });

      // Renderizar cards
      if (resultados.length === 0) {
        contenedor.innerHTML = "<p>No se encontraron alojamientos para este destino.</p>";
        return;
      }

      resultados.forEach(a => {
        const card = document.createElement("div");
        card.classList.add("resultado-card");
        card.innerHTML = `
          <img src="${a.imagen}" alt="${a.nombre}">
          <div class="resultado-info">
            <h4>${a.nombre}</h4>
            <div class="rating">${a.rating} (${a.puntuacion})</div>
            <div class="precio">${a.precio} ${a.moneda} pp</div>
          </div>
        `;
        contenedor.appendChild(card);
      });
    })
    .catch(err => {
      console.error("Error cargando alojamientos:", err);
      contenedor.innerHTML = "<p>Error al cargar los alojamientos.</p>";
    });
});

document.addEventListener("DOMContentLoaded", () => {
  const params = new URLSearchParams(window.location.search);
  const tipo = params.get("tipo");
  const destino = params.get("destino");
  const inicio = params.get("inicio");
  const fin = params.get("fin");

  // Mostrar los datos en consola (para pruebas)
  console.log("Tipo:", tipo);
  console.log("Destino:", destino);
  console.log("Inicio:", inicio);
  console.log("Fin:", fin);

  // Ejemplo: mostrar destino en el título
  const resultados = document.querySelector(".resultados-scroll h3");
  if (destino) {
    resultados.textContent = `Resultados para ${destino} (${inicio} - ${fin})`;
  }
});
