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
} from "react-icons/fa";
import "./Dashboard.css";

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
    const eventos = [
      { etiqueta: "Creado", fecha: ticket.creadoAt },
    ];
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

  return (
    <div style={{ display: "flex", minHeight: "100vh", backgroundColor: "#f4f6f8", fontFamily: "'Segoe UI', sans-serif" }}>
      <Sidebar usuario={usuario} cerrarSesion={cerrarSesion} />

      <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>
        <div style={{ height: "65px", width: "100%", backgroundColor: "#ff7f22", display: "flex", alignItems: "center", justifyContent: "flex-end", padding: "0 40px", boxSizing: "border-box" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "28px" }}>
            <FaRegBell style={{ color: "#ffffff", fontSize: "20px" }} />
            <FaRegEnvelope style={{ color: "#ffffff", fontSize: "20px" }} />
            <div style={{ width: "1px", height: "22px", backgroundColor: "rgba(255,255,255,0.25)" }}></div>
            <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
              <div style={{ width: "38px", height: "38px", borderRadius: "50%", backgroundColor: "rgba(255,255,255,0.3)", color: "#ffffff", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: "700", fontSize: "13px" }}>
                {getIniciales(usuario?.name)}
              </div>
              <div style={{ display: "flex", flexDirection: "column", color: "#ffffff" }}>
                <span style={{ fontSize: "13px", fontWeight: "600", lineHeight: "1.2" }}>{usuario?.name || "Asesor"}</span>
                <span style={{ fontSize: "11px", opacity: 0.85, marginTop: "2px" }}>{usuario?.role}</span>
              </div>
            </div>
          </div>
        </div>

        <div style={{ flex: 1, overflowY: "auto", padding: "30px" }}>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "20px", marginBottom: "35px" }}>
            <div style={{ backgroundColor: "#ffffff", padding: "20px", borderRadius: "12px", border: "1px solid #e2e8f0", height: "105px", display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
              <FaTicketAlt style={{ color: "#ff7f22", fontSize: "18px" }} />
              <div>
                <h3 style={{ margin: 0, fontSize: "26px", fontWeight: "700", color: "#1e293b" }}>{stats.totalTickets}</h3>
                <p style={{ margin: "4px 0 0 0", fontSize: "12px", color: "#64748b" }}>Tickets Asignados</p>
              </div>
            </div>

            <div style={{ backgroundColor: "#ffffff", padding: "20px", borderRadius: "12px", border: "1px solid #e2e8f0", height: "105px", display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
              <FaClock style={{ color: "#ff7f22", fontSize: "18px" }} />
              <div>
                <h3 style={{ margin: 0, fontSize: "26px", fontWeight: "700", color: "#1e293b" }}>{stats.enProceso}</h3>
                <p style={{ margin: "4px 0 0 0", fontSize: "12px", color: "#64748b" }}>En Proceso</p>
              </div>
            </div>

            <div style={{ backgroundColor: "#ffffff", padding: "20px", borderRadius: "12px", border: "1px solid #e2e8f0", height: "105px", display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
              <FaCheckCircle style={{ color: "#22c55e", fontSize: "18px" }} />
              <div>
                <h3 style={{ margin: 0, fontSize: "26px", fontWeight: "700", color: "#1e293b" }}>{stats.resueltos}</h3>
                <p style={{ margin: "4px 0 0 0", fontSize: "12px", color: "#64748b" }}>Resueltos</p>
              </div>
            </div>

            <div style={{ backgroundColor: "#ffffff", padding: "20px", borderRadius: "12px", border: "1px solid #e2e8f0", height: "105px", display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
              <FaStar style={{ color: "#ff7f22", fontSize: "18px" }} />
              <div>
                <h3 style={{ margin: 0, fontSize: "26px", fontWeight: "700", color: "#1e293b" }}>{stats.satisfaccion}</h3>
                <p style={{ margin: "4px 0 0 0", fontSize: "12px", color: "#64748b" }}>Satisfacción</p>
              </div>
            </div>
          </div>

          {error && (
            <div style={{ backgroundColor: "#fef2f2", border: "1px solid #fecaca", color: "#b91c1c", padding: "14px 20px", borderRadius: "10px", marginBottom: "20px", fontSize: "13px" }}>
              {error}
            </div>
          )}

          {!ticketSeleccionado ? (
            <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
              <div style={{ marginBottom: "4px", fontSize: "14px", fontWeight: "700", color: "#334155" }}>
                <span style={{ color: "#ff7f22", marginRight: "6px" }}>●</span> Tus Incidentes Asignados
              </div>

              {cargando ? (
                <div style={{ backgroundColor: "#ffffff", borderRadius: "10px", padding: "40px", textAlign: "center", border: "1px solid #e2e8f0", color: "#64748b", fontSize: "14px" }}>
                  Cargando tickets...
                </div>
              ) : tickets.length === 0 ? (
                <div style={{ backgroundColor: "#ffffff", borderRadius: "10px", padding: "40px", textAlign: "center", border: "1px solid #e2e8f0", color: "#64748b", fontSize: "14px" }}>
                  No tienes incidentes asignados en este momento.
                </div>
              ) : (
                tickets.map((t) => (
                  <div key={t.id} style={{ backgroundColor: "#ffffff", borderRadius: "10px", padding: "24px", border: "1px solid #e2e8f0" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "6px" }}>
                      <span style={{ fontSize: "12px", color: "#64748b", fontWeight: "bold" }}>#TK-{t.id}</span>
                      <div style={{ display: "flex", gap: "8px" }}>
                        {estaEnRiesgo(t) && (
                          <span style={{ fontSize: "11px", padding: "3px 8px", backgroundColor: "#fee2e2", color: "#dc2626", borderRadius: "8px", fontWeight: "bold" }}>
                            EN RIESGO
                          </span>
                        )}
                        <span style={{ fontSize: "11px", padding: "3px 8px", backgroundColor: "#ffedd5", color: "#ea580c", borderRadius: "8px", fontWeight: "bold" }}>
                          {t.prioridad}
                        </span>
                      </div>
                    </div>
                    <h4 style={{ margin: "0 0 4px 0", fontSize: "16px", color: "#1e293b" }}>{t.tipo}</h4>
                    <p style={{ margin: "0 0 16px 0", fontSize: "13px", color: "#64748b" }}>
                      Solicitante: <span style={{ fontWeight: "600", color: "#475569" }}>{t.nombre}</span> · Área: {t.area || "—"} · Origen: {t.origen}
                    </p>

                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <span style={{ fontSize: "12px", color: "#64748b" }}>
                        Estado: <b style={{ color: "#ff7f22" }}>{t.estado}</b>
                      </span>
                      <div style={{ display: "flex", gap: "10px" }}>
                        <button onClick={() => abrirTicketChat(t)} style={{ backgroundColor: "#ff7f22", color: "white", border: "none", padding: "6px 18px", borderRadius: "4px", fontSize: "12px", fontWeight: "bold", cursor: "pointer" }}>
                          Abrir
                        </button>
                        {t.estado !== "Resuelto" && (
                          <button onClick={() => cambiarEstado(t.id, "Resuelto")} style={{ backgroundColor: "#28a745", color: "white", border: "none", padding: "6px 18px", borderRadius: "4px", fontSize: "12px", fontWeight: "bold", cursor: "pointer" }}>
                            Finalizar
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          ) : (
            <div style={{ display: "flex", gap: "25px", alignItems: "stretch" }}>
              <div style={{ flex: 1.7, backgroundColor: "#ffffff", borderRadius: "12px", border: "1px solid #e2e8f0", display: "flex", flexDirection: "column", height: "550px" }}>
                <div style={{ padding: "16px 20px", borderBottom: "1px solid #e2e8f0", display: "flex", alignItems: "center", gap: "12px", backgroundColor: "#f8fafc" }}>
                  <button onClick={() => { setTicketSeleccionado(null); cargarTickets(); }} style={{ background: "none", border: "none", color: "#64748b", cursor: "pointer" }}>
                    <FaArrowLeft />
                  </button>
                  <span style={{ fontWeight: "700", color: "#1e293b", fontSize: "14px" }}>
                    #TK-{ticketSeleccionado.id} - {ticketSeleccionado.tipo}
                  </span>
                </div>

                <div style={{ display: "flex", borderBottom: "1px solid #e2e8f0", padding: "0 20px", gap: "4px" }}>
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
                        color: tabActiva === tab.key ? "#ff7f22" : "#64748b",
                        borderBottom: tabActiva === tab.key ? "2px solid #ff7f22" : "2px solid transparent",
                      }}
                    >
                      {tab.label}
                    </button>
                  ))}
                </div>

                {tabActiva === "conversaciones" && (
                <>
                <div style={{ flex: 1, padding: "20px", overflowY: "auto", backgroundColor: "#f1f5f9", display: "flex", flexDirection: "column", gap: "12px" }}>
                  {mensajesChat.map((m) => (
                    <div key={m.id} style={{ display: "flex", flexDirection: "column", alignSelf: m.esAdmin ? "flex-end" : "flex-start", maxWidth: "80%" }}>
                      <div style={{ backgroundColor: m.esAdmin ? "#ff7f22" : "white", color: m.esAdmin ? "white" : "#1e293b", padding: "10px 14px", borderRadius: "8px", fontSize: "13px" }}>
                        {m.texto}
                        <div style={{ fontSize: "9px", textAlign: "right", marginTop: "4px", opacity: 0.8 }}>{m.hora}</div>
                      </div>
                    </div>
                  ))}
                  <div ref={chatEndRef} />
                </div>

                <form onSubmit={handleEnviarMensaje} style={{ padding: "14px 20px", borderTop: "1px solid #e2e8f0", display: "flex", gap: "10px", alignItems: "center" }}>
                  <button type="button" style={{ background: "none", border: "none", color: "#64748b" }}>
                    <FaPaperclip />
                  </button>
                  <input
                    type="text"
                    value={nuevoMensaje}
                    onChange={(e) => setNuevoMensaje(e.target.value)}
                    placeholder="Escribe una respuesta..."
                    style={{ flex: 1, padding: "10px 16px", borderRadius: "20px", border: "1px solid #cbd5e1", outline: "none", fontSize: "13px" }}
                  />
                  <button type="submit" style={{ backgroundColor: "#ff7f22", color: "white", border: "none", width: "36px", height: "36px", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}>
                    <FaPaperPlane style={{ fontSize: "12px" }} />
                  </button>
                </form>
                </>
                )}

                {tabActiva === "tareas" && (
                  <div style={{ flex: 1, padding: "20px", overflowY: "auto", backgroundColor: "#f8fafc" }}>
                    <p style={{ fontSize: "12px", color: "#94a3b8", marginBottom: "14px" }}>
                      Tus tareas internas asignadas por el superadmin (no son parte de este ticket, es un recordatorio de tu trabajo pendiente).
                    </p>
                    {cargandoTareas ? (
                      <p style={{ fontSize: "13px", color: "#64748b" }}>Cargando tareas...</p>
                    ) : misTareas.length === 0 ? (
                      <p style={{ fontSize: "13px", color: "#64748b" }}>No tienes tareas asignadas.</p>
                    ) : (
                      <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                        {misTareas.map((task) => (
                          <div key={task.id} style={{ backgroundColor: "white", borderRadius: "8px", padding: "14px", border: "1px solid #e2e8f0" }}>
                            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                              <div>
                                <p style={{ margin: 0, fontWeight: "600", fontSize: "13px", color: "#1e293b" }}>{task.titulo}</p>
                                <p style={{ margin: "4px 0 0", fontSize: "11px", color: "#64748b" }}>
                                  Vence: {new Date(task.vence).toLocaleString()} · {task.area?.nombre}
                                </p>
                              </div>
                              <span style={{ fontSize: "10px", padding: "3px 8px", borderRadius: "6px", backgroundColor: task.estado === "Completada" ? "#dcfce7" : "#fff7ed", color: task.estado === "Completada" ? "#16a34a" : "#ea580c", fontWeight: "bold" }}>
                                {task.estado}
                              </span>
                            </div>
                            {task.estado !== "Completada" && (
                              <div style={{ display: "flex", gap: "6px", marginTop: "10px" }}>
                                {task.estado === "Pendiente" && (
                                  <button onClick={() => actualizarEstadoTarea(task.id, "En Proceso")} style={{ fontSize: "11px", padding: "4px 10px", borderRadius: "6px", border: "1px solid #cbd5e1", background: "white", cursor: "pointer" }}>
                                    Iniciar
                                  </button>
                                )}
                                <button onClick={() => actualizarEstadoTarea(task.id, "Completada")} style={{ fontSize: "11px", padding: "4px 10px", borderRadius: "6px", border: "none", background: "#22c55e", color: "white", cursor: "pointer", fontWeight: "600" }}>
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
                  <div style={{ flex: 1, padding: "20px", overflowY: "auto", backgroundColor: "#f8fafc" }}>
                    <div style={{ display: "flex", flexDirection: "column", gap: "0" }}>
                      {construirHistorial(ticketSeleccionado).map((evento, idx) => (
                        <div key={idx} style={{ display: "flex", gap: "12px", paddingBottom: "20px" }}>
                          <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
                            <div style={{ width: "10px", height: "10px", borderRadius: "50%", backgroundColor: "#ff7f22", flexShrink: 0 }} />
                            {idx < construirHistorial(ticketSeleccionado).length - 1 && (
                              <div style={{ width: "2px", flex: 1, backgroundColor: "#e2e8f0", marginTop: "4px" }} />
                            )}
                          </div>
                          <div>
                            <p style={{ margin: 0, fontSize: "13px", fontWeight: "600", color: "#1e293b" }}>{evento.etiqueta}</p>
                            <p style={{ margin: "2px 0 0", fontSize: "11px", color: "#64748b" }}>
                              {new Date(evento.fecha).toLocaleString()}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: "20px", height: "550px", overflowY: "auto" }}>
                {ticketSeleccionado.fechaLimiteAsesor && (
                  <div style={{ backgroundColor: "#ffffff", borderRadius: "12px", border: "1px solid #e2e8f0", padding: "24px", display: "flex", flexDirection: "column", alignItems: "center" }}>
                    {(() => {
                      const progreso = progresoTiempo(ticketSeleccionado);
                      const vencido = progreso !== null && progreso >= 100 && ticketSeleccionado.estado !== "Resuelto";
                      const colorAro = vencido ? "#dc2626" : "#ff7f22";
                      const circunferencia = 2 * Math.PI * 54;
                      const desplazamiento = circunferencia - (Math.min(progreso ?? 0, 100) / 100) * circunferencia;

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
                            <text x="65" y="60" textAnchor="middle" fontSize="20" fontWeight="700" fill="#1e293b">
                              {progreso !== null ? `${Math.round(Math.min(progreso, 100))}%` : "—"}
                            </text>
                            <text x="65" y="78" textAnchor="middle" fontSize="10" fill="#94a3b8">
                              {ticketSeleccionado.estado === "Resuelto" ? "completado" : "transcurrido"}
                            </text>
                          </svg>
                          <p style={{ margin: "10px 0 0", fontSize: "12px", color: vencido ? "#dc2626" : "#64748b", fontWeight: vencido ? "700" : "500" }}>
                            {vencido
                              ? "Tiempo estimado superado"
                              : `Límite: ${new Date(ticketSeleccionado.fechaLimiteAsesor).toLocaleString()}`}
                          </p>
                        </>
                      );
                    })()}
                  </div>
                )}

                <div style={{ backgroundColor: "#ffffff", borderRadius: "12px", border: "1px solid #e2e8f0", padding: "20px" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
                    <span style={{ fontWeight: "700", color: "#1e293b", fontSize: "14px" }}>Propiedades</span>
                    <FaChevronDown style={{ color: "#64748b", fontSize: "12px" }} />
                  </div>

                  <div style={{ display: "flex", flexDirection: "column", gap: "12px", fontSize: "13px" }}>
                    <div style={{ display: "flex", justifyContent: "space-between" }}>
                      <span style={{ color: "#64748b" }}>ID de la solicitud</span>
                      <span style={{ color: "#1e293b", fontWeight: "600", display: "flex", alignItems: "center", gap: "6px" }}>
                        #{ticketSeleccionado.id} <FaCopy style={{ color: "#cbd5e1", cursor: "pointer" }} />
                      </span>
                    </div>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <span style={{ color: "#64748b" }}>Estado</span>
                      <select
                        value={estadoTicket}
                        onChange={(e) => cambiarEstado(ticketSeleccionado.id, e.target.value)}
                        style={{ border: "none", color: "#1e293b", fontWeight: "600", background: "none", cursor: "pointer", outline: "none" }}
                      >
                        <option value="Creado">Creado</option>
                        <option value="En Proceso">En Proceso</option>
                        <option value="Resuelto">Resuelto</option>
                      </select>
                    </div>
                    <div style={{ display: "flex", justifyContent: "space-between" }}>
                      <span style={{ color: "#64748b" }}>Categoría</span>
                      <span style={{ color: "#1e293b", fontWeight: "600" }}>
                        {ticketSeleccionado.categoria?.nombre || ticketSeleccionado.tipo}
                      </span>
                    </div>
                    <div style={{ display: "flex", justifyContent: "space-between" }}>
                      <span style={{ color: "#64748b" }}>Origen</span>
                      <span style={{ color: "#1e293b", fontWeight: "600" }}>{ticketSeleccionado.origen}</span>
                    </div>
                    <div style={{ display: "flex", justifyContent: "space-between" }}>
                      <span style={{ color: "#64748b" }}>SLA</span>
                      <span style={{ color: estaEnRiesgo(ticketSeleccionado) ? "#dc2626" : "#ff7f22", fontWeight: "bold" }}>
                        {ticketSeleccionado.fechaLimite
                          ? new Date(ticketSeleccionado.fechaLimite).toLocaleString()
                          : "Sin definir"}
                      </span>
                    </div>

                    <div style={{ borderTop: "1px solid #f1f5f9", paddingTop: "12px", marginTop: "4px" }}>
                      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "10px" }}>
                        <span style={{ color: "#64748b" }}>Tu tiempo estimado</span>
                        <span style={{ color: "#1e293b", fontWeight: "600" }}>
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
                                padding: "5px 10px",
                                fontSize: "11px",
                                borderRadius: "6px",
                                border: "1px solid #e2e8f0",
                                background: "#f8fafc",
                                color: "#475569",
                                cursor: "pointer",
                                fontWeight: "600",
                              }}
                            >
                              {h < 1 ? `${h * 60} min` : `${h}h`}
                            </button>
                          ))}
                          <button
                            onClick={() => setMostrarPersonalizado(true)}
                            style={{
                              padding: "5px 10px",
                              fontSize: "11px",
                              borderRadius: "6px",
                              border: "1px solid #ff7f22",
                              background: "white",
                              color: "#ff7f22",
                              cursor: "pointer",
                              fontWeight: "600",
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
                            style={{ flex: 1, padding: "6px 8px", borderRadius: "6px", border: "1px solid #cbd5e1", fontSize: "12px", outline: "none" }}
                          />
                          <button
                            onClick={() => {
                              const horas = parseFloat(horasEstimadasInput);
                              if (horas > 0) declararTiempo(horas);
                            }}
                            style={{ padding: "6px 12px", borderRadius: "6px", border: "none", background: "#ff7f22", color: "white", fontSize: "11px", fontWeight: "bold", cursor: "pointer" }}
                          >
                            Confirmar
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                <div style={{ backgroundColor: "#ffffff", borderRadius: "12px", border: "1px solid #e2e8f0", padding: "20px" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "14px" }}>
                    <span style={{ fontWeight: "700", color: "#1e293b", fontSize: "14px" }}>Detalles del solicitante</span>
                    <FaChevronDown style={{ color: "#64748b", fontSize: "12px" }} />
                  </div>

                  <div style={{ display: "flex", gap: "12px", alignItems: "center", marginBottom: "16px" }}>
                    <div style={{ width: "42px", height: "42px", borderRadius: "50%", backgroundColor: "#e2e8f0", display: "flex", alignItems: "center", justifyContent: "center", color: "#64748b", fontWeight: "bold" }}>
                      {ticketSeleccionado.nombre ? ticketSeleccionado.nombre.charAt(0) : "U"}
                    </div>
                    <div style={{ display: "flex", flexDirection: "column" }}>
                      <span style={{ fontSize: "14px", fontWeight: "600", color: "#1e293b" }}>{ticketSeleccionado.nombre}</span>
                      <span style={{ fontSize: "12px", color: "#64748b" }}>{ticketSeleccionado.correo}</span>
                    </div>
                  </div>

                  <div style={{ fontSize: "13px", display: "flex", flexDirection: "column", gap: "10px" }}>
                    <div style={{ display: "flex", justifyContent: "space-between" }}>
                      <span style={{ color: "#64748b" }}>Área</span>
                      <span style={{ color: "#1e293b", fontWeight: "600" }}>{ticketSeleccionado.area || "—"}</span>
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