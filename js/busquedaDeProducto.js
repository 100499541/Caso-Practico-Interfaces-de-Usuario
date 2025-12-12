document.addEventListener("DOMContentLoaded", () => {
  const contenedor = document.querySelector(".resultados-scroll");

  const alojamientos = [
    { nombre: "Hotel Sol", rating: "Muy bueno", puntuacion: 8.6, precio: 321, imagen: "/imagenes/hotel1.jpg" },
    { nombre: "Hotel Luna", rating: "Bueno", puntuacion: 7.2, precio: 260, imagen: "/imagenes/hotel2.jpg" },
    { nombre: "Hostal Estrella", rating: "Decente", puntuacion: 5.9, precio: 182, imagen: "/imagenes/hotel3.jpg" }
  ];

  alojamientos.forEach(a => {
    const card = document.createElement("div");
    card.classList.add("resultado-card");
    card.innerHTML = `
      <img src="${a.imagen}" alt="${a.nombre}">
      <div class="resultado-info">
        <h4>${a.nombre}</h4>
        <div class="rating">${a.rating} (${a.puntuacion})</div>
        <div class="precio">${a.precio}€ pp</div>
      </div>
    `;
    contenedor.appendChild(card);
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
