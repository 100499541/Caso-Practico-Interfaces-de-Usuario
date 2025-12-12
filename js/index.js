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


