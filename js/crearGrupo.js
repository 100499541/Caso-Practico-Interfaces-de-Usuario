// Este código gestiona la apertura y cierre de un modal en el apartado social.

// Primero seleccionamos los elementos necesarios del DOM.
const openModal = document.querySelector(".hero__cta");
const modal = document.querySelector(".modal");
const closeModal = document.querySelector(".modal__close");

// Añadimos los event listeners para abrir y cerrar el modal.
openModal.addEventListener("click", (e) => {
    e.preventDefault();
    modal.classList.add("modal--show");
});

// Cerrar el modal al hacer clic en el botón de cerrar.
closeModal.addEventListener("click", (e) => {
    e.preventDefault();
    modal.classList.remove("modal--show");
});

// Cerrar el modal al hacer clic fuera del contenido del modal.
modal.addEventListener('click', (e) => {
    if (e.target === modal) {
        modal.classList.remove('modal--show');
    }
});