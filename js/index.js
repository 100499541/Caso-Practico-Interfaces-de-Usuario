document.addEventListener("DOMContentLoaded", function () {
  // ---------------------- MENÚ RESPONSIVE ----------------------
  var menuBtn = document.getElementById("menu-btn");
  var nav = document.getElementById("nav");

  menuBtn.addEventListener("click", function () {
    nav.classList.toggle("active");
  });

  // ---------------------- CARRUSELES ----------------------
  var carousels = document.querySelectorAll(".carousel-wrapper");

  carousels.forEach(function(wrapper) {
    var carousel = wrapper.querySelector(".carousel");
    var leftArrow = wrapper.querySelector(".carousel-arrow.left");
    var rightArrow = wrapper.querySelector(".carousel-arrow.right");

    // Detectar si es carrusel de reseñas o top viajeros
    var isSmallCarousel = wrapper.closest(".reseñas") || wrapper.closest(".top-viajeros");

    // Calcular ancho de desplazamiento: 1 elemento
    function getScrollAmount() {
      var firstChild = carousel.children[0];
      if (!firstChild) return 0;
      var style = window.getComputedStyle(firstChild);
      var marginRight = parseInt(style.marginRight) || 0;
      return firstChild.offsetWidth + marginRight;
    }

    // Mover carrusel a la izquierda
    leftArrow.addEventListener("click", function() {
      carousel.scrollBy({
        left: -getScrollAmount(),
        behavior: "smooth"
      });
    });

    // Mover carrusel a la derecha
    rightArrow.addEventListener("click", function() {
      carousel.scrollBy({
        left: getScrollAmount(),
        behavior: "smooth"
      });
    });
  });
});