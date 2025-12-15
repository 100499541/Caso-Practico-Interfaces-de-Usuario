// js/social.js

document.addEventListener("DOMContentLoaded", async () => {

  let usuarioActivo = JSON.parse(localStorage.getItem("usuarioActivo"));
  let usuarioActual = null;

  // 1. Viajeros similares (sugerencias dinámicas)
  const viajerosContainer = document.getElementById("viajeros-similares");

    async function mostrarChats() {
    const usuarioActivo = JSON.parse(localStorage.getItem("usuarioActivo"));
    if (!usuarioActivo || !usuarioActivo.amigos) return;

    // Cargar usuarios ficticios de usuarios.json
    const usuariosFicticios = await cargarUsuariosFicticios();
    const amigos = usuariosFicticios.filter(u => usuarioActivo.amigos.includes(u.id));

    const contenedorAmigos = document.getElementById("amigos-horizontal");
    const contenedorChatsPanel = document.getElementById("lista-chats-panel"); // panel lateral de Mensajes
    const contenedorChatsSidebar = document.getElementById("lista-chats");     // recuadro blanco de la sidebar

    contenedorAmigos.innerHTML = "";
    contenedorChatsPanel.innerHTML = "";
    contenedorChatsSidebar.innerHTML = "";

    // Miniaturas horizontales
    amigos.forEach(amigo => {
        const mini = document.createElement("div");
        mini.className = "friend-avatar";
        mini.innerHTML = `
        <img src="${amigo.foto}" alt="${amigo.nombre}">
        <span style="font-size:0.7em; margin-top:4px;">${amigo.nombre}</span>
        `;
        mini.addEventListener("click", () => abrirChatConUsuario(amigo));
        contenedorAmigos.appendChild(mini);
    });

    // Previews en el panel lateral (Mensajes)
    amigos.forEach(amigo => {
        const chat = document.createElement("div");
        chat.className = "chat-preview";
        chat.innerHTML = `
        <img src="${amigo.foto}" alt="${amigo.nombre}">
        <div>
            <strong>${amigo.nombre}</strong><br>
            <span style="font-size:0.8em; color:#555;">${amigo.ultimoMensaje || ""}</span>
        </div>
        `;
        chat.addEventListener("click", () => abrirChatConUsuario(amigo));
        contenedorChatsPanel.appendChild(chat);
    });

    // Previews en el recuadro blanco de la sidebar (último mensaje guardado)
    const conversaciones = JSON.parse(localStorage.getItem("conversaciones")) || {};
    const historialUsuario = conversaciones[usuarioActivo.id] || {};

    Object.entries(historialUsuario).forEach(([contactoID, mensajesGuardados]) => {
        const contacto = usuariosFicticios.find(u => u.id === contactoID);
        if (!contacto) return;

        const ultimoMensaje = mensajesGuardados[mensajesGuardados.length - 1] || "";

        const preview = document.createElement("div");
        preview.className = "chat-preview";
        preview.innerHTML = `
        <img src="${contacto.foto}" alt="${contacto.nombre}">
        <div>
            <strong>${contacto.nombre}</strong><br>
            <span style="font-size:0.8em; color:#555;">${ultimoMensaje}</span>
        </div>
        `;
        preview.addEventListener("click", () => abrirChatDesdeSidebar(contacto));
        contenedorChatsSidebar.appendChild(preview);
    });
    }

    // Función para iniciar chat con un usuario
    function abrirChatConUsuario(usuario) {
    const encabezado = document.getElementById("chat-encabezado");
    const mensajes = document.getElementById("chat-mensajes");
    const conversacion = document.getElementById("chat-conversacion");
    const lista = document.getElementById("lista-chats-panel");
    const amigos = document.getElementById("amigos-horizontal");

    // Estado aleatorio
    const estado = Math.random() < 0.5 ? "Activo" : "Inactivo";

    encabezado.innerHTML = `
        <img src="${usuario.foto}" alt="${usuario.nombre}">
        <div>
        <strong>${usuario.nombre}</strong><br>
        <span class="estado">${estado}</span>
        </div>
    `;

    // El usuario actual es el de sesión
    usuarioActual = usuario;

    mensajes.innerHTML = "";

    // Pintar el mensaje inicial del contacto al principio
    const msgContacto = document.createElement("div");
    msgContacto.className = "mensaje";
    msgContacto.textContent = usuario.ultimoMensaje || "Hola, ¿cómo estás?";
    mensajes.appendChild(msgContacto);

    // Cargar historial desde localStorage
    const conversaciones = JSON.parse(localStorage.getItem("conversaciones")) || {};
    const userID = usuarioActivo?.id;
    const contactoID = usuario.id;
    const historial = conversaciones[userID]?.[contactoID] || [];

    // Pintar tus mensajes guardados después
    historial.forEach(texto => {
    const msg = document.createElement("div");
    msg.className = "mensaje mensaje-propio";
    msg.textContent = texto;
    mensajes.appendChild(msg);
    });

    conversacion.classList.remove("oculto");
    lista.style.display = "none";     // oculta lista de chats
    amigos.style.display = "none";    // oculta amigos
    }

    // Funcionalidad para enviar mensajes al chat
    const inputMensaje = document.getElementById("mensaje-input");
    const btnEnviar = document.getElementById("enviar-mensaje");
    const contenedorMensajes = document.getElementById("chat-mensajes");

    // Función para enviar mensajes en los chats
    function enviarMensaje() {
    const texto = inputMensaje.value.trim();
    if (!texto || !usuarioActivo || !usuarioActual) return;

    const nuevoMensaje = document.createElement("div");
    nuevoMensaje.className = "mensaje mensaje-propio";
    nuevoMensaje.textContent = texto;
    contenedorMensajes.appendChild(nuevoMensaje);
    inputMensaje.value = "";
    contenedorMensajes.scrollTop = contenedorMensajes.scrollHeight;

    // Guardar las converasciones en localStorage para que no desaparezcan
    const conversaciones = JSON.parse(localStorage.getItem("conversaciones")) || {};
    const userID = usuarioActivo.id;
    const contactoID = usuarioActual.id;

    if (!conversaciones[userID]) conversaciones[userID] = {};
    if (!conversaciones[userID][contactoID]) conversaciones[userID][contactoID] = [];

    conversaciones[userID][contactoID].push(texto);
    localStorage.setItem("conversaciones", JSON.stringify(conversaciones));
    }

    btnEnviar.addEventListener("click", enviarMensaje);

    inputMensaje.addEventListener("keydown", (e) => {
    if (e.key === "Enter") {
        e.preventDefault();
        enviarMensaje();
    }
    });

    // Función para cargar el apartado de viajeros sugeridos
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

      // Cada viajero con su nombre y foto de perfil
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

    // Asignación específica de css para no liarse
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

    // Hacer click para cerrar
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

  // Función para cargar los usuarios desde usuarios.json
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

  // Función para mostrar tus amigos/contactos
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

    // Asignación específica de css para no liarse
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

    // Hacer click para cerrar
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

        // Marcar todas las notificaciones como vistas
        let notificaciones = JSON.parse(localStorage.getItem("notificaciones")) || [];
        notificaciones = notificaciones.map(n => ({ ...n, visto: true }));
        localStorage.setItem("notificaciones", JSON.stringify(notificaciones));

        // Reiniciar contador al abrir el panel
        actualizarContadorSolicitudes();
    });
    }


    // Cerrar panel con la X
    const btnCerrarPanel = document.getElementById("cerrar-panel-notificaciones");
    if (btnCerrarPanel) {
    btnCerrarPanel.addEventListener("click", () => {
        const panel = document.getElementById("panel-notificaciones");
        if (panel) panel.classList.add("oculto");
    });
    }


    // Función para mostrar notificaciones y solicitudes
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

  // 3.1 Contador rojo junto a la campana de Solicitudes
    function actualizarContadorSolicitudes() {
    const notificaciones = JSON.parse(localStorage.getItem("notificaciones")) || [];
    const noVistas = notificaciones.filter(n => !n.visto);
    const contador = document.getElementById("contador-solicitudes");
    if (contador) {
        contador.textContent = String(noVistas.length);
        contador.style.display = noVistas.length > 0 ? "inline-block" : "none";
    }
    }


  // Inicializar y actualizar contador al cargar
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

      // Crear cada anuncio en el carrusel
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

    // 5. Experiencias de amigos (carrusel)
    async function cargarExperiencias() {
    try {
        const usuarios = await cargarUsuariosFicticios(); // tu fuente de usuarios
        const carrusel = document.getElementById("carrusel-experiencias");
        if (!carrusel) return;

        carrusel.innerHTML = "";

        // Acumular todas las experiencias de todos los usuarios
        const todasExperiencias = [];
        usuarios.forEach(usuario => {
        if (!usuario.experiencias) return;
        usuario.experiencias.forEach(exp => {
            todasExperiencias.push({ usuario, exp });
        });
        });

        // Limitar a solo 5 experiencias
        const experienciasLimitadas = todasExperiencias.slice(0, 5);

        // Pintar las 5 experiencias
        experienciasLimitadas.forEach(({ usuario, exp }) => {
        const card = document.createElement("div");
        card.className = "experiencia-card";
        card.innerHTML = `
            <div class="experiencia-img">
            <img src="${exp.foto || 'https://via.placeholder.com/300x150?text=Foto+de+viaje'}" alt="${usuario.nombre}">
            </div>
            <div class="experiencia-info">
            <h4>${usuario.nombre} en ${exp.lugar.ciudad}, ${exp.lugar.pais}</h4>
            <p>${exp.reseña}</p>
            <span class="experiencia-valoracion">${exp.valoracion}</span><br>
            <span class="experiencia-fecha">${exp.fecha}</span>
            </div>
        `;
        carrusel.appendChild(card);
        });

    } catch (err) {
        console.error("Error cargando experiencias", err);
    }
    }

  // Cargar anuncios y experiencias
  await cargarAnuncios();
  await cargarExperiencias();

  // 6. Botones de acción (demo)
  document.querySelectorAll(".action-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      const action = btn.querySelector("span")?.textContent || "Acción";
      // Mantener simple para el MVP
      // alert(`Abriendo sección: ${action}`);


  // 7. Panel de Añadir Amigos
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

    // Buscar usuarios por nombre en barra de busqueda
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

        const usuarioActivo = JSON.parse(localStorage.getItem("usuarioActivo"));
        const amigosActuales = usuarioActivo?.amigos || [];

        const resultados = usuarios.filter(u => 
        u.nombre.toLowerCase().includes(query) &&
        !amigosActuales.includes(u.id) && // no mostrar si ya es amigo
        u.id !== usuarioActivo?.id         // no mostrarte a ti mismo
        );


        resultadosContainer.innerHTML = "";

        if (resultados.length === 0) {
        resultadosContainer.innerHTML = `<div class="notificacion-item">No se encontraron usuarios.</div>`;
        } else {
        // Mostrar usuarios encontrados en la busqueda
        resultados.forEach(usuario => {
            const div = document.createElement("div");
            div.className = "resultado-item";
            div.innerHTML = `
            <div style="display:flex; align-items:center; gap:10px;">
                <img src="${usuario.foto}" alt="${usuario.nombre}" style="width:40px; height:40px; border-radius:50%; object-fit:cover;">
                <div>
                <strong>${usuario.nombre}</strong><br>
                <span style="font-size:0.75em; color:#777;">${usuario.id}</span>
                </div>
            </div>
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

    // Boton de borrar busqueda para limpiar
    const btnBorrarBusqueda = document.getElementById("btn-borrar-busqueda");
    if (btnBorrarBusqueda) {
    btnBorrarBusqueda.addEventListener("click", () => {
        const input = document.getElementById("buscar-amigos-input");
        const resultadosContainer = document.getElementById("resultados-busqueda-amigos");
        input.value = "";
        resultadosContainer.innerHTML = `<div class="notificacion-item">Introduce un nombre para buscar.</div>`;
    });
    }

    // 8. Panel de Chats
    const btnChats = document.querySelector(".action-btn:nth-child(1)");
    if (btnChats) {
    btnChats.addEventListener("click", () => {
        const panel = document.getElementById("panel-chats");
        if (!panel) return;
        panel.classList.add("visible"); // muestra el panel lateral
        mostrarChats();
    });
    }

    // Cerrar panel con la X
    const btnCerrarChats = document.getElementById("cerrar-panel-chats");
    if (btnCerrarChats) {
    btnCerrarChats.addEventListener("click", () => {
        const panel = document.getElementById("panel-chats");
        if (panel) panel.classList.remove("visible"); // 👈 oculta el panel lateral
    });
    }

    // Aquí añades tu listener de cerrar conversación
    const btnCerrarConversacion = document.getElementById("cerrar-chat-conversacion");
    if (btnCerrarConversacion) {
        btnCerrarConversacion.addEventListener("click", () => {
        document.getElementById("chat-conversacion").classList.add("oculto");
        document.getElementById("lista-chats-panel").style.display = "block";
        document.getElementById("amigos-horizontal").style.display = "flex";
    });
    }

    // Función para abrir chats desde preview (no se logró hacer funcional)
    function abrirChatDesdeSidebar(contacto) {
    const btnChats = document.getElementById("btn-chats");
    if (!btnChats) return;

    // Simula clic en el botón de Mensajes
    btnChats.click();

    // Espera a que el panel se abra y luego abre el chat
    setTimeout(() => {
        abrirChatConUsuario(contacto);
    }, 300); // ajusta si tu transición es más lenta
    }

    });
  });
});

// Escucha para crear nuevo grupo en el boton Crear Grupo
document.addEventListener("DOMContentLoaded", async () => {
  const btnNuevoGrupo = document.querySelector(".btn-nuevo-grupo");
  const modal = document.getElementById("modal-grupo");
  const cerrarModal = document.getElementById("cerrar-modal");
  const formGrupo = document.getElementById("form-nuevo-grupo");
  const selectAmigos = document.getElementById("invitar-amigos");
  const listaChats = document.getElementById("lista-chats");
  const panelChat = document.getElementById("panel-chat");

  // Comprobar que todos los campos estan bien para crear el modal
  if (!btnNuevoGrupo || !modal || !cerrarModal || !formGrupo || !selectAmigos || !listaChats || !panelChat) {
    console.warn("Faltan elementos del DOM para el modal de grupos o el panel de chat.");
    return;
  }

  // Cargar amigos reales desde usuarioActivo
  const usuarioActivo = JSON.parse(localStorage.getItem("usuarioActivo"));
  const usuariosFicticios = await cargarUsuariosFicticios();
  const amigos = usuariosFicticios.filter(u => usuarioActivo?.amigos?.includes(u.id));

  selectAmigos.innerHTML = "";
  amigos.forEach(amigo => {
    const option = document.createElement("option");
    option.value = amigo.id;
    option.textContent = amigo.nombre;
    option.dataset.foto = amigo.foto;
    selectAmigos.appendChild(option);
  });

  // Abrir modal
  btnNuevoGrupo.addEventListener("click", () => {
    modal.classList.remove("oculto");
  });

  // Cerrar modal
  cerrarModal.addEventListener("click", () => {
    modal.classList.add("oculto");
  });

  // Crear grupo con nombre, descripcion, foto de perfil y usuarios invitados
  formGrupo.addEventListener("submit", (e) => {
    e.preventDefault();

    const nombre = document.getElementById("nombre-grupo").value.trim();
    if (nombre.length < 1) {
      alert("El nombre del grupo es obligatorio.");
      return;
    }

    const descripcion = document.getElementById("descripcion-grupo").value.trim();
    const foto = document.getElementById("foto-grupo").files[0];
    const invitados = Array.from(selectAmigos.selectedOptions).map(opt => ({
      id: opt.value,
      nombre: opt.textContent,
      foto: opt.dataset.foto
    }));

    // ID único para el grupo
    const grupoID = `grupo-${Date.now()}`;

    // Crear item de chat
    const chatItem = document.createElement("div");
    chatItem.className = "chat-preview";

    let fotoHTML = "";
    if (foto) {
      const urlFoto = URL.createObjectURL(foto);
      fotoHTML = `<img src="${urlFoto}" alt="Foto grupo" class="chat-foto">`;
    } else {
      fotoHTML = `<div class="chat-foto-placeholder">👥</div>`;
    }

    const invitadosHTML = invitados
      .map(inv => `<img src="${inv.foto}" alt="${inv.nombre}" class="chat-invitado-foto">`)
      .join("");

    chatItem.innerHTML = `
      ${fotoHTML}
      <div>
        <strong>${nombre}</strong><br>
        <span style="font-size:0.8em; color:#555;">${descripcion}</span>
        <div class="chat-invitados">${invitadosHTML}</div>
      </div>
    `;

    // Al hacer clic → abrir conversación de grupo
    chatItem.addEventListener("click", () => {
      abrirChatGrupo(grupoID, nombre);
    });

    listaChats.appendChild(chatItem);

    // Guardar grupo en conversaciones
    const conversaciones = JSON.parse(localStorage.getItem("conversaciones")) || {};
    const userID = usuarioActivo.id;
    if (!conversaciones[userID]) conversaciones[userID] = {};
    conversaciones[userID][grupoID] = []; // hilo vacío
    localStorage.setItem("conversaciones", JSON.stringify(conversaciones));

    alert("Grupo creado y añadido a tus chats.");
    modal.classList.add("oculto");
    formGrupo.reset();
  });

  // Función para abrir un chat de grupo
  function abrirChatGrupo(grupoID, nombre) {
    panelChat.innerHTML = `
      <h3>${nombre}</h3>
      <div class="mensajes"></div>
      <div class="input-chat">
        <input type="text" id="mensaje-input" placeholder="Escribe un mensaje...">
        <button id="enviar-mensaje">Enviar</button>
      </div>
    `;

    const btnEnviar = document.getElementById("enviar-mensaje");
    const inputMensaje = document.getElementById("mensaje-input");
    const mensajes = panelChat.querySelector(".mensajes");

    // Cargar conversaciones con usuarios
    const conversaciones = JSON.parse(localStorage.getItem("conversaciones")) || {};
    const userID = usuarioActivo.id;
    const historial = conversaciones[userID]?.[grupoID] || [];
    historial.forEach(texto => {
      const msg = document.createElement("div");
      msg.className = "mensaje mensaje-propio";
      msg.textContent = texto;
      mensajes.appendChild(msg);
    });

    // Boton de enviar mensaje
    btnEnviar.addEventListener("click", () => {
      const texto = inputMensaje.value.trim();
      if (texto) {
        const msg = document.createElement("div");
        msg.className = "mensaje mensaje-propio";
        msg.textContent = texto;
        mensajes.appendChild(msg);
        inputMensaje.value = "";

        // Guardar mensaje en localStorage
        const conversaciones = JSON.parse(localStorage.getItem("conversaciones")) || {};
        if (!conversaciones[userID]) conversaciones[userID] = {};
        if (!conversaciones[userID][grupoID]) conversaciones[userID][grupoID] = [];
        conversaciones[userID][grupoID].push(texto);
        localStorage.setItem("conversaciones", JSON.stringify(conversaciones));
      }
    });
  }
});

