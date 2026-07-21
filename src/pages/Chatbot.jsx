import { marked } from "marked";
import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { 
  FaRobot, 
  FaUser, 
  FaPaperclip, 
  FaPaperPlane, 
  FaTimes, 
  FaHistory, 
  FaEllipsisV, 
  FaCheckCircle, 
  FaTicketAlt, 
  FaCloudUploadAlt, 
  FaFileAlt,
  FaPrint,
  FaLaptop,
  FaWifi,
  FaEnvelope,
  FaQuestionCircle
} from 'react-icons/fa';
import chatIcon from "../assets/chat.png";
import "./chatbot.css";

function Chatbot() {
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [estado, setEstado] = useState("WELCOME"); 
  const [input, setInput] = useState("");
  const [cargando, setCargando] = useState(false);

  const [user] = useState(() => {
    try {
      const storedUser = localStorage.getItem("user");
      return storedUser ? JSON.parse(storedUser) : null;
    } catch (error) {
      console.error("Error leyendo usuario de localStorage:", error);
      return null;
    }
  });

  const [ticketData, setTicketData] = useState({
    nombre: user?.name || user?.username || "",
    correo: user?.email || "",
    descripcion: ""
  });

  const [file, setFile] = useState(null);
  const [filePreview, setFilePreview] = useState(null);

  const chatBodyRef = useRef(null);
  const fileInputMainRef = useRef(null); 
  const fileInputFormRef = useRef(null); 

  useEffect(() => {
    if (user) {
      setTicketData(prev => ({
        ...prev,
        nombre: user.name || user.username || "",
        correo: user.email || ""
      }));
    }
  }, [user]);

  useEffect(() => {
    if (chatBodyRef.current) {
      chatBodyRef.current.scrollTop = chatBodyRef.current.scrollHeight;
    }
  }, [messages, cargando, estado]);

  const addMessage = (tipo, content, isBot = true) => {
    setMessages(prev => [...prev, { tipo, content, isBot }]);
  };

  const iniciarChat = () => {
    setMessages([]);
    addMessage("bot_msg", "Hola, soy BaproChat. Estoy aquí para ayudarte.");
    menuPrincipal();
  };
  
  const irAHistorial = () => {
    if (!user) {
      addMessage(
        "bot_msg",
        "Para ver el estado de tus tickets necesitas iniciar sesión primero con tu usuario y contraseña. Una vez dentro, entra a **Mis conversaciones** para darles seguimiento."
      );
      return;
    }
    setOpen(false);
    navigate("/chat");
  };

  const menuPrincipal = () => {
    setEstado("MENU");
    addMessage("bot_msg", "Selecciona una opción para comenzar:");
    addMessage("menu", [
      { id: "impresora", text: "Impresora", icon: <FaPrint /> },
      { id: "laptop", text: "Laptop lenta", icon: <FaLaptop /> },
      { id: "internet", text: "Internet", icon: <FaWifi /> },
      { id: "correo", text: "Correo", icon: <FaEnvelope /> },
      { id: "otro", text: "Otro problema", icon: <FaQuestionCircle /> }
    ]);
  };

  const marcarSolucionado = () => {
    addMessage("bot_msg", "Me alegra haber podido ayudarte. Si necesitas algo más, aquí tienes el menú principal:");
    menuPrincipal();
  };

  const handleOptionClick = (opcion) => {
    addMessage("user_msg", opcion.text, false);
    setEstado("CHATTING");
    addMessage("bot_msg", `Entendido. Por favor, describe brevemente el problema que tienes con ${opcion.text}.`);
  };

  const enviarTexto = () => {
    if (!input.trim() || cargando) return;
    const msg = input.trim();
    addMessage("user_msg", msg, false);
    setInput("");
    enviarMensajeGemini(msg);
  };

  const enviarMensajeGemini = async (msg) => {
    setCargando(true);
    try {
      const response = await fetch("http://localhost:3000/api/chat-gemini", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          mensaje: msg,
          historial: messages.filter(m => m.tipo === 'bot_msg' || m.tipo === 'user_msg').map(m => ({
            role: m.isBot ? 'model' : 'user',
            parts: [{ text: m.content }]
          }))
        })
      });

      const data = await response.json();
      
      if (data && data.respuesta) {
        addMessage("bot_msg", data.respuesta);
        addMessage("acciones", null);
      } else {
        addMessage("bot_msg", "Lo siento, tuve un problema al procesar tu solicitud.");
      }
    } catch (error) {
      console.error(error);
      addMessage("bot_msg", "Error de conexión con el servidor de inteligencia artificial.");
    } finally {
      setCargando(false);
    }
  };

  const abrirFormularioTicket = () => {
    addMessage("bot_msg", "Entendido. Completa la descripción a continuación para generar tu ticket.");
    setEstado("TICKET_FORM");
  };

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setTicketData(prev => ({ ...prev, [name]: value }));
  };

  const procesarArchivo = (selectedFile) => {
    if (!selectedFile) return;
    setFile(selectedFile);
    
    const reader = new FileReader();
    reader.onload = (event) => {
      if (selectedFile.type.startsWith('image/')) {
        setFilePreview(event.target.result);
      } else {
        setFilePreview('document');
      }
    };
    reader.readAsDataURL(selectedFile);
    addMessage("bot_msg", `Archivo adjuntado: ${selectedFile.name}. Se enviará junto con el ticket.`);
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      procesarArchivo(e.target.files[0]);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      procesarArchivo(e.dataTransfer.files[0]);
    }
  };

  const handleDragOver = (e) => { 
    e.preventDefault(); 
    e.stopPropagation(); 
  };

  const enviarTicket = async (e) => {
    e.preventDefault();
    setCargando(true);

    const formData = new FormData();
    formData.append("nombre", ticketData.nombre);
    formData.append("correo", ticketData.correo);
    formData.append("descripcion", ticketData.descripcion);
    if (file) formData.append("archivo", file);
    formData.append("origen", "CHATBOT");
  
    if (user?.id) formData.append("usuarioId", user.id);

    try {
      const response = await fetch("http://localhost:3000/api/tickets/crear-con-archivo", {
        method: "POST",
        body: formData
      });
      const data = await response.json();

      if (data.ok || response.ok) {
        setEstado("SUCCESS");
        addMessage("bot_msg", `Ticket creado exitosamente. Tu número de reporte es: #${data.ticketId || 'N/A'}. Un técnico ha sido asignado a tu caso.`);
        setTicketData({ 
          nombre: user?.name || user?.username || "", 
          correo: user?.email || "", 
          descripcion: "" 
        });
        setFile(null);
        setFilePreview(null);
      } else {
        addMessage("bot_msg", `Hubo un error al crear el ticket: ${data.message || 'Error desconocido'}`);
        setEstado("CHATTING");
      }
    } catch (error) {
      console.error(error);
      addMessage("bot_msg", "Error crítico de conexión al intentar crear el ticket.");
      setEstado("CHATTING");
    } finally {
      setCargando(false);
    }
  };

  const renderMessage = (m, i) => {
    if (m.tipo === "bot_msg") {
      return (
        <div key={i} className="msg-container bot">
          <div className="bot-avatar-msg"><FaRobot /></div>
          <div 
            className="msg bot" 
            dangerouslySetInnerHTML={{ __html: marked.parse(m.content) }}
          />
        </div>
      );
    }
    if (m.tipo === "user_msg") {
      return (
        <div key={i} className="msg-container user">
          <div className="user-avatar-msg"><FaUser /></div>
          <div className="msg user">{m.content}</div>
        </div>
      );
    }
    if (m.tipo === "menu" && estado === "MENU") {
      return (
        <div key={i} className="menu-options">
          {m.content.map(op => (
            <button key={op.id} className="menu-btn" onClick={() => handleOptionClick(op)}>
              <span className="menu-btn-icon">{op.icon}</span>
              <span className="menu-btn-text">{op.text}</span>
            </button>
          ))}
        </div>
      );
    }
    if (m.tipo === "acciones" && (estado === "CHATTING" || estado === "SUCCESS")) {
      return (
        <div key={i} className="action-buttons">
          <button type="button" className="action-btn solucionado" onClick={marcarSolucionado}>
            <FaCheckCircle /> Solucionado
          </button>
          <button type="button" className="action-btn ticket" onClick={abrirFormularioTicket}>
            <FaTicketAlt /> Generar Ticket
          </button>
        </div>
      );
    }
    return null;
  };

  return (
    <>
      {!open && (
        <div className="chat-icon-container" onClick={() => setOpen(true)}>
          <img src={chatIcon} className="chat-icon-img" alt="BaproChat" />
        </div>
      )}

      {open && (
        <div className="chat-box">

          <div className="chat-header">
            <div className="header-info">
              <div className="bot-avatar-header"><FaRobot /></div>
              <div className="header-text">
                <h3>BaproChat</h3>
                <span>Online</span>
              </div>
            </div>
            <div className="header-actions">
              <FaHistory
                cursor="pointer"
                title="Ver mis conversaciones"
                onClick={irAHistorial}
              />
              <FaTimes onClick={() => setOpen(false)} cursor="pointer" title="Cerrar" />
            </div>
          </div>

          {estado === "WELCOME" ? (
            <div className="chat-body" ref={chatBodyRef}>
              <div className="welcome-box">
                <h2>Hola</h2>
                <p>Bienvenido al asistente virtual de IT (Nivel 1 y 2). ¿En qué puedo ayudarte hoy?</p>
                <button className="start-btn" onClick={iniciarChat}>
                  Iniciar conversación
                </button>
              </div>
            </div>
          ) : (
            <>
              <div className="chat-body" ref={chatBodyRef}>
                {messages.map((m, i) => renderMessage(m, i))}
                
                {cargando && estado === "CHATTING" && (
                  <div className="msg-container bot">
                    <div className="bot-avatar-msg"><FaRobot /></div>
                    <div className="msg bot">Escribiendo...</div>
                  </div>
                )}
              </div>
              
              {estado === "TICKET_FORM" ? (
                <form className="ticket-form-container" onSubmit={enviarTicket}>
                  <div className="ticket-form-header">Generar Nuevo Ticket</div>
                  <div className="ticket-form-body">
                    <div className="form-group">
                      <label>Nombre Solicitante</label>
                      <input 
                        type="text" 
                        name="nombre" 
                        value={ticketData.nombre} 
                        onChange={handleFormChange} 
                        required 
                        readOnly={!!user} 
                      />
                    </div>
                    <div className="form-group">
                      <label>Correo Electrónico</label>
                      <input 
                        type="email" 
                        name="correo" 
                        value={ticketData.correo} 
                        onChange={handleFormChange} 
                        required 
                        readOnly={!!user} 
                      />
                    </div>

                    <div className="form-group">
                      <label>Descripción del Problema</label>
                      <textarea 
                        name="descripcion" 
                        value={ticketData.descripcion} 
                        onChange={handleFormChange} 
                        placeholder="Describe brevemente la falla..." 
                        required
                      ></textarea>
                    </div>

                    <div className="form-group">
                      <label>Adjuntar Archivo (Opcional)</label>
                      <div 
                        className="file-upload-dropzone"
                        onDrop={handleDrop}
                        onDragOver={handleDragOver}
                        onClick={() => fileInputFormRef.current.click()}
                      >
                        <input 
                          type="file" 
                          ref={fileInputFormRef} 
                          style={{ display: 'none' }} 
                          onChange={handleFileChange} 
                        />
                        <FaCloudUploadAlt />
                        <span>Haz clic para subir o arrastra y suelta</span>
                        <p>PDF, PNG, JPG o DOCX (Máx. 10MB)</p>
                      </div>
                
                      {filePreview && (
                        <div className="file-preview-container">
                          {filePreview === 'document' ? (
                            <FaFileAlt className="file-icon" />
                          ) : (
                            <img src={filePreview} alt="Vista previa" className="image-preview" />
                          )}
                          <div className="file-info">
                            <span className="file-name">{file?.name}</span>
                            <span className="file-size">({file ? (file.size / 1024 / 1024).toFixed(2) : 0} MB)</span>
                          </div>
                          <FaTimes 
                            className="remove-file" 
                            onClick={(e) => { 
                              e.stopPropagation(); 
                              setFile(null); 
                              setFilePreview(null); 
                            }} 
                            title="Quitar archivo" 
                          />
                        </div>
                      )}
                    </div>

                    <div className="form-actions">
                      <button type="button" className="btn-cancelar" onClick={() => setEstado("CHATTING")}>Cancelar</button>
                      <button type="submit" className="btn-enviar-ticket" disabled={cargando}>
                        {cargando ? 'Enviando...' : <><FaPaperPlane /> Enviar Ticket</>}
                      </button>
                    </div>
                  </div>
                </form>
              ) : estado === "MENU" || estado === "SUCCESS" ? (
                <div className="chat-paused-footer">
                  <FaEllipsisV />
                  <span>El chat está a la espera de tu selección...</span>
                </div>
              ) : (
                <div className="chat-input-area">
                  <label htmlFor="mainFileInput" className="attach-label">
                    <FaPaperclip title="Adjuntar archivo" />
                  </label>
                  <input 
                    type="file" 
                    id="mainFileInput" 
                    ref={fileInputMainRef} 
                    style={{ display: 'none' }} 
                    onChange={handleFileChange} 
                  />
                  
                  <input
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder="Escribe tu mensaje aquí..."
                    onKeyDown={(e) => { if (e.key === "Enter") enviarTexto(); }}
                    disabled={cargando}
                  />
                  <button className="send-btn" onClick={enviarTexto} disabled={cargando}>
                    <FaPaperPlane />
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      )}
    </>
  );
}

export default Chatbot;