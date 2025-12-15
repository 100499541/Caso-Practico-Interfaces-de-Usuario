// Este codigo se encarga de
// - Lee id de querystring
// - Carga viaje desde localStorage (viajesCompartidosData)
// - Chat / Actividades / Alojamientos / Presupuesto

// Utilidades y carga de datos
document.addEventListener("DOMContentLoaded", async () => {
  const LS_TRIPS = "viajesCompartidosData";

  // Funciones de almacenamiento en localStorage
  function load(key, fallback) {
    try {
      const v = JSON.parse(localStorage.getItem(key));
      return v ?? fallback;
    } catch {
      return fallback;
    }
  }
  // Guarda un valor en localStorage
  function save(key, value) {
    localStorage.setItem(key, JSON.stringify(value));
  }

  // Obtiene el usuario activo desde localStorage
  function getUsuarioActivo() {
    try { return JSON.parse(localStorage.getItem("usuarioActivo")); } catch { return null; }
  }
  // Obtiene un identificador único del usuario
  function getUserId(user) {
    if (!user) return null;
    if (user.id) return user.id;
    if (user.usuario) return `local:${user.usuario}`;
    return null;
  }

  // Carga usuarios ficticios desde JSON
  async function cargarUsuariosFicticios() {
    try {
      const res = await fetch("/js/usuarios.json");
      const data = await res.json();
      return data.usuarios || [];
    } catch {
      return [];
    }
  }

  // Mapa de usuarios ficticios
  const usuariosFicticios = await cargarUsuariosFicticios();

  // Busca un usuario ficticio por id
  function findUserById(id) {
    const u = usuariosFicticios.find(x => x.id === id);
    // Si lo encontramos, devolvemos datos completos
    if (u) return { id: u.id, nombre: u.nombre, foto: u.foto };
    // Si no, devolvemos datos por defecto
    if (id && id.startsWith("local:")) {
      const username = id.slice("local:".length);
      return { id, nombre: username, foto: "/imagenes/default-profile.jpg" };
    }
    return { id, nombre: id || "Usuario", foto: "/imagenes/default-profile.jpg" };
  }

  // Formatea número a euros
  function euros(n) {
    const x = Number(n || 0);
    return `${x}€`;
  }
  // Formatea fecha AAAA-MM-DD a DD/MM/AAAA
  function formatDate(d) {
    if (!d) return "";
    const [y, m, day] = d.split("-");
    return `${day}/${m}/${y}`;
  }

  const params = new URLSearchParams(window.location.search);
  const id = params.get("id");

  let trips = load(LS_TRIPS, []);
  let viaje = trips.find(t => t.id === id);

  // Si no existe el viaje, redirigimos
  if (!id || !viaje) {
    alert("Viaje no encontrado.");
    window.location.href = "viajesCompartidos.html";
    return;
  }

  const usuarioActivo = getUsuarioActivo();
  const myId = getUserId(usuarioActivo);

  // -------------------------
  // DOM
  // -------------------------
  const hero = document.getElementById("heroViaje");
  const breadTitle = document.getElementById("breadTitle");

  const chatBox = document.getElementById("chatBox");
  const chatInput = document.getElementById("chatInput");
  const chatSend = document.getElementById("chatSend");

  const actInput = document.getElementById("actInput");
  const actAdd = document.getElementById("actAdd");
  const actList = document.getElementById("actList");

  const alojNombre = document.getElementById("alojNombre");
  const alojPrecio = document.getElementById("alojPrecio");
  const alojLink = document.getElementById("alojLink");
  const alojAdd = document.getElementById("alojAdd");
  const alojList = document.getElementById("alojList");

  const participants = document.getElementById("participants");
  const budgetBox = document.getElementById("budgetBox");


  // Guardar el viaje actualizado dentro del array
  function persist() {
    trips = trips.map(t => (t.id === viaje.id ? viaje : t));
    save(LS_TRIPS, trips);
  }

  // Render HERO
  // Se encarga de pintar la sección superior con los datos del viaje
  function renderHero() {
    // Si existe el título en el breadcrumb, actualizar texto
    if (breadTitle) breadTitle.textContent = viaje.titulo;

    const estado = (viaje.privacidad === "publico") ? "Público" : "Privado";
    const num = (viaje.participantes || []).length;

    // Pintar contenido
    hero.innerHTML = `
      <div class="hero-top">
        <div class="hero-img">
          <img src="${viaje.imagen || "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=900"}" alt="${viaje.titulo}">
        </div>
        <div class="hero-info">
          <h1>${viaje.titulo}</h1>
          <div class="hero-meta">
            <span class="pill">📍 ${viaje.destino}</span>
            <span class="pill">📅 ${formatDate(viaje.inicio)} - ${formatDate(viaje.fin)}</span>
            <span class="pill">💶 ${euros(viaje.presupuesto)} / persona</span>
            <span class="pill">👥 ${num} participantes</span>
            <span class="pill">🔒 ${estado}</span>
          </div>
          <p class="hero-desc">${viaje.descripcion || ""}</p>
        </div>
      </div>
    `;
  }


  // Render Participants
  // Esta funcion se encarga de pintar la lista de participantes del viaje
  function renderParticipants() {
    participants.innerHTML = "";
    (viaje.participantes || []).forEach(pid => {
      const u = findUserById(pid);
      const row = document.createElement("div");
      row.className = "p-user";
      row.innerHTML = `
        <img src="${u.foto}" alt="${u.nombre}">
        <div>
          <div class="name">${u.nombre}</div>
          <span class="id">${u.id}</span>
        </div>
      `;
      participants.appendChild(row);
    });
  }

  // Render Budget
  // Esta funcion se encarga de pintar el presupuesto del viaje
  function renderBudget() {
    const n = (viaje.participantes || []).length || 1;
    const total = Number(viaje.presupuesto || 0) * n;

    budgetBox.innerHTML = `
      <div class="b-row"><strong>Presupuesto por persona</strong> <span>${euros(viaje.presupuesto)}</span></div>
      <div class="b-row"><strong>Nº participantes</strong> <span>${n}</span></div>
      <div class="b-row"><strong>Presupuesto total estimado</strong> <span>${euros(total)}</span></div>
    `;
  }

  // Chat
  // Esta funcion se encarga de pintar los mensajes del chat
  function renderChat() {
    chatBox.innerHTML = "";
    const msgs = viaje.chat || [];

    if (!msgs.length) {
      chatBox.innerHTML = `<div class="msg"><div class="meta">Sistema</div><div class="text">Aún no hay mensajes.</div></div>`;
      return;
    }

    // Ordenar por fecha y pintar
    msgs
      .slice()
      .sort((a, b) => (a.ts || 0) - (b.ts || 0))
      .forEach(m => {
        const u = findUserById(m.fromId);
        const d = new Date(m.ts || Date.now());
        const hh = String(d.getHours()).padStart(2, "0");
        const mm = String(d.getMinutes()).padStart(2, "0");

        const div = document.createElement("div");
        div.className = "msg" + ((myId && m.fromId === myId) ? " me" : "");
        div.innerHTML = `
          <div class="meta">${u.nombre} · ${hh}:${mm}</div>
          <div class="text">${escapeHtml(m.text || "")}</div>
        `;
        chatBox.appendChild(div);
      });

    chatBox.scrollTop = chatBox.scrollHeight;
  }

  // Esta funcion se encarga de escapar texto para evitar inyecciones HTML
  function escapeHtml(str) {
    return String(str)
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#039;");
  }

  // Esta funcion comprueba si el usuario puede interactuar (participante u organizador)
  function canInteract() {
    // Solo participan o el organizador
    if (!myId) return false;
    return (viaje.participantes || []).includes(myId) || viaje.organizadorId === myId;
  }

  // Esta funcion requiere que el usuario pueda interactuar
  function requireInteract() {
    if (!canInteract()) {
      alert("Solo los participantes pueden usar el chat/añadir actividades/alojamientos.");
      return false;
    }
    return true;
  }

  // Ahora configuramos los eventos
  chatSend.addEventListener("click", () => {
    if (!requireInteract()) return;
    const text = (chatInput.value || "").trim();
    if (!text) return;

    viaje.chat = viaje.chat || [];
    viaje.chat.push({ fromId: myId, text, ts: Date.now() });
    persist();
    chatInput.value = "";
    renderChat();
  });

  // Permitir enviar con Enter
  chatInput.addEventListener("keydown", (e) => {
    if (e.key === "Enter") chatSend.click();
  });

  // Actividades
  // Esta funcion se encarga de pintar la lista de actividades
  function renderActs() {
    actList.innerHTML = "";
    const list = viaje.actividades || [];

    if (!list.length) {
      actList.innerHTML = `<div class="item"><div class="item-left"><div class="item-title">Sin actividades</div><div class="item-sub">Añade propuestas para el grupo.</div></div></div>`;
      return;
    }

    // Pintar actividades
    list.forEach((a, idx) => {
      const u = findUserById(a.byId);
      const div = document.createElement("div");
      div.className = "item";
      div.innerHTML = `
        <div class="item-left">
          <div class="item-title">${a.done ? "✅ " : "🟦 "}${escapeHtml(a.text || "")}</div>
          <div class="item-sub">Propuesto por: ${u.nombre}</div>
        </div>
        <div class="item-actions">
          <button class="btn-mini" data-act="toggle" data-idx="${idx}">${a.done ? "Desmarcar" : "Hecho"}</button>
          <button class="btn-mini danger" data-act="del" data-idx="${idx}">Eliminar</button>
        </div>
      `;
      actList.appendChild(div);
    });

    // Añadir eventos a botones
    actList.querySelectorAll("button[data-act]").forEach(btn => {
      btn.addEventListener("click", () => {
        if (!requireInteract()) return;

        const idx = Number(btn.dataset.idx);
        const type = btn.dataset.act;

        // Acción según tipo
        if (type === "toggle") {
          viaje.actividades[idx].done = !viaje.actividades[idx].done;
        } else if (type === "del") {
          viaje.actividades.splice(idx, 1);
        }
        persist();
        renderActs();
      });
    });
  }

  // Añadir actividad
  actAdd.addEventListener("click", () => {
    if (!requireInteract()) return;

    const text = (actInput.value || "").trim();
    if (!text) return;

    viaje.actividades = viaje.actividades || [];
    viaje.actividades.push({ text, done: false, byId: myId, ts: Date.now() });
    persist();

    actInput.value = "";
    renderActs();
  });

  // Alojamientos
  // Esta funcion se encarga de pintar la lista de alojamientos
  function renderAlojs() {
    alojList.innerHTML = "";
    const list = viaje.alojamientos || [];

    // Si no hay alojamientos, mostramos mensaje
    if (!list.length) {
      alojList.innerHTML = `<div class="item"><div class="item-left"><div class="item-title">Sin alojamientos</div><div class="item-sub">Añade propuestas y enlaces.</div></div></div>`;
      return;
    }

    // Pintar alojamientos
    list.forEach((a, idx) => {
      const u = findUserById(a.byId);
      const linkHtml = a.link ? `<a href="${a.link}" target="_blank" rel="noopener">Ver link</a>` : "Sin link";

      const div = document.createElement("div");
      div.className = "item";
      div.innerHTML = `
        <div class="item-left">
          <div class="item-title">🏨 ${escapeHtml(a.nombre || "")}</div>
          <div class="item-sub">Precio: ${euros(a.precioNoche)} / noche · ${linkHtml} · Propuesto por: ${u.nombre}</div>
        </div>
        <div class="item-actions">
          <button class="btn-mini danger" data-al="del" data-idx="${idx}">Eliminar</button>
        </div>
      `;
      alojList.appendChild(div);
    });

    // Añadir eventos a botones
    alojList.querySelectorAll("button[data-al='del']").forEach(btn => {
      btn.addEventListener("click", () => {
        if (!requireInteract()) return;

        // Eliminar alojamiento
        const idx = Number(btn.dataset.idx);
        viaje.alojamientos.splice(idx, 1);
        persist();
        renderAlojs();
      });
    });
  }

  // Añadir alojamiento
  alojAdd.addEventListener("click", () => {
    if (!requireInteract()) return;

    // Leer datos
    const nombre = (alojNombre.value || "").trim();
    const precio = Number(alojPrecio.value || 0);
    const link = (alojLink.value || "").trim();

    // Validar
    if (!nombre || !Number.isFinite(precio) || precio < 0) {
      alert("Rellena nombre y un precio válido.");
      return;
    }

    // Añadir alojamiento
    viaje.alojamientos = viaje.alojamientos || [];
    viaje.alojamientos.push({ nombre, precioNoche: precio, link, byId: myId, ts: Date.now() });
    persist();

    alojNombre.value = "";
    alojPrecio.value = "";
    alojLink.value = "";
    renderAlojs();
  });

  // Finalmente, renderizamos todo
  renderHero();
  renderParticipants();
  renderBudget();
  renderChat();
  renderActs();
  renderAlojs();
});
