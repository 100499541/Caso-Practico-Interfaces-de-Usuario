document.addEventListener('DOMContentLoaded', () => {
  // Menú móvil
  const menuBtn = document.getElementById('menu-btn');
  const mobileMenu = document.getElementById('mobileMenu');
  if (menuBtn && mobileMenu) {
    menuBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      mobileMenu.classList.toggle('visible');
      const expanded = menuBtn.getAttribute('aria-expanded') === 'true';
      menuBtn.setAttribute('aria-expanded', String(!expanded));
    });
    document.addEventListener('click', (e) => {
      if (!mobileMenu.contains(e.target) && !menuBtn.contains(e.target)) {
        mobileMenu.classList.remove('visible');
        menuBtn.setAttribute('aria-expanded', 'false');
      }
    });
  }

  // Carruseles
  const wrappers = document.querySelectorAll('.carousel-wrapper');

  wrappers.forEach((wrapper) => {
    const carousel = wrapper.querySelector('.carousel');
    const leftArrow = wrapper.querySelector('.carousel-arrow.left');
    const rightArrow = wrapper.querySelector('.carousel-arrow.right');

    if (!carousel) return;

    // Garantiza que las flechas capten el clic
    [leftArrow, rightArrow].forEach((arrow) => {
      if (!arrow) return;
      arrow.style.pointerEvents = 'auto';
      arrow.style.zIndex = '1000';
    });

    // Desplazamiento: ancho de la primera card + gap del carrusel
    const getScrollAmount = () => {
      const first = carousel.children[0];
      if (!first) return 0;
      const cardWidth = first.getBoundingClientRect().width;
      const gap = parseFloat(getComputedStyle(carousel).gap) || 0;
      return cardWidth + gap;
    };

    if (leftArrow) {
      leftArrow.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        carousel.scrollBy({ left: -getScrollAmount(), behavior: 'smooth' });
      });
    }

    if (rightArrow) {
      rightArrow.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        carousel.scrollBy({ left: getScrollAmount(), behavior: 'smooth' });
      });
    }

    // Swipe táctil (móvil)
    let startX = 0;
    let startScroll = 0;
    carousel.addEventListener('touchstart', (e) => {
      startX = e.touches[0].clientX;
      startScroll = carousel.scrollLeft;
    }, { passive: true });
    carousel.addEventListener('touchmove', (e) => {
      const dx = e.touches[0].clientX - startX;
      carousel.scrollLeft = startScroll - dx;
    }, { passive: true });
  });

// Reemplazar enlace de login si hay sesión activa
const usuario = JSON.parse(localStorage.getItem("usuarioActivo"));
if (usuario && usuario.foto) {
  const loginDiv = document.querySelector(".login-btn");
  if (loginDiv) {
    // Mostrar foto + botón de cerrar sesión
    loginDiv.innerHTML = `
      <div class="perfil-contenedor">
        <a href="perfil.html" style="background:none; padding:0;">
          <img src="${usuario.foto}" alt="Perfil" class="perfil-mini">
        </a>
        <button id="cerrarSesionBtn" class="cerrar-sesion">Cerrar sesión</button>
      </div>
    `;


    // Evento para cerrar sesión
    const cerrarBtn = document.getElementById("cerrarSesionBtn");
    cerrarBtn.addEventListener("click", () => {
      const confirmacion = confirm("¿Estás seguro de que quieres cerrar sesión?");
      if (confirmacion) {
        // Eliminar usuario activo
        localStorage.removeItem("usuarioActivo");
        // Volver a mostrar el enlace de iniciar sesión
        loginDiv.innerHTML = `<a href="/inicioSesion.html">Iniciar sesión</a>`;
      }
    });
  }
}
})

// Redireccionamiento a busquedaDeProducto.html segun los datos introducidos

document.addEventListener("DOMContentLoaded", () => {
  const form = document.querySelector(".search-form");

  form.addEventListener("submit", (e) => {
    e.preventDefault(); // evita que recargue la página

    const tipoProducto = document.getElementById("tipo-producto").value;
    const destino = document.getElementById("destino").value.trim();
    const inicio = document.getElementById("inicio-viaje").value;
    const fin = document.getElementById("fin-viaje").value;

    // Validación básica
    if (!destino || !inicio || !fin) {
      alert("Por favor, completa todos los campos de búsqueda.");
      return;
    }

    // Si es hotel o hotel+avión → redirige a busquedaDeProducto.html
    if (tipoProducto === "hotel" || tipoProducto === "hotel-avion") {
      // Pasamos los datos por querystring para usarlos en la otra página
      const url = `busquedaDeProducto.html?tipo=${tipoProducto}&destino=${encodeURIComponent(destino)}&inicio=${inicio}&fin=${fin}`;
      window.location.href = url;
    } else {
      // Si es solo avión, de momento mostramos alerta (luego se hará otra sección)
      alert("La búsqueda de vuelos se implementará más adelante.");
    }
  });
});

// Autocompletado y consejos de busquedas

document.addEventListener("DOMContentLoaded", () => {
  const destinoInput = document.getElementById("destino");
  const sugerenciasDiv = document.getElementById("sugerencias");
  let ciudades = [];

  // Cargar el JSON con continentes, países y ciudades
  fetch("/js/ciudades-del-mundo.json")
    .then(res => res.json())
    .then(data => {
      data.continents.forEach(cont => {
        cont.countries.forEach(country => {
          country.cities.forEach(city => {
            ciudades.push({
              ciudad: city.name,
              pais: country.name,
              continente: cont.name
            });
          });
        });
      });
    });

  // Escuchar lo que escribe el usuario
  destinoInput.addEventListener("input", () => {
    const texto = destinoInput.value.toLowerCase();
    sugerenciasDiv.innerHTML = "";

    if (texto.length < 2) return;

    const coincidencias = ciudades.filter(c =>
      c.ciudad.toLowerCase().startsWith(texto) ||
      c.pais.toLowerCase().startsWith(texto)
    );

    coincidencias.slice(0, 5).forEach(c => {
      const opcion = document.createElement("div");
      opcion.textContent = `${c.ciudad}, ${c.pais}`;
      opcion.addEventListener("click", () => {
        destinoInput.value = c.ciudad;
        sugerenciasDiv.innerHTML = "";
      });
      sugerenciasDiv.appendChild(opcion);
    });
  });

  // Ocultar sugerencias si se hace clic fuera
  document.addEventListener("click", (e) => {
    if (!sugerenciasDiv.contains(e.target) && e.target !== destinoInput) {
      sugerenciasDiv.innerHTML = "";
    }
  });
});

document.addEventListener("DOMContentLoaded", () => {
  const carousel = document.querySelector(".destinos-famosos .carousel");

  fetch("/js/ciudades-del-mundo.json")
    .then(res => res.json())
    .then(data => {
      let ciudades = [];

      // Recorrer continentes → países → ciudades
      data.continents.forEach(cont => {
        cont.countries.forEach(country => {
          country.cities.forEach(city => {
            ciudades.push({
              nombre: city.name,
              pais: country.name,
              imagen: city.image?.url || "imagenes/default.jpg",
              alt: city.image?.alt || city.name
            });
          });
        });
      });

      // Seleccionar 4 aleatorias
      const aleatorias = [];
      while (aleatorias.length < 4 && ciudades.length > 0) {
        const idx = Math.floor(Math.random() * ciudades.length);
        aleatorias.push(ciudades.splice(idx, 1)[0]);
      }

      // Renderizar cards
      aleatorias.forEach(c => {
        const card = document.createElement("div");
        card.classList.add("card");
        card.innerHTML = `
          <img src="${c.imagen}" alt="${c.alt}">
          <button class="ver-destino">Ver destino</button>
          <div class="destino-nombre">${c.nombre}, ${c.pais}</div>
        `;
        // Acción del botón
        card.querySelector(".ver-destino").addEventListener("click", () => {
          window.location.href = `destinos.html?ciudad=${encodeURIComponent(c.nombre)}&pais=${encodeURIComponent(c.pais)}`;
        });
        carousel.appendChild(card);
      });
    })
    .catch(err => {
      console.error("Error cargando ciudades:", err);
      carousel.innerHTML = "<p>Error al cargar destinos.</p>";
    });
});

document.addEventListener("DOMContentLoaded", () => {
  const carouselAlojamientos = document.querySelector(".mejores-ofertas .carousel");

  fetch("/js/alojamientos-del-mundo.json")
    .then(res => res.json())
    .then(data => {
      let alojamientos = [];

      // Recorrer continentes → países → ciudades → alojamientos
      data.continents.forEach(cont => {
        cont.countries.forEach(country => {
          country.cities.forEach(city => {
            city.alojamientos.forEach(aloj => {
              alojamientos.push({
                nombre: aloj.nombre,
                ciudad: city.name,
                pais: country.name,
                imagen: aloj.imagen || "imagenes/default.jpg",
                precio: `${aloj.precio} ${aloj.moneda} pp`,
                rating: aloj.rating,
                puntuacion: aloj.puntuacion,
                valoraciones: aloj.valoraciones
              });
            });
          });
        });
      });

      // Seleccionar aleatorios (ejemplo: 6)
      const aleatorias = [];
      while (aleatorias.length < 6 && alojamientos.length > 0) {
        const idx = Math.floor(Math.random() * alojamientos.length);
        aleatorias.push(alojamientos.splice(idx, 1)[0]);
      }

      // Renderizar cards
      aleatorias.forEach(a => {
        const card = document.createElement("div");
        card.classList.add("card");
        card.innerHTML = `
          <img src="${a.imagen}" alt="${a.nombre}">
          <div class="alojamiento-info superpuesta">
            <h4>${a.nombre}</h4>
            <p>${a.ciudad}, ${a.pais}</p>
            <p>${a.rating} – ${a.puntuacion}/10 (${a.valoraciones} valoraciones)</p>
            <p class="precio">${a.precio}</p>
            <button class="ver-alojamiento">Ver alojamiento</button>
          </div>
        `;
        card.querySelector(".ver-alojamiento").addEventListener("click", () => {
          window.location.href = `producto.html?ciudad=${encodeURIComponent(a.ciudad)}&nombre=${encodeURIComponent(a.nombre)}`;
        });
        carouselAlojamientos.appendChild(card);
      });
    })
    .catch(err => {
      console.error("Error cargando alojamientos:", err);
      carouselAlojamientos.innerHTML = "<p>Error al cargar alojamientos.</p>";
    });
});

document.addEventListener("DOMContentLoaded", async () => {
  const carousel = document.querySelector(".reseñas .carousel");

  if (!carousel) {
    console.warn("No se encontró el carrusel de reseñas.");
    return;
  }

  try {
    const res = await fetch("js/usuarios.json");
    const data = await res.json();
    const usuarios = data.usuarios || [];

    carousel.innerHTML = ""; // Limpiar contenido estático

    usuarios.forEach(usuario => {
      const fotoUsuario = usuario.foto || "/imagenes/default_user.png";
      const nombre = usuario.nombre || "Usuario";
      const edad = usuario.edad ? `, ${usuario.edad}` : "";
      const experiencias = Array.isArray(usuario.experiencias) ? usuario.experiencias : [];

      experiencias.forEach(exp => {
        const ciudad = exp.lugar?.ciudad || "Ciudad desconocida";
        const pais = exp.lugar?.pais || "País desconocido";
        const reseña = exp.reseña || "";
        const valoracion = exp.valoracion || "⭐⭐⭐";
        const fotoViaje = exp.foto || "/images/default.jpg";

        const card = document.createElement("div");
        card.className = "review-card";

        card.innerHTML = `
          <div class="usuario-info">
            <img src="${fotoUsuario}" alt="${nombre}">
            <div class="usuario-datos">
              <p class="nombre">${nombre}${edad}</p>
              <p class="ciudad">${ciudad}, ${pais}</p>
            </div>
          </div>
          <p class="texto-review">${reseña}</p>
          <div class="estrellas">${valoracion}</div>
          <img src="${fotoViaje}" alt="${ciudad}" class="imagen-viaje">
        `;

        carousel.appendChild(card);
      });
    });
  } catch (err) {
    console.error("Error cargando reseñas desde usuarios.json", err);
  }
});


document.addEventListener("DOMContentLoaded", async () => {
  const carousel = document.querySelector(".top-viajeros .carousel");
  if (!carousel) return;

  try {
    const [resUsuarios, resCiudades] = await Promise.all([
      fetch("js/usuarios.json"),
      fetch("js/ciudades-del-mundo.json")
    ]);

    const usuarios = (await resUsuarios.json()).usuarios || [];
    const continentes = (await resCiudades.json()).continents || [];

    // --- Ranking 1: más viajes ---
    const viajerosViajes = usuarios.map(u => ({
      nombre: u.nombre,
      foto: u.foto || "/imagenes/default_user.png",
      viajes: u.viajes || 0
    }));
    const topViajes = viajerosViajes.sort((a, b) => b.viajes - a.viajes).slice(0, 3);

    const ranking1 = document.createElement("div");
    ranking1.className = "ranking-card";
    ranking1.innerHTML = `<h4>Top viajeros con más viajes</h4><ol></ol>`;
    topViajes.forEach(v => {
      ranking1.querySelector("ol").innerHTML += `
        <li>${v.nombre} - ${v.viajes} viajes <img src="${v.foto}" alt="${v.nombre}"></li>
      `;
    });

    // --- Ranking 2: más amigos ---
    const viajerosAmigos = usuarios.map(u => ({
      nombre: u.nombre,
      foto: u.foto || "/imagenes/default_user.png",
      amigos: u.amigos || 0
    }));
    const topAmigos = viajerosAmigos.sort((a, b) => b.amigos - a.amigos).slice(0, 3);

    const ranking2 = document.createElement("div");
    ranking2.className = "ranking-card";
    ranking2.innerHTML = `<h4>Top viajeros con más amigos</h4><ol></ol>`;
    topAmigos.forEach(v => {
      ranking2.querySelector("ol").innerHTML += `
        <li>${v.nombre} - ${v.amigos} amigos <img src="${v.foto}" alt="${v.nombre}"></li>
      `;
    });

    // --- Ranking 3: destinos más visitados (aleatorios desde ciudades-del-mundo.json) ---
    // Recoger todos los países del archivo
    const todosPaises = [];
    continentes.forEach(cont => {
      cont.countries.forEach(c => {
        todosPaises.push({
          nombre: c.name,
          imagen: c.image?.url || "/images/default.jpg"
        });
      });
    });

    // Seleccionar 3 países aleatorios distintos
    const paisesAleatorios = [];
    while (paisesAleatorios.length < 3 && todosPaises.length > 0) {
      const idx = Math.floor(Math.random() * todosPaises.length);
      paisesAleatorios.push(todosPaises.splice(idx, 1)[0]);
    }

    // Asignar visitas aleatorias ordenadas
    const base = Math.floor(Math.random() * 50) + 100;
    paisesAleatorios[0].visitas = base;
    paisesAleatorios[1].visitas = base - Math.floor(Math.random() * 20 + 10);
    paisesAleatorios[2].visitas = paisesAleatorios[1].visitas - Math.floor(Math.random() * 10 + 5);

    const ranking3 = document.createElement("div");
    ranking3.className = "ranking-card";
    ranking3.innerHTML = `<h4>Top destinos más visitados</h4><ol></ol>`;
    paisesAleatorios.forEach(p => {
      ranking3.querySelector("ol").innerHTML += `
        <li>${p.nombre} - ${p.visitas} visitas <img src="${p.imagen}" alt="${p.nombre}"></li>
      `;
    });

    // Añadir rankings al carrusel
    carousel.innerHTML = "";
    carousel.appendChild(ranking1);
    carousel.appendChild(ranking2);
    carousel.appendChild(ranking3);
  } catch (err) {
    console.error("Error cargando rankings de viajeros", err);
  }
});



