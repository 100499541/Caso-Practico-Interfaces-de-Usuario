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
        <a href="perfil.html">
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
