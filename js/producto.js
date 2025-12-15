// Este codigo:
// - Carga alojamiento desde JSON
// - Permite ir a compra
// - Guarda / quita favoritos por usuario (localStorage)

// Alojamiento actualmente mostrado
let alojamientoActual = null;

// Funciones de almacenamiento en localStorage
function cargarMapa(key) {
  try {
    return JSON.parse(localStorage.getItem(key)) || {};
  } catch {
    return {};
  }
}

// Guarda un objeto como mapa en localStorage
function guardarMapa(key, obj) {
  localStorage.setItem(key, JSON.stringify(obj));
}

// Obtiene el usuario activo desde localStorage
function getUsuarioActivo() {
  try {
    return JSON.parse(localStorage.getItem("usuarioActivo"));
  } catch {
    return null;
  }
}

// Esta funcion comprueba si un alojamiento está en favoritos
function isFavorito(username, ciudad, nombre) {
  const favs = cargarMapa("viajesFavoritos");
  const lista = favs[username] || [];
  // Buscar coincidencia
  return lista.some(
    (v) =>
      (v.ciudad || "").toLowerCase() === (ciudad || "").toLowerCase() &&
      v.nombre === nombre
  );
}

// Esta funcion añade o quita un alojamiento de favoritos
function toggleFavorito(username, item) {
  const favs = cargarMapa("viajesFavoritos");
  const lista = favs[username] || [];
  const idx = lista.findIndex(
    (v) =>
      (v.ciudad || "").toLowerCase() === (item.ciudad || "").toLowerCase() &&
      v.nombre === item.nombre
  );

  // Si ya está, lo quitamos
  if (idx >= 0) {
    lista.splice(idx, 1);
    favs[username] = lista;
    guardarMapa("viajesFavoritos", favs);
    return { added: false };
  }

  // Si no está, lo añadimos
  lista.unshift(item);
  favs[username] = lista;
  guardarMapa("viajesFavoritos", favs);
  return { added: true };
}

// 1) Cargar producto
document.addEventListener("DOMContentLoaded", () => {
  const params = new URLSearchParams(window.location.search);
  const ciudad = params.get("ciudad");
  const nombre = params.get("nombre");

  fetch("/js/alojamientos-del-mundo.json")
    .then((res) => res.json())
    .then((data) => {
      let alojamiento = null;

      // Buscar alojamiento por ciudad y nombre
      data.continents.forEach((cont) => {
        cont.countries.forEach((country) => {
          country.cities.forEach((city) => {
            // Comparamos ignorando mayusculas/minusculas
            if ((city.name || "").toLowerCase() === (ciudad || "").toLowerCase()) {
              city.alojamientos.forEach((a) => {
                if (a.nombre === nombre) alojamiento = a;
              });
            }
          });
        });
      });

      // Si no se encuentra, mostrar mensaje
      if (!alojamiento) {
        document.querySelector("main").innerHTML = "<p>Alojamiento no encontrado.</p>";
        return;
      }

      // Guardar alojamiento actual
      alojamientoActual = alojamiento;

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
      serviciosLista.innerHTML = "";
      (alojamiento.servicios || []).forEach((servicio) => {
        const li = document.createElement("li");
        li.textContent = servicio;
        serviciosLista.appendChild(li);
      });

      // Botón favorito (texto según estado)
      const user = getUsuarioActivo();
      const btnFav = document.getElementById("guardar-favorito");
      // Actualizar texto del botón
      if (btnFav && user && user.usuario) {
        btnFav.textContent = isFavorito(user.usuario, ciudad, nombre)
          ? "Quitar de favorito"
          : "Guardar en favorito";
      }
    })
    // Captura errores de fetch
    .catch((err) => {
      console.error("Error cargando alojamiento:", err);
      document.querySelector("main").innerHTML = "<p>Error al cargar el alojamiento.</p>";
    });
});

// 2) Imágenes genéricas de servicios ("Qué se incluye")
const imagenesIncluye = [
  "imagenes/servicio-1.jpg",
  "imagenes/servicio-2.jpg",
  "imagenes/servicio-3.jpg",
  "imagenes/servicio-4.jpg",
  "imagenes/servicio-5.jpg",
  "imagenes/servicio-6.png",
  "imagenes/servicio-7.jpg",
  "imagenes/servicio-8.jpeg",
];

// Seleccionar 3 imágenes aleatorias sin repetición
const seleccionadas = [];
// Mientras no tengamos 3 únicas
while (seleccionadas.length < 3) {
  // Selección aleatoria
  const aleatoria = imagenesIncluye[Math.floor(Math.random() * imagenesIncluye.length)];
  // Si no está ya, la añadimos
  if (!seleccionadas.includes(aleatoria)) seleccionadas.push(aleatoria);
}

// Pintar las imágenes seleccionadas en el contenedor
document.addEventListener("DOMContentLoaded", () => {
  const contenedorIncluye = document.getElementById("incluye-imagenes");
  // Si incluye imagenes no existe, no hacemos nada
  if (!contenedorIncluye) return;
  contenedorIncluye.innerHTML = "";
  // Añadir cada imagen
  seleccionadas.forEach((src, i) => {
    const img = document.createElement("img");
    img.src = src;
    img.alt = `Incluye ${i + 1}`;
    contenedorIncluye.appendChild(img);
  });
});

// 3) Ir a compra
document.addEventListener("DOMContentLoaded", () => {
  const btnEstancia = document.getElementById("elegir-estancia");
  // Si no existe el botón, no hacemos nada
  if (!btnEstancia) return;

  // Manejador del clic
  btnEstancia.addEventListener("click", () => {
    const params = new URLSearchParams(window.location.search);
    const ciudad = params.get("ciudad");
    const nombre = params.get("nombre");
    const tipo = params.get("tipo") || "hotel";
    const inicio = params.get("inicio") || "";
    const fin = params.get("fin") || "";

    // Redirigir a compra con parámetros
    window.location.href =
      `compraProducto.html?ciudad=${encodeURIComponent(ciudad)}` +
      `&nombre=${encodeURIComponent(nombre)}` +
      `&tipo=${encodeURIComponent(tipo)}` +
      `&inicio=${encodeURIComponent(inicio)}` +
      `&fin=${encodeURIComponent(fin)}`;
  });
});

// 4) Guardar / quitar favorito
document.addEventListener("DOMContentLoaded", () => {
  const btnFav = document.getElementById("guardar-favorito");
  // Si no existe el botón, no hacemos nada
  if (!btnFav) return;

  // Manejador del clic
  btnFav.addEventListener("click", () => {
    const user = getUsuarioActivo();
    if (!user || !user.usuario) {
      alert("Debes iniciar sesión para guardar favoritos.");
      window.location.href = "inicioSesion.html";
      return;
    }

    // Obtener parámetros actuales
    const params = new URLSearchParams(window.location.search);
    const ciudad = params.get("ciudad") || "";
    const nombre = params.get("nombre") || "";
    const tipo = params.get("tipo") || "hotel";
    const inicio = params.get("inicio") || "";
    const fin = params.get("fin") || "";

    // Comprobar que el alojamiento actual está cargado
    if (!alojamientoActual) {
      alert("No se ha podido guardar el favorito (producto no cargado).");
      return;
    }

    // Crear el objeto del favorito
    const item = {
      ciudad,
      nombre: alojamientoActual.nombre,
      tipo: alojamientoActual.tipo || tipo,
      imagen: alojamientoActual.imagen,
      precio: alojamientoActual.precio,
      moneda: alojamientoActual.moneda,
      puntuacion: alojamientoActual.puntuacion,
      rating: alojamientoActual.rating,
      valoraciones: alojamientoActual.valoraciones,
      inicio,
      fin,
      guardadoEn: new Date().toISOString(),
    };

    // Alternar favorito
    const { added } = toggleFavorito(user.usuario, item);
    btnFav.textContent = added ? "Quitar de favorito" : "Guardar en favorito";
    alert(added ? "Guardado en favoritos." : "Eliminado de favoritos.");
  });
});

// 5) Breadcrumbs
document.addEventListener("DOMContentLoaded", () => {
  const params = new URLSearchParams(window.location.search);

  const tipo = params.get("tipo") || "hotel";
  const ciudad = params.get("ciudad");
  const inicio = params.get("inicio") || "";
  const fin = params.get("fin") || "";

  const breadcrumbBusqueda = document.getElementById("breadcrumb-busqueda");
  // Si existe el breadcrumb de búsqueda, actualizar href
  if (breadcrumbBusqueda && ciudad) {
    breadcrumbBusqueda.href =
      `busquedaDeProducto.html?tipo=${encodeURIComponent(tipo)}` +
      `&destino=${encodeURIComponent(ciudad)}` +
      `&inicio=${encodeURIComponent(inicio)}` +
      `&fin=${encodeURIComponent(fin)}`;
  }

  // Breadcrumb producto
  const nombre = params.get("nombre");
  const breadcrumbProducto = document.getElementById("breadcrumb-producto");
  // Si existe el breadcrumb de producto, actualizar textos
  if (breadcrumbProducto) {
    breadcrumbProducto.textContent = nombre || ciudad || "Producto";
  }
});
