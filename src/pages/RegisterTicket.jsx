import { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { 
  FaBell, 
  FaEnvelope, 
  FaPaperclip, 
  FaArrowLeft,
  FaTrash,
  FaBold,
  FaItalic,
  FaUnderline,
  FaListOl,
  FaListUl,
  FaAlignLeft,    
  FaAlignCenter,    
  FaAlignRight,    
  FaHeadset,      
  FaUsers,        
  FaChartBar,     
  FaCog,         
  FaSignOutAlt   
} from "react-icons/fa";

export default function RegisterTicket() {
  const navigate = useNavigate();
  const editorRef = useRef(null);
  const [user] = useState({
    name: "Ana Zepeda",
    email: "ana@gmail.com",
    role: "USER"
  });

  const [tipo, setTipo] = useState("");
  const [estado] = useState("Creado");
  const [urgencia, setUrgencia] = useState("");
  const [prioridad, setPrioridad] = useState("");
  const [asesor, setAsesor] = useState("");
  const [correoAsesor, setCorreoAsesor] = useState("");
  const [notificar, setNotificar] = useState("");
  const [asunto, setAsunto] = useState("");
  const [archivos, setArchivos] = useState([]);
  
  // Estado interactivo de la barra superior
  const [showProfileCard, setShowProfileCard] = useState(false);
  const [showNotifDropdown, setShowNotifDropdown] = useState(false);

  const ejecutarComando = (comando) => {
    document.execCommand(comando, false, null);
    if (editorRef.current) editorRef.current.focus();
  };

  const obtenerCorreoAsesor = (nombre) => {
    switch (nombre) {
      case "Ing Manuel Flores": return "m.flores@baprosa.com";
      case "Ing Luis Salgado": return "l.salgado@baprosa.com";
      case "Ing Fredy Fajardo": return "f.fajardo@baprosa.com";
      case "Ing Arnol Sanchez": return "a.sanchez@baprosa.com";
      default: return "";
    }
  };

  const handleFileChange = (e) => {
    if (e.target.files) {
      setArchivos([...archivos, ...Array.from(e.target.files)]);
    }
  };

  const removerArchivo = (index) => {
    setArchivos(archivos.filter((_, i) => i !== index));
  };

  const handleRestablecer = () => {
    setTipo(""); setUrgencia(""); setPrioridad(""); 
    if (editorRef.current) editorRef.current.innerHTML = "";
    setAsesor(""); setCorreoAsesor(""); setNotificar(""); setAsunto(""); setArchivos([]);
  };

  const inputStyle = {
    width: "100%",
    padding: "10px 14px",
    borderRadius: "6px",
    border: "1px solid #cbd5e1",
    backgroundColor: "#f8fafc",
    fontSize: "14px",
    color: "#334155",
    outline: "none",
    boxSizing: "border-box",
    fontFamily: "'Segoe UI', sans-serif"
  };

  const toolbarButtonStyle = {
    background: "none",
    border: "none",
    color: "#64748b",
    padding: "6px 10px",
    borderRadius: "4px",
    cursor: "pointer",
    display: "inline-flex",
    alignItems: "center"
  };

  const sidebarLinkStyle = (isActive, isDisabled = false) => ({
    display: "flex",
    alignItems: "center",
    gap: "14px",
    padding: "12px 20px",
    color: isActive ? "#ff7f22" : isDisabled ? "#94a3b8" : "#64748b",
    backgroundColor: isActive ? "#fff7ed" : "transparent",
    textDecoration: "none",
    fontSize: "14px",
    fontWeight: isActive ? "600" : "500",
    transition: "all 0.15s ease",
    cursor: isDisabled ? "not-allowed" : "pointer",
    borderLeft: isActive ? "4px solid #ff7f22" : "4px solid transparent",
    opacity: isDisabled ? 0.6 : 1
  });

  return (
    <div style={{ display: "flex", height: "100vh", width: "100vw", overflow: "hidden", backgroundColor: "#f8fafc", fontFamily: "'Segoe UI', sans-serif" }}>

      <div style={{ width: "220px", minWidth: "220px", maxWidth: "220px", backgroundColor: "#ffffff", borderRight: "1px solid #e2e8f0", display: "flex", flexDirection: "column", boxSizing: "border-box", justifyContent: "space-between", height: "100%", zIndex: 30 }}>
        <div>
          <div style={{ padding: "24px 20px", display: "flex", justifyContent: "flex-start" }}>
            <img 
              src="/src/assets/baprosa-logo.png" 
              alt="Baprosa Logo" 
              style={{ maxWidth: "150px", height: "auto", objectFit: "contain" }} 
              onError={(e) => { 
                e.target.src = "assets/baprosa-logo.png"; 
              }} 
            />
          </div>

          
          <div style={{ fontSize: "14px", fontWeight: "600", color: "#707070", padding: "10px 20px 8px 24px" }}>
            Navegación
          </div>
          
          
          <nav style={{ display: "flex", flexDirection: "column" }}>
            <div style={sidebarLinkStyle(true)} onClick={() => navigate("/tickets/nuevo")}>
              <FaHeadset style={{ fontSize: "16px" }} />
              <span>Tickets Soporte</span>
            </div>

            <div style={sidebarLinkStyle(false, true)}>
              <FaListUl style={{ fontSize: "15px" }} />
              <span>Asignación Tareas IT</span>
            </div>
            
            <div style={sidebarLinkStyle(false, true)}>
              <FaEnvelope style={{ fontSize: "16px" }} />
              <span>Chat por Área</span>
            </div>
            
            <div style={sidebarLinkStyle(false)} onClick={() => navigate("/usuarios")}>
              <FaUsers style={{ fontSize: "16px" }} />
              <span>Usuarios</span>
            </div>

            <div style={sidebarLinkStyle(false, true)}>
              <FaChartBar style={{ fontSize: "16px" }} />
              <span>Reportes</span>
            </div>

            <div style={sidebarLinkStyle(false, true)}>
              <FaCog style={{ fontSize: "16px" }} />
              <span>Configuración</span>
            </div>
          </nav>
        </div>

        <div style={{ paddingBottom: "24px" }}>
          <div style={sidebarLinkStyle(false)} onClick={() => navigate("/login")}>
            <FaSignOutAlt style={{ fontSize: "16px", color: "#ef4444" }} />
            <span style={{ color: "#ef4444" }}>Cerrar sesión</span>
          </div>
        </div>
      </div>
      <div style={{ flex: 1, display: "flex", flexDirection: "column", height: "100%", overflow: "hidden" }}>
        
       
        <div style={{ height: "65px", width: "100%", backgroundColor: "#ff7f22", display: "flex", alignItems: "center", justifyContent: "flex-end", padding: "0 30px", boxSizing: "border-box", zIndex: 20 }}>
          <div style={{ display: "flex", alignItems: "center", gap: "24px" }}>
            
            
            <div style={{ position: "relative", cursor: "pointer" }} onClick={() => setShowNotifDropdown(!showNotifDropdown)}>
              <FaBell style={{ color: "#ffffff", fontSize: "19px" }} />
              <span style={{ position: "absolute", top: "-5px", right: "-5px", backgroundColor: "#ef4444", color: "white", fontSize: "10px", padding: "1px 5px", borderRadius: "10px", fontWeight: "bold" }}>1</span>
              
              {showNotifDropdown && (
                <div style={{ position: "absolute", top: "35px", right: "0", backgroundColor: "white", borderRadius: "6px", boxShadow: "0 10px 15px -3px rgba(0,0,0,0.1)", width: "260px", border: "1px solid #e2e8f0", overflow: "hidden", zIndex: 50 }}>
                  <div style={{ padding: "10px 14px", backgroundColor: "#f8fafc", borderBottom: "1px solid #e2e8f0", fontWeight: "600", fontSize: "13px", color: "#334155" }}>Notificaciones</div>
                  <div style={{ padding: "12px", fontSize: "12px", color: "#64748b", lineHeight: "1.4" }}>Tiene un correo pendiente: revise la plataforma.</div>
                </div>
              )}
            </div>

           
            <div style={{ cursor: "pointer", display: "flex", alignItems: "center" }}>
              <FaEnvelope style={{ color: "#ffffff", fontSize: "18px" }} />
            </div>

           
            <div 
              style={{ display: "flex", alignItems: "center", gap: "12px", position: "relative", cursor: "pointer" }}
              onMouseEnter={() => setShowProfileCard(true)}
              onMouseLeave={() => setShowProfileCard(false)}
            >
              <div style={{ width: "38px", height: "38px", borderRadius: "50%", backgroundColor: "#ffedd5", color: "#ea580c", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: "700", fontSize: "15px", border: "2px solid #ffffff" }}>
                A
              </div>
              <div style={{ display: "flex", flexDirection: "column", color: "#ffffff" }}>
                <span style={{ fontSize: "13px", fontWeight: "600", lineHeight: "1.2" }}>{user.name}</span>
                <span style={{ fontSize: "10px", fontWeight: "bold", opacity: 0.85, textTransform: "uppercase" }}>{user.role}</span>
              </div>

              {showProfileCard && (
                <div style={{ position: "absolute", top: "48px", right: "0", backgroundColor: "#ffffff", border: "1px solid #cbd5e1", borderRadius: "8px", boxShadow: "0 10px 25px -5px rgba(0,0,0,0.1)", width: "230px", padding: "14px", zIndex: 100, display: "flex", flexDirection: "column", gap: "6px" }}>
                  <div>
                    <span style={{ display: "block", fontSize: "10px", fontWeight: "700", color: "#94a3b8", textTransform: "uppercase" }}>Colaborador</span>
                    <span style={{ fontSize: "14px", fontWeight: "700", color: "#1e293b" }}>{user.name}</span>
                  </div>
                  <div>
                    <span style={{ display: "block", fontSize: "10px", fontWeight: "700", color: "#94a3b8", textTransform: "uppercase" }}>Cuenta asignada</span>
                    <span style={{ fontSize: "12px", color: "#475569" }}>{user.email}</span>
                  </div>
                </div>
              )}
            </div>

          </div>
        </div>

        
        <div style={{ flex: 1, overflowY: "auto", padding: "30px", backgroundColor: "#f4f6f8" }}>
          <div style={{ 
            backgroundColor: "#ffffff", 
            padding: "35px", 
            borderRadius: "10px", 
            boxShadow: "0 4px 12px rgba(0,0,0,0.02)", 
            border: "1px solid #e2e8f0", 
            width: "100%", 
            maxWidth: "1100px", 
            margin: "0 auto", 
            boxSizing: "border-box" 
          }}>
            
            <h2 style={{ margin: "0 0 25px 0", fontSize: "20px", fontWeight: "600", color: "#1e293b", borderBottom: "2px solid #ff7f22", paddingBottom: "6px", display: "inline-block" }}>
              Registrar Nuevo Ticket
            </h2>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "18px", marginBottom: "18px" }}>
              <div>
                <label style={{ display: "block", fontSize: "12px", fontWeight: "600", color: "#64748b", marginBottom: "6px" }}>Tipo de Solicitud</label>
                <select style={inputStyle} value={tipo} onChange={(e) => { setTipo(e.target.value); setPrioridad(e.target.value === "Incidente" ? "Alta" : "Baja"); }}>
                  <option value="">Seleccione...</option>
                  <option>Incidente</option>
                  <option>Problema</option>
                  <option>Servicio de mantenimiento</option>
                </select>
              </div>
              <div>
                <label style={{ display: "block", fontSize: "12px", fontWeight: "600", color: "#64748b", marginBottom: "6px" }}>Prioridad</label>
                <input style={{...inputStyle, backgroundColor: "#f1f5f9", color: "#94a3b8"}} value={prioridad} placeholder="Automática" readOnly />
              </div>
              <div>
                <label style={{ display: "block", fontSize: "12px", fontWeight: "600", color: "#64748b", marginBottom: "6px" }}>Estado</label>
                <input style={{...inputStyle, backgroundColor: "#f1f5f9", color: "#94a3b8"}} value={estado} readOnly />
              </div>
            </div>

            
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "18px", marginBottom: "18px" }}>
              <div>
                <label style={{ display: "block", fontSize: "12px", fontWeight: "600", color: "#64748b", marginBottom: "6px" }}>Urgencia</label>
                <select style={inputStyle} value={urgencia} onChange={(e) => setUrgencia(e.target.value)}>
                  <option value="">Seleccione...</option>
                  <option>Alta</option>
                  <option>Media</option>
                  <option>Baja</option>
                </select>
              </div>
              <div>
                <label style={{ display: "block", fontSize: "12px", fontWeight: "600", color: "#64748b", marginBottom: "6px" }}>Área Destino</label>
                <select style={inputStyle}>
                  <option>Soporte Técnico</option>
                  <option>Desarrollo Web</option>
                </select>
              </div>
              <div>
                <label style={{ display: "block", fontSize: "12px", fontWeight: "600", color: "#64748b", marginBottom: "6px" }}>Asesor Asignado</label>
                <select style={inputStyle} value={asesor} onChange={(e) => { setAsesor(e.target.value); setCorreoAsesor(obtenerCorreoAsesor(e.target.value)); }}>
                  <option value="">Seleccione...</option>
                  <option>Ing Manuel Flores</option>
                  <option>Ing Luis Salgado</option>
                  <option>Ing Fredy Fajardo</option>
                  <option>Ing Arnol Sanchez</option>
                </select>
              </div>
            </div>

            
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "18px", marginBottom: "18px" }}>
              <div>
                <label style={{ display: "block", fontSize: "12px", fontWeight: "600", color: "#64748b", marginBottom: "6px" }}>Correo del Asesor</label>
                <input style={{...inputStyle, backgroundColor: "#f1f5f9", color: "#94a3b8"}} value={correoAsesor} placeholder="Sin asignar asesor" readOnly />
              </div>
              <div>
                <label style={{ display: "block", fontSize: "12px", fontWeight: "600", color: "#64748b", marginBottom: "6px" }}>Correos a Notificar</label>
                <input style={inputStyle} placeholder="ejemplo@correo.com" value={notificar} onChange={(e) => setNotificar(e.target.value)} />
              </div>
            </div>

           
            <div style={{ marginBottom: "18px" }}>
              <label style={{ display: "block", fontSize: "12px", fontWeight: "600", color: "#64748b", marginBottom: "6px" }}>Asunto del Ticket</label>
              <input style={inputStyle} placeholder="Escribe el resumen corto del problema" value={asunto} onChange={(e) => setAsunto(e.target.value)} />
            </div>

            
            <div style={{ marginBottom: "22px" }}>
              <label style={{ display: "block", fontSize: "12px", fontWeight: "600", color: "#64748b", marginBottom: "6px" }}>Descripción Detallada</label>
              <div style={{ border: "1px solid #cbd5e1", borderRadius: "6px", overflow: "hidden" }}>
                <div style={{ display: "flex", gap: "4px", backgroundColor: "#f8fafc", padding: "8px", borderBottom: "1px solid #cbd5e1", alignItems: "center" }}>
                  <button type="button" onClick={() => ejecutarComando("bold")} style={toolbarButtonStyle}><FaBold /></button>
                  <button type="button" onClick={() => ejecutarComando("italic")} style={toolbarButtonStyle}><FaItalic /></button>
                  <button type="button" onClick={() => ejecutarComando("underline")} style={toolbarButtonStyle}><FaUnderline /></button>
                  <div style={{ width: "1px", height: "16px", backgroundColor: "#cbd5e1", margin: "0 6px" }} />
                  <button type="button" onClick={() => ejecutarComando("insertOrderedList")} style={toolbarButtonStyle}><FaListOl /></button>
                  <button type="button" onClick={() => ejecutarComando("insertUnorderedList")} style={toolbarButtonStyle}><FaListUl /></button>
                  <div style={{ width: "1px", height: "16px", backgroundColor: "#cbd5e1", margin: "0 6px" }} />
                  <button type="button" onClick={() => ejecutarComando("justifyLeft")} style={toolbarButtonStyle}><FaAlignLeft /></button>
                  <button type="button" onClick={() => ejecutarComando("justifyCenter")} style={toolbarButtonStyle}><FaAlignCenter /></button>
                  <button type="button" onClick={() => ejecutarComando("justifyRight")} style={toolbarButtonStyle}><FaAlignRight /></button>
                </div>

                <div
                  ref={editorRef}
                  contentEditable
                  style={{
                    width: "100%",
                    padding: "14px",
                    minHeight: "140px",
                    outline: "none",
                    fontSize: "14px",
                    color: "#334155",
                    backgroundColor: "#ffffff",
                    lineHeight: "1.6",
                    boxSizing: "border-box"
                  }}
                  data-placeholder="Describe el problema detalladamente..."
                />
              </div>
            </div>

            
            <div style={{ border: "1px solid #e2e8f0", borderRadius: "8px", overflow: "hidden", marginBottom: "25px" }}>
              <div style={{ padding: "10px 14px", display: "flex", justifyContent: "space-between", backgroundColor: "#f8fafc", borderBottom: "1px solid #e2e8f0" }}>
                <span style={{ fontSize: "13px", color: "#334155", fontWeight: "600", display: "flex", alignItems: "center", gap: "6px" }}>
                  <FaPaperclip /> Archivos adjuntos
                </span>
              </div>
              <label style={{ display: "block", padding: "24px", border: "1px dashed #cbd5e1", borderRadius: "6px", margin: "12px", backgroundColor: "#f8fafc", textAlign: "center", color: "#64748b", fontSize: "13px", cursor: "pointer" }}>
                <input type="file" multiple onChange={handleFileChange} style={{ display: "none" }} />
                Arrastre y suelte los archivos aquí o <span style={{ color: "#ff7f22", fontWeight: "600" }}>busque un archivo</span>
              </label>

              {archivos.length > 0 && (
                <div style={{ padding: "0 12px 12px", display: "flex", flexDirection: "column", gap: "6px" }}>
                  {archivos.map((file, idx) => (
                    <div key={idx} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "6px 10px", backgroundColor: "#f1f5f9", borderRadius: "4px", fontSize: "12px" }}>
                      <span style={{ color: "#334155" }}>{file.name}</span>
                      <button type="button" onClick={() => removerArchivo(idx)} style={{ background: "none", border: "none", color: "#ef4444", cursor: "pointer" }}><FaTrash /></button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div style={{ display: "flex", gap: "12px" }}>
              <button type="button" style={{ backgroundColor: "#ff7f22", color: "white", border: "none", padding: "11px 22px", borderRadius: "6px", fontWeight: "600", fontSize: "13px", cursor: "pointer" }}>
                Agregar solicitud
              </button>
              <button type="button" onClick={handleRestablecer} style={{ backgroundColor: "#ffffff", color: "#334155", border: "1px solid #cbd5e1", padding: "11px 20px", borderRadius: "6px", fontWeight: "600", fontSize: "13px", cursor: "pointer" }}>
                Restablecer
              </button>
              <button type="button" onClick={() => navigate("/dashboard")} style={{ backgroundColor: "#f1f5f9", color: "#334151", border: "1px solid #cbd5e1", padding: "10px 18px", borderRadius: "6px", fontWeight: "600", fontSize: "13px", cursor: "pointer", display: "flex", alignItems: "center", gap: "6px" }}>
                <FaArrowLeft style={{ fontSize: "11px" }} /> Cancelar
              </button>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}