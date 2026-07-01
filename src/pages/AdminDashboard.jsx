import { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import {
  FaTicketAlt,
  FaClock,
  FaCheckCircle,
  FaStar,
  FaRegBell,
  FaRegEnvelope,
  FaArrowLeft,
  FaPaperPlane,
  FaPaperclip,
  FaCopy,
  FaChevronDown,
  FaSignOutAlt,
} from "react-icons/fa";
import "./Dashboard.css";
import baprosaLogo from "../assets/baprosa-logo.png";
import { useNotificaciones, ToastContainer } from "../hooks/useNotificaciones";

const colors = {
  naranja: "#ff7f22",
  naranjaOscuro: "#e66a10",
  naranjaClaro: "#fff1e6",
  texto: "#1e293b",
  textoSec: "#64748b",
  textoMuted: "#94a3b8",
  borde: "#eef1f5",
  fondo: "#fdf0e6",
  verde: "#16a34a",
  verdeClaro: "#e9f9ee",
  rojo: "#dc2626",
  rojoClaro: "#fee2e2",
  amarillo: "#d97706",
  amarilloClaro: "#fef3e2",
};

export default function AdminDashboard({ usuario, cerrarSesion }) {
  const navigate = useNavigate();
  const [tickets, setTickets] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");

  const [ticketSeleccionado, setTicketSeleccionado] = useState(null);
  const [mensajesChat, setMensajesChat] = useState([]);
  const [nuevoMensaje, setNuevoMensaje] = useState("");
  const [estadoTicket, setEstadoTicket] = useState("Creado");
  const [horasEstimadasInput, setHorasEstimadasInput] = useState("");
  const [mostrarPersonalizado, setMostrarPersonalizado] = useState(false);

  const [tabActiva, setTabActiva] = useState("conversaciones");
  const [misTareas, setMisTareas] = useState([]);
  const [cargandoTareas, setCargandoTareas] = useState(false);
  const [filtroActivo, setFiltroActivo] = useState("pendientes"); 
  const [busqueda, setBusqueda] = useState("");
  const { toasts } = useNotificaciones(usuario);
  const [menuAvatarAbierto, setMenuAvatarAbierto] = useState(false);
  const [panelNotifAbierto, setPanelNotifAbierto] = useState(false);
  const [panelCorreoAbierto, setPanelCorreoAbierto] = useState(false);
  const [notificaciones, setNotificaciones] = useState([]);
  const [correosRecientes, setCorreosRecientes] = useState([]);
  const [totalPendientes, setTotalPendientes] = useState(0);
  const avatarRef = useRef(null);
  const notifRef = useRef(null);
  const correoRef = useRef(null);

  const cargarNotificaciones = () => {
    fetch("http://localhost:3000/api/notificaciones", { headers: authHeaders() })
      .then((r) => r.json())
      .then((data) => {
        setNotificaciones(data.notificaciones || []);
        setTotalPendientes(data.totalPendientes || 0);
      })
      .catch((e) => console.error("Error notificaciones:", e));
  };

  const cargarCorreos = () => {
    fetch("http://localhost:3000/api/notificaciones/correos", { headers: authHeaders() })
      .then((r) => r.json())
      .then((data) => setCorreosRecientes(Array.isArray(data) ? data : []))
      .catch((e) => console.error("Error correos:", e));
  };

  useEffect(() => {
    cargarNotificaciones();
    // Refresca notificaciones cada 60 segundos
    const intervalo = setInterval(cargarNotificaciones, 60000);
    return () => clearInterval(intervalo);
  }, []);

  // Cerrar paneles al hacer clic fuera
  useEffect(() => {
    const cerrar = (e) => {
      if (avatarRef.current && !avatarRef.current.contains(e.target)) setMenuAvatarAbierto(false);
      if (notifRef.current && !notifRef.current.contains(e.target)) setPanelNotifAbierto(false);
      if (correoRef.current && !correoRef.current.contains(e.target)) setPanelCorreoAbierto(false);
    };
    document.addEventListener("mousedown", cerrar);
    return () => document.removeEventListener("mousedown", cerrar);
  }, []);

  const colorNotif = (tipo) => {
    if (tipo === "riesgo") return { bg: "#fee2e2", color: "#991b1b", label: "En riesgo" };
    if (tipo === "encuesta") return { bg: "#e9f9ee", color: "#16a34a", label: "Encuesta" };
    if (tipo === "subtarea") return { bg: "#eff6ff", color: "#1d4ed8", label: "Sub-tarea" };
    return { bg: "#fff1e6", color: "#9a3412", label: "Nuevo" };
  };

  const cargarMisTareas = () => {
    setCargandoTareas(true);
    fetch("http://localhost:3000/api/tasks", { headers: authHeaders() })
      .then((res) => res.json())
      .then((data) => setMisTareas(Array.isArray(data) ? data : []))
      .catch((err) => console.error("Error al cargar tareas:", err))
      .finally(() => setCargandoTareas(false));
  };

  const actualizarEstadoTarea = (taskId, nuevoEstado) => {
    fetch(`http://localhost:3000/api/tasks/${taskId}`, {
      method: "PUT",
      headers: authHeaders(),
      body: JSON.stringify({ estado: nuevoEstado }),
    })
      .then((res) => res.json())
      .then((taskActualizada) => {
        setMisTareas((prev) =>
          prev.map((t) => (t.id === taskId ? { ...t, ...taskActualizada } : t))
        );
      })
      .catch((err) => console.error("Error al actualizar tarea:", err));
  };

  const construirHistorial = (ticket) => {
    const eventos = [{ etiqueta: "Creado", fecha: ticket.creadoAt }];
    if (ticket.vistoAt) eventos.push({ etiqueta: "Tomado por el asesor", fecha: ticket.vistoAt });
    if (ticket.resueltoAt) eventos.push({ etiqueta: "Resuelto", fecha: ticket.resueltoAt });
    if (ticket.encuesta?.respondidaAt) {
      eventos.push({
        etiqueta: `Encuesta respondida (${ticket.encuesta.calificacion} ★)`,
        fecha: ticket.encuesta.respondidaAt,
      });
    }
    return eventos.sort((a, b) => new Date(a.fecha) - new Date(b.fecha));
  };

  const declararTiempo = (horas) => {
    fetch(`http://localhost:3000/api/tickets/${ticketSeleccionado.id}/tiempo-estimado`, {
      method: "PUT",
      headers: authHeaders(),
      body: JSON.stringify({ horasEstimadas: horas }),
    })
      .then((res) => res.json())
      .then((ticketActualizado) => {
        setTicketSeleccionado((prev) => ({ ...prev, ...ticketActualizado }));
        setTickets((prev) =>
          prev.map((t) => (t.id === ticketActualizado.id ? { ...t, ...ticketActualizado } : t))
        );
        setEstadoTicket(ticketActualizado.estado);
        setMostrarPersonalizado(false);
        setHorasEstimadasInput("");
      })
      .catch((err) => console.error("Error al declarar tiempo estimado:", err));
  };

  const chatEndRef = useRef(null);

  const authHeaders = () => ({
    "Content-Type": "application/json",
    Authorization: `Bearer ${localStorage.getItem("token")}`,
  });

  const cargarTickets = () => {
    setCargando(true);
    fetch("http://localhost:3000/api/tickets", {
      headers: authHeaders(),
    })
      .then((res) => {
        if (res.status === 401) {
          cerrarSesion();
          navigate("/");
          return [];
        }
        return res.json();
      })
      .then((data) => {
        setTickets(Array.isArray(data) ? data : []);
        setError("");
      })
      .catch((err) => {
        console.error("Error al conectar con el backend:", err);
        setError("No se pudieron cargar los tickets. Verifica que el servidor esté activo.");
      })
      .finally(() => setCargando(false));
  };

  useEffect(() => {
    cargarTickets();
  }, []);

  useEffect(() => {
    if (chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [mensajesChat]);

  const stats = {
    totalTickets: tickets.length,
    enProceso: tickets.filter((t) => t.estado === "En Proceso").length,
    resueltos: tickets.filter((t) => t.estado === "Resuelto").length,
    satisfaccion: (() => {
      const calificados = tickets.filter((t) => t.encuesta?.calificacion);
      if (calificados.length === 0) return "—";
      const promedio =
        calificados.reduce((acc, t) => acc + t.encuesta.calificacion, 0) / calificados.length;
      return promedio.toFixed(1);
    })(),
  };

  const abrirTicketChat = (ticket) => {
    setTicketSeleccionado(ticket);
    setEstadoTicket(ticket.estado);
    setTabActiva("conversaciones");

    setMensajesChat([
      {
        id: 1,
        remitente: ticket.nombre,
        texto: ticket.descripcion || "Sin descripción adicional.",
        hora: new Date(ticket.creadoAt).toLocaleString(),
        esAdmin: false,
      },
    ]);

    if (ticket.estado === "Creado") {
      cambiarEstado(ticket.id, "En Proceso", false);
    }
  };

  const cambiarEstado = (ticketId, nuevoEstado, actualizarSeleccionado = true) => {
    fetch(`http://localhost:3000/api/tickets/${ticketId}`, {
      method: "PUT",
      headers: authHeaders(),
      body: JSON.stringify({ estado: nuevoEstado }),
    })
      .then((res) => res.json())
      .then((ticketActualizado) => {
        setTickets((prev) =>
          prev.map((t) => (t.id === ticketId ? { ...t, ...ticketActualizado } : t))
        );
        if (actualizarSeleccionado) {
          setEstadoTicket(nuevoEstado);
        }
      })
      .catch((err) => console.error("Error al actualizar el ticket:", err));
  };

  const handleEnviarMensaje = (e) => {
    e.preventDefault();
    if (!nuevoMensaje.trim()) return;

    setMensajesChat((prev) => [
      ...prev,
      {
        id: prev.length + 1,
        remitente: usuario?.name || "Asesor",
        texto: nuevoMensaje,
        hora: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        esAdmin: true,
      },
    ]);
    setNuevoMensaje("");
  };

  const getIniciales = (name) => {
    if (!name) return "A";
    const parts = name.split(" ");
    return parts.length > 1 ? `${parts[0][0]}${parts[1][0]}`.toUpperCase() : parts[0][0].toUpperCase();
  };

  const estaEnRiesgo = (ticket) => {
    if (!ticket.fechaLimite || ticket.estado === "Resuelto") return false;
    return new Date(ticket.fechaLimite) < new Date();
  };

  const progresoTiempo = (ticket) => {
    if (!ticket.fechaLimiteAsesor || !ticket.vistoAt) return null;
    const inicio = new Date(ticket.vistoAt).getTime();
    const fin = new Date(ticket.fechaLimiteAsesor).getTime();
    const ahora = ticket.estado === "Resuelto" && ticket.resueltoAt
      ? new Date(ticket.resueltoAt).getTime()
      : Date.now();
    const total = fin - inicio;
    const transcurrido = ahora - inicio;
    if (total <= 0) return 100;
    return Math.min(150, Math.max(0, (transcurrido / total) * 100));
  };

  // Progreso visual 0-100 para la barra de cada tarjeta de ticket en la lista
  const progresoVisualLista = (ticket) => {
    if (ticket.estado === "Resuelto") return 100;
    const p = progresoTiempo(ticket);
    if (p === null) return ticket.estado === "En Proceso" ? 35 : 8;
    return Math.min(100, p);
  };

  const KPI = ({ icon, valor, etiqueta, bg, badge, badgeColor, filtro }) => (
    <div
      onClick={() => setFiltroActivo(filtro || "todos")}
      style={{
        backgroundColor: "#ffffff",
        padding: "18px 20px",
        borderRadius: "12px",
        border: filtroActivo === (filtro || "todos")
          ? `2px solid ${colors.naranja}`
          : `1px solid ${colors.borde}`,
        cursor: "pointer",
        transition: "box-shadow 0.18s ease, transform 0.18s ease, border 0.15s ease",
        userSelect: "none",
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.boxShadow = "0 6px 18px rgba(15, 23, 42, 0.07)";
        e.currentTarget.style.transform = "translateY(-2px)";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.boxShadow = "none";
        e.currentTarget.style.transform = "translateY(0)";
      }}
    >
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
        <div
          style={{
            width: "34px",
            height: "34px",
            borderRadius: "9px",
            backgroundColor: bg,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          {icon}
        </div>
        {badge && (
          <span style={{ fontSize: "11px", fontWeight: "700", color: badgeColor || colors.textoMuted }}>
            {badge}
          </span>
        )}
      </div>
      <h3
        style={{
          margin: "12px 0 0 0",
          fontSize: "28px",
          fontWeight: "800",
          color: colors.texto,
          fontFamily: "'Manrope', 'Segoe UI', sans-serif",
          letterSpacing: "-0.5px",
        }}
      >
        {valor}
      </h3>
      <p style={{ margin: "3px 0 0 0", fontSize: "12.5px", color: colors.textoSec }}>{etiqueta}</p>
    </div>
  );

  return (
    <div style={{ display: "flex", minHeight: "100vh", backgroundColor: colors.fondo, fontFamily: "'Segoe UI', sans-serif" }}>
      <link
        href="https://fonts.googleapis.com/css2?family=Manrope:wght@500;700;800&display=swap"
        rel="stylesheet"
      />
      <Sidebar usuario={usuario} cerrarSesion={cerrarSesion} />

      {/* ── TOASTS de notificación en tiempo real ── */}
      <ToastContainer toasts={toasts} />

      <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>
        {/* ===== TOPBAR BLANCA ===== */}
        <div
          style={{
            height: "65px",
            width: "100%",
            backgroundColor: "#ffffff",
            borderBottom: `1px solid ${colors.borde}`,
            boxShadow: "0 1px 4px rgba(15,23,42,0.04)",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "0 28px",
            boxSizing: "border-box",
            position: "relative",
            flexShrink: 0,
          }}
        >
          {/* Logo Baprosa — izquierda del topbar */}
          <img
            src={baprosaLogo}
            alt="Baprosa"
            style={{ height: "46px", width: "auto", objectFit: "contain" }}
          />

          {/* Iconos derecha */}
          <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
          <div ref={notifRef} style={{ position: "relative" }}>
            <button
              onClick={() => { setPanelNotifAbierto((v) => !v); setPanelCorreoAbierto(false); setMenuAvatarAbierto(false); }}
              style={{ background: "none", border: "none", cursor: "pointer", position: "relative", padding: "8px", borderRadius: "10px", color: colors.textoSec, display: "flex", alignItems: "center", justifyContent: "center", transition: "background 0.15s" }}
              onMouseEnter={(e) => (e.currentTarget.style.background = colors.fondo)}
              onMouseLeave={(e) => (e.currentTarget.style.background = "none")}
            >
              <FaRegBell style={{ fontSize: "22px" }} />
              {notificaciones.length > 0 && (
                <span style={{ position: "absolute", top: "4px", right: "4px", minWidth: "17px", height: "17px", borderRadius: "9px", backgroundColor: colors.rojo, color: "white", fontSize: "10px", fontWeight: "800", display: "flex", alignItems: "center", justifyContent: "center", border: "2px solid white", padding: "0 3px" }}>
                  {notificaciones.length > 9 ? "9+" : notificaciones.length}
                </span>
              )}
            </button>
            {panelNotifAbierto && (
              <div style={{ position: "absolute", top: "52px", right: 0, width: "340px", backgroundColor: "#ffffff", borderRadius: "12px", boxShadow: "0 12px 32px rgba(15,23,42,0.15)", border: `1px solid ${colors.borde}`, zIndex: 50, overflow: "hidden" }}>
                <div style={{ padding: "14px 18px", borderBottom: `1px solid ${colors.borde}`, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <span style={{ fontWeight: "700", fontSize: "14px", color: colors.texto }}>Notificaciones</span>
                  {totalPendientes > 0 && <span style={{ fontSize: "11px", backgroundColor: colors.naranjaClaro, color: colors.naranja, padding: "3px 8px", borderRadius: "6px", fontWeight: "700" }}>{totalPendientes} pendientes</span>}
                </div>
                <div style={{ maxHeight: "320px", overflowY: "auto" }}>
                  {notificaciones.length === 0 ? (
                    <div style={{ padding: "28px", textAlign: "center", color: colors.textoMuted, fontSize: "13px" }}>Sin notificaciones nuevas</div>
                  ) : notificaciones.map((n, i) => {
                    const c = colorNotif(n.tipo);
                    return (
                      <div key={i} onClick={() => { if (n.ticketId) setPanelNotifAbierto(false); }} style={{ padding: "12px 18px", borderBottom: i < notificaciones.length - 1 ? `1px solid ${colors.borde}` : "none", cursor: n.ticketId ? "pointer" : "default" }}
                        onMouseEnter={(e) => (e.currentTarget.style.background = colors.fondo)}
                        onMouseLeave={(e) => (e.currentTarget.style.background = "white")}
                      >
                        <div style={{ display: "flex", gap: "10px", alignItems: "flex-start" }}>
                          <span style={{ fontSize: "10px", fontWeight: "700", padding: "3px 7px", borderRadius: "5px", backgroundColor: c.bg, color: c.color, whiteSpace: "nowrap", marginTop: "2px" }}>{c.label}</span>
                          <div>
                            <p style={{ margin: 0, fontSize: "12.5px", fontWeight: "700", color: colors.texto }}>{n.titulo}</p>
                            <p style={{ margin: "2px 0 0", fontSize: "11.5px", color: colors.textoSec }}>{n.detalle}</p>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* Correo — tickets recientes */}
          <div ref={correoRef} style={{ position: "relative" }}>
            <button
              onClick={() => { setPanelCorreoAbierto((v) => !v); setPanelNotifAbierto(false); setMenuAvatarAbierto(false); cargarCorreos(); }}
              style={{ background: "none", border: "none", cursor: "pointer", padding: "8px", borderRadius: "10px", color: colors.textoSec, display: "flex", alignItems: "center", justifyContent: "center", transition: "background 0.15s" }}
              onMouseEnter={(e) => (e.currentTarget.style.background = colors.fondo)}
              onMouseLeave={(e) => (e.currentTarget.style.background = "none")}
            >
              <FaRegEnvelope style={{ fontSize: "22px" }} />
            </button>
            {panelCorreoAbierto && (
              <div style={{ position: "absolute", top: "52px", right: 0, width: "340px", backgroundColor: "#ffffff", borderRadius: "12px", boxShadow: "0 12px 32px rgba(15,23,42,0.15)", border: `1px solid ${colors.borde}`, zIndex: 50, overflow: "hidden" }}>
                <div style={{ padding: "14px 18px", borderBottom: `1px solid ${colors.borde}` }}>
                  <span style={{ fontWeight: "700", fontSize: "14px", color: colors.texto }}>Tickets recientes</span>
                </div>
                <div style={{ maxHeight: "320px", overflowY: "auto" }}>
                  {correosRecientes.length === 0 ? (
                    <div style={{ padding: "28px", textAlign: "center", color: colors.textoMuted, fontSize: "13px" }}>Sin tickets recientes</div>
                  ) : correosRecientes.map((t, i) => (
                    <div key={i} style={{ padding: "12px 18px", borderBottom: i < correosRecientes.length - 1 ? `1px solid ${colors.borde}` : "none" }}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "8px" }}>
                        <div>
                          <p style={{ margin: 0, fontSize: "12.5px", fontWeight: "700", color: colors.texto }}>{t.nombre}</p>
                          <p style={{ margin: "2px 0 0", fontSize: "11px", color: colors.textoSec }}>{t.correo} · {t.area || "—"}</p>
                        </div>
                        <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: "4px", flexShrink: 0 }}>
                          <span style={{ fontSize: "10px", fontWeight: "700", padding: "2px 7px", borderRadius: "5px", backgroundColor: colors.naranjaClaro, color: "#9a3412" }}>{t.tipo}</span>
                          <span style={{ fontSize: "10px", color: colors.textoMuted }}>#TK-{t.id}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Separador */}
          <div style={{ width: "1px", height: "28px", backgroundColor: colors.borde, margin: "0 8px" }}></div>

          {/* Avatar con menú */}
          <div ref={avatarRef} style={{ position: "relative" }}>
            <div
              onClick={() => { setMenuAvatarAbierto((v) => !v); setPanelNotifAbierto(false); setPanelCorreoAbierto(false); }}
              style={{ display: "flex", alignItems: "center", gap: "10px", cursor: "pointer", padding: "6px 10px", borderRadius: "10px", transition: "background 0.15s" }}
              onMouseEnter={(e) => (e.currentTarget.style.background = colors.fondo)}
              onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
            >
              <div style={{ width: "38px", height: "38px", borderRadius: "50%", backgroundColor: colors.naranjaClaro, color: colors.naranja, display: "flex", alignItems: "center", justifyContent: "center", fontWeight: "800", fontSize: "13px", flexShrink: 0 }}>
                {getIniciales(usuario?.name)}
              </div>
              <div style={{ display: "flex", flexDirection: "column" }}>
                <span style={{ fontSize: "13px", fontWeight: "700", color: colors.texto, lineHeight: "1.2" }}>
                  {usuario?.name || "Asesor"}
                </span>
                <span style={{ fontSize: "11px", color: colors.textoSec, marginTop: "1px" }}>
                  {usuario?.areaNombre || usuario?.areaEmpresa || usuario?.role}
                </span>
              </div>
              <FaChevronDown style={{ color: colors.textoMuted, fontSize: "10px", transform: menuAvatarAbierto ? "rotate(180deg)" : "rotate(0deg)", transition: "transform 0.15s ease" }} />
            </div>

            {menuAvatarAbierto && (
              <div style={{ position: "absolute", top: "56px", right: 0, backgroundColor: "#ffffff", border: `1px solid ${colors.borde}`, borderRadius: "10px", boxShadow: "0 8px 24px rgba(15,23,42,0.12)", minWidth: "200px", overflow: "hidden", zIndex: 50 }}>
                <div style={{ padding: "14px 16px", borderBottom: `1px solid ${colors.borde}` }}>
                  <p style={{ margin: 0, fontSize: "13px", fontWeight: "700", color: colors.texto }}>{usuario?.name}</p>
                  <p style={{ margin: "3px 0 0", fontSize: "11.5px", color: colors.textoSec }}>{usuario?.email}</p>
                  <p style={{ margin: "3px 0 0", fontSize: "11px", color: colors.naranja, fontWeight: "700" }}>{usuario?.areaNombre || usuario?.areaEmpresa || usuario?.role}</p>
                </div>
                <div
                  onClick={() => { setMenuAvatarAbierto(false); if (cerrarSesion) cerrarSesion(); navigate("/"); }}
                  style={{ display: "flex", alignItems: "center", gap: "10px", padding: "11px 16px", fontSize: "13px", fontWeight: "600", color: colors.rojo, cursor: "pointer" }}
                  onMouseEnter={(e) => (e.currentTarget.style.background = "#fff0f0")}
                  onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                >
                  <FaSignOutAlt style={{ fontSize: "13px" }} />
                  Cerrar sesión
                </div>
              </div>
            )}
          </div>
          </div>{/* fin iconos derecha */}
        </div>{/* fin topbar */}

        <div style={{ flex: 1, overflowY: "auto", padding: "30px" }}>
          {/* KPI cards rediseñadas */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "16px", marginBottom: "30px" }}>
            <KPI
              icon={<FaTicketAlt style={{ color: colors.naranja, fontSize: "15px" }} />}
              bg={colors.naranjaClaro}
              valor={stats.totalTickets}
              etiqueta="Tickets asignados"
              badge={stats.totalTickets > 0 ? "Activo" : null}
              badgeColor={colors.naranja}
              filtro="todos"
            />
            <KPI
              icon={<FaClock style={{ color: colors.amarillo, fontSize: "15px" }} />}
              bg={colors.amarilloClaro}
              valor={stats.enProceso}
              etiqueta="En proceso"
              filtro="En Proceso"
            />
            <KPI
              icon={<FaCheckCircle style={{ color: colors.verde, fontSize: "15px" }} />}
              bg={colors.verdeClaro}
              valor={stats.resueltos}
              etiqueta="Resueltos"
              badge={stats.totalTickets > 0 ? `${Math.round((stats.resueltos / stats.totalTickets) * 100)}%` : null}
              badgeColor={colors.verde}
              filtro="Resuelto"
            />
            <KPI
              icon={<FaStar style={{ color: colors.naranja, fontSize: "15px" }} />}
              bg={colors.naranjaClaro}
              valor={stats.satisfaccion}
              etiqueta="Satisfacción"
              badge="Promedio"
              filtro="todos"
            />
          </div>

          {error && (
            <div
              style={{
                backgroundColor: "#fef2f2",
                border: "1px solid #fecaca",
                color: "#b91c1c",
                padding: "14px 20px",
                borderRadius: "10px",
                marginBottom: "20px",
                fontSize: "13px",
              }}
            >
              {error}
            </div>
          )}

          {!ticketSeleccionado ? (
            <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
              {/* Encabezado con buscador y filtro activo */}
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "12px" }}>
                <div style={{ fontSize: "14px", fontWeight: "700", color: "#334155", fontFamily: "'Manrope', 'Segoe UI', sans-serif", display: "flex", alignItems: "center", gap: "8px" }}>
                  <span style={{ color: colors.naranja }}>●</span>
                  {filtroActivo === "todos" && "Todos los incidentes"}
                  {filtroActivo === "pendientes" && "Incidentes pendientes"}
                  {filtroActivo === "En Proceso" && "Incidentes en proceso"}
                  {filtroActivo === "Resuelto" && "Incidentes resueltos"}
                </div>
                <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
                  {/* Buscador */}
                  <div style={{ position: "relative" }}>
                    <input
                      type="text"
                      placeholder="Buscar por ID o palabra clave..."
                      value={busqueda}
                      onChange={(e) => setBusqueda(e.target.value)}
                      style={{
                        padding: "8px 14px 8px 34px",
                        borderRadius: "9px",
                        border: `1px solid ${colors.borde}`,
                        fontSize: "13px",
                        outline: "none",
                        width: "240px",
                        backgroundColor: "#ffffff",
                        color: colors.texto,
                        fontFamily: "inherit",
                        transition: "border-color 0.15s ease",
                      }}
                      onFocus={(e) => (e.target.style.borderColor = colors.naranja)}
                      onBlur={(e) => (e.target.style.borderColor = colors.borde)}
                    />
                    <span style={{ position: "absolute", left: "10px", top: "50%", transform: "translateY(-50%)", color: colors.textoMuted, fontSize: "13px", pointerEvents: "none" }}>🔍</span>
                    {busqueda && (
                      <button
                        onClick={() => setBusqueda("")}
                        style={{ position: "absolute", right: "8px", top: "50%", transform: "translateY(-50%)", background: "none", border: "none", color: colors.textoMuted, cursor: "pointer", fontSize: "14px", lineHeight: 1 }}
                      >×</button>
                    )}
                  </div>
                  {/* Botón "Solo pendientes" / "Ver todos" */}
                  <button
                    onClick={() => setFiltroActivo(filtroActivo === "pendientes" ? "todos" : "pendientes")}
                    style={{
                      padding: "8px 14px",
                      borderRadius: "9px",
                      border: `1px solid ${filtroActivo === "pendientes" ? colors.naranja : colors.borde}`,
                      backgroundColor: filtroActivo === "pendientes" ? colors.naranjaClaro : "#ffffff",
                      color: filtroActivo === "pendientes" ? colors.naranja : colors.textoSec,
                      fontSize: "12.5px",
                      fontWeight: "700",
                      cursor: "pointer",
                      fontFamily: "inherit",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {filtroActivo === "pendientes" ? "Ver todos" : "Solo pendientes"}
                  </button>
                </div>
              </div>

              {cargando ? (
                <div
                  style={{
                    backgroundColor: "#ffffff",
                    borderRadius: "12px",
                    padding: "44px",
                    textAlign: "center",
                    border: `1px solid ${colors.borde}`,
                    color: colors.textoSec,
                    fontSize: "14px",
                  }}
                >
                  Cargando tickets...
                </div>
              ) : tickets.length === 0 ? (
                <div
                  style={{
                    backgroundColor: "#ffffff",
                    borderRadius: "12px",
                    padding: "44px",
                    textAlign: "center",
                    border: `1px solid ${colors.borde}`,
                    color: colors.textoSec,
                    fontSize: "14px",
                  }}
                >
                  No tienes incidentes asignados en este momento.
                </div>
              ) : (
                (() => {
                  // Filtrado por KPI clickeable
                  let ticketsFiltrados = tickets.filter((t) => {
                    if (filtroActivo === "pendientes") return t.estado !== "Resuelto";
                    if (filtroActivo === "En Proceso") return t.estado === "En Proceso";
                    if (filtroActivo === "Resuelto") return t.estado === "Resuelto";
                    return true; // "todos"
                  });

                  // Filtrado por búsqueda (ID o texto en nombre/tipo/solicitante)
                  if (busqueda.trim()) {
                    const q = busqueda.trim().toLowerCase();
                    ticketsFiltrados = ticketsFiltrados.filter(
                      (t) =>
                        `tk-${t.id}`.includes(q) ||
                        String(t.id).includes(q) ||
                        t.tipo?.toLowerCase().includes(q) ||
                        t.nombre?.toLowerCase().includes(q) ||
                        t.area?.toLowerCase().includes(q)
                    );
                  }

                  if (ticketsFiltrados.length === 0) {
                    return (
                      <div style={{ backgroundColor: "#ffffff", borderRadius: "12px", padding: "44px", textAlign: "center", border: `1px solid ${colors.borde}`, color: colors.textoSec, fontSize: "14px" }}>
                        {busqueda ? `No se encontraron tickets para "${busqueda}"` : "No hay incidentes en esta categoría."}
                      </div>
                    );
                  }

                  return ticketsFiltrados.map((t) => {
                  const enRiesgo = estaEnRiesgo(t);
                  const colorBorde = enRiesgo ? colors.rojo : t.estado === "Resuelto" ? colors.verde : colors.naranja;
                  const progreso = progresoVisualLista(t);
                  return (
                    <div
                      key={t.id}
                      style={{
                        backgroundColor: "#ffffff",
                        borderRadius: "0 12px 12px 0",
                        border: `1px solid ${colors.borde}`,
                        borderLeftWidth: "4px",
                        borderLeftColor: colorBorde,
                        padding: "22px 26px",
                        transition: "box-shadow 0.18s ease",
                        cursor: "pointer",
                      }}
                      onClick={() => abrirTicketChat(t)}
                      onMouseEnter={(e) => (e.currentTarget.style.boxShadow = "0 4px 14px rgba(15, 23, 42, 0.05)")}
                      onMouseLeave={(e) => (e.currentTarget.style.boxShadow = "none")}
                    >
                      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "8px" }}>
                        <span style={{ fontSize: "12px", color: colors.textoMuted, fontWeight: "700" }}>
                          #TK-{t.id}
                        </span>
                        <div style={{ display: "flex", gap: "8px" }}>
                          {enRiesgo && (
                            <span
                              style={{
                                fontSize: "11px",
                                padding: "3px 9px",
                                backgroundColor: colors.rojoClaro,
                                color: "#991b1b",
                                borderRadius: "7px",
                                fontWeight: "700",
                              }}
                            >
                              En riesgo
                            </span>
                          )}
                          <span
                            style={{
                              fontSize: "11px",
                              padding: "3px 9px",
                              backgroundColor: colors.naranjaClaro,
                              color: "#9a3412",
                              borderRadius: "7px",
                              fontWeight: "700",
                            }}
                          >
                            {t.prioridad}
                          </span>
                        </div>
                      </div>

                      <h4
                        style={{
                          margin: "0 0 4px 0",
                          fontSize: "16px",
                          fontWeight: "700",
                          color: colors.texto,
                          fontFamily: "'Manrope', 'Segoe UI', sans-serif",
                        }}
                      >
                        {t.tipo}
                      </h4>
                      <p style={{ margin: "0 0 14px 0", fontSize: "13px", color: colors.textoSec }}>
                        Solicitante: <span style={{ fontWeight: "600", color: "#475569" }}>{t.nombre}</span> · Área:{" "}
                        {t.area || "—"} · Origen: {t.origen}
                      </p>

                      <div
                        style={{
                          height: "5px",
                          backgroundColor: colors.borde,
                          borderRadius: "4px",
                          overflow: "hidden",
                          marginBottom: "14px",
                        }}
                      >
                        <div
                          style={{
                            width: `${progreso}%`,
                            height: "100%",
                            backgroundColor: colorBorde,
                            transition: "width 0.4s ease",
                          }}
                        />
                      </div>

                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                        <span style={{ fontSize: "12px", color: colors.textoSec }}>
                          Estado: <b style={{ color: colors.naranja }}>{t.estado}</b>
                        </span>
                        <div style={{ display: "flex", gap: "10px" }} onClick={(e) => e.stopPropagation()}>
                          <button
                            onClick={() => abrirTicketChat(t)}
                            style={{
                              backgroundColor: colors.naranja,
                              color: "white",
                              border: "none",
                              padding: "7px 18px",
                              borderRadius: "7px",
                              fontSize: "12px",
                              fontWeight: "700",
                              cursor: "pointer",
                              transition: "background-color 0.15s ease",
                            }}
                            onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = colors.naranjaOscuro)}
                            onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = colors.naranja)}
                          >
                            Abrir
                          </button>
                          {t.estado !== "Resuelto" && (
                            <button
                              onClick={() => cambiarEstado(t.id, "Resuelto")}
                              style={{
                                backgroundColor: colors.verde,
                                color: "white",
                                border: "none",
                                padding: "7px 18px",
                                borderRadius: "7px",
                                fontSize: "12px",
                                fontWeight: "700",
                                cursor: "pointer",
                              }}
                            >
                              Finalizar
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })
                })()
              )}
            </div>
          ) : (
            <div style={{ display: "flex", gap: "24px", alignItems: "stretch" }}>
              <div
                style={{
                  flex: 1.7,
                  backgroundColor: "#ffffff",
                  borderRadius: "12px",
                  border: `1px solid ${colors.borde}`,
                  display: "flex",
                  flexDirection: "column",
                  height: "550px",
                }}
              >
                <div
                  style={{
                    padding: "16px 20px",
                    borderBottom: `1px solid ${colors.borde}`,
                    display: "flex",
                    alignItems: "center",
                    gap: "12px",
                    backgroundColor: "#fafbfc",
                  }}
                >
                  <button
                    onClick={() => {
                      setTicketSeleccionado(null);
                      cargarTickets();
                    }}
                    style={{ background: "none", border: "none", color: colors.textoSec, cursor: "pointer" }}
                  >
                    <FaArrowLeft />
                  </button>
                  <span style={{ fontWeight: "700", color: colors.texto, fontSize: "14px" }}>
                    #TK-{ticketSeleccionado.id} - {ticketSeleccionado.tipo}
                  </span>
                </div>

                <div style={{ display: "flex", borderBottom: `1px solid ${colors.borde}`, padding: "0 20px", gap: "4px" }}>
                  {[
                    { key: "conversaciones", label: "Conversaciones" },
                    { key: "tareas", label: "Tareas" },
                    { key: "historial", label: "Historial" },
                  ].map((tab) => (
                    <button
                      key={tab.key}
                      onClick={() => {
                        setTabActiva(tab.key);
                        if (tab.key === "tareas") cargarMisTareas();
                      }}
                      style={{
                        padding: "10px 16px",
                        border: "none",
                        background: "none",
                        cursor: "pointer",
                        fontSize: "13px",
                        fontWeight: tabActiva === tab.key ? "700" : "500",
                        color: tabActiva === tab.key ? colors.naranja : colors.textoSec,
                        borderBottom: tabActiva === tab.key ? `2px solid ${colors.naranja}` : "2px solid transparent",
                        transition: "color 0.15s ease",
                      }}
                    >
                      {tab.label}
                    </button>
                  ))}
                </div>

                {tabActiva === "conversaciones" && (
                  <>
                    <div
                      style={{
                        flex: 1,
                        padding: "20px",
                        overflowY: "auto",
                        backgroundColor: colors.fondo,
                        display: "flex",
                        flexDirection: "column",
                        gap: "12px",
                      }}
                    >
                      {mensajesChat.map((m) => (
                        <div
                          key={m.id}
                          style={{
                            display: "flex",
                            flexDirection: "column",
                            alignSelf: m.esAdmin ? "flex-end" : "flex-start",
                            maxWidth: "80%",
                          }}
                        >
                          <div
                            style={{
                              backgroundColor: m.esAdmin ? colors.naranja : "white",
                              color: m.esAdmin ? "white" : colors.texto,
                              padding: "10px 14px",
                              borderRadius: m.esAdmin ? "10px 10px 2px 10px" : "10px 10px 10px 2px",
                              fontSize: "13px",
                              boxShadow: m.esAdmin ? "none" : "0 1px 2px rgba(15,23,42,0.04)",
                            }}
                          >
                            {m.texto}
                            <div style={{ fontSize: "9px", textAlign: "right", marginTop: "4px", opacity: 0.8 }}>
                              {m.hora}
                            </div>
                          </div>
                        </div>
                      ))}
                      <div ref={chatEndRef} />
                    </div>

                    <form
                      onSubmit={handleEnviarMensaje}
                      style={{
                        padding: "14px 20px",
                        borderTop: `1px solid ${colors.borde}`,
                        display: "flex",
                        gap: "10px",
                        alignItems: "center",
                      }}
                    >
                      <button type="button" style={{ background: "none", border: "none", color: colors.textoSec }}>
                        <FaPaperclip />
                      </button>
                      <input
                        type="text"
                        value={nuevoMensaje}
                        onChange={(e) => setNuevoMensaje(e.target.value)}
                        placeholder="Escribe una respuesta..."
                        style={{
                          flex: 1,
                          padding: "10px 16px",
                          borderRadius: "20px",
                          border: `1px solid ${colors.borde}`,
                          outline: "none",
                          fontSize: "13px",
                          transition: "border-color 0.15s ease",
                        }}
                        onFocus={(e) => (e.target.style.borderColor = colors.naranja)}
                        onBlur={(e) => (e.target.style.borderColor = colors.borde)}
                      />
                      <button
                        type="submit"
                        style={{
                          backgroundColor: colors.naranja,
                          color: "white",
                          border: "none",
                          width: "36px",
                          height: "36px",
                          borderRadius: "50%",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          cursor: "pointer",
                        }}
                      >
                        <FaPaperPlane style={{ fontSize: "12px" }} />
                      </button>
                    </form>
                  </>
                )}

                {tabActiva === "tareas" && (
                  <div style={{ flex: 1, padding: "20px", overflowY: "auto", backgroundColor: "#fafbfc" }}>
                    <p style={{ fontSize: "12px", color: colors.textoMuted, marginBottom: "14px" }}>
                      Tus tareas internas asignadas por el superadmin (no son parte de este ticket, es un recordatorio de
                      tu trabajo pendiente).
                    </p>
                    {cargandoTareas ? (
                      <p style={{ fontSize: "13px", color: colors.textoSec }}>Cargando tareas...</p>
                    ) : misTareas.length === 0 ? (
                      <p style={{ fontSize: "13px", color: colors.textoSec }}>No tienes tareas asignadas.</p>
                    ) : (
                      <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                        {misTareas.map((task) => (
                          <div
                            key={task.id}
                            style={{
                              backgroundColor: "white",
                              borderRadius: "10px",
                              padding: "14px",
                              border: `1px solid ${colors.borde}`,
                            }}
                          >
                            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                              <div>
                                <p style={{ margin: 0, fontWeight: "700", fontSize: "13px", color: colors.texto }}>
                                  {task.titulo}
                                </p>
                                <p style={{ margin: "4px 0 0", fontSize: "11px", color: colors.textoSec }}>
                                  Vence: {new Date(task.vence).toLocaleString()} · {task.area?.nombre}
                                </p>
                              </div>
                              <span
                                style={{
                                  fontSize: "10px",
                                  padding: "3px 9px",
                                  borderRadius: "7px",
                                  backgroundColor: task.estado === "Completada" ? colors.verdeClaro : colors.naranjaClaro,
                                  color: task.estado === "Completada" ? colors.verde : "#9a3412",
                                  fontWeight: "700",
                                }}
                              >
                                {task.estado}
                              </span>
                            </div>
                            {task.estado !== "Completada" && (
                              <div style={{ display: "flex", gap: "6px", marginTop: "10px" }}>
                                {task.estado === "Pendiente" && (
                                  <button
                                    onClick={() => actualizarEstadoTarea(task.id, "En Proceso")}
                                    style={{
                                      fontSize: "11px",
                                      padding: "5px 11px",
                                      borderRadius: "7px",
                                      border: `1px solid ${colors.borde}`,
                                      background: "white",
                                      cursor: "pointer",
                                      fontWeight: "600",
                                    }}
                                  >
                                    Iniciar
                                  </button>
                                )}
                                <button
                                  onClick={() => actualizarEstadoTarea(task.id, "Completada")}
                                  style={{
                                    fontSize: "11px",
                                    padding: "5px 11px",
                                    borderRadius: "7px",
                                    border: "none",
                                    background: colors.verde,
                                    color: "white",
                                    cursor: "pointer",
                                    fontWeight: "700",
                                  }}
                                >
                                  Completar
                                </button>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {tabActiva === "historial" && (
                  <div style={{ flex: 1, padding: "20px", overflowY: "auto", backgroundColor: "#fafbfc" }}>
                    <div style={{ display: "flex", flexDirection: "column" }}>
                      {construirHistorial(ticketSeleccionado).map((evento, idx) => (
                        <div key={idx} style={{ display: "flex", gap: "12px", paddingBottom: "20px" }}>
                          <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
                            <div
                              style={{
                                width: "10px",
                                height: "10px",
                                borderRadius: "50%",
                                backgroundColor: colors.naranja,
                                flexShrink: 0,
                              }}
                            />
                            {idx < construirHistorial(ticketSeleccionado).length - 1 && (
                              <div style={{ width: "2px", flex: 1, backgroundColor: colors.borde, marginTop: "4px" }} />
                            )}
                          </div>
                          <div>
                            <p style={{ margin: 0, fontSize: "13px", fontWeight: "700", color: colors.texto }}>
                              {evento.etiqueta}
                            </p>
                            <p style={{ margin: "2px 0 0", fontSize: "11px", color: colors.textoSec }}>
                              {new Date(evento.fecha).toLocaleString()}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: "18px", height: "550px", overflowY: "auto" }}>
                {ticketSeleccionado.fechaLimiteAsesor && (
                  <div
                    style={{
                      backgroundColor: "#ffffff",
                      borderRadius: "12px",
                      border: `1px solid ${colors.borde}`,
                      padding: "24px",
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                    }}
                  >
                    {(() => {
                      const progreso = progresoTiempo(ticketSeleccionado);
                      const vencido = progreso !== null && progreso >= 100 && ticketSeleccionado.estado !== "Resuelto";
                      const colorAro = vencido ? colors.rojo : colors.naranja;
                      const circunferencia = 2 * Math.PI * 54;
                      const desplazamiento =
                        circunferencia - (Math.min(progreso ?? 0, 100) / 100) * circunferencia;

                      return (
                        <>
                          <svg width="130" height="130" viewBox="0 0 130 130">
                            <circle cx="65" cy="65" r="54" fill="none" stroke="#f1f5f9" strokeWidth="10" />
                            <circle
                              cx="65"
                              cy="65"
                              r="54"
                              fill="none"
                              stroke={colorAro}
                              strokeWidth="10"
                              strokeDasharray={circunferencia}
                              strokeDashoffset={desplazamiento}
                              strokeLinecap="round"
                              transform="rotate(-90 65 65)"
                              style={{ transition: "stroke-dashoffset 0.5s ease" }}
                            />
                            <text
                              x="65"
                              y="60"
                              textAnchor="middle"
                              fontSize="20"
                              fontWeight="800"
                              fontFamily="'Manrope', sans-serif"
                              fill={colors.texto}
                            >
                              {progreso !== null ? `${Math.round(Math.min(progreso, 100))}%` : "—"}
                            </text>
                            <text x="65" y="78" textAnchor="middle" fontSize="10" fill={colors.textoMuted}>
                              {ticketSeleccionado.estado === "Resuelto" ? "completado" : "transcurrido"}
                            </text>
                          </svg>
                          <p
                            style={{
                              margin: "10px 0 0",
                              fontSize: "12px",
                              color: vencido ? colors.rojo : colors.textoSec,
                              fontWeight: vencido ? "700" : "500",
                            }}
                          >
                            {vencido
                              ? "Tiempo estimado superado"
                              : `Límite: ${new Date(ticketSeleccionado.fechaLimiteAsesor).toLocaleString()}`}
                          </p>
                        </>
                      );
                    })()}
                  </div>
                )}

                <div
                  style={{
                    backgroundColor: "#ffffff",
                    borderRadius: "12px",
                    border: `1px solid ${colors.borde}`,
                    padding: "20px",
                  }}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
                    <span style={{ fontWeight: "700", color: colors.texto, fontSize: "14px" }}>Propiedades</span>
                    <FaChevronDown style={{ color: colors.textoSec, fontSize: "12px" }} />
                  </div>

                  <div style={{ display: "flex", flexDirection: "column", gap: "12px", fontSize: "13px" }}>
                    <div style={{ display: "flex", justifyContent: "space-between" }}>
                      <span style={{ color: colors.textoSec }}>ID de la solicitud</span>
                      <span style={{ color: colors.texto, fontWeight: "700", display: "flex", alignItems: "center", gap: "6px" }}>
                        #{ticketSeleccionado.id} <FaCopy style={{ color: "#cbd5e1", cursor: "pointer" }} />
                      </span>
                    </div>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <span style={{ color: colors.textoSec }}>Estado</span>
                      <select
                        value={estadoTicket}
                        onChange={(e) => cambiarEstado(ticketSeleccionado.id, e.target.value)}
                        style={{ border: "none", color: colors.texto, fontWeight: "700", background: "none", cursor: "pointer", outline: "none" }}
                      >
                        <option value="Creado">Creado</option>
                        <option value="En Proceso">En Proceso</option>
                        <option value="Resuelto">Resuelto</option>
                      </select>
                    </div>
                    <div style={{ display: "flex", justifyContent: "space-between" }}>
                      <span style={{ color: colors.textoSec }}>Categoría</span>
                      <span style={{ color: colors.texto, fontWeight: "700" }}>
                        {ticketSeleccionado.categoria?.nombre || ticketSeleccionado.tipo}
                      </span>
                    </div>
                    <div style={{ display: "flex", justifyContent: "space-between" }}>
                      <span style={{ color: colors.textoSec }}>Origen</span>
                      <span style={{ color: colors.texto, fontWeight: "700" }}>{ticketSeleccionado.origen}</span>
                    </div>
                    <div style={{ display: "flex", justifyContent: "space-between" }}>
                      <span style={{ color: colors.textoSec }}>SLA</span>
                      <span style={{ color: estaEnRiesgo(ticketSeleccionado) ? colors.rojo : colors.naranja, fontWeight: "700" }}>
                        {ticketSeleccionado.fechaLimite
                          ? new Date(ticketSeleccionado.fechaLimite).toLocaleString()
                          : "Sin definir"}
                      </span>
                    </div>

                    <div style={{ borderTop: `1px solid ${colors.fondo}`, paddingTop: "12px", marginTop: "4px" }}>
                      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "10px" }}>
                        <span style={{ color: colors.textoSec }}>Tu tiempo estimado</span>
                        <span style={{ color: colors.texto, fontWeight: "700" }}>
                          {ticketSeleccionado.fechaLimiteAsesor
                            ? new Date(ticketSeleccionado.fechaLimiteAsesor).toLocaleString()
                            : "Sin definir"}
                        </span>
                      </div>

                      {!mostrarPersonalizado ? (
                        <div style={{ display: "flex", gap: "6px", flexWrap: "wrap" }}>
                          {[0.5, 1, 2, 4, 8].map((h) => (
                            <button
                              key={h}
                              onClick={() => declararTiempo(h)}
                              style={{
                                padding: "6px 11px",
                                fontSize: "11px",
                                borderRadius: "7px",
                                border: `1px solid ${colors.borde}`,
                                background: colors.fondo,
                                color: "#475569",
                                cursor: "pointer",
                                fontWeight: "700",
                                transition: "border-color 0.15s ease",
                              }}
                              onMouseEnter={(e) => (e.currentTarget.style.borderColor = colors.naranja)}
                              onMouseLeave={(e) => (e.currentTarget.style.borderColor = colors.borde)}
                            >
                              {h < 1 ? `${h * 60} min` : `${h}h`}
                            </button>
                          ))}
                          <button
                            onClick={() => setMostrarPersonalizado(true)}
                            style={{
                              padding: "6px 11px",
                              fontSize: "11px",
                              borderRadius: "7px",
                              border: `1px solid ${colors.naranja}`,
                              background: "white",
                              color: colors.naranja,
                              cursor: "pointer",
                              fontWeight: "700",
                            }}
                          >
                            Personalizado
                          </button>
                        </div>
                      ) : (
                        <div style={{ display: "flex", gap: "6px" }}>
                          <input
                            type="number"
                            min="0.1"
                            step="0.1"
                            placeholder="Horas"
                            value={horasEstimadasInput}
                            onChange={(e) => setHorasEstimadasInput(e.target.value)}
                            style={{ flex: 1, padding: "7px 9px", borderRadius: "7px", border: "1px solid #cbd5e1", fontSize: "12px", outline: "none" }}
                          />
                          <button
                            onClick={() => {
                              const horas = parseFloat(horasEstimadasInput);
                              if (horas > 0) declararTiempo(horas);
                            }}
                            style={{ padding: "7px 13px", borderRadius: "7px", border: "none", background: colors.naranja, color: "white", fontSize: "11px", fontWeight: "800", cursor: "pointer" }}
                          >
                            Confirmar
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                <div
                  style={{
                    backgroundColor: "#ffffff",
                    borderRadius: "12px",
                    border: `1px solid ${colors.borde}`,
                    padding: "20px",
                  }}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "14px" }}>
                    <span style={{ fontWeight: "700", color: colors.texto, fontSize: "14px" }}>Detalles del solicitante</span>
                    <FaChevronDown style={{ color: colors.textoSec, fontSize: "12px" }} />
                  </div>

                  <div style={{ display: "flex", gap: "12px", alignItems: "center", marginBottom: "16px" }}>
                    <div
                      style={{
                        width: "42px",
                        height: "42px",
                        borderRadius: "50%",
                        backgroundColor: colors.naranjaClaro,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        color: colors.naranja,
                        fontWeight: "800",
                      }}
                    >
                      {ticketSeleccionado.nombre ? ticketSeleccionado.nombre.charAt(0) : "U"}
                    </div>
                    <div style={{ display: "flex", flexDirection: "column" }}>
                      <span style={{ fontSize: "14px", fontWeight: "700", color: colors.texto }}>
                        {ticketSeleccionado.nombre}
                      </span>
                      <span style={{ fontSize: "12px", color: colors.textoSec }}>{ticketSeleccionado.correo}</span>
                    </div>
                  </div>

                  <div style={{ fontSize: "13px", display: "flex", flexDirection: "column", gap: "10px" }}>
                    <div style={{ display: "flex", justifyContent: "space-between" }}>
                      <span style={{ color: colors.textoSec }}>Área</span>
                      <span style={{ color: colors.texto, fontWeight: "700" }}>{ticketSeleccionado.area || "—"}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}