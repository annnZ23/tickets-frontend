import { useState, useEffect, useRef } from "react";
import io from "socket.io-client";
import Sidebar from "../components/Sidebar";
import { FaPaperPlane, FaComments } from "react-icons/fa";
import "./Dashboard.css"; 


const socket = io("http://localhost:3000");

export default function ChatPorArea() {
  const user = JSON.parse(localStorage.getItem("user"));
  
  
  const areas = ["Soporte Técnico", "Desarrollo Web", "Analista de Rutas"];
  
  
  const [selectedArea, setSelectedArea] = useState("Soporte Técnico");
  const [messageText, setMessageText] = useState("");
  const [messages, setMessages] = useState([]);
  
  const chatEndRef = useRef(null);

 
  const scrollToBottom = () => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

 
  useEffect(() => {
   
    socket.emit("join_area", selectedArea);
    
    
    socket.on("receive_message", (newMessage) => {
      setMessages((prev) => [...prev, newMessage]);
    });

  
    return () => {
      socket.off("receive_message");
      setMessages([]); 
    };
  }, [selectedArea]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!messageText.trim()) return;

    const messageData = {
      area: selectedArea,
      sender: user?.email || "Anónimo",
      text: messageText,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    socket.emit("send_message", messageData);
    
    // Limpiar caja de texto
    setMessageText("");
  };

  return (
    <div style={{ display: "flex", minHeight: "100vh", width: "100vw", overflowX: "hidden" }}>
      <Sidebar />

      <div className="content" style={{ flex: 1, padding: "20px", background: "#f8f9fa", display: "flex", flexDirection: "column" }}>
        
        {/* Barra superior */}
        <div className="topbar-pro" style={{ width: "100%", marginBottom: "20px" }}>
          <div className="tareas-title-flex" style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <FaComments style={{ color: "#ff7f22", fontSize: "24px" }} />
            <h3 style={{ margin: 0 }}>Chat de Coordinación por Área IT</h3>
          </div>
        </div>

        
        <div style={{ display: "flex", gap: "10px", marginBottom: "15px" }}>
          {areas.map((area) => (
            <button
              key={area}
              onClick={() => setSelectedArea(area)}
              style={{
                padding: "10px 16px",
                borderRadius: "20px",
                border: "none",
                fontWeight: "bold",
                cursor: "pointer",
                backgroundColor: selectedArea === area ? "#ff7f22" : "#e0e0e0",
                color: selectedArea === area ? "white" : "#555",
                transition: "all 0.3s ease"
              }}
            >
              {area}
            </button>
          ))}
        </div>

     
        <div style={{ flex: 1, background: "#fff", borderRadius: "12px", boxShadow: "0 4px 12px rgba(0,0,0,0.05)", display: "flex", flexDirection: "column", overflow: "hidden", border: "1px solid #eef0f2" }}>
          
         
          <div style={{ background: "#ff7f22", color: "white", padding: "12px 20px", fontWeight: "bold" }}>
            Canal Activo: # {selectedArea}
          </div>

          
          <div style={{ flex: 1, padding: "20px", overflowY: "auto", display: "flex", flexDirection: "column", gap: "12px", background: "#fffdfa" }}>
            {messages.length === 0 ? (
              <p style={{ textAlign: "center", color: "#aaa", marginTop: "20px", fontSize: "14px" }}>
                No hay mensajes en el canal de {selectedArea}. ¡Inicia la conversación!
              </p>
            ) : (
              messages.map((msg, index) => {
                const isMe = msg.sender === user?.email;
                return (
                  <div
                    key={index}
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      alignItems: isMe ? "flex-end" : "flex-start",
                      width: "100%"
                    }}
                  >
                    <span style={{ fontSize: "11px", color: "#777", marginBottom: "2px", marginLeft: "5px", marginRight: "5px" }}>
                      {isMe ? "Tú" : msg.sender}
                    </span>
                    
                    {/* Globo del mensaje */}
                    <div
                      style={{
                        maxWidth: "70%",
                        padding: "10px 14px",
                        borderRadius: isMe ? "14px 14px 0px 14px" : "14px 14px 14px 0px",
                        backgroundColor: isMe ? "#ff7f22" : "#f1f3f5",
                        color: isMe ? "white" : "#333",
                        boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
                        fontSize: "14px",
                        wordBreak: "break-word"
                      }}
                    >
                      {msg.text}
                      <span style={{ display: "block", fontSize: "9px", textAlign: "right", marginTop: "4px", color: isMe ? "#ffe0cc" : "#999" }}>
                        {msg.timestamp}
                      </span>
                    </div>
                  </div>
                );
              })
            )}
            <div ref={chatEndRef} />
          </div>

         
          <form onSubmit={handleSendMessage} style={{ display: "flex", padding: "15px", background: "#f8f9fa", borderTop: "1px solid #eee", gap: "10px" }}>
            <input
              type="text"
              placeholder={`Escribe un mensaje para # ${selectedArea}...`}
              value={messageText}
              onChange={(e) => setMessageText(e.target.value)}
              style={{ flex: 1, padding: "12px", borderRadius: "8px", border: "1px solid #ccc", outline: "none", fontSize: "14px" }}
            />
            <button
              type="submit"
              style={{ backgroundColor: "#ff7f22", color: "white", border: "none", borderRadius: "8px", width: "45px", display: "flex", justifyContent: "center", alignItems: "center", cursor: "pointer", transition: "background 0.2s" }}
            >
              <FaPaperPlane />
            </button>
          </form>

        </div>
      </div>
    </div>
  );
}