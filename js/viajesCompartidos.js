// ===========================
// VIAJES COMPARTIDOS (FULL)
// - Crear viajes (publico/privado)
// - Invitar amigos (usuarioActivo.amigos -> ids de usuarios.json)
// - Unirse a viajes públicos
// - Aceptar/Rechazar invitaciones
// - Abrir detalle del viaje (viajeDetalle.html)
// ===========================

document.addEventListener("DOMContentLoaded", async () => {
  // -------------------------
  // Helpers Storage
  // -------------------------
  const LS_TRIPS = "viajesCompartidosData";
  const LS_INV = "invitacionesViajes"; // { userId: [ {viajeId, fromId, fecha} ] }

  function load(key, fallback) {
    try {
      const v = JSON.parse(localStorage.getItem(key));
      return v ?? fallback;
    } catch {
      return fallback;
    }
  }
  function save(key, value) {
    localStorage.setItem(key, JSON.stringify(value));
  }

  function uid() {
    return `v_${Date.now()}_${Math.random().toString(16).slice(2)}`;
  }

  function getUsuarioActivo() {
    try { return JSON.parse(localStorage.getItem("usuarioActivo")); } catch { return null; }
  }

  // Para que podamos invitar/participar aunque el usuario local no tenga "id"
  function getUserId(user) {
    if (!user) return null;
    if (user.id) return user.id;
    if (user.usuario) return `local:${user.usuario}`;
    return null;
  }

  function euros(n) {
    const x = Number(n || 0);
    return `${x}€`;
  }

  function formatDate(d) {
    if (!d) return "";
    // d = "YYYY-MM-DD"
    const [y, m, day] = d.split("-");
    return `${day}/${m}/${y}`;
  }

  function getMonthKey(dateStr) {
    // "YYYY-MM-DD" -> "YYYY-MM"
    if (!dateStr || dateStr.length < 7) return "";
    return dateStr.slice(0, 7);
  }

  async function cargarUsuariosFicticios() {
    try {
      const res = await fetch("/js/usuarios.json");
      const data = await res.json();
      return data.usuarios || [];
    } catch (e) {
      console.error("No se pudo cargar usuarios.json", e);
      return [];
    }
  }

  // -------------------------
  // Seed (viajes demo)
  // -------------------------
  function ensureSeed(trips) {
    if (Array.isArray(trips) && trips.length > 0) return trips;

    const seed = [
      {
        id: "seed_thai",
        titulo: "Mochileros en Tailandia",
        destino: "Tailandia",
        inicio: "2025-08-15",
        fin: "2025-08-30",
        presupuesto: 850,
        descripcion: "Ruta de 15 días recorriendo el norte de Tailandia, templos, santuarios de elefantes y mucha comida callejera.",
        imagen: "https://images.unsplash.com/photo-1528181304800-259b08848526?auto=format&fit=crop&w=900",
        privacidad: "publico",
        organizadorId: "usr01",
        participantes: ["usr01", "usr02"],
        createdAt: new Date().toISOString(),
        chat: [
          { fromId: "usr01", text: "¡Bienvenidos! ¿Preferís Chiang Mai o Phuket primero?", ts: Date.now() - 1000000 }
        ],
        actividades: [
          { text: "Visitar templos en Chiang Mai", done: false, byId: "usr01", ts: Date.now() - 900000 }
        ],
        alojamientos: [
          { nombre: "Hostel Chiang Mai Center", precioNoche: 18, link: "", byId: "usr02", ts: Date.now() - 800000 }
        ]
      },
      {
        id: "seed_italy",
        titulo: "Ruta gastronómica Italia",
        destino: "Italia",
        inicio: "2025-09-10",
        fin: "2025-09-17",
        presupuesto: 600,
        descripcion: "Buscamos 2 personas más para alquilar una villa en la Toscana y recorrer viñedos en coche.",
        imagen: "https://images.unsplash.com/photo-1523906834658-6e24ef2386f9?auto=format&fit=crop&w=900",
        privacidad: "publico",
        organizadorId: "usr02",
        participantes: ["usr02"],
        createdAt: new Date().toISOString(),
        chat: [],
        actividades: [],
        alojamientos: []
      },
      {
        id: "seed_pata",
        titulo: "Trekking Patagonia",
        destino: "Patagonia",
        inicio: "2025-12-02",
        fin: "2025-12-12",
        presupuesto: 1200,
        descripcion: "Aventura exigente para amantes de la montaña. Torres del Paine y Fitz Roy. Solo gente con experiencia.",
        imagen: "https://images.unsplash.com/photo-1501785888041-af3ef285b470?auto=format&fit=crop&w=900",
        privacidad: "publico",
        organizadorId: "usr03",
        participantes: ["usr03"],
        createdAt: new Date().toISOString(),
        chat: [],
        actividades: [],
        alojamientos: []
      }
    ];

    save(LS_TRIPS, seed);
    return seed;
  }

  // -------------------------
  // DOM
  // -------------------------
  const contenedor = document.getElementById("contenedor-viajes");

  const filtroDestino = document.getElementById("filtroDestino");
  const filtroMes = document.getElementById("filtroMes");
  const filtroPresupuesto = document.getElementById("filtroPresupuesto");
  const btnBuscar = document.getElementById("btnBuscar");
  const btnLimpiar = document.getElementById("btnLimpiar");

  const btnCrear = document.getElementById("btnCrear");
  const modalOverlay = document.getElementById("modalCrearOverlay");
  const modalClose = document.getElementById("modalCrearClose");
  const btnCancelarCrear = document.getElementById("btnCancelarCrear");
  const formCrear = document.getElementById("formCrearViaje");

  const cvTitulo = document.getElementById("cvTitulo");
  const cvDestino = document.getElementById("cvDestino");
  const cvInicio = document.getElementById("cvInicio");
  const cvFin = document.getElementById("cvFin");
  const cvPresupuesto = document.getElementById("cvPresupuesto");
  const cvDescripcion = document.getElementById("cvDescripcion");
  const cvImagen = document.getElementById("cvImagen");
  const cvAmigos = document.getElementById("cvAmigos");

  const panelInv = document.getElementById("panelInvitaciones");
  const invList = document.getElementById("invitacionesList");
  const btnRefrescarInv = document.getElementById("btnRefrescarInv");

  // -------------------------
  // Session UI (header login)
  // (index.js ya hace reemplazo en muchas páginas, aquí no lo tocamos)
  // -------------------------
  const usuarioActivo = getUsuarioActivo();
  const activeId = getUserId(usuarioActivo);

  // -------------------------
  // Load data
  // -------------------------
  let usuariosFicticios = await cargarUsuariosFicticios();
  let trips = ensureSeed(load(LS_TRIPS, []));
  let invitaciones = load(LS_INV, {});

  // -------------------------
  // Invitaciones UI
  // -------------------------
  function getInvitacionesDe(userId) {
    if (!userId) return [];
    return invitaciones[userId] || [];
  }

  function setInvitacionesDe(userId, list) {
    invitaciones[userId] = list;
    save(LS_INV, invitaciones);
  }

  function findUserById(id) {
    // primero ficticios
    const u = usuariosFicticios.find(x => x.id === id);
    if (u) return { id: u.id, nombre: u.nombre, foto: u.foto };
    // local users (registrados)
    if (id && id.startsWith("local:")) {
      const username = id.slice("local:".length);
      return { id, nombre: username, foto: "/imagenes/default-profile.jpg" };
    }
    return { id, nombre: id || "Usuario", foto: "/imagenes/default-profile.jpg" };
  }

  function renderInvitaciones() {
    if (!panelInv || !invList) return;

    if (!activeId) {
      panelInv.classList.add("hidden");
      return;
    }

    const list = getInvitacionesDe(activeId);
    if (!list.length) {
      panelInv.classList.add("hidden");
      return;
    }

    panelInv.classList.remove("hidden");
    invList.innerHTML = "";

    list.forEach(inv => {
      const viaje = trips.find(t => t.id === inv.viajeId);
      if (!viaje) return;

      const from = findUserById(inv.fromId);

      const card = document.createElement("div");
      card.className = "inv-card";
      card.innerHTML = `
        <div class="inv-info">
          <div class="inv-title">${viaje.titulo}</div>
          <div class="inv-meta">De: ${from.nombre} · Destino: ${viaje.destino} · ${formatDate(viaje.inicio)} - ${formatDate(viaje.fin)}</div>
        </div>
        <div class="inv-actions">
          <button class="btn-primario" data-acc="accept" data-id="${inv.viajeId}">Aceptar</button>
          <button class="btn-secundario" data-acc="reject" data-id="${inv.viajeId}">Rechazar</button>
        </div>
      `;
      invList.appendChild(card);
    });

    invList.querySelectorAll("button[data-acc]").forEach(btn => {
      btn.addEventListener("click", () => {
        const acc = btn.dataset.acc;
        const viajeId = btn.dataset.id;
        if (acc === "accept") aceptarInvitacion(viajeId);
        else rechazarInvitacion(viajeId);
      });
    });
  }

  function aceptarInvitacion(viajeId) {
    if (!activeId) return;

    const viaje = trips.find(t => t.id === viajeId);
    if (!viaje) return;

    if (!viaje.participantes.includes(activeId)) {
      viaje.participantes.push(activeId);
      save(LS_TRIPS, trips);
    }

    const list = getInvitacionesDe(activeId).filter(i => i.viajeId !== viajeId);
    setInvitacionesDe(activeId, list);

    renderInvitaciones();
    renderViajes(getFilteredTrips());

    alert("✅ Te has unido al viaje.");
  }

  function rechazarInvitacion(viajeId) {
    if (!activeId) return;

    const list = getInvitacionesDe(activeId).filter(i => i.viajeId !== viajeId);
    setInvitacionesDe(activeId, list);

    renderInvitaciones();
    alert("Invitación rechazada.");
  }

  // -------------------------
  // Create modal
  // -------------------------
  function openModal() {
    if (!modalOverlay) return;
    modalOverlay.classList.remove("hidden");
    modalOverlay.setAttribute("aria-hidden", "false");
    document.body.style.overflow = "hidden";
  }

  function closeModal() {
    if (!modalOverlay) return;
    modalOverlay.classList.add("hidden");
    modalOverlay.setAttribute("aria-hidden", "true");
    document.body.style.overflow = "";
    formCrear.reset();
    cvAmigos.innerHTML = "";
    rellenarAmigosEnCrear(); // para que se repinte
  }

  function rellenarAmigosEnCrear() {
    if (!cvAmigos) return;
    cvAmigos.innerHTML = "";

    if (!usuarioActivo || !Array.isArray(usuarioActivo.amigos) || usuarioActivo.amigos.length === 0) {
      return;
    }

    usuarioActivo.amigos.forEach(amigoId => {
      const a = usuariosFicticios.find(u => u.id === amigoId);
      if (!a) return;

      const div = document.createElement("div");
      div.className = "amigo-pill";
      div.innerHTML = `
        <input type="checkbox" id="am_${a.id}" value="${a.id}">
        <img src="${a.foto}" alt="${a.nombre}">
        <div>
          <label for="am_${a.id}">${a.nombre}</label>
          <small>${a.id}</small>
        </div>
      `;
      // mover checkbox al principio (estética)
      const cb = div.querySelector("input");
      cb.style.width = "18px";
      cb.style.height = "18px";
      cb.style.margin = "0 10px 0 0";
      div.prepend(cb);

      cvAmigos.appendChild(div);
    });
  }

  // -------------------------
  // Trips filtering/render
  // -------------------------
  function getFilteredTrips() {
    const destino = (filtroDestino?.value || "").trim().toLowerCase();
    const mes = (filtroMes?.value || "").trim(); // "YYYY-MM"
    const presupuestoMax = Number(filtroPresupuesto?.value || 0);

    return trips.filter(t => {
      // destino
      if (destino) {
        const okDestino =
          (t.destino || "").toLowerCase().includes(destino) ||
          (t.titulo || "").toLowerCase().includes(destino);
        if (!okDestino) return false;
      }

      // mes: comparamos por inicio
      if (mes) {
        const mk = getMonthKey(t.inicio);
        if (mk !== mes) return false;
      }

      // presupuesto
      if (presupuestoMax > 0) {
        if (Number(t.presupuesto || 0) > presupuestoMax) return false;
      }

      return true;
    });
  }

  function renderViajes(list) {
    if (!contenedor) return;

    contenedor.innerHTML = "";

    if (!list.length) {
      contenedor.innerHTML = `
        <div class="empty-state">
          <h3>No hay viajes que coincidan con tu búsqueda</h3>
          <p>Prueba con otro destino/mes/presupuesto.</p>
        </div>
      `;
      return;
    }

    list.forEach(viaje => {
      const card = document.createElement("div");
      card.className = "viaje-card";
      card.tabIndex = 0;

      const participantes = (viaje.participantes || []).slice(0, 4);
      const avataresHTML = participantes.map(pid => {
        const u = findUserById(pid);
        return `<img src="${u.foto}" class="participante-avatar" alt="${u.nombre}">`;
      }).join("");

      const estado = (viaje.privacidad === "publico") ? "Abierto" : "Privado";

      card.innerHTML = `
        <div class="viaje-img-container">
          <img src="${viaje.imagen || "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=900"}" alt="${viaje.titulo}">
          <span class="etiqueta-estado">${estado}</span>
        </div>

        <div class="viaje-info">
          <div class="viaje-header">
            <h3>${viaje.titulo}</h3>
            <span class="viaje-precio">${euros(viaje.presupuesto)}</span>
          </div>

          <div class="viaje-fechas">
            <span>📅</span> ${formatDate(viaje.inicio)} - ${formatDate(viaje.fin)}
          </div>

          <p class="viaje-desc">${viaje.descripcion || ""}</p>

          <div class="viaje-footer">
            <div class="participantes">${avataresHTML}</div>
            ${renderBotonAccion(viaje)}
          </div>
        </div>
      `;

      // click card -> detalle
      card.addEventListener("click", () => {
        window.location.href = `viajeDetalle.html?id=${encodeURIComponent(viaje.id)}`;
      });
      card.addEventListener("keydown", (e) => {
        if (e.key === "Enter") window.location.href = `viajeDetalle.html?id=${encodeURIComponent(viaje.id)}`;
      });

      // evitar que el botón dispare el click del card
      const btn = card.querySelector("button[data-action]");
      if (btn) {
        btn.addEventListener("click", (e) => {
          e.stopPropagation();
          handleTripAction(btn.dataset.action, viaje.id);
        });
      }

      contenedor.appendChild(card);
    });
  }

  function renderBotonAccion(viaje) {
    const isLogged = !!activeId;

    if (!isLogged) {
      return `<button class="btn-unirse" data-action="login" title="Inicia sesión">Inicia sesión</button>`;
    }

    const yaDentro = (viaje.participantes || []).includes(activeId);
    if (yaDentro) {
      return `<button class="btn-unirse" data-action="ver" title="Ver viaje">Ver</button>`;
    }

    if (viaje.privacidad === "publico") {
      return `<button class="btn-unirse" data-action="join">Unirse</button>`;
    }

    // privado
    // Si tiene invitación pendiente -> mostramos "Pendiente"
    const invs = getInvitacionesDe(activeId);
    const pendiente = invs.some(i => i.viajeId === viaje.id);
    if (pendiente) {
      return `<button class="btn-unirse" data-action="pendiente" disabled>Pendiente</button>`;
    }

    return `<button class="btn-unirse" data-action="privado" disabled>Privado</button>`;
  }

  function handleTripAction(action, viajeId) {
    if (action === "login") {
      alert("Debes iniciar sesión para unirte a viajes.");
      window.location.href = "inicioSesion.html";
      return;
    }
    if (action === "ver") {
      window.location.href = `viajeDetalle.html?id=${encodeURIComponent(viajeId)}`;
      return;
    }
    if (action === "join") {
      const viaje = trips.find(t => t.id === viajeId);
      if (!viaje) return;

      if (!viaje.participantes.includes(activeId)) {
        viaje.participantes.push(activeId);
        save(LS_TRIPS, trips);
      }

      alert("✅ Te has unido al viaje.");
      renderViajes(getFilteredTrips());
      return;
    }
  }

  // -------------------------
  // Create trip + invite
  // -------------------------
  function addInvitacion(toUserId, viajeId, fromId) {
    const list = invitaciones[toUserId] || [];
    // evitar duplicados
    if (list.some(i => i.viajeId === viajeId)) return;

    list.push({ viajeId, fromId, fecha: new Date().toISOString() });
    invitaciones[toUserId] = list;
  }

  function validateDates(inicio, fin) {
    const di = new Date(inicio);
    const df = new Date(fin);
    if (isNaN(di.getTime()) || isNaN(df.getTime())) return "Fechas inválidas.";
    if (df < di) return "La fecha de fin no puede ser anterior al inicio.";
    return "";
  }

  // -------------------------
  // Events
  // -------------------------
  if (btnCrear) {
    btnCrear.addEventListener("click", () => {
      if (!usuarioActivo) {
        alert("Debes iniciar sesión para crear un viaje compartido.");
        window.location.href = "inicioSesion.html";
        return;
      }
      rellenarAmigosEnCrear();
      openModal();
    });
  }

  if (modalClose) modalClose.addEventListener("click", closeModal);
  if (btnCancelarCrear) btnCancelarCrear.addEventListener("click", closeModal);

  if (modalOverlay) {
    modalOverlay.addEventListener("click", (e) => {
      if (e.target === modalOverlay) closeModal();
    });
  }

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && modalOverlay && !modalOverlay.classList.contains("hidden")) {
      closeModal();
    }
  });

  if (formCrear) {
    formCrear.addEventListener("submit", (e) => {
      e.preventDefault();

      if (!usuarioActivo) return;

      const titulo = cvTitulo.value.trim();
      const destino = cvDestino.value.trim();
      const inicio = cvInicio.value;
      const fin = cvFin.value;
      const presupuesto = Number(cvPresupuesto.value || 0);
      const descripcion = (cvDescripcion.value || "").trim();
      const imagen = (cvImagen.value || "").trim();

      const privacidad = (formCrear.querySelector('input[name="cvPrivacidad"]:checked')?.value) || "publico";

      if (!titulo || !destino || !inicio || !fin || !Number.isFinite(presupuesto)) {
        alert("Completa título, destino, fechas y presupuesto.");
        return;
      }

      const err = validateDates(inicio, fin);
      if (err) { alert(err); return; }

      const newTrip = {
        id: uid(),
        titulo,
        destino,
        inicio,
        fin,
        presupuesto,
        descripcion,
        imagen,
        privacidad,
        organizadorId: activeId,
        participantes: [activeId],
        createdAt: new Date().toISOString(),
        chat: [],
        actividades: [],
        alojamientos: []
      };

      trips.unshift(newTrip);
      save(LS_TRIPS, trips);

      // Invitaciones a amigos seleccionados
      const seleccionados = Array.from(cvAmigos.querySelectorAll('input[type="checkbox"]:checked')).map(cb => cb.value);
      seleccionados.forEach(amigoId => addInvitacion(amigoId, newTrip.id, activeId));
      save(LS_INV, invitaciones);

      closeModal();
      renderInvitaciones();
      renderViajes(getFilteredTrips());

      if (seleccionados.length > 0) {
        alert(`Viaje creado. Invitaciones enviadas a ${seleccionados.length} amigo(s).`);
      } else {
        alert("Viaje creado.");
      }
    });
  }

  if (btnBuscar) btnBuscar.addEventListener("click", () => renderViajes(getFilteredTrips()));
  if (btnLimpiar) {
    btnLimpiar.addEventListener("click", () => {
      if (filtroDestino) filtroDestino.value = "";
      if (filtroMes) filtroMes.value = "";
      if (filtroPresupuesto) filtroPresupuesto.value = "";
      renderViajes(getFilteredTrips());
    });
  }

  if (btnRefrescarInv) btnRefrescarInv.addEventListener("click", renderInvitaciones);

  // -------------------------
  // Init
  // -------------------------
  renderInvitaciones();
  renderViajes(getFilteredTrips());
});
