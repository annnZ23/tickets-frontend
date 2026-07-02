import { useNavigate } from 'react-router-dom';
import { FaLaptop, FaUndo, FaArrowLeft, FaRegBell, FaRegEnvelope, FaChevronDown } from 'react-icons/fa';
import Sidebar from '../components/Sidebar';
import baprosaLogo from '../assets/baprosa-logo.png';

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

const getIniciales = (name) => {
  if (!name) return "A";
  const parts = name.trim().split(" ");
  return parts.length > 1 ? `${parts[0][0]}${parts[1][0]}`.toUpperCase() : parts[0][0].toUpperCase();
};

const CheckItem = ({ text }) => (
  <li style={{ display: "flex", alignItems: "flex-start", gap: "9px", padding: "5px 0", borderBottom: "1px solid #f8f9fa", fontSize: "13px", color: "#374151", lineHeight: "1.4" }}>
    <span style={{ color: colors.naranja, fontWeight: "800", fontSize: "14px", marginTop: "1px", flexShrink: 0 }}>✓</span>
    {text}
  </li>
);

export default function RegistroEntrada({ usuario, cerrarSesion }) {
  const navigate = useNavigate();

  return (
    <div style={{ display: "flex", minHeight: "100vh", backgroundColor: colors.fondo, fontFamily: "'Manrope', 'Segoe UI', sans-serif" }}>
      <link href="https://fonts.googleapis.com/css2?family=Manrope:wght@500;600;700;800&display=swap" rel="stylesheet" />
      <Sidebar usuario={usuario} cerrarSesion={cerrarSesion} />

      <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>

        {/* TOPBAR BLANCA */}
        <div style={{ height: "65px", backgroundColor: "#ffffff", borderBottom: `1px solid ${colors.borde}`, boxShadow: "0 1px 4px rgba(15,23,42,0.04)", display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 28px", boxSizing: "border-box", flexShrink: 0 }}>
          <img src={baprosaLogo} alt="Baprosa" style={{ height: "46px", width: "auto", objectFit: "contain" }} />
          <div style={{ display: "flex", alignItems: "center", gap: "20px" }}>
            <FaRegBell style={{ color: colors.textoMuted, fontSize: "20px", cursor: "pointer" }} />
            <FaRegEnvelope style={{ color: colors.textoMuted, fontSize: "20px", cursor: "pointer" }} />
            <div style={{ width: "1px", height: "22px", backgroundColor: colors.borde }} />
            <div style={{ display: "flex", alignItems: "center", gap: "10px", cursor: "pointer" }}>
              <div style={{ width: "36px", height: "36px", borderRadius: "50%", backgroundColor: colors.naranjaClaro, color: colors.naranja, display: "flex", alignItems: "center", justifyContent: "center", fontWeight: "800", fontSize: "13px" }}>
                {getIniciales(usuario?.name)}
              </div>
              <div style={{ display: "flex", flexDirection: "column" }}>
                <span style={{ fontSize: "13px", fontWeight: "700", color: colors.texto, lineHeight: "1.2" }}>{usuario?.name || "Usuario"}</span>
                <span style={{ fontSize: "11px", color: colors.textoSec }}>{usuario?.areaNombre || usuario?.role}</span>
              </div>
              <FaChevronDown style={{ color: colors.textoMuted, fontSize: "10px" }} />
            </div>
          </div>
        </div>

        {/* CONTENIDO */}
        <div style={{ flex: 1, padding: "32px 48px", overflowY: "auto" }}>

          {/* Botón volver + título integrados */}
          <div style={{ display: "flex", alignItems: "center", gap: "16px", marginBottom: "6px" }}>
            <button
              onClick={() => navigate(-1)}
              style={{ width: "36px", height: "36px", borderRadius: "50%", background: "#ffffff", border: `1px solid ${colors.borde}`, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", color: colors.textoSec, boxShadow: "0 2px 6px rgba(0,0,0,0.06)", transition: "all 0.15s", flexShrink: 0 }}
              onMouseEnter={(e) => { e.currentTarget.style.background = colors.naranjaClaro; e.currentTarget.style.color = colors.naranja; e.currentTarget.style.borderColor = colors.naranja; }}
              onMouseLeave={(e) => { e.currentTarget.style.background = "#ffffff"; e.currentTarget.style.color = colors.textoSec; e.currentTarget.style.borderColor = colors.borde; }}
              title="Volver"
            >
              <FaArrowLeft style={{ fontSize: "13px" }} />
            </button>
            <div>
              <h1 style={{ margin: 0, fontSize: "22px", fontWeight: "800", color: colors.texto, letterSpacing: "-0.3px" }}>
                Registro de Entrada
              </h1>
              <p style={{ margin: "2px 0 0", fontSize: "13px", color: colors.textoSec }}>
                Selecciona el tipo de entrada para guiarte por el flujo correcto.
              </p>
            </div>
          </div>

          {/* Banner informativo con borde izquierdo naranja */}
          <div style={{ display: "flex", alignItems: "center", gap: "12px", background: "#fffbf5", borderLeft: `4px solid ${colors.naranja}`, border: `1px solid #ffd49e`, borderLeftWidth: "4px", padding: "12px 18px", borderRadius: "0 9px 9px 0", marginTop: "20px", marginBottom: "32px", color: "#92400e", fontWeight: "600", fontSize: "13.5px" }}>
            <span style={{ fontSize: "18px", flexShrink: 0 }}>ⓘ</span>
            ¿El equipo que vas a registrar es nuevo o viene reasignado de otro usuario?
          </div>

          {/* Tarjetas */}
          <div style={{ display: "flex", gap: "22px", justifyContent: "center", flexWrap: "wrap" }}>

            {/* Equipo Nuevo */}
            <div
              style={{ background: "#fff", borderRadius: "14px", width: "360px", overflow: "hidden", boxShadow: "0 4px 16px rgba(0,0,0,0.05)", border: `1px solid ${colors.borde}`, borderTop: `4px solid ${colors.naranja}`, transition: "box-shadow 0.18s, transform 0.18s", display: "flex", flexDirection: "column" }}
              onMouseEnter={(e) => { e.currentTarget.style.boxShadow = "0 10px 32px rgba(255,127,34,0.14)"; e.currentTarget.style.transform = "translateY(-4px)"; }}
              onMouseLeave={(e) => { e.currentTarget.style.boxShadow = "0 4px 16px rgba(0,0,0,0.05)"; e.currentTarget.style.transform = "translateY(0)"; }}
            >
              <div style={{ padding: "28px 28px 0" }}>
                <div style={{ width: "52px", height: "52px", background: colors.naranjaClaro, borderRadius: "12px", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: "14px", color: colors.naranja, fontSize: "24px" }}>
                  <FaLaptop />
                </div>
                <h2 style={{ margin: "0 0 8px", fontSize: "17px", fontWeight: "800", color: colors.texto }}>Equipo Nuevo</h2>
                <p style={{ fontSize: "12.5px", color: colors.textoSec, lineHeight: "1.6", marginBottom: "16px" }}>
                  Registra un equipo que ingresa por primera vez al Inventario. Crea un registro completo con categoría, ubicación, accesorios y genera la hoja de entrega.
                </p>
                <ul style={{ padding: 0, margin: "0 0 20px", listStyle: "none" }}>
                  {["Crear registro con categoría y ubicación", "Agregar accesorios del equipo", "Generar hoja de entrega", "Asignar usuario responsable"].map((item) => (
                    <CheckItem key={item} text={item} />
                  ))}
                </ul>
              </div>
              <div style={{ padding: "0 28px 28px", marginTop: "auto" }}>
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

            {/* Equipo Reasignado */}
            <div
              style={{ background: "#fff", borderRadius: "14px", width: "360px", overflow: "hidden", boxShadow: "0 4px 16px rgba(0,0,0,0.05)", border: `1px solid ${colors.borde}`, borderTop: "4px solid #94a3b8", transition: "box-shadow 0.18s, transform 0.18s", display: "flex", flexDirection: "column" }}
              onMouseEnter={(e) => { e.currentTarget.style.boxShadow = "0 10px 32px rgba(255,127,34,0.14)"; e.currentTarget.style.transform = "translateY(-4px)"; e.currentTarget.style.borderTopColor = colors.naranja; }}
              onMouseLeave={(e) => { e.currentTarget.style.boxShadow = "0 4px 16px rgba(0,0,0,0.05)"; e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.borderTopColor = "#94a3b8"; }}
            >
              <div style={{ padding: "28px 28px 0" }}>
                <div style={{ width: "52px", height: "52px", background: colors.naranjaClaro, borderRadius: "12px", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: "14px", color: colors.naranja, fontSize: "24px" }}>
                  <FaUndo />
                </div>
                <h2 style={{ margin: "0 0 8px", fontSize: "17px", fontWeight: "800", color: colors.texto }}>Equipo Reasignado</h2>
                <p style={{ fontSize: "12.5px", color: colors.textoSec, lineHeight: "1.6", marginBottom: "16px" }}>
                  Registra un equipo ya existente en el Inventario que será reasignado a un nuevo usuario. Revisa el historial y actualiza la información.
                </p>
                <ul style={{ padding: 0, margin: "0 0 20px", listStyle: "none" }}>
                  {["Revisar historial de asignaciones", "Verificar estado actual del equipo", "Agregar accesorios y nuevo usuario", "Imprimir hoja de entrega actualizada"].map((item) => (
                    <CheckItem key={item} text={item} />
                  ))}
                </ul>
              </div>
              <div style={{ padding: "0 28px 28px", marginTop: "auto" }}>
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