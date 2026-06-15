import { useState, useEffect, useRef } from "react";
import { useParams } from "react-router-dom";
import { FaPaperclip, FaPaperPlane, FaFileAlt, FaCheckCircle, FaSpinner, FaRegClock } from "react-icons/fa";
import Sidebar from "../components/Sidebar";
import "./Chat.css"; // Usa o adapta tus estilos para globos naranjas y grises

export default function ChatTicket() {
  const { id } = useParams(); // ID del Ticket actual
  const user = JSON.parse(localStorage.getItem("user"));
  
  const [ticket, setTicket] = useState(null);
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState("");
  const [selectedFile, setSelectedFile] = useState(null);
  const fileInputRef = useRef(null);

  // Campos exclusivos para la gestión del Admin
  const [nuevoEstado, setNuevoEstado] = useState("Creado");
  const [solucionText, setSolucionText] = useState("");

  const cargarDatos = async () => {
    try {
      // 1. Obtener detalles del ticket
      const resTicket = await fetch(`http://localhost:3000/api/tickets`);
      const tickets = await resTicket.json();
      const current = tickets.find(t => t.id === Number(id));
      setTicket(current);
      if (current) setNuevoEstado(current.estado);

      // 2. Obtener mensajes del chat
      const resMsg = await fetch(`http://localhost:3000/api/messages/${id}`);
      const dataMsg = await resMsg.json();
      setMessages(dataMsg);
    } catch (err) {
      console.error("Error al cargar chat:", err);
    }
  };

  useEffect(() => {
    cargarDatos();
  }, [id]);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!text.trim() && !selectedFile) return;

    // Usamos FormData para enviar el archivo físico junto con el texto
    const formData = new FormData();
    formData.append("texto", text);
    formData.append("ticketId", id);
    formData.append("enviadoPor", user?.role === "ADMIN" ? "soporte" : "usuario");
    if (selectedFile) {
      formData.append("file", selectedFile);
    }

    try {
      const response = await fetch("http://localhost:3000/api/messages", {
        method: "POST",
        body: formData // No se pone Header Content-Type, el navegador lo calcula automáticamente
      });

      if (response.ok) {
        setText("");
        setSelectedFile(null);
        cargarDatos(); // Refrescar mensajes en pantalla
      }
    } catch (err) {
      console.error("Error al enviar:", err);
    }
  };

  const actualizarFlujoAdmin = async () => {
    try {
      const res = await fetch(`http://localhost:3000/api/tickets/${id}/estado`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ estado: nuevoEstado, solucion: solucionText })
      });
      if (res.ok) {
        alert("Flujo operativo del incidente actualizado");
        cargarDatos();
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div style={{ display: "flex", minHeight: "100vh", width: "100vw", background: "#f8f9fa" }}>
      <Sidebar />

      <div style={{ flex: 1, display: "flex", flexDirection: "column", minWidth: 0 }}>
        
        {/* TOPBAR INFORMATIVA */}
        <div className="topbar-pro" style={{ padding: "15px 25px", background: "#fff", borderBottom: "1px solid #e0e0e0", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div>
            <h3 style={{ margin: 0 }}>Chat de Incidencia #{id}</h3>
            <small style={{ color: "#666" }}>Asunto: {ticket?.nombre} - {ticket?.tipo}</small>
          </div>
          <span className={`badge-estado-actual ${ticket?.estado?.toLowerCase()?.replace(" ", "-")}`}>
            {ticket?.estado}
          </span>
        </div>

        {/* CUERPO PRINCIPAL DIVIDIDO EN DOS (CHAT & CONTROL OPERATIVO SI ES ADMIN) */}
        <div style={{ flex: 1, display: "flex", width: "100%" }}>
          
          {/* SECCIÓN DEL CHAT DIRECTO */}
          <div style={{ flex: user?.role === "ADMIN" ? 2 : 3, display: "flex", flexDirection: "column", background: "#fff", margin: "20px", borderRadius: "12px", boxShadow: "0 2px 8px rgba(0,0,0,0.05)", overflow: "hidden" }}>
            
            {/* Cabecera del chat */}
            <div style={{ background: "#ff7f22", color: "#fff", padding: "12px 20px", fontWeight: "bold" }}>
              Soporte Técnico - Baprosa Asistencia
            </div>

            {/* Contenedor de burbujas */}
            <div style={{ flex: 1, padding: "20px", overflowY: "auto", display: "flex", flexDirection: "column", gap: "12px", background: "#fefefe" }}>
              {messages.map((msg) => {
                const esSoporte = msg.enviadoPor === "soporte";
                return (
                  <div key={msg.id} style={{ display: "flex", flexDirection: "column", alignItems: esSoporte ? "flex-end" : "flex-start", width: "100%" }}>
                    
                    {/* Burbuja */}
                    <div style={{
                      maxWidth: "70%",
                      padding: "12px 16px",
                      borderRadius: "14px",
                      background: esSoporte ? "#ff7f22" : "#f1f3f5",
                      color: esSoporte ? "#fff" : "#333",
                      boxShadow: "0 1px 3px rgba(0,0,0,0.1)"
                    }}>
                      <small style={{ display: "block", fontWeight: "bold", marginBottom: "4px", fontSize: "11px", color: esSoporte ? "#ffe3d1" : "#777" }}>
                        {esSoporte ? "Soporte Técnico" : ticket?.nombre || "Usuario"}
                      </small>
                      
                      {/* Texto */}
                      {msg.contenido && <p style={{ margin: 0, fontSize: "14px", lineHeight: "1.4" }}>{msg.contenido}</p>}

                      {/* Renderizado Dinámico de Multimedia según su tipo */}
                      {msg.fileUrl && (
                        <div style={{ marginTop: "10px" }}>
                          {msg.fileType === "image" && (
                            <img src={`http://localhost:3000${msg.fileUrl}`} alt="Adjunto" style={{ maxWidth: "100%", borderRadius: "8px", maxHeight: "200px", objectFit: "cover" }} />
                          )}
                          {msg.fileType === "audio" && (
                            <audio controls style={{ maxWidth: "100%" }}>
                              <source src={`http://localhost:3000${msg.fileUrl}`} />
                            </audio>
                          )}
                          {msg.fileType === "document" && (
                            <a href={`http://localhost:3000${msg.fileUrl}`} target="_blank" rel="noreferrer" style={{ display: "flex", alignItems: "center", gap: "8px", color: esSoporte ? "#fff" : "#ff7f22", textDecoration: "underline", fontWeight: "bold", fontSize: "13px" }}>
                              <FaFileAlt /> Descargar Archivo Adjunto
                            </a>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Barra inferior para redactar y adjuntar */}
            <form onSubmit={handleSendMessage} style={{ padding: "15px", borderTop: "1px solid #eee", background: "#f8f9fa", display: "flex", alignItems: "center", gap: "10px" }}>
              <input type="file" ref={fileInputRef} style={{ display: "none" }} onChange={(e) => setSelectedFile(e.target.files[0])} />
              
              <button type="button" title="Adjuntar Archivo" style={{ background: "none", border: "none", color: selectedFile ? "#ff7f22" : "#666", fontSize: "20px", cursor: "pointer" }} onClick={() => fileInputRef.current.click()}>
                <FaPaperclip />
              </button>

              <div style={{ flex: 1, position: "relative", display: "flex", flexDirection: "column" }}>
                <input type="text" placeholder={selectedFile ? `Archivo seleccionado: ${selectedFile.name}` : "Escribe un mensaje..."} style={{ width: "100%", padding: "10px 15px", borderRadius: "20px", border: "1px solid #ccc", outline: "none" }} value={text} onChange={(e) => setText(e.target.value)} />
              </div>

              <button type="submit" style={{ background: "#ff7f22", color: "white", border: "none", width: "40px", height: "40px", borderRadius: "50%", display: "flex", justifyContent: "center", alignItems: "center", cursor: "pointer" }}>
                <FaPaperPlane />
              </button>
            </form>

          </div>

          {/* VISTA DEL FLUJO LOGÍSTICO Y ESTADO DEL TICKET (EXCLUSIVO ADMIN) */}
          {user?.role === "ADMIN" && (
            <div style={{ flex: 1, background: "#fff", margin: "20px 20px 20px 0", padding: "20px", borderRadius: "12px", boxShadow: "0 2px 8px rgba(0,0,0,0.05)", display: "flex", flexDirection: "column", gap: "20px" }}>
              
              <h4 style={{ margin: 0, color: "#333", borderBottom: "2px solid #ff7f22", paddingBottom: "8px" }}>
                Control Operativo IT
              </h4>

              {/* Componente visual idéntico del Estado del Ticket */}
              <div>
                <p style={{ fontWeight: "bold", fontSize: "13px", color: "#55px", marginBottom: "10px" }}>Progreso de Resolución:</p>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "10px 5px", background: "#f9f9f9", borderRadius: "8px" }}>
                  <div style={{ textAlign: "center", fontSize: "11px", color: "green" }}><FaCheckCircle /><br/>Creado</div>
                  <div style={{ width: "20px", height: "4px", background: "green" }} />
                  <div style={{ textAlign: "center", fontSize: "11px", color: ticket?.estado !== "Creado" ? "green" : "#ccc" }}><FaCheckCircle /><br/>Asignado</div>
                  <div style={{ width: "20px", height: "4px", background: ticket?.estado === "En Proceso" || ticket?.estado === "Resuelto" ? "green" : "#ccc" }} />
                  <div style={{ textAlign: "center", fontSize: "11px", color: ticket?.estado === "En Proceso" ? "orange" : ticket?.estado === "Resuelto" ? "green" : "#ccc" }}><FaSpinner /><br/>En Proceso</div>
                  <div style={{ width: "20px", height: "4px", background: ticket?.estado === "Resuelto" ? "green" : "#ccc" }} />
                  <div style={{ textAlign: "center", fontSize: "11px", color: ticket?.estado === "Resuelto" ? "green" : "#ccc" }}><FaRegClock /><br/>Resuelto</div>
                </div>
              </div>

              {/* Formulario de Cambios de Estado */}
              <div style={{ display: "flex", flexDirection: "column", gap: "10px", marginTop: "10px" }}>
                <label style={{ fontSize: "13px", fontWeight: "bold" }}>Cambiar Estado:</label>
                <select style={{ padding: "8px", borderRadius: "6px", border: "1px solid #ccc" }} value={nuevoEstado} onChange={(e) => setNuevoEstado(e.target.value)}>
                  <option value="Creado">Creado</option>
                  <option value="Asignado">Asignado</option>
                  <option value="En Proceso">En Proceso</option>
                  <option value="Resuelto">Resuelto</option>
                </select>
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                <label style={{ fontSize: "13px", fontWeight: "bold" }}>Solución al Incidente:</label>
                <textarea rows="4" placeholder="Escribe la bitácora o los pasos técnicos tomados para resolver el problema..." style={{ padding: "8px", borderRadius: "6px", border: "1px solid #ccc", resize: "none", fontSize: "13px" }} value={solucionText} onChange={(e) => setSolucionText(e.target.value)} />
              </div>

              <button type="button" style={{ background: "#28a745", color: "white", border: "none", padding: "10px", borderRadius: "6px", fontWeight: "bold", cursor: "pointer", width: "100%", marginTop: "auto" }} onClick={actualizarFlujoAdmin}>
                Guardar Flujo Técnico
              </button>

            </div>
          )}

        </div>
      </div>
    </div>
  );
}