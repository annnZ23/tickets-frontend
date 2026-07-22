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

const CAUSAS_POR_CATEGORIA = {
  impresora: [
    {
      id: "imp-no-imprime",
      text: "No imprime nada",
      pasos: [
        "Verifica que la impresora esté encendida y conectada (USB o red).",
        "Revisa que tenga papel y tinta/tóner suficiente.",
        "En Windows: Configuración > Impresoras y confírmala como predeterminada.",
        "Reinicia la impresora (apágala, espera 10 segundos, enciéndela).",
        "Intenta imprimir una página de prueba.",
      ],
    },
    {
      id: "imp-atascado",
      text: "Papel atascado",
      pasos: [
        "Apaga la impresora antes de manipularla.",
        "Abre con cuidado la bandeja o la puerta trasera.",
        "Retira el papel atascado jalando en la dirección de impresión, sin forzar.",
        "Revisa que no queden fragmentos de papel adentro.",
        "Enciende la impresora e intenta imprimir de nuevo.",
      ],
    },
    {
      id: "imp-fuera-linea",
      text: "Aparece \"fuera de línea\"",
      pasos: [
        "Verifica el cable de red/USB o la conexión Wi-Fi de la impresora.",
        "Click derecho sobre la impresora en Windows > \"Usar impresora en línea\".",
        "Reinicia el servicio de cola de impresión (o reinicia el equipo).",
        "Reinicia la impresora.",
        "Intenta imprimir de nuevo.",
      ],
    },
    {
      id: "imp-mala-calidad",
      text: "Impresión manchada o de mala calidad",
      pasos: [
        "Revisa los niveles de tinta o tóner.",
        "Ejecuta la limpieza de cabezales desde el panel o software de la impresora.",
        "Verifica que el papel no esté húmedo o doblado.",
        "Imprime una página de prueba de alineación.",
        "Si persiste, puede necesitar cambio de cartucho — genera un ticket.",
      ],
    },
    {
      id: "imp-otro",
      text: "Otro / no es esto",
      pasos: null, 
    },
  ],
  laptop: [
    {
      id: "lap-lenta-general",
      text: "Va lenta en general",
      pasos: [
        "Cierra programas y pestañas del navegador que no estés usando.",
        "Abre el Administrador de tareas (Ctrl+Shift+Esc) y revisa qué consume más recursos.",
        "Reinicia el equipo completamente (no solo cerrar sesión).",
        "Verifica que Windows Update no esté instalando algo en segundo plano.",
        "Si sigue lenta después de reiniciar, genera un ticket.",
      ],
    },
    {
      id: "lap-disco-lleno",
      text: "Se queda sin espacio en disco",
      pasos: [
        "Ve a Configuración > Almacenamiento y revisa qué ocupa más espacio.",
        "Vacía la Papelera de reciclaje.",
        "Desinstala programas que ya no uses.",
        "Borra archivos temporales (ejecuta \"Liberador de espacio en disco\").",
        "Si el disco sigue casi lleno, genera un ticket para revisar opciones.",
      ],
    },
    {
      id: "lap-actualizaciones",
      text: "Pide reiniciar por actualizaciones constantemente",
      pasos: [
        "Guarda tu trabajo y deja que la actualización termine por completo.",
        "No apagues el equipo a la fuerza durante una actualización.",
        "Después de reiniciar, verifica en Windows Update si quedan pendientes.",
        "Si el proceso se queda \"pegado\" por más de 30-40 minutos, genera un ticket.",
      ],
    },
    {
      id: "lap-caliente",
      text: "Se calienta mucho / el ventilador suena fuerte",
      pasos: [
        "Verifica que las rejillas de ventilación no estén tapadas (usa una superficie dura, no la cama).",
        "Cierra programas pesados que no necesites en este momento.",
        "Deja que repose unos minutos apagada si está muy caliente.",
        "Evita usarla mientras carga en superficies blandas.",
        "Si el sobrecalentamiento es frecuente, genera un ticket — puede necesitar limpieza interna.",
      ],
    },
    {
      id: "lap-otro",
      text: "Otro / no es esto",
      pasos: null,
    },
  ],
  internet: [
    {
      id: "int-sin-conexion",
      text: "No tengo conexión / sin internet",
      pasos: [
        "Verifica que el cable de red esté bien conectado (si usas cable).",
        "Revisa el ícono de Wi-Fi/red en la barra de tareas.",
        "Reinicia el adaptador de red: desactívalo y actívalo de nuevo.",
        "Reinicia el equipo.",
        "Si otros compañeros también están sin internet, genera un ticket de inmediato.",
      ],
    },
    {
      id: "int-lento",
      text: "El internet está muy lento",
      pasos: [
        "Cierra descargas, videos o transmisiones que no estés usando.",
        "Verifica si otros equipos en tu área también están lentos.",
        "Prueba acercarte más al router si usas Wi-Fi.",
        "Reinicia tu conexión de red.",
        "Si persiste, genera un ticket con la hora en que empezó.",
      ],
    },
    {
      id: "int-pagina-especifica",
      text: "Una página o sistema específico no carga",
      pasos: [
        "Verifica que la dirección esté bien escrita.",
        "Prueba abrir la misma página desde otro navegador.",
        "Borra caché y cookies del navegador.",
        "Prueba desde tu celular con datos móviles para descartar que sea general.",
        "Si solo falla ese sistema para todos, genera un ticket.",
      ],
    },
    {
      id: "int-vpn",
      text: "La VPN no conecta",
      pasos: [
        "Verifica tu usuario y contraseña de VPN.",
        "Confirma que tienes conexión a internet normal (sin VPN) primero.",
        "Cierra y vuelve a abrir el programa de VPN.",
        "Reinicia el equipo.",
        "Si sigue sin conectar, genera un ticket.",
      ],
    },
    {
      id: "int-otro",
      text: "Otro / no es esto",
      pasos: null,
    },
  ],
  correo: [
    {
      id: "cor-no-envia-recibe",
      text: "No puedo enviar o recibir correos",
      pasos: [
        "Verifica que tengas conexión a internet.",
        "Revisa que la bandeja de entrada no esté llena (elimina correos viejos con adjuntos grandes).",
        "Cierra sesión y vuelve a iniciar sesión en el correo.",
        "Prueba acceder desde el navegador (webmail) para descartar problema de la app.",
        "Si el problema continúa, genera un ticket.",
      ],
    },
    {
      id: "cor-olvide-contrasena",
      text: "Olvidé mi contraseña",
      pasos: [
        "Usa la opción \"¿Olvidaste tu contraseña?\" en la pantalla de inicio de sesión, si está disponible.",
        "Si no tienes esa opción, genera un ticket — un asesor debe restablecerla por ti.",
      ],
    },
    {
      id: "cor-no-llegan-adjuntos",
      text: "No me llegan correos con adjuntos",
      pasos: [
        "Revisa la carpeta de Spam / No deseado.",
        "Confirma con quien te lo envió el tamaño del archivo (adjuntos muy grandes pueden rebotar).",
        "Verifica que tu buzón no esté lleno.",
        "Pide que te lo reenvíen comprimido en ZIP si es muy pesado.",
        "Si sigue sin llegar, genera un ticket.",
      ],
    },
    {
      id: "cor-outlook-congela",
      text: "Outlook no abre o se congela",
      pasos: [
        "Cierra Outlook completamente desde el Administrador de tareas.",
        "Vuelve a abrirlo y espera un momento a que cargue.",
        "Reinicia el equipo.",
        "Verifica que Outlook no esté actualizándose en segundo plano.",
        "Si sigue sin abrir, genera un ticket.",
      ],
    },
    {
      id: "cor-otro",
      text: "Otro / no es esto",
      pasos: null,
    },
  ],
  otro: [
    {
      id: "otro-app-especifica",
      text: "Problema con una aplicación específica",
      pasos: [
        "Cierra por completo la aplicación e ábrela de nuevo.",
        "Verifica que esté actualizada a la última versión.",
        "Reinicia el equipo.",
        "Prueba abrir la aplicación con otro usuario de Windows, si es posible.",
        "Si el problema continúa, genera un ticket indicando el nombre de la aplicación.",
      ],
    },
    {
      id: "otro-no-enciende",
      text: "El equipo no enciende",
      pasos: [
        "Verifica que el cargador esté bien conectado (y a un tomacorriente que funcione).",
        "Mantén presionado el botón de encendido 10 segundos y suelta.",
        "Prueba con otro cable/cargador si tienes uno a la mano.",
        "Si tiene batería removible, revisa que esté bien colocada.",
        "Si no enciende, genera un ticket — puede requerir revisión física.",
      ],
    },
    {
      id: "otro-periferico",
      text: "Mouse, teclado o monitor no funciona",
      pasos: [
        "Verifica que esté bien conectado (cable o USB inalámbrico).",
        "Prueba conectarlo en otro puerto USB.",
        "Si es inalámbrico, revisa o cambia las baterías.",
        "Prueba el periférico en otro equipo, si puedes, para descartar que esté dañado.",
        "Si no funciona, genera un ticket.",
      ],
    },
    {
      id: "otro-describir",
      text: "Otro / prefiero explicarlo con mis palabras",
      pasos: null,
    },
  ],
};

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

  // CAMBIO: al elegir una categoría, si tiene causas comunes
  // predefinidas, se muestran como botones en vez de pedirle al
  // usuario que escriba/lea con la IA de una vez.
  const handleOptionClick = (opcion) => {
    addMessage("user_msg", opcion.text, false);
    const causas = CAUSAS_POR_CATEGORIA[opcion.id];
    if (causas && causas.length > 0) {
      setEstado("CAUSAS_MENU");
      addMessage("bot_msg", `Estas son las causas más comunes relacionadas con **${opcion.text}**. Selecciona la que más se parezca a lo que te pasa:`);
      addMessage("causas", causas);
    } else {
      setEstado("CHATTING");
      addMessage("bot_msg", `Entendido. Por favor, describe brevemente el problema que tienes con ${opcion.text}.`);
    }
  };

  // NUEVO: al elegir una causa, muestra sus pasos (si tiene) y deja
  // los mismos botones de "Solucionado" / "Generar Ticket" que ya
  // usabas después de la respuesta de la IA. Si la causa no trae
  // pasos (ej. "Prefiero explicarlo con mis palabras"), cae al chat
  // libre de siempre.
  const handleCausaClick = (causa) => {
    addMessage("user_msg", causa.text, false);
    setEstado("CHATTING");
    if (causa.pasos && causa.pasos.length > 0) {
      const pasosTexto = causa.pasos.map((p, idx) => `${idx + 1}. ${p}`).join("\n");
      addMessage("bot_msg", `Prueba estos pasos:\n\n${pasosTexto}`);
      addMessage("acciones", null);
    } else {
      addMessage("bot_msg", "Cuéntame con más detalle qué te está pasando y te ayudo a resolverlo.");
    }
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
    // NUEVO: submenú de causas comunes de la categoría elegida
    if (m.tipo === "causas" && estado === "CAUSAS_MENU") {
      return (
        <div key={i} className="menu-options">
          {m.content.map(c => (
            <button key={c.id} className="menu-btn" onClick={() => handleCausaClick(c)}>
              <span className="menu-btn-text">{c.text}</span>
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
                <p>Bienvenido al asistente virtual de IT. ¿En qué puedo ayudarte hoy?</p>
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
              ) : estado === "MENU" || estado === "SUCCESS" || estado === "CAUSAS_MENU" ? (
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