import { useState, useEffect, useRef, useCallback } from "react";
import { useParams } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import {
  FaPaperPlane, FaComments, FaClipboardList, FaPaperclip,
  FaCheckCircle, FaClock, FaTrash, FaPlus, FaTimes,
  FaFileAlt, FaSmile, FaReply,
} from "react-icons/fa";
import { useNotificaciones, ToastContainer, socket } from "../hooks/useNotificaciones";
import "./Dashboard.css";

const EMOJIS = ["😊","👍","✅","⚠️","🔥","💡","📌","🚀","❌","🙏","💪","📎","🎯","⏰","✔️"];

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
};

export default function ChatPorArea({ usuario, cerrarSesion }) {
  const { idTicket } = useParams();
  const token = localStorage.getItem("token");
  const areas = ["Soporte Técnico", "Desarrollo Web", "Analista de Rutas"];

  // Hook de notificaciones en tiempo real
  const { toasts } = useNotificaciones(usuario);

  const [selectedArea, setSelectedArea] = useState("Soporte Técnico");
  const [tabActiva, setTabActiva] = useState("mensajes");

  // Estado para responder sub-tarea con archivo
  const [respondiendo, setRespondiendo] = useState(null); // id de la sub-tarea
  const [archivoRespuesta, setArchivoRespuesta] = useState(null);
  const [comentarioRespuesta, setComentarioRespuesta] = useState("");
  const [enviandoRespuesta, setEnviandoRespuesta] = useState(false);
  const archivoRespuestaRef = useRef(null); // "mensajes" | "subtareas"

  // ── CHAT ──────────────────────────────────────────────────────────────────
  const [messageText, setMessageText] = useState("");
  const [messages, setMessages] = useState([]);
  const [mostrarEmojisChat, setMostrarEmojisChat] = useState(false);
  const chatEndRef = useRef(null);

  const scrollToBottom = () => chatEndRef.current?.scrollIntoView({ behavior: "smooth" });

  const handleReceiveMessage = useCallback((newMessage) => {
    setMessages((prev) => [...prev, newMessage]);
  }, []);

  useEffect(() => {
    const roomName = idTicket ? `ticket_${idTicket}` : `area_${selectedArea}`;
    socket.emit("join_room", roomName);
    socket.on("receive_message", handleReceiveMessage);
    return () => {
      socket.off("receive_message", handleReceiveMessage);
      socket.emit("leave_room", roomName);
      setMessages([]);
    };
  }, [selectedArea, idTicket, handleReceiveMessage]);

  useEffect(() => { scrollToBottom(); }, [messages]);

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!messageText.trim()) return;
    const roomName = idTicket ? `ticket_${idTicket}` : `area_${selectedArea}`;
    socket.emit("send_message", {
      room: roomName,
      sender: usuario?.email || "Anónimo",
      senderName: usuario?.name || "Asesor",
      text: messageText,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    });
    setMessageText("");
    setMostrarEmojisChat(false);
  };

  const agregarEmojiChat = (emoji) => {
    setMessageText((prev) => prev + emoji);
    setMostrarEmojisChat(false);
  };

  // ── SUB-TAREAS ─────────────────────────────────────────────────────────────
  const [subTareas, setSubTareas] = useState([]);
  const [cargandoST, setCargandoST] = useState(false);
  const [mostrarFormST, setMostrarFormST] = useState(false);
  const [asesores, setAsesores] = useState([]);
  const [areaActualId, setAreaActualId] = useState(null);

  // Form nueva sub-tarea
  const [stTitulo, setStTitulo] = useState("");
  const [stDescripcion, setStDescripcion] = useState("");
  const [stReceptorId, setStReceptorId] = useState("");
  const [stFechaLimite, setStFechaLimite] = useState("");
  const [stArchivo, setStArchivo] = useState(null);
  const [stArchivoNombre, setStArchivoNombre] = useState("");
  const [mostrarEmojisForm, setMostrarEmojisForm] = useState(false);
  const [enviandoST, setEnviandoST] = useState(false);
  const archivoRef = useRef(null);

  const authHeaders = () => ({
    Authorization: `Bearer ${token}`,
  });

  // Cargar área actual y asesores al montar
  useEffect(() => {
    fetch("http://localhost:3000/api/areas-it", { headers: authHeaders() })
      .then((r) => r.json())
      .then((areas) => {
        const areaEncontrada = areas.find((a) => a.nombre === selectedArea);
        if (areaEncontrada) setAreaActualId(areaEncontrada.id);
      })
      .catch(console.error);

    fetch("http://localhost:3000/api/usuarios", { headers: authHeaders() })
      .then((r) => r.json())
      .then((data) => setAsesores(data.filter((u) => u.role === "ADMIN" || u.role === "SUPERADMIN")))
      .catch(console.error);
  }, [selectedArea]);

  const cargarSubTareas = useCallback(() => {
    if (!areaActualId) return;
    setCargandoST(true);
    fetch(`http://localhost:3000/api/subtareas?areaId=${areaActualId}`, { headers: authHeaders() })
      .then((r) => r.json())
      .then((data) => setSubTareas(Array.isArray(data) ? data : []))
      .catch(console.error)
      .finally(() => setCargandoST(false));
  }, [areaActualId]);

  useEffect(() => {
    if (tabActiva === "subtareas") cargarSubTareas();
  }, [tabActiva, cargarSubTareas]);

  const crearSubTarea = async (e) => {
    e.preventDefault();
    if (!stTitulo.trim() || !stReceptorId) return;
    setEnviandoST(true);

    const formData = new FormData();
    formData.append("titulo", stTitulo);
    formData.append("descripcion", stDescripcion);
    formData.append("receptorId", stReceptorId);
    if (areaActualId) formData.append("areaId", areaActualId);
    if (stFechaLimite) formData.append("fechaLimite", stFechaLimite);
    if (stArchivo) formData.append("archivo", stArchivo);

    try {
      const res = await fetch("http://localhost:3000/api/subtareas", {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });
      if (res.ok) {
        setStTitulo(""); setStDescripcion(""); setStReceptorId("");
        setStFechaLimite(""); setStArchivo(null); setStArchivoNombre("");
        setMostrarFormST(false);
        cargarSubTareas();
      } else {
        const err = await res.json();
        alert(err.message || "Error al crear sub-tarea");
      }
    } catch (err) {
      console.error(err);
      alert("Error al crear sub-tarea");
    } finally {
      setEnviandoST(false);
    }
  };

  const cambiarEstadoST = (id, estado) => {
    fetch(`http://localhost:3000/api/subtareas/${id}`, {
      method: "PUT",
      headers: { ...authHeaders(), "Content-Type": "application/json" },
      body: JSON.stringify({ estado }),
    })
      .then((r) => r.json())
      .then((actualizada) => {
        setSubTareas((prev) => prev.map((st) => st.id === id ? { ...st, ...actualizada } : st));
      })
      .catch(console.error);
  };

  const eliminarST = (id) => {
    if (!window.confirm("¿Eliminar esta sub-tarea?")) return;
    fetch(`http://localhost:3000/api/subtareas/${id}`, {
      method: "DELETE",
      headers: authHeaders(),
    })
      .then(() => setSubTareas((prev) => prev.filter((st) => st.id !== id)))
      .catch(console.error);
  };

  const enviarRespuesta = async (subTareaId) => {
    if (!archivoRespuesta) return;
    setEnviandoRespuesta(true);
    const formData = new FormData();
    formData.append("archivo", archivoRespuesta);
    if (comentarioRespuesta) formData.append("comentario", comentarioRespuesta);

    try {
      const res = await fetch(`http://localhost:3000/api/subtareas/${subTareaId}/respuesta`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });
      if (res.ok) {
        alert("Respuesta enviada correctamente. El asignador recibirá un correo con el archivo.");
        setRespondiendo(null);
        setArchivoRespuesta(null);
        setComentarioRespuesta("");
      } else {
        const err = await res.json();
        alert(err.message || "Error al enviar respuesta");
      }
    } catch (err) {
      console.error(err);
      alert("Error al enviar respuesta");
    } finally {
      setEnviandoRespuesta(false);
    }
  };

  const agregarEmojiForm = (emoji) => {
    setStDescripcion((prev) => prev + emoji);
    setMostrarEmojisForm(false);
  };

  const colorEstado = (estado) => {
    if (estado === "Completada") return { bg: colors.verdeClaro, color: colors.verde };
    if (estado === "EnProceso") return { bg: "#fff1e6", color: colors.naranja };
    return { bg: "#f1f5f9", color: colors.textoSec };
  };

  const labelEstado = (e) => e === "EnProceso" ? "En Proceso" : e;

  const esVencida = (fechaLimite, estado) =>
    fechaLimite && estado !== "Completada" && new Date(fechaLimite) < new Date();

  return (
    <div style={{ display: "flex", minHeight: "100vh", width: "100vw", overflowX: "hidden", background: colors.fondo, fontFamily: "'Segoe UI', sans-serif" }}>
      <Sidebar usuario={usuario} cerrarSesion={cerrarSesion} />
      <ToastContainer toasts={toasts} />

      <div style={{ flex: 1, padding: "24px", display: "flex", flexDirection: "column", gap: "20px" }}>

        {/* Header */}
        <div style={{ background: `linear-gradient(135deg, ${colors.naranja} 0%, ${colors.naranjaOscuro} 100%)`, padding: "18px 24px", borderRadius: "14px", boxShadow: "0 4px 15px rgba(255,127,34,0.25)", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "12px", color: "white" }}>
            <FaComments style={{ fontSize: "26px" }} />
            <div>
              <h3 style={{ margin: 0, fontSize: "20px", fontWeight: "700" }}>
                {idTicket ? `Chat por Área #TK-${idTicket}` : "Mesa de Coordinación por Área IT"}
              </h3>
              <p style={{ margin: 0, fontSize: "12px", color: "rgba(255,255,255,0.85)", marginTop: "2px" }}>
                Monitoreo y respuesta en tiempo real Baprosa S.A.
              </p>
            </div>
          </div>
        </div>

        {/* Selector de área */}
        {!idTicket && (
          <div style={{ display: "flex", gap: "10px", background: "#fff", padding: "8px", borderRadius: "12px", boxShadow: "0 2px 8px rgba(0,0,0,0.04)", width: "fit-content" }}>
            {areas.map((area) => (
              <button key={area} onClick={() => setSelectedArea(area)} style={{ padding: "10px 20px", borderRadius: "10px", border: "none", fontWeight: "600", fontSize: "14px", cursor: "pointer", backgroundColor: selectedArea === area ? colors.naranja : "transparent", color: selectedArea === area ? "white" : colors.textoSec, transition: "all 0.2s ease" }}>
                {area}
              </button>
            ))}
          </div>
        )}

        {/* Contenedor principal */}
        <div style={{ flex: 1, background: "#fff", borderRadius: "16px", border: `1px solid ${colors.borde}`, display: "flex", flexDirection: "column", overflow: "hidden", boxShadow: "0 4px 20px rgba(0,0,0,0.04)" }}>

          {/* Tabs */}
          <div style={{ display: "flex", borderBottom: `1px solid ${colors.borde}`, padding: "0 20px", backgroundColor: "#fafbfc" }}>
            {[
              { key: "mensajes", label: "Mensajes", icon: <FaComments style={{ fontSize: "13px" }} /> },
              { key: "subtareas", label: "Sub-tareas", icon: <FaClipboardList style={{ fontSize: "13px" }} /> },
            ].map((tab) => (
              <button key={tab.key} onClick={() => setTabActiva(tab.key)} style={{ padding: "14px 20px", border: "none", background: "none", cursor: "pointer", fontSize: "13px", fontWeight: tabActiva === tab.key ? "700" : "500", color: tabActiva === tab.key ? colors.naranja : colors.textoSec, borderBottom: tabActiva === tab.key ? `2px solid ${colors.naranja}` : "2px solid transparent", display: "flex", alignItems: "center", gap: "7px", transition: "color 0.15s" }}>
                {tab.icon} {tab.label}
                {tab.key === "subtareas" && subTareas.filter((s) => s.estado !== "Completada").length > 0 && (
                  <span style={{ background: colors.naranja, color: "white", borderRadius: "10px", fontSize: "10px", fontWeight: "700", padding: "1px 6px" }}>
                    {subTareas.filter((s) => s.estado !== "Completada").length}
                  </span>
                )}
              </button>
            ))}
          </div>

          {/* ── TAB MENSAJES ─────────────────────────────────────────────── */}
          {tabActiva === "mensajes" && (
            <>
              <div style={{ flex: 1, padding: "20px", overflowY: "auto", display: "flex", flexDirection: "column", gap: "14px", background: "#fcfcfd", minHeight: "400px" }}>
                {messages.length === 0 ? (
                  <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", height: "100%", color: colors.textoMuted }}>
                    <FaComments style={{ fontSize: "40px", marginBottom: "10px", color: "#d1d5db" }} />
                    <p style={{ fontSize: "14px", margin: 0 }}>No hay mensajes en este canal todavía.</p>
                  </div>
                ) : messages.map((msg, i) => {
                  const isMe = msg.sender === usuario?.email;
                  return (
                    <div key={i} style={{ display: "flex", flexDirection: "column", alignItems: isMe ? "flex-end" : "flex-start" }}>
                      <span style={{ fontSize: "11px", color: colors.textoSec, marginBottom: "3px" }}>{isMe ? "Tú" : (msg.senderName || msg.sender)}</span>
                      <div style={{ maxWidth: "68%", padding: "11px 15px", borderRadius: isMe ? "16px 16px 0 16px" : "16px 16px 16px 0", backgroundColor: isMe ? colors.naranja : "#f3f4f6", color: isMe ? "white" : colors.texto, fontSize: "14px", lineHeight: "1.5", boxShadow: isMe ? "0 4px 12px rgba(255,127,34,0.15)" : "0 2px 4px rgba(0,0,0,0.04)" }}>
                        {msg.text}
                        <span style={{ display: "block", fontSize: "10px", textAlign: "right", marginTop: "5px", opacity: 0.75 }}>{msg.timestamp}</span>
                      </div>
                    </div>
                  );
                })}
                <div ref={chatEndRef} />
              </div>

              <form onSubmit={handleSendMessage} style={{ display: "flex", padding: "16px 20px", background: "#fff", borderTop: `1px solid ${colors.borde}`, gap: "10px", alignItems: "center", position: "relative" }}>
                {mostrarEmojisChat && (
                  <div style={{ position: "absolute", bottom: "70px", left: "20px", background: "#fff", border: `1px solid ${colors.borde}`, borderRadius: "12px", padding: "10px", display: "flex", flexWrap: "wrap", gap: "6px", width: "240px", boxShadow: "0 8px 24px rgba(0,0,0,0.1)", zIndex: 10 }}>
                    {EMOJIS.map((e) => (
                      <button key={e} type="button" onClick={() => agregarEmojiChat(e)} style={{ background: "none", border: "none", fontSize: "20px", cursor: "pointer", borderRadius: "6px", padding: "2px 4px", transition: "background 0.1s" }}
                        onMouseEnter={(el) => (el.currentTarget.style.background = colors.fondo)}
                        onMouseLeave={(el) => (el.currentTarget.style.background = "none")}
                      >{e}</button>
                    ))}
                  </div>
                )}
                <button type="button" onClick={() => setMostrarEmojisChat((v) => !v)} style={{ background: "none", border: "none", color: colors.textoMuted, cursor: "pointer", fontSize: "18px", padding: "6px", borderRadius: "8px", flexShrink: 0 }}>
                  <FaSmile />
                </button>
                <input type="text" placeholder={`Mensaje en #${selectedArea}...`} value={messageText} onChange={(e) => setMessageText(e.target.value)} style={{ flex: 1, padding: "12px 16px", borderRadius: "10px", border: `1px solid ${colors.borde}`, outline: "none", fontSize: "14px", background: "#f9fafb" }}
                  onFocus={(e) => (e.target.style.borderColor = colors.naranja)}
                  onBlur={(e) => (e.target.style.borderColor = colors.borde)}
                />
                <button type="submit" style={{ backgroundColor: colors.naranja, color: "white", border: "none", borderRadius: "10px", width: "46px", height: "46px", display: "flex", justifyContent: "center", alignItems: "center", cursor: "pointer", flexShrink: 0 }}>
                  <FaPaperPlane style={{ fontSize: "16px" }} />
                </button>
              </form>
            </>
          )}

          {/* ── TAB SUB-TAREAS ────────────────────────────────────────────── */}
          {tabActiva === "subtareas" && (
            <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>

              {/* Toolbar sub-tareas */}
              <div style={{ padding: "14px 20px", borderBottom: `1px solid ${colors.borde}`, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span style={{ fontSize: "13px", color: colors.textoSec }}>
                  Sub-tareas del canal <b style={{ color: colors.texto }}>#{selectedArea}</b>
                </span>
                <button onClick={() => setMostrarFormST((v) => !v)} style={{ background: mostrarFormST ? "#f1f5f9" : colors.naranja, color: mostrarFormST ? colors.textoSec : "white", border: "none", padding: "8px 16px", borderRadius: "9px", fontSize: "13px", fontWeight: "700", cursor: "pointer", display: "flex", alignItems: "center", gap: "7px" }}>
                  {mostrarFormST ? <><FaTimes /> Cancelar</> : <><FaPlus /> Nueva sub-tarea</>}
                </button>
              </div>

              {/* Formulario nueva sub-tarea */}
              {mostrarFormST && (
                <form onSubmit={crearSubTarea} style={{ padding: "18px 20px", borderBottom: `1px solid ${colors.borde}`, background: "#fafbfc", display: "flex", flexDirection: "column", gap: "14px" }}>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                    <div>
                      <label style={{ fontSize: "11.5px", fontWeight: "700", color: colors.textoSec, display: "block", marginBottom: "5px" }}>Título *</label>
                      <input value={stTitulo} onChange={(e) => setStTitulo(e.target.value)} placeholder="¿Qué hay que hacer?" required style={{ width: "100%", padding: "9px 12px", borderRadius: "8px", border: `1px solid ${colors.borde}`, fontSize: "13px", outline: "none", boxSizing: "border-box", background: "#fff" }}
                        onFocus={(e) => (e.target.style.borderColor = colors.naranja)}
                        onBlur={(e) => (e.target.style.borderColor = colors.borde)}
                      />
                    </div>
                    <div>
                      <label style={{ fontSize: "11.5px", fontWeight: "700", color: colors.textoSec, display: "block", marginBottom: "5px" }}>Asignar a *</label>
                      <select value={stReceptorId} onChange={(e) => setStReceptorId(e.target.value)} required style={{ width: "100%", padding: "9px 12px", borderRadius: "8px", border: `1px solid ${colors.borde}`, fontSize: "13px", outline: "none", boxSizing: "border-box", background: "#fff" }}
                        onFocus={(e) => (e.target.style.borderColor = colors.naranja)}
                        onBlur={(e) => (e.target.style.borderColor = colors.borde)}
                      >
                        <option value="">Selecciona un asesor</option>
                        {asesores.filter((a) => a.id !== usuario?.id).map((a) => (
                          <option key={a.id} value={a.id}>{a.name} ({a.area?.nombre || "IT"})</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div style={{ position: "relative" }}>
                    <label style={{ fontSize: "11.5px", fontWeight: "700", color: colors.textoSec, display: "block", marginBottom: "5px" }}>Descripción</label>
                    <textarea value={stDescripcion} onChange={(e) => setStDescripcion(e.target.value)} placeholder="Detalla lo que necesitas..." rows={2} style={{ width: "100%", padding: "9px 12px", borderRadius: "8px", border: `1px solid ${colors.borde}`, fontSize: "13px", outline: "none", resize: "vertical", boxSizing: "border-box", background: "#fff", fontFamily: "inherit" }}
                      onFocus={(e) => (e.target.style.borderColor = colors.naranja)}
                      onBlur={(e) => (e.target.style.borderColor = colors.borde)}
                    />
                    <div style={{ position: "relative" }}>
                      <button type="button" onClick={() => setMostrarEmojisForm((v) => !v)} style={{ background: "none", border: "none", color: colors.textoMuted, cursor: "pointer", fontSize: "16px", marginTop: "4px" }}>
                        <FaSmile />
                      </button>
                      {mostrarEmojisForm && (
                        <div style={{ position: "absolute", top: "30px", left: 0, background: "#fff", border: `1px solid ${colors.borde}`, borderRadius: "12px", padding: "8px", display: "flex", flexWrap: "wrap", gap: "5px", width: "220px", boxShadow: "0 8px 24px rgba(0,0,0,0.1)", zIndex: 20 }}>
                          {EMOJIS.map((e) => (
                            <button key={e} type="button" onClick={() => agregarEmojiForm(e)} style={{ background: "none", border: "none", fontSize: "18px", cursor: "pointer", borderRadius: "5px", padding: "2px" }}>{e}</button>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>

                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                    <div>
                      <label style={{ fontSize: "11.5px", fontWeight: "700", color: colors.textoSec, display: "block", marginBottom: "5px" }}>Fecha límite</label>
                      <input type="datetime-local" value={stFechaLimite} onChange={(e) => setStFechaLimite(e.target.value)} style={{ width: "100%", padding: "9px 12px", borderRadius: "8px", border: `1px solid ${colors.borde}`, fontSize: "13px", outline: "none", boxSizing: "border-box", background: "#fff" }}
                        onFocus={(e) => (e.target.style.borderColor = colors.naranja)}
                        onBlur={(e) => (e.target.style.borderColor = colors.borde)}
                      />
                    </div>
                    <div>
                      <label style={{ fontSize: "11.5px", fontWeight: "700", color: colors.textoSec, display: "block", marginBottom: "5px" }}>Adjunto</label>
                      <input ref={archivoRef} type="file" accept="*/*" onChange={(e) => { setStArchivo(e.target.files[0]); setStArchivoNombre(e.target.files[0]?.name || ""); }} style={{ display: "none" }} />
                      <button type="button" onClick={() => archivoRef.current.click()} style={{ width: "100%", padding: "9px 12px", borderRadius: "8px", border: `1px dashed ${colors.borde}`, fontSize: "13px", background: "#fff", cursor: "pointer", color: stArchivoNombre ? colors.naranja : colors.textoMuted, display: "flex", alignItems: "center", gap: "7px", boxSizing: "border-box" }}>
                        <FaPaperclip />
                        <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                          {stArchivoNombre || "Adjuntar archivo..."}
                        </span>
                      </button>
                    </div>
                  </div>

                  <button type="submit" disabled={enviandoST} style={{ alignSelf: "flex-end", padding: "10px 24px", borderRadius: "9px", border: "none", background: colors.naranja, color: "white", fontSize: "13px", fontWeight: "700", cursor: enviandoST ? "default" : "pointer", opacity: enviandoST ? 0.7 : 1 }}>
                    {enviandoST ? "Creando..." : "Crear sub-tarea"}
                  </button>
                </form>
              )}

              {/* Lista de sub-tareas */}
              <div style={{ flex: 1, overflowY: "auto", padding: "16px 20px", display: "flex", flexDirection: "column", gap: "12px" }}>
                {cargandoST ? (
                  <p style={{ color: colors.textoSec, fontSize: "13px" }}>Cargando sub-tareas...</p>
                ) : subTareas.length === 0 ? (
                  <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "40px", color: colors.textoMuted }}>
                    <FaClipboardList style={{ fontSize: "36px", marginBottom: "10px", color: "#d1d5db" }} />
                    <p style={{ fontSize: "14px", margin: 0 }}>No hay sub-tareas en este canal todavía.</p>
                  </div>
                ) : subTareas.map((st) => {
                  const c = colorEstado(st.estado);
                  const vencida = esVencida(st.fechaLimite, st.estado);
                  return (
                    <div key={st.id} style={{ background: "#fff", borderRadius: "12px", border: `1px solid ${vencida ? colors.rojo : colors.borde}`, borderLeft: `4px solid ${st.estado === "Completada" ? colors.verde : vencida ? colors.rojo : colors.naranja}`, padding: "16px 18px", transition: "box-shadow 0.15s" }}
                      onMouseEnter={(e) => (e.currentTarget.style.boxShadow = "0 4px 14px rgba(15,23,42,0.05)")}
                      onMouseLeave={(e) => (e.currentTarget.style.boxShadow = "none")}
                    >
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "10px" }}>
                        <div style={{ flex: 1 }}>
                          <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "5px" }}>
                            <span style={{ fontSize: "13px", fontWeight: "700", color: st.estado === "Completada" ? colors.textoMuted : colors.texto, textDecoration: st.estado === "Completada" ? "line-through" : "none" }}>
                              {st.titulo}
                            </span>
                            <span style={{ fontSize: "10px", fontWeight: "700", padding: "2px 8px", borderRadius: "6px", backgroundColor: c.bg, color: c.color, whiteSpace: "nowrap" }}>
                              {labelEstado(st.estado)}
                            </span>
                            {vencida && (
                              <span style={{ fontSize: "10px", fontWeight: "700", padding: "2px 8px", borderRadius: "6px", backgroundColor: colors.rojoClaro, color: colors.rojo }}>
                                Vencida
                              </span>
                            )}
                          </div>
                          {st.descripcion && (
                            <p style={{ margin: "0 0 8px 0", fontSize: "12.5px", color: colors.textoSec, lineHeight: "1.4" }}>{st.descripcion}</p>
                          )}
                          <div style={{ display: "flex", gap: "14px", fontSize: "11px", color: colors.textoMuted, flexWrap: "wrap" }}>
                            <span>De: <b style={{ color: colors.textoSec }}>{st.asignador?.name}</b></span>
                            <span>Para: <b style={{ color: colors.naranja }}>{st.receptor?.name}</b></span>
                            {st.fechaLimite && (
                              <span style={{ display: "flex", alignItems: "center", gap: "3px", color: vencida ? colors.rojo : colors.textoMuted }}>
                                <FaClock style={{ fontSize: "10px" }} />
                                {new Date(st.fechaLimite).toLocaleString("es-HN", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" })}
                              </span>
                            )}
                            {st.archivoUrl && (
                              <a href={`http://localhost:3000${st.archivoUrl}`} target="_blank" rel="noreferrer" style={{ display: "flex", alignItems: "center", gap: "3px", color: colors.naranja, textDecoration: "none", fontWeight: "600" }}>
                                <FaFileAlt style={{ fontSize: "10px" }} />
                                {st.archivoNombre || "Ver adjunto"}
                              </a>
                            )}
                          </div>
                        </div>

                        <div style={{ display: "flex", flexDirection: "column", gap: "6px", flexShrink: 0 }}>
                          {st.estado === "Pendiente" && (
                            <button onClick={() => cambiarEstadoST(st.id, "EnProceso")} style={{ fontSize: "11px", padding: "5px 10px", borderRadius: "7px", border: `1px solid ${colors.borde}`, background: "#fff", cursor: "pointer", fontWeight: "600", color: colors.textoSec, whiteSpace: "nowrap" }}>
                              Iniciar
                            </button>
                          )}
                          {st.estado !== "Completada" && (
                            <button onClick={() => cambiarEstadoST(st.id, "Completada")} style={{ fontSize: "11px", padding: "5px 10px", borderRadius: "7px", border: "none", background: colors.verde, color: "white", cursor: "pointer", fontWeight: "700", display: "flex", alignItems: "center", gap: "4px", whiteSpace: "nowrap" }}>
                              <FaCheckCircle style={{ fontSize: "10px" }} /> Completar
                            </button>
                          )}
                          {/* Botón responder con archivo — solo el receptor puede responder */}
                          {st.receptorId === usuario?.id && st.estado !== "Completada" && (
                            <button onClick={() => { setRespondiendo(respondiendo === st.id ? null : st.id); setArchivoRespuesta(null); setComentarioRespuesta(""); }} style={{ fontSize: "11px", padding: "5px 10px", borderRadius: "7px", border: `1px solid #3b82f6`, background: respondiendo === st.id ? "#eff6ff" : "white", color: "#3b82f6", cursor: "pointer", fontWeight: "700", display: "flex", alignItems: "center", gap: "4px", whiteSpace: "nowrap" }}>
                              <FaReply style={{ fontSize: "10px" }} /> Responder
                            </button>
                          )}
                          {(st.asignadorId === usuario?.id || usuario?.role === "SUPERADMIN") && (
                            <button onClick={() => eliminarST(st.id)} style={{ fontSize: "11px", padding: "5px 10px", borderRadius: "7px", border: "none", background: colors.rojoClaro, color: colors.rojo, cursor: "pointer", fontWeight: "700", display: "flex", alignItems: "center", gap: "4px" }}>
                              <FaTrash style={{ fontSize: "10px" }} /> Eliminar
                            </button>
                          )}
                        </div>
                      </div>

                      {/* Panel de respuesta con archivo */}
                      {respondiendo === st.id && (
                        <div style={{ marginTop: "12px", padding: "12px", background: "#eff6ff", borderRadius: "8px", border: "1px solid #bfdbfe", display: "flex", flexDirection: "column", gap: "8px" }}>
                          <p style={{ margin: 0, fontSize: "12px", fontWeight: "700", color: "#1d4ed8" }}>Adjuntar archivo de respuesta</p>
                          <input
                            ref={archivoRespuestaRef}
                            type="file"
                            accept="*/*"
                            onChange={(e) => setArchivoRespuesta(e.target.files[0])}
                            style={{ display: "none" }}
                          />
                          <button type="button" onClick={() => archivoRespuestaRef.current.click()} style={{ padding: "8px 12px", borderRadius: "7px", border: "1px dashed #93c5fd", background: "white", cursor: "pointer", color: archivoRespuesta ? "#1d4ed8" : colors.textoMuted, fontSize: "12px", display: "flex", alignItems: "center", gap: "6px" }}>
                            <FaPaperclip />
                            {archivoRespuesta ? archivoRespuesta.name : "Seleccionar archivo..."}
                          </button>
                          <input
                            placeholder="Comentario opcional..."
                            value={comentarioRespuesta}
                            onChange={(e) => setComentarioRespuesta(e.target.value)}
                            style={{ padding: "8px 10px", borderRadius: "7px", border: "1px solid #bfdbfe", fontSize: "12px", outline: "none" }}
                          />
                          <div style={{ display: "flex", gap: "8px" }}>
                            <button onClick={() => enviarRespuesta(st.id)} disabled={!archivoRespuesta || enviandoRespuesta} style={{ padding: "7px 16px", borderRadius: "7px", border: "none", background: "#3b82f6", color: "white", fontSize: "12px", fontWeight: "700", cursor: archivoRespuesta ? "pointer" : "not-allowed", opacity: archivoRespuesta ? 1 : 0.5 }}>
                              {enviandoRespuesta ? "Enviando..." : "Enviar respuesta"}
                            </button>
                            <button onClick={() => { setRespondiendo(null); setArchivoRespuesta(null); }} style={{ padding: "7px 12px", borderRadius: "7px", border: `1px solid ${colors.borde}`, background: "white", fontSize: "12px", cursor: "pointer", color: colors.textoSec }}>
                              Cancelar
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}