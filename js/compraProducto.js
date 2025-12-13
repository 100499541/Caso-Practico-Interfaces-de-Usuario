document.addEventListener("DOMContentLoaded", () => {
  const params = new URLSearchParams(window.location.search);
  const ciudad = params.get("ciudad");
  const nombre = params.get("nombre");

  // Cargar alojamientos desde el JSON
  fetch("/js/alojamientos-del-mundo.json")
    .then(res => res.json())
    .then(data => {
      let alojamiento = null;

      // Buscar el alojamiento por ciudad y nombre
      data.continents.forEach(cont => {
        cont.countries.forEach(country => {
          country.cities.forEach(city => {
            if (city.name.toLowerCase() === (ciudad || "").toLowerCase()) {
              alojamiento = city.alojamientos.find(a => a.nombre === nombre);
            }
          });
        });
      });

      if (!alojamiento) {
        console.error("Alojamiento no encontrado");
        return;
      }

      // Pintar datos en la columna izquierda
      const imgEl = document.getElementById("imagen-principal");
      const nombreAlojEl = document.getElementById("nombre"); // h3 del alojamiento
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
        alojamiento.servicios.forEach(servicio => {
          const li = document.createElement("li");
          li.textContent = servicio;
          serviciosUl.appendChild(li);
        });
      }

      if (checkinEl) checkinEl.textContent = alojamiento.checkin || "14:00";
      if (checkoutEl) checkoutEl.textContent = alojamiento.checkout || "11:00";
    })
    .catch(err => {
      console.error("Error cargando alojamiento:", err);
    });
});

//----------------- FORMULARIO DE COMPRA -----------------//
document.addEventListener("DOMContentLoaded", () => {
  const form = document.querySelector(".formulario-compra");
  if (!form) return;

  form.addEventListener("submit", (e) => {
    e.preventDefault();

    // Selecciones SCOPED al formulario (evita colisión con el h3#nombre del alojamiento)
    const nombreInput = form.querySelector("#nombre");
    const correoInput = form.querySelector("#correo");
    const tipoTarjetaSelect = form.querySelector("#tipo-tarjeta");
    const numeroTarjetaInput = form.querySelector("#numero-tarjeta");
    const titularInput = form.querySelector("#titular");
    const caducidadInput = form.querySelector("#caducidad"); // type="month"
    const cvvInput = form.querySelector("#cvv");

    const nombre = (nombreInput?.value || "").trim();
    const correo = (correoInput?.value || "").trim();
    const tipoTarjeta = (tipoTarjetaSelect?.value || "");
    const numeroTarjeta = (numeroTarjetaInput?.value || "").trim();
    const titular = (titularInput?.value || "").trim();
    const caducidad = (caducidadInput?.value || "");
    const cvv = (cvvInput?.value || "").trim();

    let errores = [];

    // Validaciones
    if (!/^[A-Za-zÁÉÍÓÚáéíóúÑñ\s]{2,}$/.test(nombre)) {
      errores.push("El nombre debe tener al menos 2 letras y solo contener letras.");
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(correo)) {
      errores.push("Correo electrónico inválido.");
    }

    if (!tipoTarjeta) {
      errores.push("Seleccione un tipo de tarjeta.");
    }

    if (!/^\d{14}$|^\d{16}$/.test(numeroTarjeta)) {
      errores.push("Número de tarjeta inválido (14 o 16 dígitos).");
    }

    if (!/^[A-Za-zÁÉÍÓÚáéíóúÑñ\s]{2,}$/.test(titular)) {
      errores.push("El nombre del titular debe tener al menos 2 letras y solo contener letras.");
    }

    if (!caducidad) {
      errores.push("Seleccione una fecha de caducidad.");
    } else {
      // caducidad formato YYYY-MM (input type="month")
      const hoy = new Date();
      const fechaCaducidad = new Date(caducidad + "-01");
      // Ajuste a fin de mes de caducidad para ser más justo
      fechaCaducidad.setMonth(fechaCaducidad.getMonth() + 1);
      fechaCaducidad.setDate(0);
      if (fechaCaducidad < hoy) {
        errores.push("La tarjeta ha expirado.");
      }
    }

    if (!/^\d{3}$/.test(cvv)) {
      errores.push("CVV inválido (3 dígitos).");
    }

    // Mostrar errores o éxito
    if (errores.length > 0) {
      alert("Errores:\n" + errores.join("\n"));
      return;
    }

    alert("Compra realizada con éxito.");
    form.reset();
  });

  // Botón borrar
  const botonBorrar = form.querySelector("button[type='reset']");
  if (botonBorrar) {
    botonBorrar.addEventListener("click", () => {
      form.reset();
    });
  }
});