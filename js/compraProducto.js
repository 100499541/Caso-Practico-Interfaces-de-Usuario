// ---------------------------
// COMPRA PRODUCTO
// - Carga alojamiento desde JSON
// - Valida formulario
// - Guarda compra por usuario (localStorage)
// ---------------------------

let alojamientoCompra = null;

function cargarMapa(key) {
  try {
    return JSON.parse(localStorage.getItem(key)) || {};
  } catch {
    return {};
  }
}

function guardarMapa(key, obj) {
  localStorage.setItem(key, JSON.stringify(obj));
}

function getUsuarioActivo() {
  try {
    return JSON.parse(localStorage.getItem("usuarioActivo"));
  } catch {
    return null;
  }
}

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

  fetch("/js/alojamientos-del-mundo.json")
    .then((res) => res.json())
    .then((data) => {
      let alojamiento = null;

      data.continents.forEach((cont) => {
        cont.countries.forEach((country) => {
          country.cities.forEach((city) => {
            if ((city.name || "").toLowerCase() === (ciudad || "").toLowerCase()) {
              alojamiento =
                (city.alojamientos || []).find((a) => a.nombre === nombre) || alojamiento;
            }
          });
        });
      });

      if (!alojamiento) {
        console.error("Alojamiento no encontrado");
        return;
      }

      alojamientoCompra = alojamiento;

      const imgEl = document.getElementById("imagen-principal");
      const nombreAlojEl = document.getElementById("nombre");
      const descEl = document.getElementById("descripcion");
      const precioEl = document.getElementById("precio");
      const serviciosUl = document.getElementById("servicios-lista");
      const checkinEl = document.getElementById("checkin");
      const checkoutEl = document.getElementById("checkout");

      if (imgEl) imgEl.src = alojamiento.imagen;
      if (nombreAlojEl) nombreAlojEl.textContent = alojamiento.nombre;
      if (descEl) descEl.textContent = alojamiento.descripcion;
      if (precioEl) precioEl.textContent = `${alojamiento.precio} ${alojamiento.moneda} pp`;

      if (serviciosUl) {
        serviciosUl.innerHTML = "";
        (alojamiento.servicios || []).forEach((servicio) => {
          const li = document.createElement("li");
          li.textContent = servicio;
          serviciosUl.appendChild(li);
        });
      }

      if (checkinEl) checkinEl.textContent = alojamiento.checkin || "14:00";
      if (checkoutEl) checkoutEl.textContent = alojamiento.checkout || "11:00";
    })
    .catch((err) => {
      console.error("Error cargando alojamiento:", err);
    });
});

//----------------- FORMULARIO DE COMPRA -----------------//
document.addEventListener("DOMContentLoaded", () => {
  const form = document.querySelector(".formulario-compra");
  if (!form) return;

  form.addEventListener("submit", (e) => {
    e.preventDefault();

    const usuario = getUsuarioActivo();
    if (!usuario || !usuario.usuario) {
      alert("Debes iniciar sesión para realizar una compra.");
      window.location.href = "inicioSesion.html";
      return;
    }

    const nombreInput = form.querySelector("#nombre");
    const correoInput = form.querySelector("#correo");
    const tipoTarjetaSelect = form.querySelector("#tipo-tarjeta");
    const numeroTarjetaInput = form.querySelector("#numero-tarjeta");
    const titularInput = form.querySelector("#titular");
    const caducidadInput = form.querySelector("#caducidad");
    const cvvInput = form.querySelector("#cvv");

    const nombre = (nombreInput?.value || "").trim();
    const correo = (correoInput?.value || "").trim();
    const tipoTarjeta = (tipoTarjetaSelect?.value || "");
    const numeroTarjeta = (numeroTarjetaInput?.value || "").trim();
    const titular = (titularInput?.value || "").trim();
    const caducidad = caducidadInput?.value || "";
    const cvv = (cvvInput?.value || "").trim();

    let errores = [];

    if (!/^[A-Za-zÁÉÍÓÚáéíóúÑñ\s]{2,}$/.test(nombre)) {
      errores.push("El nombre debe tener al menos 2 letras y solo contener letras.");
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(correo)) {
      errores.push("Correo electrónico inválido.");
    }

    if (!tipoTarjeta) errores.push("Seleccione un tipo de tarjeta.");

    if (!/^\d{14}$|^\d{16}$/.test(numeroTarjeta)) {
      errores.push("Número de tarjeta inválido (14 o 16 dígitos).");
    }

    if (!/^[A-Za-zÁÉÍÓÚáéíóúÑñ\s]{2,}$/.test(titular)) {
      errores.push("El nombre del titular debe tener al menos 2 letras y solo contener letras.");
    }

    if (!caducidad) {
      errores.push("Seleccione una fecha de caducidad.");
    } else {
      const hoy = new Date();
      const fechaCaducidad = new Date(caducidad + "-01");
      fechaCaducidad.setMonth(fechaCaducidad.getMonth() + 1);
      fechaCaducidad.setDate(0);
      if (fechaCaducidad < hoy) errores.push("La tarjeta ha expirado.");
    }

    if (!/^\d{3}$/.test(cvv)) errores.push("CVV inválido (3 dígitos).");

    if (errores.length > 0) {
      alert("Errores:\n" + errores.join("\n"));
      return;
    }

    const params = new URLSearchParams(window.location.search);
    const ciudad = params.get("ciudad") || "";
    const inicio = params.get("inicio") || "";
    const fin = params.get("fin") || "";
    const tipo = params.get("tipo") || (alojamientoCompra?.tipo || "hotel");

    if (!alojamientoCompra) {
      alert("No se ha podido completar la compra (producto no cargado).");
      return;
    }

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

    guardarCompra(usuario.usuario, compra);

    alert("Compra realizada con éxito.");
    form.reset();
  });

  const botonBorrar = form.querySelector("button[type='reset']");
  if (botonBorrar) {
    botonBorrar.addEventListener("click", () => form.reset());
  }
});
