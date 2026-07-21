import { useNavigate } from "react-router-dom";
import { FaLaptop, FaUndo, FaArrowLeft } from "react-icons/fa";
import Sidebar from "../components/Sidebar";
import Topbar from "../components/Topbar";

const colors = {
  naranja: "#ff7f22",
  naranjaOscuro: "#e66a10",
  naranjaClaro: "#fff1e6",
  texto: "#1e293b",
  textoSec: "#64748b",
  textoMuted: "#94a3b8",
  borde: "#eef1f5",
  fondo: "#FFF7F2", 
};

const CheckItem = ({ text }) => (
  <li style={{ 
    display: "flex", 
    alignItems: "center", 
    justifyContent: "center", 
    gap: "8px", 
    padding: "6px 0", 
    fontSize: "13px", 
    color: "#64748b", 
    lineHeight: "1.4" 
  }}>
    <span style={{ 
      color: colors.naranja, 
      fontWeight: "800", 
      fontSize: "14px", 
      flexShrink: 0 
    }}>✓</span>
    <span>{text}</span>
  </li>
);

export default function RegistroEntrada({ usuario, cerrarSesion }) {
  const navigate = useNavigate();

  return (
    <div style={{ display: "flex", minHeight: "100vh", backgroundColor: colors.fondo, fontFamily: "'Manrope', 'Segoe UI', sans-serif" }}>
      <link href="https://fonts.googleapis.com/css2?family=Manrope:wght@500;600;700;800&display=swap" rel="stylesheet" />
      <Sidebar usuario={usuario} cerrarSesion={cerrarSesion} />

      <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>
        <Topbar usuario={usuario} cerrarSesion={cerrarSesion} />

        {/* Contenido principal */}
        <div style={{ flex: 1, padding: "32px 48px", overflowY: "auto" }}>
          
          {/* Encabezado CENTRADO */}
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center", marginBottom: "20px" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "12px", marginBottom: "8px" }}>
              <button
                onClick={() => navigate(-1)}
                style={{ width: "36px", height: "36px", borderRadius: "50%", background: "#ffffff", border: `1px solid ${colors.borde}`, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", color: colors.textoSec, boxShadow: "0 2px 6px rgba(0,0,0,0.06)", transition: "all 0.15s" }}
                onMouseEnter={(e) => { e.currentTarget.style.background = colors.naranjaClaro; e.currentTarget.style.color = colors.naranja; e.currentTarget.style.borderColor = colors.naranja; }}
                onMouseLeave={(e) => { e.currentTarget.style.background = "#ffffff"; e.currentTarget.style.color = colors.textoSec; e.currentTarget.style.borderColor = colors.borde; }}
                title="Volver"
              >
                <FaArrowLeft style={{ fontSize: "13px" }} />
              </button>
              <h1 style={{ margin: 0, fontSize: "24px", fontWeight: "800", color: colors.texto, letterSpacing: "-0.3px" }}>
                Registro de Entrada
              </h1>
            </div>
            <p style={{ margin: 0, fontSize: "13px", color: colors.textoSec, maxWidth: "600px" }}>
              Antes de registrar un equipo, selecciona el tipo de entrada que deseas realizar. Esto nos permitirá guiarte por el flujo correcto.
            </p>
          </div>

          {/* Banner de información CENTRADO */}
          <div style={{ display: "flex", justifyContent: "center", marginBottom: "32px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "12px", background: "#fffbf5", border: `1px solid #ffd49e`, borderLeft: `4px solid ${colors.naranja}`, padding: "12px 24px", borderRadius: "8px", color: "#92400e", fontWeight: "600", fontSize: "13.5px", maxWidth: "700px" }}>
              <span style={{ fontSize: "18px", flexShrink: 0 }}>ⓘ</span>
              ¿El equipo que vas a registrar es nuevo o viene reasignado de otro usuario?
            </div>
          </div>

          {/* Tarjetas Centradas */}
          <div style={{ display: "flex", gap: "24px", justifyContent: "center", flexWrap: "wrap" }}>

            {/* Tarjeta: Equipo Nuevo */}
            <div
              style={{ background: "#fff", borderRadius: "16px", width: "380px", overflow: "hidden", boxShadow: "0 4px 16px rgba(0,0,0,0.04)", border: `1px solid ${colors.borde}`, transition: "box-shadow 0.18s, transform 0.18s", display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center" }}
              onMouseEnter={(e) => { e.currentTarget.style.boxShadow = "0 10px 32px rgba(255,127,34,0.12)"; e.currentTarget.style.transform = "translateY(-4px)"; }}
              onMouseLeave={(e) => { e.currentTarget.style.boxShadow = "0 4px 16px rgba(0,0,0,0.04)"; e.currentTarget.style.transform = "translateY(0)"; }}
            >
              <div style={{ padding: "32px 32px 0", display: "flex", flexDirection: "column", alignItems: "center", width: "100%", boxSizing: "border-box" }}>
                <div style={{ width: "64px", height: "64px", background: colors.naranjaClaro, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: "18px", color: colors.naranja, fontSize: "24px" }}>
                  <FaLaptop />
                </div>
                <h2 style={{ margin: "0 0 10px", fontSize: "18px", fontWeight: "800", color: colors.texto }}>Equipo Nuevo</h2>
                <p style={{ fontSize: "12.5px", color: colors.textoSec, lineHeight: "1.6", marginBottom: "20px" }}>
                  Registra un equipo que ingresa por primera vez al inventario. Podrás crear un nuevo registro completo incluyendo categoría, ubicación, accesorios asociados y generar la hoja de entrega correspondiente.
                </p>
                
                <div style={{ width: "100%", height: "1px", backgroundColor: "#f1f5f9", marginBottom: "16px" }} />

                <ul style={{ padding: 0, margin: "0 0 24px", listStyle: "none", width: "100%" }}>
                  {["Crear registro con categoría y ubicación", "Agregar accesorios del equipo", "Generar hoja de entrega", "Asignar usuario responsable"].map((item) => (
                    <CheckItem key={item} text={item} />
                  ))}
                </ul>
              </div>
              <div style={{ padding: "0 32px 32px", marginTop: "auto", width: "100%", boxSizing: "border-box" }}>
                <button
                  onClick={() => navigate("/admin/equipo-nuevo")}
                  style={{ background: colors.naranja, color: "white", border: "none", padding: "13px", width: "100%", borderRadius: "9px", fontWeight: "700", cursor: "pointer", fontSize: "13.5px", fontFamily: "inherit", transition: "background 0.15s" }}
                  onMouseEnter={(e) => (e.currentTarget.style.background = colors.naranjaOscuro)}
                  onMouseLeave={(e) => (e.currentTarget.style.background = colors.naranja)}
                >
                  Seleccionar Equipo Nuevo
                </button>
              </div>
            </div>
            
            {/* Tarjeta: Equipo Reasignado */}
            <div
              style={{ background: "#fff", borderRadius: "16px", width: "380px", overflow: "hidden", boxShadow: "0 4px 16px rgba(0,0,0,0.04)", border: `1px solid ${colors.borde}`, transition: "box-shadow 0.18s, transform 0.18s", display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center" }}
              onMouseEnter={(e) => { e.currentTarget.style.boxShadow = "0 10px 32px rgba(255,127,34,0.12)"; e.currentTarget.style.transform = "translateY(-4px)"; }}
              onMouseLeave={(e) => { e.currentTarget.style.boxShadow = "0 4px 16px rgba(0,0,0,0.04)"; e.currentTarget.style.transform = "translateY(0)"; }}
            >
              <div style={{ padding: "32px 32px 0", display: "flex", flexDirection: "column", alignItems: "center", width: "100%", boxSizing: "border-box" }}>
                <div style={{ width: "64px", height: "64px", background: colors.naranjaClaro, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: "18px", color: colors.naranja, fontSize: "24px" }}>
                  <FaUndo />
                </div>
                <h2 style={{ margin: "0 0 10px", fontSize: "18px", fontWeight: "800", color: colors.texto }}>Equipo Reasignado</h2>
                <p style={{ fontSize: "12.5px", color: colors.textoSec, lineHeight: "1.6", marginBottom: "20px" }}>
                  Registra un equipo que ya existía en el inventario y será reasignado a un nuevo usuario. Podrás revisar el historial de asignaciones, verificar el estado actual y actualizar la información.
                </p>

                <div style={{ width: "100%", height: "1px", backgroundColor: "#f1f5f9", marginBottom: "16px" }} />

                <ul style={{ padding: 0, margin: "0 0 24px", listStyle: "none", width: "100%" }}>
                  {["Revisar historial de asignaciones", "Verificar estado actual del equipo", "Agregar accesorios y nuevo usuario", "Imprimir hoja de entrega actualizada"].map((item) => (
                    <CheckItem key={item} text={item} />
                  ))}
                </ul>
              </div>
              <div style={{ padding: "0 32px 32px", marginTop: "auto", width: "100%", boxSizing: "border-box" }}>
                <button
                  onClick={() => navigate("/admin/equipo-reasignado")}
                  style={{ background: "white", color: colors.naranja, border: `2px solid ${colors.naranja}`, padding: "11px", width: "100%", borderRadius: "9px", fontWeight: "700", cursor: "pointer", fontSize: "13.5px", fontFamily: "inherit", transition: "all 0.15s" }}
                  onMouseEnter={(e) => { e.currentTarget.style.background = colors.naranja; e.currentTarget.style.color = "white"; }}
                  onMouseLeave={(e) => { e.currentTarget.style.background = "white"; e.currentTarget.style.color = colors.naranja; }}
                >
                  Seleccionar Equipo Reasignado
                </button>
              </div>
            </div>
          </div>

          <p style={{ textAlign: "center", fontSize: "12.5px", color: colors.textoMuted, marginTop: "32px" }}>
            ◈ Si no estás seguro del tipo de entrada, consulta con el área de soporte técnico antes de continuar.
          </p>
        </div>
      </div>
    </div>
  );
}