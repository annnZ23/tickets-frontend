import { useEffect, useState, useRef, useCallback } from "react";
import { useParams } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import { socket } from "../hooks/useNotificaciones";
import {
  FaPaperPlane, FaPaperclip, FaMicrophone, FaStop, FaFileAlt,
  FaClock, FaTag, FaUser,
} from "react-icons/fa";

const colors = {
  naranja: "#ff7f22", naranjaOscuro: "#e66a10", naranjaClaro: "#fff1e6",
  texto: "#1e293b", textoSec: "#64748b", textoMuted: "#94a3b8",
  borde: "#eef1f5", fondo: "#fdf0e6", verde: "#16a34a", verdeClaro: "#e9f9ee",
  rojo: "#dc2626", rojoClaro: "#fee2e2", amarillo: "#d97706", amarilloClaro: "#fef3e2",
};

const badgeEstado = (estado) => {
  if (estado === "Resuelto") return { bg: colors.verdeClaro, color: colors.verde };
  if (estado === "En Proceso") return { bg: colors.naranjaClaro, color: colors.naranja };
  return { bg: "#f1f5f9", color: colors.textoSec };
};

export default function ChatTicket({ usuario, cerrarSesion }) {
  const { id } = useParams();
  const token = localStorage.getItem("token");
  const user = usuario || JSON.parse(localStorage.getItem("user") || "null");

  const [ticket, setTicket] = useState(null);
  const [mensajes, setMensajes] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [nuevoMensaje, setNuevoMensaje] = useState("");
  const [enviando, setEnviando] = useState(false);
  const [grabando, setGrabando] = useState(false);

  const chatEndRef = useRef(null);
  const inputArchivoRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const chunksAudioRef = useRef([]);

  const authHeaders = () => ({ Authorization: `Bearer ${token}` });

  const cargarTicket = useCallback(async () => {
    setCargando(true);
    try {
      const res = await fetch(`http://localhost:3000/api/tickets/${id}`, { headers: authHeaders() });
      if (!res.ok) throw new Error("No se pudo cargar el ticket");
      const data = await res.json();
      setTicket(data);
      setMensajes(data.mensajes || []);
    } catch (err) {
      console.error(err);
    } finally {
      setCargando(false);
    }
  }, [id]);

  useEffect(() => { cargarTicket(); }, [cargarTicket]);
  useEffect(() => {
    const room = `ticket_${id}`;
    socket.emit("join_room", room);

    const onReceive = (data) => {
      setMensajes((prev) => {
        if (data.idTemporal && prev.some((m) => m.idTemporal === data.idTemporal)) return prev;
        return [...prev, data];
      });
    };

    socket.on("receive_message", onReceive);
    return () => {
      socket.off("receive_message", onReceive);
      socket.emit("leave_room", room);
    };
  }, [id]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [mensajes]);

  const enviarTexto = async (e) => {
    e.preventDefault();
    if (!nuevoMensaje.trim() || enviando) return;
    await enviarMensaje({ contenido: nuevoMensaje.trim() });
    setNuevoMensaje("");
  };

  const enviarArchivo = async (file) => {
    if (!file) return;
    await enviarMensaje({ archivo: file });
  };

  const enviarMensaje = async ({ contenido, archivo }) => {
    setEnviando(true);
    const idTemporal = `${Date.now()}-${Math.random()}`;
    const nombreRemitente = user?.name || ticket?.nombre || "Usuario";
    const mensajeLocal = {
      idTemporal,
      contenido: contenido || null,
      enviadoPor: nombreRemitente,
      fileUrl: archivo ? URL.createObjectURL(archivo) : null,
      fileType: archivo ? archivo.type : null,
      creadoAt: new Date().toISOString(),
      _local: true,
    };
    setMensajes((prev) => [...prev, mensajeLocal]);

    try {
      const formData = new FormData();
      if (contenido) formData.append("contenido", contenido);
      formData.append("enviadoPor", nombreRemitente);
      if (archivo) formData.append("archivo", archivo);

      const res = await fetch(`http://localhost:3000/api/tickets/${id}/mensajes`, {
        method: "POST",
        headers: authHeaders(),
        body: formData,
      });
      const guardado = await res.json();
      setMensajes((prev) => prev.map((m) => (m.idTemporal === idTemporal ? { ...guardado, idTemporal } : m)));

      socket.emit("send_message", {
        room: `ticket_${id}`,
        idTemporal,
        ...guardado,
      });
    } catch (err) {
      console.error("Error al enviar mensaje:", err);
    } finally {
      setEnviando(false);
    }
  };

  const iniciarGrabacion = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      chunksAudioRef.current = [];
      recorder.ondataavailable = (e) => chunksAudioRef.current.push(e.data);
      recorder.onstop = async () => {
        const blob = new Blob(chunksAudioRef.current, { type: "audio/webm" });
        const archivo = new File([blob], `audio-${Date.now()}.webm`, { type: "audio/webm" });
        await enviarArchivo(archivo);
        stream.getTracks().forEach((t) => t.stop());
      };
      recorder.start();
      mediaRecorderRef.current = recorder;
      setGrabando(true);
    } catch (err) {
      alert("No se pudo acceder al micrófono. Revisa los permisos del navegador.");
    }
  };

  const detenerGrabacion = () => {
    mediaRecorderRef.current?.stop();
    setGrabando(false);
  };

  if (cargando) {
    return (
      <div style={{ display: "flex", minHeight: "100vh", background: colors.fondo }}>
        <Sidebar usuario={user} cerrarSesion={cerrarSesion} />
        <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", color: colors.textoSec }}>
          Cargando conversación...
        </div>
      </div>
    );
  }

  if (!ticket) {
    return (
      <div style={{ display: "flex", minHeight: "100vh", background: colors.fondo }}>
        <Sidebar usuario={user} cerrarSesion={cerrarSesion} />
        <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", color: colors.textoSec }}>
          No se encontró este ticket, o no tienes acceso a él.
        </div>
      </div>
    );
  }

  const badge = badgeEstado(ticket.estado);

  return (
    <div style={{ display: "flex", minHeight: "100vh", background: colors.fondo, fontFamily: "'Segoe UI', sans-serif" }}>
      <link href="https://fonts.googleapis.com/css2?family=Manrope:wght@500;700;800&display=swap" rel="stylesheet" />
      <Sidebar usuario={user} cerrarSesion={cerrarSesion} />

      <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>
       
        <div style={{ height: "65px", backgroundColor: "#fff", borderBottom: `1px solid ${colors.borde}`, display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 28px", flexShrink: 0 }}>
          <div>
            <span style={{ fontSize: "12px", color: colors.textoMuted }}>Ticket</span>
            <h2 style={{ margin: 0, fontSize: "16px", fontWeight: "800", color: colors.texto, fontFamily: "'Manrope', sans-serif" }}>
              #TK-{ticket.id} — {ticket.tipo}
            </h2>
          </div>
          <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
            {ticket.pausado && (
              <span style={{ padding: "5px 14px", borderRadius: "20px", fontSize: "12px", fontWeight: "700", background: colors.amarilloClaro || "#fef3e2", color: "#92400e" }}>
                ⏸ Pausado
              </span>
            )}
            <span style={{ padding: "5px 14px", borderRadius: "20px", fontSize: "12px", fontWeight: "700", background: badge.bg, color: badge.color }}>
              {ticket.estado}
            </span>
          </div>
        </div>

        <div style={{ flex: 1, display: "flex", gap: "20px", padding: "20px 28px", overflow: "hidden" }}>
          
          <div style={{ flex: 2, background: "#fff", borderRadius: "14px", border: `1px solid ${colors.borde}`, display: "flex", flexDirection: "column", overflow: "hidden" }}>
            <div style={{ flex: 1, overflowY: "auto", padding: "20px", display: "flex", flexDirection: "column", gap: "12px", background: colors.fondo }}>
             
              <div style={{ background: "#fff", border: `1px solid ${colors.borde}`, borderRadius: "10px", padding: "14px 16px", fontSize: "13px", color: colors.textoSec }}>
                <strong style={{ color: colors.texto, display: "block", marginBottom: "4px" }}>Descripción original del incidente</strong>
                <div style={{ lineHeight: 1.5 }} dangerouslySetInnerHTML={{ __html: ticket.descripcion || "Sin descripción adicional." }} />
              </div>

              {mensajes.map((m, i) => {
                const esMio = m.enviadoPor === (user?.name || ticket.nombre);
                return (
                  <div key={m.id || m.idTemporal || i} style={{ display: "flex", flexDirection: "column", alignSelf: esMio ? "flex-end" : "flex-start", maxWidth: "72%" }}>
                    <span style={{ fontSize: "10.5px", color: colors.textoMuted, marginBottom: "3px", alignSelf: esMio ? "flex-end" : "flex-start" }}>
                      {esMio ? "Tú" : m.enviadoPor}
                    </span>
                    <div style={{
                      background: esMio ? colors.naranja : "#fff",
                      color: esMio ? "#fff" : colors.texto,
                      padding: "10px 14px",
                      borderRadius: esMio ? "14px 14px 3px 14px" : "14px 14px 14px 3px",
                      fontSize: "13.5px",
                      boxShadow: esMio ? "none" : "0 1px 3px rgba(15,23,42,0.06)",
                    }}>
                      {m.contenido && <div dangerouslySetInnerHTML={{ __html: m.contenido }} />}
                      {m.fileUrl && m.fileType?.startsWith("audio") && (
                        <audio controls src={m.fileUrl.startsWith("blob:") ? m.fileUrl : `http://localhost:3000${m.fileUrl}`} style={{ marginTop: m.contenido ? "8px" : 0, maxWidth: "220px" }} />
                      )}
                      {m.fileUrl && m.fileType?.startsWith("image") && (
                        <img src={m.fileUrl.startsWith("blob:") ? m.fileUrl : `http://localhost:3000${m.fileUrl}`} alt="" style={{ marginTop: m.contenido ? "8px" : 0, maxWidth: "220px", borderRadius: "8px", display: "block" }} />
                      )}
                      {m.fileUrl && !m.fileType?.startsWith("audio") && !m.fileType?.startsWith("image") && (
                        <a href={m.fileUrl.startsWith("blob:") ? m.fileUrl : `http://localhost:3000${m.fileUrl}`} target="_blank" rel="noreferrer" style={{ display: "flex", alignItems: "center", gap: "6px", marginTop: m.contenido ? "8px" : 0, color: esMio ? "#fff" : colors.naranja, fontWeight: "600", textDecoration: "none" }}>
                          <FaFileAlt /> Ver archivo
                        </a>
                      )}
                      <div style={{ fontSize: "9.5px", textAlign: "right", marginTop: "5px", opacity: 0.75 }}>
                        {new Date(m.creadoAt).toLocaleTimeString("es-HN", { hour: "2-digit", minute: "2-digit" })}
                      </div>
                    </div>
                  </div>
                );
              })}
              <div ref={chatEndRef} />
            </div>

            <form onSubmit={enviarTexto} style={{ padding: "14px 20px", borderTop: `1px solid ${colors.borde}`, display: "flex", gap: "10px", alignItems: "center" }}>
              <input
                ref={inputArchivoRef}
                type="file"
                style={{ display: "none" }}
                onChange={(e) => { enviarArchivo(e.target.files[0]); e.target.value = ""; }}
              />
              <button type="button" onClick={() => inputArchivoRef.current.click()} style={{ background: "none", border: "none", color: colors.textoSec, cursor: "pointer", fontSize: "16px" }}>
                <FaPaperclip />
              </button>
              <button
                type="button"
                onClick={grabando ? detenerGrabacion : iniciarGrabacion}
                style={{ background: "none", border: "none", cursor: "pointer", fontSize: "16px", color: grabando ? colors.rojo : colors.textoSec }}
                title={grabando ? "Detener grabación" : "Grabar audio"}
              >
                {grabando ? <FaStop /> : <FaMicrophone />}
              </button>
              <input
                type="text"
                value={nuevoMensaje}
                onChange={(e) => setNuevoMensaje(e.target.value)}
                placeholder={grabando ? "Grabando audio..." : "Escribe una respuesta..."}
                disabled={grabando}
                style={{ flex: 1, padding: "10px 16px", borderRadius: "20px", border: `1px solid ${colors.borde}`, outline: "none", fontSize: "13px" }}
              />
              <button type="submit" disabled={enviando} style={{ backgroundColor: colors.naranja, color: "white", border: "none", width: "38px", height: "38px", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", flexShrink: 0 }}>
                <FaPaperPlane style={{ fontSize: "13px" }} />
              </button>
            </form>
          </div>
          
          <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: "16px" }}>
            <div style={{ background: "#fff", borderRadius: "14px", border: `1px solid ${colors.borde}`, padding: "18px" }}>
              <h4 style={{ margin: "0 0 14px", fontSize: "13px", fontWeight: "700", color: colors.texto }}>Detalles del ticket</h4>
              <div style={{ display: "flex", flexDirection: "column", gap: "11px", fontSize: "12.5px" }}>
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <span style={{ color: colors.textoSec, display: "flex", alignItems: "center", gap: "6px" }}><FaTag style={{ fontSize: "10px" }} /> Prioridad</span>
                  <span style={{ fontWeight: "700", color: colors.naranja }}>{ticket.prioridad}</span>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <span style={{ color: colors.textoSec }}>Categoría</span>
                  <span style={{ fontWeight: "700", color: colors.texto }}>{ticket.categoria?.nombre || "—"}</span>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <span style={{ color: colors.textoSec }}>Área</span>
                  <span style={{ fontWeight: "700", color: colors.texto }}>{ticket.area || "—"}</span>
                </div>
                {ticket.fechaLimiteAsesor && (
                  <div style={{ display: "flex", justifyContent: "space-between" }}>
                    <span style={{ color: colors.textoSec, display: "flex", alignItems: "center", gap: "6px" }}><FaClock style={{ fontSize: "10px" }} /> Se resuelve antes de</span>
                    <span style={{ fontWeight: "700", color: colors.texto }}>{new Date(ticket.fechaLimiteAsesor).toLocaleString("es-HN")}</span>
                  </div>
                )}
              </div>
            </div>

            <div style={{ background: "#fff", borderRadius: "14px", border: `1px solid ${colors.borde}`, padding: "18px" }}>
              <h4 style={{ margin: "0 0 12px", fontSize: "13px", fontWeight: "700", color: colors.texto, display: "flex", alignItems: "center", gap: "7px" }}>
                <FaUser style={{ color: colors.naranja, fontSize: "12px" }} /> Asesor asignado
              </h4>
              {ticket.asignados?.length > 0 ? (
                ticket.asignados.map((a) => (
                  <div key={a.adminId} style={{ fontSize: "12.5px", color: colors.texto, fontWeight: "600", marginBottom: "3px" }}>
                    {a.admin.name}
                  </div>
                ))
              ) : (
                <p style={{ fontSize: "12px", color: colors.textoMuted, margin: 0 }}>Aún no se ha asignado un asesor.</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}