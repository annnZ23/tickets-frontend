import { useState, useEffect, useRef, useCallback } from "react";
import { useParams } from "react-router-dom";
import io from "socket.io-client";
import Sidebar from "../components/Sidebar";
import { 
  FaPaperPlane, FaComments, FaUser, FaClipboardList, 
  FaChevronDown, FaChevronUp, FaRegClock, FaPaperclip, FaUserShield, FaBusinessTime 
} from "react-icons/fa";
import "./Dashboard.css"; 

const socket = io("http://localhost:3000");

export default function ChatPorArea() {
  const user = JSON.parse(localStorage.getItem("user"));
  const { idTicket } = useParams(); 
  const areas = ["Soporte Técnico", "Desarrollo Web", "Analista de Rutas"];
  const [selectedArea, setSelectedArea] = useState("Soporte Técnico");
  const [messageText, setMessageText] = useState("");
  const [messages, setMessages] = useState([]);
  const [ticketDetails, setTicketDetails] = useState(null);
  const [isDescOpen, setIsDescOpen] = useState(true);

  const chatEndRef = useRef(null);

  const scrollToBottom = () => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    const fetchTicketDetails = async () => {
      if (!idTicket) {
        setTicketDetails(null);
        return;
      }
      try {
        const res = await fetch(`http://localhost:3000/api/tickets/${idTicket}`);
        if (res.ok) {
          const data = await res.json();
          setTicketDetails(data);
          if (data.area) setSelectedArea(data.area);
        }
      } catch (err) {
        console.error("Error al traer credenciales del ticket:", err);
      }
    };

    fetchTicketDetails();
  }, [idTicket]);

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

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!messageText.trim()) return;

    const messageData = {
      room: idTicket ? `ticket_${idTicket}` : `area_${selectedArea}`,
      sender: user?.email || "Anónimo",
      text: messageText,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    socket.emit("send_message", messageData);
    setMessageText("");
  };

  const handleRestablecer = () => {
    if(window.confirm("¿Deseas restablecer los valores de este chat?")) {
      setMessages([]);
    }
  };

  const handleCancelar = () => {
    setMessageText("");
  };

  return (
 <div style={{ display: "flex", minHeight: "100vh", width: "100vw", overflowX: "hidden", background: "#f3f4f6" }}>
<Sidebar />

<div className="content" style={{ flex: 1, padding: "24px", display: "flex", flexDirection: "column", gap: "20px" }}>
        
<div style={{
 width: "100%", 
 background: "linear-gradient(135deg, #ff7f22 0%, #e66a10 100%)", 
 padding: "18px 24px", 
 borderRadius: "14px", 
 boxShadow: "0 4px 15px rgba(255, 127, 34, 0.25)",
 display: "flex",
 alignItems: "center",
 justifyContent: "space-between"
  }}>
                    
<div style={{ display: "flex", alignItems: "center", gap: "12px", color: "white" }}>
            <FaComments style={{ fontSize: "26px", filter: "drop-shadow(0px 2px 4px rgba(0,0,0,0.15))" }} />
            <div>
              <h3 style={{ margin: 0, fontSize: "20px", fontWeight: "700", letterSpacing: "0.5px" }}>
                {idTicket ? `Chat por Área  #TK-${idTicket}` : "Mesa de Coordinación por Área IT"}
              </h3>
              <p style={{ margin: 0, fontSize: "12px", color: "rgba(255,255,255,0.85)", marginTop: "2px" }}>
                Monitoreo y respuesta en tiempo real Baprosa S.A.
              </p>
            </div>
          </div>
        </div>

        {!idTicket && (
          <div style={{ display: "flex", gap: "12px", background: "#fff", padding: "8px", borderRadius: "12px", boxShadow: "0 2px 8px rgba(0,0,0,0.04)", width: "fit-content" }}>
            {areas.map((area) => (
              <button
                key={area}
                onClick={() => setSelectedArea(area)}
                style={{
                  padding: "10px 20px",
                  borderRadius: "10px",
                  border: "none",
                  fontWeight: "600",
                  fontSize: "14px",
                  cursor: "pointer",
                  backgroundColor: selectedArea === area ? "#ff7f22" : "transparent",
                  color: selectedArea === area ? "white" : "#6b7280",
                  transition: "all 0.25s ease"
                }}
              >
                {area}
              </button>
            ))}
          </div>
        )}

        <div style={{ display: "flex", flex: 1, gap: "24px", width: "100%", alignItems: "stretch" }}>
        
         
          <div style={{ flex: 3, background: "#fff", borderRadius: "16px", boxShadow: "0 10px 25px rgba(0,0,0,0.03)", display: "flex", flexDirection: "column", overflow: "hidden", border: "1px solid #e5e7eb" }}>
            <div style={{ background: "#fafafa", padding: "14px 24px", borderBottom: "1px solid #edf2f7", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <span style={{ fontWeight: "600", color: "#4b5563", fontSize: "14px" }}>
                {idTicket ? `Canal de Seguimiento Seguro` : `Canal Activo: #${selectedArea}`}
              </span>
              <span style={{ width: "8px", height: "8px", background: "#10b981", borderRadius: "50%", display: "inline-block", boxShadow: "0 0 8px #10b981" }}></span>
            </div>

            <div style={{ flex: 1, padding: "24px", overflowY: "auto", display: "flex", flexDirection: "column", gap: "16px", background: "#fcfcfd" }}>
              {messages.length === 0 ? (
                <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", height: "100%", color: "#9ca3af" }}>
                  <FaComments style={{ fontSize: "40px", marginBottom: "10px", color: "#d1d5db" }} />
                  <p style={{ fontSize: "14px", margin: 0 }}>No hay mensajes de seguimiento registrados en este incidente.</p>
                </div>
              ) : (
                messages.map((msg, index) => {
                  const isMe = msg.sender === user?.email;
                  return (
                    <div key={index} style={{ display: "flex", flexDirection: "column", alignItems: isMe ? "flex-end" : "flex-start", width: "100%" }}>
                      <span style={{ fontSize: "11px", color: "#6b7280", marginBottom: "4px", paddingLeft: "4px" }}>{isMe ? "Tú" : msg.sender}</span>
                      <div style={{
                        maxWidth: "68%",
                        padding: "12px 16px",
                        borderRadius: isMe ? "16px 16px 0px 16px" : "16px 16px 16px 0px",
                        backgroundColor: isMe ? "#ff7f22" : "#f3f4f6",
                        color: isMe ? "white" : "#1f2937",
                        fontSize: "14px",
                        lineHeight: "1.5",
                        boxShadow: isMe ? "0 4px 12px rgba(255, 127, 34, 0.15)" : "0 2px 4px rgba(0,0,0,0.02)"
                      }}>
                        {msg.text}
                        <span style={{ display: "block", fontSize: "10px", textAlign: "right", marginTop: "6px", color: isMe ? "rgba(255,255,255,0.8)" : "#9ca3af", fontWeight: "500" }}>
                          {msg.timestamp}
                        </span>
                      </div>
                    </div>
                  );
                })
              )}
              <div ref={chatEndRef} />
            </div>

            <form onSubmit={handleSendMessage} style={{ display: "flex", padding: "18px 24px", background: "#ffffff", borderTop: "1px solid #f3f4f6", gap: "12px" }}>
              <input
                type="text"
                placeholder="Escribe una actualización oficial del ticket..."
                value={messageText}
                onChange={(e) => setMessageText(e.target.value)}
                style={{ flex: 1, padding: "14px 16px", borderRadius: "10px", border: "1px solid #e5e7eb", outline: "none", fontSize: "14px", transition: "border 0.2s", background: "#f9fafb" }}
                onFocus={(e) => e.target.style.border = "1px solid #ff7f22"}
                onBlur={(e) => e.target.style.border = "1px solid #e5e7eb"}
              />
              <button type="submit" style={{ backgroundColor: "#ff7f22", color: "white", border: "none", borderRadius: "10px", width: "50px", display: "flex", justifyContent: "center", alignItems: "center", cursor: "pointer", transition: "background 0.2s", boxShadow: "0 4px 10px rgba(255, 127, 34, 0.2)" }}>
                <FaPaperPlane style={{ fontSize: "16px" }} />
              </button>
            </form>
          </div>

          {idTicket && (
            <div style={{ flex: 1, background: "#ffffff", borderRadius: "16px", boxShadow: "0 10px 25px rgba(0,0,0,0.03)", border: "1px solid #e5e7eb", padding: "24px", display: "flex", flexDirection: "column", gap: "20px", overflowY: "auto", maxWidth: "340px" }}>

              <div>
                <div style={{ display: "flex", alignItems: "center", paddingBottom: "10px", borderBottom: "2px solid #f3f4f6", marginBottom: "12px" }}>
                  <span style={{ fontWeight: "700", fontSize: "12px", color: "#374151", display: "flex", alignItems: "center", gap: "8px", textTransform: "uppercase", letterSpacing: "0.5px" }}>
                    <FaUser style={{ color: "#ff7f22" }} /> Solicitante del Incidente
                  </span>
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: "8px", fontSize: "13px" }}>
                  <div>
                    <span style={{ color: "#9ca3af", fontSize: "11px", display: "block" }}>Nombre Completo</span>
                    <strong style={{ color: "#1f2937", fontSize: "14px" }}>{ticketDetails?.usuarioNombre || "Ana Zepeda"}</strong>
                  </div>
                  <div>
                    <span style={{ color: "#9ca3af", fontSize: "11px", display: "block" }}>Correo Institucional</span>
                    <span style={{ color: "#ff7f22", fontWeight: "600", fontSize: "13px" }}>{ticketDetails?.usuarioEmail || "ana@gmail.com"}</span>
                  </div>
                </div>
              </div>

             
              <div>
                <div style={{ display: "flex", alignItems: "center", paddingBottom: "10px", borderBottom: "2px solid #f3f4f6", marginBottom: "12px" }}>
                  <span style={{ fontWeight: "700", fontSize: "12px", color: "#374151", display: "flex", alignItems: "center", gap: "8px", textTransform: "uppercase", letterSpacing: "0.5px" }}>
                    <FaUserShield style={{ color: "#4b5563" }} /> Asesor Asignado
                  </span>
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: "8px", fontSize: "13px" }}>
                  <div>
                    <span style={{ color: "#9ca3af", fontSize: "11px", display: "block" }}>Especialista a Cargo</span>
                    <strong style={{ color: "#1f2937", fontSize: "14px" }}>{ticketDetails?.asesor || "Manuel Flores"}</strong>
                  </div>
                  <div>
                    <span style={{ color: "#9ca3af", fontSize: "11px", display: "block" }}>Correo Corporativo</span>
                    <span style={{ color: "#ff7f22", fontWeight: "600", fontSize: "13px" }}>{ticketDetails?.correoAsesor || "manuel@empresa.com"}</span>
                  </div>
                  <div>
                    <span style={{ color: "#9ca3af", fontSize: "11px", display: "block" }}>Área IT</span>
                    <strong style={{ color: "#4b5563" }}>{ticketDetails?.area || "Soporte Técnico"}</strong>
                  </div>
                </div>
              </div>

              <div>
                <div style={{ display: "flex", alignItems: "center", paddingBottom: "10px", borderBottom: "2px solid #f3f4f6", marginBottom: "12px" }}>
                  <span style={{ fontWeight: "700", fontSize: "12px", color: "#374151", display: "flex", alignItems: "center", gap: "8px", textTransform: "uppercase", letterSpacing: "0.5px" }}>
                    <FaClipboardList style={{ color: "#ff7f22" }} /> Propiedades Básicas
                  </span>
                </div>

                <div style={{ display: "flex", flexDirection: "column", gap: "10px", fontSize: "13px" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <span style={{ color: "#6b7280" }}>Código Solicitud</span>
                    <span style={{ background: "#f3f4f6", padding: "3px 8px", borderRadius: "6px", fontFamily: "monospace", fontWeight: "700", color: "#1f2937" }}>#{idTicket}</span>
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <span style={{ color: "#6b7280" }}>Estado Actual</span>
                    <span style={{ background: "#e0f2fe", color: "#0369a1", padding: "3px 10px", borderRadius: "12px", fontSize: "11px", fontWeight: "700" }}>
                      {ticketDetails?.status || "Open"}
                    </span>
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <span style={{ color: "#6b7280" }}>Prioridad</span>
                    <span style={{ 
                      background: ticketDetails?.priority === "Alta" ? "#fee2e2" : "#fef3c7", 
                      color: ticketDetails?.priority === "Alta" ? "#991b1b" : "#92400e", 
                      padding: "3px 10px", borderRadius: "12px", fontSize: "11px", fontWeight: "700" 
                    }}>
                      {ticketDetails?.priority || "Media"}
                    </span>
                  </div>

                
                  <div style={{ marginTop: "6px", background: "#fdf8f6", border: "1px dashed #fda4af", padding: "12px", borderRadius: "10px", display: "flex", gap: "10px", alignItems: "flex-start" }}>
                    <FaRegClock style={{ color: "#e11d48", fontSize: "18px", marginTop: "2px" }} />
                    <div>
                      <span style={{ color: "#e11d48", fontWeight: "700", fontSize: "11px", display: "block" }}>Tiempo Estimado de Solución</span>
                      <strong style={{ color: "#1f2937", fontSize: "13px" }}>
                        {ticketDetails?.estimatedTime ? `${ticketDetails.estimatedTime}` : "Establecido por el asesor"}
                      </strong>
                    </div>
                  </div>

                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", paddingTop: "4px" }}>
                    <span style={{ color: "#6b7280" }}>Archivos adjuntos</span>
                    <span style={{ color: "#374151", fontWeight: "600" }}><FaPaperclip style={{ marginRight: "4px", color: "#9ca3af" }}/>0</span>
                  </div>
                </div>
              </div>

             
              <div style={{ border: "1px solid #e5e7eb", borderRadius: "10px", overflow: "hidden" }}>
                <div 
                  onClick={() => setIsDescOpen(!isDescOpen)}
                  style={{ background: "#fafafa", padding: "12px 14px", display: "flex", justifyContent: "space-between", alignItems: "center", cursor: "pointer", borderBottom: isDescOpen ? "1px solid #e5e7eb" : "none" }}
                >
                  <span style={{ fontWeight: "700", fontSize: "12px", color: "#374151", textTransform: "uppercase" }}>Descripción</span>
                  {isDescOpen ? <FaChevronUp style={{ fontSize: "12px", color: "#6b7280" }} /> : <FaChevronDown style={{ fontSize: "12px", color: "#6b7280" }} />}
                </div>
                
                {isDescOpen && (
                  <div style={{ padding: "14px", fontSize: "13px", color: "#4b5563", backgroundColor: "#fff", lineHeight: "1.5" }}>
                    {ticketDetails?.description || "No se especificó un cuerpo detallado de descripción en este incidente."}
                  </div>
                )}
              </div>

             
              <div style={{ display: "flex", gap: "10px", marginTop: "auto", paddingTop: "10px" }}>
                <button 
                  onClick={handleRestablecer}
                  style={{ flex: 1, backgroundColor: "#ff7f22", color: "white", border: "none", padding: "10px", borderRadius: "8px", fontWeight: "600", fontSize: "13px", cursor: "pointer", transition: "background 0.2s" }}
                  onMouseEnter={(e) => e.target.style.backgroundColor = "#e66a10"}
                  onMouseLeave={(e) => e.target.style.backgroundColor = "#ff7f22"}
                >
                  Restablecer
                </button>
                <button 
                  onClick={handleCancelar}
                  style={{ flex: 1, backgroundColor: "#e5e7eb", color: "#374151", border: "none", padding: "10px", borderRadius: "8px", fontWeight: "600", fontSize: "13px", cursor: "pointer", transition: "background 0.2s" }}
                  onMouseEnter={(e) => e.target.style.backgroundColor = "#d1d5db"}
                  onMouseLeave={(e) => e.target.style.backgroundColor = "#e5e7eb"}
                >
                  Cancelar
                </button>
              </div>

            </div>
          )}

        </div>
      </div>
    </div>
  );
}