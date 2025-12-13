document.addEventListener("DOMContentLoaded", () => {
  const params = new URLSearchParams(window.location.search);
  const ciudad = params.get("ciudad");
  const nombre = params.get("nombre");

  fetch("/js/alojamientos-del-mundo.json")
    .then(res => res.json())
    .then(data => {
      let alojamiento = null;

      // Buscar alojamiento por ciudad y nombre
      data.continents.forEach(cont => {
        cont.countries.forEach(country => {
          country.cities.forEach(city => {
            if (city.name.toLowerCase() === ciudad.toLowerCase()) {
              city.alojamientos.forEach(a => {
                if (a.nombre === nombre) {
                  alojamiento = a;
                }
              });
            }
          });
        });
      });

      if (!alojamiento) {
        document.querySelector("main").innerHTML = "<p>Alojamiento no encontrado.</p>";
        return;
      }

      // Rellenar campos
      document.getElementById("imagen-principal").src = alojamiento.imagen;
      document.getElementById("imagen-principal").alt = alojamiento.nombre;
      document.getElementById("nombre").textContent = alojamiento.nombre;
      document.getElementById("descripcion").textContent = alojamiento.descripcion;
      document.getElementById("puntuacion").textContent = alojamiento.puntuacion;
      document.getElementById("rating-text").textContent = alojamiento.rating;
      document.getElementById("valoraciones").textContent = `${alojamiento.valoraciones} valoraciones`;
      document.getElementById("precio").textContent = `${alojamiento.precio} ${alojamiento.moneda} pp`;

      // Servicios
      const serviciosLista = document.getElementById("servicios-lista");
      alojamiento.servicios.forEach(servicio => {
        const li = document.createElement("li");
        li.textContent = servicio;
        serviciosLista.appendChild(li);
      });
    })
    .catch(err => {
      console.error("Error cargando alojamiento:", err);
      document.querySelector("main").innerHTML = "<p>Error al cargar el alojamiento.</p>";
    });
});

// Imágenes genéricas de servicios
const imagenesIncluye = [
  "imagenes/servicio-1.jpg",
  "imagenes/servicio-2.jpg",
  "imagenes/servicio-3.jpg",
  "imagenes/servicio-4.jpg",
  "imagenes/servicio-5.jpg",
  "imagenes/servicio-6.png",
  "imagenes/servicio-7.jpg",
  "imagenes/servicio-8.jpeg"
];

// Seleccionar 3 aleatorias sin repetir
const seleccionadas = [];
while (seleccionadas.length < 3) {
  const aleatoria = imagenesIncluye[Math.floor(Math.random() * imagenesIncluye.length)];
  if (!seleccionadas.includes(aleatoria)) {
    seleccionadas.push(aleatoria);
  }
}

// Pintar en el HTML
const contenedorIncluye = document.getElementById("incluye-imagenes");
seleccionadas.forEach((src, i) => {
  const img = document.createElement("img");
  img.src = src;
  img.alt = `Incluye ${i + 1}`;
  contenedorIncluye.appendChild(img);
});

document.addEventListener("DOMContentLoaded", () => {
  const btnEstancia = document.getElementById("elegir-estancia");
  if (btnEstancia) {
    btnEstancia.addEventListener("click", () => {
      const params = new URLSearchParams(window.location.search);
      const ciudad = params.get("ciudad");
      const nombre = params.get("nombre");

      // Redirige a la página de compra con los datos del producto
      window.location.href = `compraProducto.html?ciudad=${encodeURIComponent(ciudad)}&nombre=${encodeURIComponent(nombre)}`;
    });
  }
});

document.addEventListener("DOMContentLoaded", () => {
  const params = new URLSearchParams(window.location.search);

  const tipo = params.get("tipo") || "hotel";
  const ciudad = params.get("ciudad");   // <-- usa la ciudad
  const inicio = params.get("inicio") || "";
  const fin = params.get("fin") || "";

  const breadcrumbBusqueda = document.getElementById("breadcrumb-busqueda");
  if (breadcrumbBusqueda && ciudad) {
    breadcrumbBusqueda.href = `busquedaDeProducto.html?tipo=${tipo}&destino=${encodeURIComponent(ciudad)}&inicio=${inicio}&fin=${fin}`;
  }

  const nombre = params.get("nombre");
  const breadcrumbProducto = document.getElementById("breadcrumb-producto");
  if (breadcrumbProducto) {
    breadcrumbProducto.textContent = nombre || ciudad || "Producto";
  }
});



