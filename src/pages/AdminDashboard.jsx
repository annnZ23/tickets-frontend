import { useEffect, useState, useRef } from "react";
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
  FaHistory
} from "react-icons/fa";
import "./Dashboard.css";

export default function AdminDashboard() {
  const [tickets, setTickets] = useState([]);
  const [stats, setStats] = useState({
    totalTickets: 0,
    enProceso: 0,
    resueltos: 0,
    satisfaccion: "5.0"
  });

  const [ticketSeleccionado, setTicketSeleccionado] = useState(null);
  const [mensajesChat, setMensajesChat] = useState([]);
  const [nuevoMensaje, setNuevoMensaje] = useState("");
  
  const [estadoTicket, setEstadoTicket] = useState("Open");
  const [horasEstimadas, setHorasEstimadas] = useState("02:00");

  const chatEndRef = useRef(null);
  const user = {
    email: "admin@gmail.com",
    name: "Ana Zepeda",
    role: "ADMIN"
  };

  useEffect(() => {
    fetch("http://localhost:5178/api/tickets")
      .then(res => res.json())
      .then(data => {
        if (data && data.tickets) {
          setTickets(data.tickets);
          setStats(data.stats); 
        } else if (Array.isArray(data)) {
          setTickets(data);
          if (data.length === 0) {
            setStats({ totalTickets: 0, enProceso: 0, resueltos: 0, satisfaccion: "5.0" });
          }
        }
      })
      .catch((err) => {
        console.error("Error al conectar con el backend:", err);
      });
  }, []);

  useEffect(() => {
    if (chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [mensajesChat]);

  const abrirTicketChat = (ticket) => {
    fetch(`http://localhost:5178/api/tickets/${ticket.id}/abrir`, {
      method: "PUT"
    })
      .then(res => res.json())
      .then(ticketActualizado => {
        const ticketValidado = {
          ...ticket,
          estado: ticketActualizado.estado || "En Proceso",
          usuario: ticket.usuario && ticket.usuario.trim() !== "" ? ticket.usuario : "Colaborador",
          departamento: ticket.departamento && ticket.departamento.trim() !== "" ? ticket.departamento : "Operaciones",
          correo: ticket.correo && ticket.correo.trim() !== "" ? ticket.correo : "colaborador@baprosa.com"
        };

        setTicketSeleccionado(ticketValidado);
        setEstadoTicket(ticketValidado.estado);

        if (ticketValidado.prioridad === "Alta") {
          setHorasEstimadas("01:00");
        } else if (ticketValidado.prioridad === "Media") {
          setHorasEstimadas("02:00");
        } else {
          setHorasEstimadas("04:00");
        }

        setMensajesChat([
          { id: 1, remitente: ticketValidado.usuario, texto: ticketValidado.descripcion || "Hola, abro este ticket debido al siguiente inconveniente.", hora: "Justo ahora", esAdmin: false },
          { id: 2, remitente: "Mesa de Control", texto: `Ticket abierto por el asesor. Estado actualizado a: En Proceso. Tiempo estimado: ${ticketValidado.prioridad === "Alta" ? "1h" : ticketValidado.prioridad === "Media" ? "2h" : "4h"}.`, esSistema: true }
        ]);
      })
      .catch(err => console.error("Error al actualizar la apertura del ticket:", err));
  };

  const handleEnviarMensaje = (e) => {
    e.preventDefault();
    if (!nuevoMensaje.trim()) return;

    setMensajesChat([...mensajesChat, {
      id: mensajesChat.length + 1,
      remitente: user.email,
      texto: nuevoMensaje,
      hora: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      esAdmin: true
    }]);
    setNuevoMensaje("");
  };

  const getIniciales = (name) => {
    if (!name) return "A";
    const parts = name.split(" ");
    return parts.length > 1 ? `${parts[0][0]}${parts[1][0]}`.toUpperCase() : parts[0][0].toUpperCase();
  };

  return (
    <div style={{ display: "flex", minHeight: "100vh", backgroundColor: "#f4f6f8", fontFamily: "'Segoe UI', sans-serif" }}>

      <Sidebar />

      <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>
        
        {/* TOPBAR */}
        <div style={{ height: "65px", width: "100%", backgroundColor: "#ff7f22", display: "flex", alignItems: "center", justifyContent: "flex-end", padding: "0 40px", boxSizing: "border-box" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "28px" }}>
            
            <div style={{ position: "relative", cursor: "pointer", display: "flex", alignItems: "center" }}>
              <FaRegBell style={{ color: "#ffffff", fontSize: "20px" }} />
              <span style={{ position: "absolute", top: "-6px", right: "-8px", backgroundColor: "#ef4444", color: "white", borderRadius: "50%", width: "16px", height: "16px", fontSize: "10px", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: "bold" }}>
                3
              </span>
            </div>
            <div style={{ display: "flex", alignItems: "center", cursor: "pointer" }}>
              <FaRegEnvelope style={{ color: "#ffffff", fontSize: "20px" }} />
            </div>
            <div style={{ width: "1px", height: "22px", backgroundColor: "rgba(255,255,255,0.25)" }}></div>
            <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
              <div style={{ width: "38px", height: "38px", borderRadius: "50%", backgroundColor: "rgba(255,255,255,0.3)", color: "#ffffff", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: "700", fontSize: "13px", letterSpacing: "0.5px" }}>
                {getIniciales(user.name)}
              </div>
              <div style={{ display: "flex", flexDirection: "column", color: "#ffffff" }}>
                <span style={{ fontSize: "13px", fontWeight: "600", lineHeight: "1.2" }}>{user.name}</span>
                <span style={{ fontSize: "11px", opacity: 0.85, marginTop: "2px" }}>{user.role}</span>
              </div>
            </div>

          </div>
        </div>

        {/* CONTENIDO PRINCIPAL */}
        <div style={{ flex: 1, overflowY: "auto", padding: "30px" }}>
          
          {/* SECCIÓN DE METRICAS DEL DASHBOARD */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "20px", marginBottom: "35px" }}>
            
            {/* KPI 1 */}
            <div style={{ backgroundColor: "#ffffff", padding: "20px", borderRadius: "12px", border: "1px solid #e2e8f0", display: "flex", flexDirection: "column", justifyContent: "space-between", height: "105px", boxSizing: "border-box" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", width: "100%" }}>
                <FaTicketAlt style={{ color: "#ff7f22", fontSize: "18px" }} />
                <span style={{ color: "#22c55e", fontSize: "12px", fontWeight: "700" }}>+12%</span>
              </div>
              <div>
                <h3 style={{ margin: 0, fontSize: "26px", fontWeight: "700", color: "#1e293b", lineHeight: "1" }}>{stats.totalTickets}</h3>
                <p style={{ margin: "4px 0 0 0", fontSize: "12px", color: "#64748b", fontWeight: "500" }}>Tickets Totales</p>
              </div>
            </div>

            {/* KPI 2 */}
            <div style={{ backgroundColor: "#ffffff", padding: "20px", borderRadius: "12px", border: "1px solid #e2e8f0", display: "flex", flexDirection: "column", justifyContent: "space-between", height: "105px", boxSizing: "border-box" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", width: "100%" }}>
                <FaClock style={{ color: "#ff7f22", fontSize: "18px" }} />
                <span style={{ color: "#ff7f22", fontSize: "11px", fontWeight: "700" }}>En vivo</span>
              </div>
              <div>
                <h3 style={{ margin: 0, fontSize: "26px", fontWeight: "700", color: "#1e293b", lineHeight: "1" }}>{stats.enProceso}</h3>
                <p style={{ margin: "4px 0 0 0", fontSize: "12px", color: "#64748b", fontWeight: "500" }}>En Proceso</p>
              </div>
            </div>

            {/* KPI 3 */}
            <div style={{ backgroundColor: "#ffffff", padding: "20px", borderRadius: "12px", border: "1px solid #e2e8f0", display: "flex", flexDirection: "column", justifyContent: "space-between", height: "105px", boxSizing: "border-box" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", width: "100%" }}>
                <FaCheckCircle style={{ color: "#22c55e", fontSize: "18px" }} />
                <span style={{ color: "#22c55e", fontSize: "11px", fontWeight: "700" }}>95%</span>
              </div>
              <div>
                <h3 style={{ margin: 0, fontSize: "26px", fontWeight: "700", color: "#1e293b", lineHeight: "1" }}>{stats.resueltos}</h3>
                <p style={{ margin: "4px 0 0 0", fontSize: "12px", color: "#64748b", fontWeight: "500" }}>Resueltos</p>
              </div>
            </div>

            {/* KPI 4 */}
            <div style={{ backgroundColor: "#ffffff", padding: "20px", borderRadius: "12px", border: "1px solid #e2e8f0", display: "flex", flexDirection: "column", justifyContent: "space-between", height: "105px", boxSizing: "border-box" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", width: "100%" }}>
                <FaStar style={{ color: "#ff7f22", fontSize: "18px" }} />
                <span style={{ color: "#64748b", fontSize: "11px", fontWeight: "500" }}>Promedio</span>
              </div>
              <div>
                <h3 style={{ margin: 0, fontSize: "26px", fontWeight: "700", color: "#1e293b", lineHeight: "1" }}>{stats.satisfaccion}</h3>
                <p style={{ margin: "4px 0 0 0", fontSize: "12px", color: "#64748b", fontWeight: "500" }}>Satisfacción</p>
              </div>
            </div>

          </div>

          {/* LISTADO O DETALLE SEGÚN SELECCIÓN */}
          {!ticketSeleccionado ? (
            <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
              <div style={{ marginBottom: "4px", fontSize: "14px", fontWeight: "700", color: "#334155" }}>
                <span style={{ color: "#ff7f22", marginRight: "6px" }}>●</span> Monitoreo de Incidentes Activos
              </div>

              {tickets.length === 0 ? (
                <div style={{ backgroundColor: "#ffffff", borderRadius: "10px", padding: "40px", textAlign: "center", border: "1px solid #e2e8f0", color: "#64748b", fontSize: "14px", fontWeight: "500" }}>
                  📭 No hay incidentes activos en este momento. Las tablas están completamente limpias.
                </div>
              ) : (
                tickets.map((t) => (
                  <div key={t.id} style={{ backgroundColor: "#ffffff", borderRadius: "10px", padding: "24px", border: "1px solid #e2e8f0", boxShadow: "0 1px 3px rgba(0,0,0,0.01)" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "6px" }}>
                      <span style={{ fontSize: "12px", color: "#64748b", fontWeight: "bold" }}>#TK-{t.id}</span>
                      <span style={{ fontSize: "11px", padding: "3px 8px", backgroundColor: "#ffedd5", color: "#ea580c", borderRadius: "8px", fontWeight: "bold" }}>{t.prioridad}</span>
                    </div>
                    <h4 style={{ margin: "0 0 4px 0", fontSize: "16px", color: "#1e293b" }}>{t.asunto}</h4>
                    <p style={{ margin: "0 0 16px 0", fontSize: "13px", color: "#64748b" }}>
                      Solicitante: <span style={{ fontWeight: "600", color: "#475569" }}>{t.usuario || "—"}</span> · Depto: {t.departamento || "—"}
                    </p>
                    
                    <div style={{ height: "6px", width: "100%", backgroundColor: "#e2e8f0", borderRadius: "10px", overflow: "hidden", marginBottom: "12px" }}>
                      <div style={{ height: "100%", width: t.estado === "En Proceso" ? "60%" : "20%", backgroundColor: "#ff7f22", transition: "width 0.5s ease" }}></div>
                    </div>

                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <span style={{ fontSize: "12px", color: "#64748b" }}>Estado actual: <b style={{ color: "#ff7f22" }}>{t.estado}</b></span>
                      <div style={{ display: "flex", gap: "10px" }}>
                        <button onClick={() => abrirTicketChat(t)} style={{ backgroundColor: "#ff7f22", color: "white", border: "none", padding: "6px 18px", borderRadius: "4px", fontSize: "12px", fontWeight: "bold", cursor: "pointer" }}>Abrir</button>
                        <button style={{ backgroundColor: "#28a745", color: "white", border: "none", padding: "6px 18px", borderRadius: "4px", fontSize: "12px", fontWeight: "bold", cursor: "pointer" }}>Finalizar</button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          ) : (
            <div style={{ display: "flex", gap: "25px", alignItems: "stretch" }}>
              
              {/* CAJA DEL CHAT */}
              <div style={{ flex: 1.7, backgroundColor: "#ffffff", borderRadius: "12px", border: "1px solid #e2e8f0", display: "flex", flexDirection: "column", height: "550px" }}>
                <div style={{ padding: "16px 20px", borderBottom: "1px solid #e2e8f0", display: "flex", alignItems: "center", gap: "12px", backgroundColor: "#f8fafc" }}>
                  <button onClick={() => setTicketSeleccionado(null)} style={{ background: "none", border: "none", color: "#64748b", cursor: "pointer" }}><FaArrowLeft /></button>
                  <span style={{ fontWeight: "700", color: "#1e293b", fontSize: "14px" }}>#TK-{ticketSeleccionado.id} - {ticketSeleccionado.asunto}</span>
                </div>

                <div style={{ flex: 1, padding: "20px", overflowY: "auto", backgroundColor: "#f1f5f9", display: "flex", flexDirection: "column", gap: "12px" }}>
                  {mensajesChat.map((m) => (
                    <div key={m.id} style={{ display: "flex", flexDirection: "column", alignSelf: m.esSistema ? "center" : m.esAdmin ? "flex-end" : "flex-start", maxWidth: "80%" }}>
                      {m.esSistema ? (
                        <div style={{ backgroundColor: "#cbd5e1", color: "#475569", fontSize: "11px", padding: "4px 12px", borderRadius: "12px" }}>{m.texto}</div>
                      ) : (
                        <div style={{ backgroundColor: m.esAdmin ? "#ff7f22" : "white", color: m.esAdmin ? "white" : "#1e293b", padding: "10px 14px", borderRadius: "8px", fontSize: "13px", boxShadow: "0 1px 2px rgba(0,0,0,0.05)" }}>
                          {m.texto}
                          <div style={{ fontSize: "9px", textAlign: "right", marginTop: "4px", opacity: 0.8 }}>{m.hora}</div>
                        </div>
                      )}
                    </div>
                  ))}
                  <div ref={chatEndRef} />
                </div>

                <form onSubmit={handleEnviarMensaje} style={{ padding: "14px 20px", borderTop: "1px solid #e2e8f0", display: "flex", gap: "10px", alignItems: "center" }}>
                  <button type="button" style={{ background: "none", border: "none", color: "#64748b" }}><FaPaperclip /></button>
                  <input type="text" value={nuevoMensaje} onChange={(e) => setNuevoMensaje(e.target.value)} placeholder="Escribe una respuesta..." style={{ flex: 1, padding: "10px 16px", borderRadius: "20px", border: "1px solid #cbd5e1", outline: "none", fontSize: "13px" }} />
                  <button type="submit" style={{ backgroundColor: "#ff7f22", color: "white", border: "none", width: "36px", height: "36px", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}><FaPaperPlane style={{ fontSize: "12px" }} /></button>
                </form>
              </div>

              {/* BARRA LATERAL DERECHA DE PROPIEDADES */}
              <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: "20px", height: "550px", overflowY: "auto" }}>
                <div style={{ backgroundColor: "#ffffff", borderRadius: "12px", border: "1px solid #e2e8f0", padding: "20px" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
                    <span style={{ fontWeight: "700", color: "#1e293b", fontSize: "14px" }}>Propiedades</span>
                    <FaChevronDown style={{ color: "#64748b", fontSize: "12px" }} />
                  </div>

                  <div style={{ display: "flex", flexDirection: "column", gap: "12px", fontSize: "13px" }}>
                    <div style={{ display: "flex", justifyContent: "space-between" }}>
                      <span style={{ color: "#64748b" }}>ID de la solicitud</span>
                      <span style={{ color: "#1e293b", fontWeight: "600", display: "flex", alignItems: "center", gap: "6px" }}>#{ticketSeleccionado.id} <FaCopy style={{ color: "#cbd5e1", cursor: "pointer" }} /></span>
                    </div>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <span style={{ color: "#64748b" }}>Estado</span>
                      <select value={estadoTicket} onChange={(e) => setEstadoTicket(e.target.value)} style={{ border: "none", color: "#1e293b", fontWeight: "600", background: "none", cursor: "pointer", outline: "none" }}>
                        <option value="Creado">Creado</option>
                        <option value="En Proceso">En Proceso</option>
                        <option value="Resuelto">Resuelto</option>
                      </select>
                    </div>
                    <div style={{ display: "flex", justifyContent: "space-between" }}>
                      <span style={{ color: "#64748b" }}>Grupo & Sitio</span>
                      <span style={{ color: "#1e293b", fontWeight: "600" }}>{ticketSeleccionado.departamento}, Base Site</span>
                    </div>
                    <div style={{ display: "flex", justifyContent: "space-between" }}>
                      <span style={{ color: "#64748b" }}>Tareas</span>
                      <span style={{ backgroundColor: "#f1f5f9", padding: "2px 8px", borderRadius: "4px", fontWeight: "bold" }}>0/2</span>
                    </div>
                    <div style={{ display: "flex", justifyContent: "space-between" }}>
                      <span style={{ color: "#64748b" }}>Listas de comprobación</span>
                      <span style={{ backgroundColor: "#f1f5f9", padding: "2px 8px", borderRadius: "4px", fontWeight: "bold" }}>0/0</span>
                    </div>
                    <div style={{ display: "flex", justifyContent: "space-between" }}>
                      <span style={{ color: "#64748b" }}>Recordatorios</span>
                      <span style={{ backgroundColor: "#f1f5f9", padding: "2px 8px", borderRadius: "4px" }}>0</span>
                    </div>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <span style={{ color: "#64748b" }}>Archivos adjuntos</span>
                      <span style={{ backgroundColor: "#f1f5f9", padding: "2px 8px", borderRadius: "4px" }}>0 <FaPaperclip style={{ fontSize: "11px", marginLeft: "4px" }} /></span>
                    </div>
                    <div style={{ display: "flex", justifyContent: "space-between" }}>
                      <span style={{ color: "#64748b" }}>Temporizador de registro</span>
                      <span style={{ color: "#ff7f22", fontWeight: "bold" }}>{horasEstimadas}</span>
                    </div>
                  </div>
                </div>

                {/* DETALLES DEL SOLICITANTE */}
                <div style={{ backgroundColor: "#ffffff", borderRadius: "12px", border: "1px solid #e2e8f0", padding: "20px" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "14px" }}>
                    <span style={{ fontWeight: "700", color: "#1e293b", fontSize: "14px" }}>Detalles del solicitante</span>
                    <FaChevronDown style={{ color: "#64748b", fontSize: "12px" }} />
                  </div>

                  <div style={{ display: "flex", gap: "12px", alignItems: "center", marginBottom: "16px" }}>
                    <div style={{ width: "42px", height: "42px", borderRadius: "50%", backgroundColor: "#e2e8f0", display: "flex", alignItems: "center", justifyContent: "center", color: "#64748b", fontWeight: "bold" }}>
                      {ticketSeleccionado.usuario ? ticketSeleccionado.usuario.charAt(0) : "U"}
                    </div>
                    <div style={{ display: "flex", flexDirection: "column" }}>
                      <span style={{ fontSize: "14px", fontWeight: "600", color: "#1e293b" }}>{ticketSeleccionado.usuario}</span>
                      <span style={{ fontSize: "12px", color: "#64748b" }}>{ticketSeleccionado.correo}</span>
                    </div>
                  </div>

                  <div style={{ fontSize: "13px", display: "flex", flexDirection: "column", gap: "10px", marginBottom: "14px" }}>
                    <div style={{ display: "flex", justifyContent: "space-between" }}>
                      <span style={{ color: "#64748b" }}>Área</span>
                      <span style={{ color: "#1e293b", fontWeight: "600" }}>{ticketSeleccionado.departamento}</span>
                    </div>
                  </div>

                  <button type="button" style={{ width: "100%", backgroundColor: "#ffffff", border: "1px solid #cbd5e1", borderRadius: "8px", padding: "10px", fontSize: "12px", fontWeight: "600", color: "#334155", display: "flex", alignItems: "center", justifyContent: "center", gap: "8px", cursor: "pointer" }}>
                    <FaHistory style={{ color: "#64748b" }} /> Solicitudes previas
                  </button>
                </div>

              </div>

            </div>
          )}

        </div>
      </div>
    </div>
  );
}