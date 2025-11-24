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

    // Mover carrusel a la izquierda
    leftArrow.addEventListener("click", function() {
      carousel.scrollBy({
        left: -carousel.offsetWidth * 0.8, 
        behavior: "smooth"
      });
    });

    // Mover carrusel a la derecha
    rightArrow.addEventListener("click", function() {
      carousel.scrollBy({
        left: carousel.offsetWidth * 0.8,
        behavior: "smooth"
      });
    });
  });
});
