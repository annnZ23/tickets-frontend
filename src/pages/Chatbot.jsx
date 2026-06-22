import { useState } from "react";
import chatIcon from "../assets/chat.png";
import "./chatbot.css";

function Chatbot() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [estado, setEstado] = useState("WELCOME"); // WELCOME, MENU, CHAT, FORMULARIO_TICKET
  const [input, setInput] = useState("");

  // Datos para el formulario del ticket
  const user = JSON.parse(localStorage.getItem("user")) || { name: "Empleado Baprosa", email: "usuario@baprosa.com" };
  const [ticketEmail, setTicketEmail] = useState(user.email || "");
  const [ticketArea, setTicketArea] = useState("");

  const add = (tipo, content) => {
    setMessages((prev) => [...prev, { tipo, content }]);
  };

  const iniciarChat = () => {
    setMessages([]);
    add("bot", "👋 ¡Hola, soy BaproChat! Disponible 24/7 para ayudarte con tus incidentes técnicos. 🤖");
    add("bot", "⚠️ Nuestro equipo de soporte humano atiende de:\n🕒 Lun a Vie: 7:30 AM - 4:30 PM\n🕒 Sábados: 7:30 AM - 12:00 PM");
    menu();
  };

  const menu = () => {
    setEstado("MENU");
    add("bot", "Selecciona una opción o escribe tu problema libremente:");
    add("menu", [
      "🖨️ Impresora",
      "💻 Laptop lenta",
      "🌐 Internet",
      "📧 Correo",
      "🎫 Crear Ticket Directo",
      "💬 Otro problema",
    ]);
  };

 
  const esHorarioLaboral = () => {
    const ahora = new Date();
    const dia = ahora.getDay(); 
    const hora = ahora.getHours();
    const minutos = ahora.getMinutes();
    const tiempoEnMinutos = hora * 60 + minutos;

    if (dia >= 1 && dia <= 5) {
      
      return tiempoEnMinutos >= 480 && tiempoEnMinutos <= 1080;
    } else if (dia === 6) {
      
      return tiempoEnMinutos >= 540 && tiempoEnMinutos <= 780;
    }
    return false; // Domingo o fuera de horario
  };

  const enviarMensajeBackend = async (msg) => {
    add("user", msg);
    try {
      const response = await fetch("http://localhost:3000/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mensaje: msg, usuario: user }),
      });
      const data = await response.json();

      if (data && data.message) {
        add("bot", data.message);
        ofrecerConfirmacionSolucion();
      } else {
        add("bot", "⚠️ El servidor devolvió un formato inesperado.");
      }
    } catch (error) {
      console.error(error);
      add("bot", "❌ No se pudo establecer conexión con el servidor. ¿Deseas generar un ticket?");
      ofrecerConfirmacionSolucion();
    }
  };

  const ofrecerConfirmacionSolucion = () => {
    add("confirmacion_solucion", {
      pregunta: "¿Se solucionó tu problema con esta información?"
    });
  };

  const procesarSeleccionMenu = (msg) => {
    const opcion = msg.toLowerCase();

    if (opcion.includes("correo")) {
      add("user", "📧 Correo");
      add("bot", "Entendido, ¿qué problema específico tienes con tu correo?");
      add("menu", [
        "🔑 No puedo iniciar sesión / Contraseña",
        "🖥️ Error en Outlook de escritorio",
        "🌐 Problemas con Baprosa Webmail",
        "❓ Otro problema de correo"
      ]);
    } else if (opcion.includes("ticket") || opcion.includes("generar ticket")) {
      setEstado("FORMULARIO_TICKET");
    } else if (opcion.includes("otro problema")) {
      add("user", "💬 Otro problema");
      add("bot", "Por favor escribe detalladamente qué problema estás experimentando:");
      setEstado("CHAT");
    } else {
      enviarMensajeBackend(msg);
    }
  };

  const manejarEnvioTicket = (e) => {
    e.preventDefault();
    if (!ticketEmail.trim() || !ticketArea) {
      alert("Por favor completa todos los campos requeridos.");
      return;
    }
    setEstado("CHAT");
    add("bot", `🎫 **Ticket creado con éxito**.\nEnviamos un resumen al correo: *${ticketEmail}* para el área de *${ticketArea}*.`);

    if (esHorarioLaboral()) {
      add("ofrecer_asesor", true);
    } else {
      add("bot", "🌙 Actualmente nos encontramos fuera del horario de atención comercial. Un técnico de IT revisará tu caso al iniciar el siguiente día hábil.");
    }
  };

  const enviarTextoManual = () => {
    if (!input.trim()) return;
    enviarMensajeBackend(input);
    setInput("");
  };

  return (
    <>
      <img
        src={chatIcon}
        className="chat-icon"
        alt="BaproChat"
        onClick={() => {
          if (!open) iniciarChat();
          setOpen(!open);
        }}
      />

      {open && (
        <div className="chat-box">
          <div className="chat-header">
            <span>🤖 BaproChat</span>
            <span style={{ cursor: "pointer" }} onClick={() => setOpen(false)}>✖</span>
          </div>

          {estado === "WELCOME" && (
            <div className="welcome-box">
              <h2>Hola 👋</h2>
              <p>¿Necesitas ayuda con algún sistema de la empresa?</p>
              <button
                className="start-btn"
                onClick={() => iniciarChat()}
              >
                Iniciar conversación
              </button>
            </div>
          )}

          {estado === "FORMULARIO_TICKET" && (
            <div className="ticket-form-container">
              <div className="back-to-menu" onClick={() => menu()}>
                ⬅ Volver al menú
              </div>
              
              <div className="form-card-header">
                <span className="form-icon">📋</span>
                <div>
                  <h4>Completa tus datos</h4>
                  <p>Para brindarte una atención precisa, necesitamos registrar tu solicitud.</p>
                </div>
              </div>

              <form onSubmit={manejarEnvioTicket} className="ticket-form-body">
                <label>Correo electrónico</label>
                <input 
                  type="email" 
                  value={ticketEmail} 
                  onChange={(e) => setTicketEmail(e.target.value)} 
                  placeholder="ejemplo@correo.com"
                  required
                />
                <span className="input-help">Usaremos tu correo para enviarte un resumen de la conversación.</span>

                <label>Área de interés</label>
                <select 
                  value={ticketArea} 
                  onChange={(e) => setTicketArea(e.target.value)}
                  required
                >
                  <option value="">Selecciona un área...</option>
                  <option value="Soporte Técnico">Soporte Técnico</option>
                  <option value="Redes e Internet">Redes e Internet</option>
                  <option value="Cuentas y Correos">Cuentas y Correos</option>
                  <option value="Infraestructura">Infraestructura / Impresoras</option>
                </select>
                <span className="input-help">Elige el área para dirigirte al equipo correcto.</span>

                <button type="submit" className="btn-submit-ticket">
                  Generar Ticket de Soporte
                </button>
              </form>
            </div>
          )}

          {estado !== "WELCOME" && estado !== "FORMULARIO_TICKET" && (
            <>
              <div className="chat-body">
                {messages.map((m, i) => (
                  <div key={i}>
                    {m.tipo === "bot" && (
                      <div className="msg bot">{m.content}</div>
                    )}

                    {m.tipo === "user" && (
                      <div className="msg user">{m.content}</div>
                    )}

                    {m.tipo === "menu" && (
                      <div className="menu">
                        {m.content.map((op, j) => (
                          <button
                            key={j}
                            className="menu-btn"
                            onClick={() => procesarSeleccionMenu(op)}
                          >
                            {op}
                          </button>
                        ))}
                      </div>
                    )}

                    {m.tipo === "confirmacion_solucion" && (
                      <div className="ticket-confirm-card">
                        <p className="ticket-confirm-title">¿Pudiste resolverlo?</p>
                        <p className="ticket-confirm-detail">{m.content.pregunta}</p>
                        <div className="ticket-confirm-buttons">
                          <button className="btn-confirm-yes" onClick={() => {
                            add("bot", "🎉 ¡Excelente! Me alegra haber ayudado. Si necesitas algo más, aquí estaré.");
                          }}>Sí, gracias</button>
                          <button className="btn-confirm-no" onClick={() => {
                            add("user", "No, sigo con problemas");
                            setEstado("FORMULARIO_TICKET");
                          }}>No, crear ticket</button>
                        </div>
                      </div>
                    )}

                    {m.tipo === "ofrecer_asesor" && (
                      <div className="asesor-live-card">
                        <div className="asesor-card-content">
                          <span className="asesor-icon">🎧</span>
                          <div>
                            <h5>¿Prefieres hablar directamente?</h5>
                            <p>Conéctate con un asesor en tiempo real.</p>
                          </div>
                        </div>
                        <button className="btn-connect-asesor" onClick={() => alert("Conectando con un agente de IT...")}>
                          Conectar con asesor
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </div>

              <div className="chat-input">
                <input
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Escribe tu problema técnico..."
                  onKeyDown={(e) => {
                    if (e.key === "Enter") enviarTextoManual();
                  }}
                />
                <button onClick={enviarTextoManual}>
                  {/* Icono de avión de papel limpio */}
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <line x1="22" y1="2" x2="11" y2="13"></line>
                    <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
                  </svg>
                </button>
              </div>
            </>
          )}
        </div>
      )}
    </>
  );
}

export default Chatbot;