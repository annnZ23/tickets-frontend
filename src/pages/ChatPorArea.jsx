import { useState, useEffect, useRef, useCallback } from "react";
import { useParams } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import { FaPaperPlane, FaComments, FaSmile } from "react-icons/fa";
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
};

export default function ChatPorArea({ usuario, cerrarSesion }) {
  const { idTicket } = useParams();
  const areas = ["Soporte Técnico", "Desarrollo Web", "Analista de Rutas"];
  const { toasts } = useNotificaciones(usuario);

  const [selectedArea, setSelectedArea] = useState("Soporte Técnico");
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

        {!idTicket && (
          <div style={{ display: "flex", gap: "10px", background: "#fff", padding: "8px", borderRadius: "12px", boxShadow: "0 2px 8px rgba(0,0,0,0.04)", width: "fit-content" }}>
            {areas.map((area) => (
              <button key={area} onClick={() => setSelectedArea(area)} style={{ padding: "10px 20px", borderRadius: "10px", border: "none", fontWeight: "600", fontSize: "14px", cursor: "pointer", backgroundColor: selectedArea === area ? colors.naranja : "transparent", color: selectedArea === area ? "white" : colors.textoSec, transition: "all 0.2s ease" }}>
                {area}
              </button>
            ))}
          </div>
        )}
        
        <div style={{ flex: 1, background: "#fff", borderRadius: "16px", border: `1px solid ${colors.borde}`, display: "flex", flexDirection: "column", overflow: "hidden", boxShadow: "0 4px 20px rgba(0,0,0,0.04)" }}>

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
        </div>
      </div>
    </div>
  );
}