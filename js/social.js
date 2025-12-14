// js/social.js

document.addEventListener("DOMContentLoaded", async () => {

  // 1. Viajeros similares (sugerencias dinámicas)
  const viajerosContainer = document.getElementById("viajeros-similares");

  async function cargarViajerosSugeridos() {
    try {
      const res = await fetch("js/usuarios.json");
      const data = await res.json();
      const usuarioActivo = JSON.parse(localStorage.getItem("usuarioActivo"));
      const amigosActuales = usuarioActivo?.amigos || [];

      // Sugeridos: cualquier usuario que NO sea el activo y NO esté en tu lista de amigos
      const sugeridos = data.usuarios.filter(u =>
        u.id !== usuarioActivo?.id && !amigosActuales.includes(u.id)
      );

      viajerosContainer.innerHTML = "";

      sugeridos.forEach(usuario => {
        const div = document.createElement("div");
        div.className = "avatar-item";
        div.setAttribute("data-user-id", usuario.id);
        div.innerHTML = `
          <div class="avatar-circle">
            <img src="${usuario.foto}" alt="${usuario.nombre}">
          </div>
          <span style="font-size:0.75em; font-weight:500; color:#333; display:block; max-width:100px; white-space:nowrap; overflow:hidden; text-overflow:ellipsis;">${usuario.nombre}</span>
        `;

        div.addEventListener("click", () => {
          mostrarSolicitudAmistad(usuario);
        });

        viajerosContainer.appendChild(div);
      });
    } catch (err) {
      console.error("Error cargando viajeros sugeridos", err);
    }
  }

  await cargarViajerosSugeridos();

  // 1.1 Popup: enviar solicitud de amistad
  function mostrarSolicitudAmistad(usuario) {
    const existente = document.querySelector(".solicitud-popup");
    if (existente) existente.remove();

    const popup = document.createElement("div");
    popup.className = "solicitud-popup";
    popup.innerHTML = `
      <p>¿Enviar solicitud de amistad a <strong>${usuario.nombre}</strong>?</p>
      <div style="display:flex; gap:10px; justify-content:center; margin-top:10px;">
        <button id="btn-solicitud">Enviar solicitud</button>
        <button id="btn-cerrar">Cancelar</button>
      </div>
    `;

    Object.assign(popup.style, {
      position: "fixed",
      top: "50%",
      left: "50%",
      transform: "translate(-50%, -50%)",
      background: "#fff",
      border: "2px solid #0097A7",
      borderRadius: "10px",
      padding: "20px",
      boxShadow: "0 4px 12px rgba(0,0,0,0.2)",
      zIndex: "9999",
      textAlign: "center",
      maxWidth: "320px"
    });

    document.body.appendChild(popup);

    const btnCerrar = popup.querySelector("#btn-cerrar");
    const btnSolicitud = popup.querySelector("#btn-solicitud");

    btnCerrar.addEventListener("click", () => {
      popup.remove();
    });

    btnSolicitud.addEventListener("click", () => {
      // Evitar dobles clics que dejen el popup colgado
      btnSolicitud.disabled = true;
      btnCerrar.disabled = true;

      // 1. Añadir usuario a lista de amigos
      const usuarioActivo = JSON.parse(localStorage.getItem("usuarioActivo"));
      if (usuarioActivo && Array.isArray(usuarioActivo.amigos)) {
        if (!usuarioActivo.amigos.includes(usuario.id)) {
          usuarioActivo.amigos.push(usuario.id);
          localStorage.setItem("usuarioActivo", JSON.stringify(usuarioActivo));
        }
      }

      // 2. Añadir notificación de aceptación
      const notificaciones = JSON.parse(localStorage.getItem("notificaciones")) || [];
      notificaciones.push({
        tipo: "amistad",
        mensaje: `${usuario.nombre} ha aceptado tu solicitud de amistad.`,
        fecha: new Date().toISOString(),
        visto: false
      });
      localStorage.setItem("notificaciones", JSON.stringify(notificaciones));

      // 3. Actualizar UI: amigos y sugeridos
      mostrarAmigos();
      const avatar = document.querySelector(`.avatar-item[data-user-id="${usuario.id}"]`);
      if (avatar) avatar.remove();

      // 4. Actualizar contador de solicitudes
      actualizarContadorSolicitudes();

      // 5. Confirmación y cierre
      alert(`Solicitud enviada y aceptada por ${usuario.nombre}`);
      popup.remove();
    });

    // Cerrar con ESC una sola vez
    const escHandler = (e) => {
      if (e.key === "Escape") {
        popup.remove();
        document.removeEventListener("keydown", escHandler);
      }
    };
    document.addEventListener("keydown", escHandler);
  }

  // 2. Tus amigos (sidebar) desde LocalStorage + JSON
  const amigosContainer = document.getElementById("lista-amigos");

  async function cargarUsuariosFicticios() {
    try {
      const res = await fetch("js/usuarios.json");
      const data = await res.json();
      return data.usuarios;
    } catch (err) {
      console.error("Error cargando usuarios.json", err);
      return [];
    }
  }

  async function mostrarAmigos() {
    const usuarioActivo = JSON.parse(localStorage.getItem("usuarioActivo"));
    if (!usuarioActivo || !usuarioActivo.amigos) return;

    const usuariosFicticios = await cargarUsuariosFicticios();
    amigosContainer.innerHTML = "";

    usuarioActivo.amigos.forEach(amigoId => {
      const amigo = usuariosFicticios.find(u => u.id === amigoId);
      if (amigo) {
        const div = document.createElement("div");
        div.className = "friend-avatar";
        div.setAttribute("data-user-id", amigo.id);
        div.innerHTML = `
          <img src="${amigo.foto}" alt="${amigo.nombre}" style="width:50px; height:50px; border-radius:50%; object-fit:cover; border:2px solid #0097A7;">
          <span style="font-size:0.8em; margin-top:4px; text-align:center;">${amigo.nombre}</span>
        `;

        // Clic → eliminar amigo
        div.addEventListener("click", () => {
          mostrarEliminarAmigo(amigo);
        });

        amigosContainer.appendChild(div);
      }
    });
  }

  await mostrarAmigos();

  // 2.1 Popup: eliminar amigo
  function mostrarEliminarAmigo(amigo) {
    const existente = document.querySelector(".solicitud-popup");
    if (existente) existente.remove();

    const popup = document.createElement("div");
    popup.className = "solicitud-popup";
    popup.innerHTML = `
      <p>¿Eliminar a <strong>${amigo.nombre}</strong> de tus amigos?</p>
      <div style="display:flex; gap:10px; justify-content:center; margin-top:10px;">
        <button id="btn-eliminar">Eliminar</button>
        <button id="btn-cerrar">Cancelar</button>
      </div>
    `;

    Object.assign(popup.style, {
      position: "fixed",
      top: "50%",
      left: "50%",
      transform: "translate(-50%, -50%)",
      background: "#fff",
      border: "2px solid #0097A7",
      borderRadius: "10px",
      padding: "20px",
      boxShadow: "0 4px 12px rgba(0,0,0,0.2)",
      zIndex: "9999",
      textAlign: "center",
      maxWidth: "320px"
    });

    document.body.appendChild(popup);

    const btnCerrar = popup.querySelector("#btn-cerrar");
    const btnEliminar = popup.querySelector("#btn-eliminar");

    btnCerrar.addEventListener("click", () => {
      popup.remove();
    });

    btnEliminar.addEventListener("click", () => {
      // Evitar dobles clics
      btnEliminar.disabled = true;
      btnCerrar.disabled = true;

      // 1. Eliminar de la lista de amigos
      const usuarioActivo = JSON.parse(localStorage.getItem("usuarioActivo"));
      if (usuarioActivo && Array.isArray(usuarioActivo.amigos)) {
        usuarioActivo.amigos = usuarioActivo.amigos.filter(id => id !== amigo.id);
        localStorage.setItem("usuarioActivo", JSON.stringify(usuarioActivo));
      }

      // 2. Añadir notificación de eliminación
      const notificaciones = JSON.parse(localStorage.getItem("notificaciones")) || [];
      notificaciones.push({
        tipo: "amistad",
        mensaje: `Has eliminado a ${amigo.nombre} de tus amigos.`,
        fecha: new Date().toISOString(),
        visto: false
      });
      localStorage.setItem("notificaciones", JSON.stringify(notificaciones));

      // 3. Actualizar UI: amigos y sugeridos
      mostrarAmigos();
      cargarViajerosSugeridos();

      // 4. Actualizar contador de solicitudes
      actualizarContadorSolicitudes();

      // 5. Confirmación y cierre
      alert(`${amigo.nombre} ha sido eliminado de tus amigos.`);
      popup.remove();
    });

    // Cerrar con ESC una sola vez
    const escHandler = (e) => {
      if (e.key === "Escape") {
        popup.remove();
        document.removeEventListener("keydown", escHandler);
      }
    };
    document.addEventListener("keydown", escHandler);
  }

    // 3. Panel de notificaciones: abrir/cerrar y renderizar lista
    const btnNotificaciones = document.getElementById("btn-notificaciones");

    if (btnNotificaciones) {
    btnNotificaciones.addEventListener("click", () => {
        const panel = document.getElementById("panel-notificaciones");
        if (!panel) return;

        // Mostrar/ocultar panel
        panel.classList.toggle("oculto");

        // Rellenar solicitudes
        mostrarSolicitudes();

        // ✅ Marcar todas las notificaciones como vistas
        let notificaciones = JSON.parse(localStorage.getItem("notificaciones")) || [];
        notificaciones = notificaciones.map(n => ({ ...n, visto: true }));
        localStorage.setItem("notificaciones", JSON.stringify(notificaciones));

        // ✅ Reiniciar contador al abrir el panel
        actualizarContadorSolicitudes();
    });
    }


    // ✅ Cerrar panel con la X
    const btnCerrarPanel = document.getElementById("cerrar-panel-notificaciones");
    if (btnCerrarPanel) {
    btnCerrarPanel.addEventListener("click", () => {
        const panel = document.getElementById("panel-notificaciones");
        if (panel) panel.classList.add("oculto");
    });
    }


  function mostrarSolicitudes() {
    const contenedor = document.getElementById("lista-solicitudes");
    if (!contenedor) return;

    const notificaciones = JSON.parse(localStorage.getItem("notificaciones")) || [];
    contenedor.innerHTML = "";

    if (notificaciones.length === 0) {
      contenedor.innerHTML = `<div class="notificacion-item">No tienes solicitudes ni notificaciones por ahora.</div>`;
      return;
    }

    notificaciones
      .slice()
      .reverse() // mostrar las más recientes primero
      .forEach(n => {
        const div = document.createElement("div");
        div.className = "notificacion-item";
        div.innerHTML = `
          <span>${n.mensaje}</span>
          <div style="font-size:0.75em; color:#777; margin-top:4px;">${new Date(n.fecha).toLocaleString()}</div>
        `;
        contenedor.appendChild(div);
      });
  }

  // 3.1 Contador rojo junto al 🔔
    function actualizarContadorSolicitudes() {
    const notificaciones = JSON.parse(localStorage.getItem("notificaciones")) || [];
    const noVistas = notificaciones.filter(n => !n.visto);
    const contador = document.getElementById("contador-solicitudes");
    if (contador) {
        contador.textContent = String(noVistas.length);
        contador.style.display = noVistas.length > 0 ? "inline-block" : "none";
    }
    }


  // Inicializar contador al cargar
  actualizarContadorSolicitudes();

  // 4. Anuncios oficiales (carrusel)
  async function cargarAnuncios() {
    try {
      const res = await fetch("js/anuncios-oficiales.json");
      const data = await res.json();
      const anuncios = data.anunciosOficiales || [];
      const carrusel = document.getElementById("carrusel-anuncios");
      if (!carrusel) return;

      carrusel.innerHTML = "";

      anuncios.forEach(anuncio => {
        const card = document.createElement("div");
        card.className = "anuncio-card";
        card.innerHTML = `
          <div class="anuncio-img">
            <img src="${anuncio.imagen}" alt="${anuncio.titulo}">
          </div>
          <div class="anuncio-info">
            <h4>${anuncio.titulo}</h4>
            <p>${anuncio.descripcion}</p>
            <span class="anuncio-fecha">${anuncio.fecha}</span>
          </div>
        `;
        carrusel.appendChild(card);
      });

    } catch (err) {
      console.error("Error cargando anuncios-oficiales.json", err);
    }
  }

  await cargarAnuncios();

  // 5. Botones de acción (demo)
  document.querySelectorAll(".action-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      const action = btn.querySelector("span")?.textContent || "Acción";
      // Mantener simple para el MVP
      // alert(`Abriendo sección: ${action}`);


  // 6. Panel de Añadir Amigos
    const btnAnadirAmigos = document.querySelector(".action-btn:nth-child(2)"); // segundo botón
    if (btnAnadirAmigos) {
    btnAnadirAmigos.addEventListener("click", () => {
        const panel = document.getElementById("panel-anadir-amigos");
        if (!panel) return;
        panel.classList.toggle("oculto");
    });
    }

    // Cerrar panel con la X
    const btnCerrarAnadir = document.getElementById("cerrar-panel-anadir");
    if (btnCerrarAnadir) {
    btnCerrarAnadir.addEventListener("click", () => {
        const panel = document.getElementById("panel-anadir-amigos");
        if (panel) panel.classList.add("oculto");
    });
    }

    // Buscar usuarios por nombre
    const btnBuscarAmigos = document.getElementById("btn-buscar-amigos");
    if (btnBuscarAmigos) {
    btnBuscarAmigos.addEventListener("click", async () => {
        const input = document.getElementById("buscar-amigos-input");
        const query = input.value.trim().toLowerCase();
        const resultadosContainer = document.getElementById("resultados-busqueda-amigos");

        if (!query) {
        resultadosContainer.innerHTML = `<div class="notificacion-item">Introduce un nombre para buscar.</div>`;
        return;
        }

        try {
        const res = await fetch("js/usuarios.json");
        const data = await res.json();
        const usuarios = data.usuarios || [];

        const resultados = usuarios.filter(u => u.nombre.toLowerCase().includes(query));

        resultadosContainer.innerHTML = "";

        if (resultados.length === 0) {
            resultadosContainer.innerHTML = `<div class="notificacion-item">No se encontraron usuarios.</div>`;
        } else {
            resultados.forEach(usuario => {
            const div = document.createElement("div");
            div.className = "resultado-item";
            div.innerHTML = `
                <strong>${usuario.nombre}</strong><br>
                <span style="font-size:0.75em; color:#777;">${usuario.id}</span>
            `;
            div.addEventListener("click", () => {
                mostrarSolicitudAmistad(usuario); // reutilizamos tu popup existente
            });
            resultadosContainer.appendChild(div);
            });
        }
        } catch (err) {
        console.error("Error buscando usuarios", err);
        }
    });
    }

    const btnBorrarBusqueda = document.getElementById("btn-borrar-busqueda");
    if (btnBorrarBusqueda) {
    btnBorrarBusqueda.addEventListener("click", () => {
        const input = document.getElementById("buscar-amigos-input");
        const resultadosContainer = document.getElementById("resultados-busqueda-amigos");
        input.value = "";
        resultadosContainer.innerHTML = `<div class="notificacion-item">Introduce un nombre para buscar.</div>`;
    });
    }

    });
  });
});