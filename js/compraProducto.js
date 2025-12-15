// Este codigo:
// - Carga alojamiento desde JSON
// - Valida formulario
// - Guarda compra por usuario (localStorage)

let alojamientoCompra = null;

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

// Guarda una compra para un usuario específico
function guardarCompra(username, compra) {
  const compras = cargarMapa("viajesComprados");
  const lista = compras[username] || [];
  lista.unshift(compra);
  compras[username] = lista;
  guardarMapa("viajesComprados", compras);
}

document.addEventListener("DOMContentLoaded", () => {
  const params = new URLSearchParams(window.location.search);
  const ciudad = params.get("ciudad");
  const nombre = params.get("nombre");

  // Cargamos los datos del alojamiento desde el JSON
  fetch("/js/alojamientos-del-mundo.json")
    .then((res) => res.json())
    .then((data) => {
      let alojamiento = null;

      // Buscamos el alojamiento correspondiente
      data.continents.forEach((cont) => {
        cont.countries.forEach((country) => {
          country.cities.forEach((city) => {
            // Comparamos ignorando mayusculas/minusculas
            if ((city.name || "").toLowerCase() === (ciudad || "").toLowerCase()) {
              alojamiento =
                (city.alojamientos || []).find((a) => a.nombre === nombre) || alojamiento;
            }
          });
        });
      });

      // Si no se encuentra el alojamiento, mostramos un error
      if (!alojamiento) {
        console.error("Alojamiento no encontrado");
        return;
      }


      alojamientoCompra = alojamiento;

      // Esta parte del codigo se encarga de mostrar los datos del alojamiento en la pagina
      const imgEl = document.getElementById("imagen-principal");
      const nombreAlojEl = document.getElementById("nombre");
      const descEl = document.getElementById("descripcion");
      const precioEl = document.getElementById("precio");
      const serviciosUl = document.getElementById("servicios-lista");
      const checkinEl = document.getElementById("checkin");
      const checkoutEl = document.getElementById("checkout");

      // Rellenamos los elementos con los datos del alojamiento
      if (imgEl) imgEl.src = alojamiento.imagen;
      if (nombreAlojEl) nombreAlojEl.textContent = alojamiento.nombre;
      if (descEl) descEl.textContent = alojamiento.descripcion;
      if (precioEl) precioEl.textContent = `${alojamiento.precio} ${alojamiento.moneda} pp`;

      // Rellenamos la lista de servicios
      if (serviciosUl) {
        serviciosUl.innerHTML = "";
        (alojamiento.servicios || []).forEach((servicio) => {
          const li = document.createElement("li");
          li.textContent = servicio;
          serviciosUl.appendChild(li);
        });
      }

      // Rellenamos los horarios de check-in y check-out
      if (checkinEl) checkinEl.textContent = alojamiento.checkin || "14:00";
      if (checkoutEl) checkoutEl.textContent = alojamiento.checkout || "11:00";
    })
    // Manejamos errores de carga del JSON
    .catch((err) => {
      console.error("Error cargando alojamiento:", err);
    });
});

// Validacion y gestion del formulario de compra
document.addEventListener("DOMContentLoaded", () => {
  const form = document.querySelector(".formulario-compra");
  // Si no hay formulario, no hacemos nada
  if (!form) return;

  // Manejador del evento submit del formulario
  form.addEventListener("submit", (e) => {
    e.preventDefault();

    // Verificamos que haya un usuario activo
    const usuario = getUsuarioActivo();

    // Si no hay usuario, redirigimos al inicio de sesión
    if (!usuario || !usuario.usuario) {
      alert("Debes iniciar sesión para realizar una compra.");
      window.location.href = "inicioSesion.html";
      return;
    }

    // Obtenemos los valores del formulario
    const nombreInput = form.querySelector("#nombre-comprador");
    const correoInput = form.querySelector("#correo");
    const tipoTarjetaSelect = form.querySelector("#tipo-tarjeta");
    const numeroTarjetaInput = form.querySelector("#numero-tarjeta");
    const titularInput = form.querySelector("#titular");
    const caducidadInput = form.querySelector("#caducidad");
    const cvvInput = form.querySelector("#cvv");

    // Validamos los campos del formulario
    const nombre = (nombreInput?.value || "").trim();
    const correo = (correoInput?.value || "").trim();
    const tipoTarjeta = (tipoTarjetaSelect?.value || "");
    const numeroTarjeta = (numeroTarjetaInput?.value || "").trim();
    const titular = (titularInput?.value || "").trim();
    const caducidad = caducidadInput?.value || "";
    const cvv = (cvvInput?.value || "").trim();

    // Array para almacenar mensajes de error
    let errores = [];

    // Validaciones
    if (!/^[A-Za-zÁÉÍÓÚáéíóúÑñ\s]{2,}$/.test(nombre)) {
      errores.push("El nombre debe tener al menos 2 letras y solo contener letras.");
    }

    // Validacion basica de correo electronico
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(correo)) {
      errores.push("Correo electrónico inválido.");
    }

    // Validacion del tipo de tarjeta
    if (!tipoTarjeta) errores.push("Seleccione un tipo de tarjeta.");

    // Validacion del numero de tarjeta (14 o 16 digitos)
    if (!/^\d{14}$|^\d{16}$/.test(numeroTarjeta)) {
      errores.push("Número de tarjeta inválido (14 o 16 dígitos).");
    }

    // Validacion del nombre del titular
    if (!/^[A-Za-zÁÉÍÓÚáéíóúÑñ\s]{2,}$/.test(titular)) {
      errores.push("El nombre del titular debe tener al menos 2 letras y solo contener letras.");
    }

    // Validacion de la fecha de caducidad
    if (!caducidad) {
      errores.push("Seleccione una fecha de caducidad.");
    } else {
      const hoy = new Date();
      const fechaCaducidad = new Date(caducidad + "-01");
      fechaCaducidad.setMonth(fechaCaducidad.getMonth() + 1);
      fechaCaducidad.setDate(0);
      if (fechaCaducidad < hoy) errores.push("La tarjeta ha expirado.");
    }

    // Validacion del CVV (3 digitos)
    if (!/^\d{3}$/.test(cvv)) errores.push("CVV inválido (3 dígitos).");

    // Si hay errores, los mostramos y detenemos el proceso
    if (errores.length > 0) {
      alert("Errores:\n" + errores.join("\n"));
      return;
    }

    // Si todo es valido, procedemos a guardar la compra
    const params = new URLSearchParams(window.location.search);
    const ciudad = params.get("ciudad") || "";
    const inicio = params.get("inicio") || "";
    const fin = params.get("fin") || "";
    const tipo = params.get("tipo") || (alojamientoCompra?.tipo || "hotel");

    // Verificamos que el alojamiento haya sido cargado correctamente
    if (!alojamientoCompra) {
      alert("No se ha podido completar la compra (producto no cargado).");
      return;
    }

    // Creamos el objeto de compra
    const compra = {
      ciudad,
      nombre: alojamientoCompra.nombre,
      tipo,
      imagen: alojamientoCompra.imagen,
      precio: alojamientoCompra.precio,
      moneda: alojamientoCompra.moneda,
      puntuacion: alojamientoCompra.puntuacion,
      rating: alojamientoCompra.rating,
      valoraciones: alojamientoCompra.valoraciones,
      inicio,
      fin,
      compradoEn: new Date().toISOString(),
    };

    // Guardamos la compra para el usuario activo
    guardarCompra(usuario.usuario, compra);

    alert("Compra realizada con éxito.");
    form.reset();
  });

  // Manejador del boton de borrar (reset) del formulario
  const botonBorrar = form.querySelector("button[type='reset']");
  if (botonBorrar) {
    botonBorrar.addEventListener("click", () => form.reset());
  }
});
