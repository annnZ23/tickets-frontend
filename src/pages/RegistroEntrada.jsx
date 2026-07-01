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

export default function RegistroEntrada({ usuario, cerrarSesion }) {
  const navigate = useNavigate();

  return (
    <div style={{ display: "flex", minHeight: "100vh", backgroundColor: colors.fondo, fontFamily: "'Segoe UI', sans-serif" }}>
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
        <div style={{ flex: 1, padding: "36px 40px", overflowY: "auto" }}>

          {/* Botón volver */}
          <button
            onClick={() => navigate(-1)}
            style={{ display: "flex", alignItems: "center", gap: "8px", background: "none", border: "none", color: colors.textoSec, cursor: "pointer", fontSize: "13px", fontWeight: "600", marginBottom: "24px", padding: "6px 10px", borderRadius: "8px", transition: "background 0.15s, color 0.15s" }}
            onMouseEnter={(e) => { e.currentTarget.style.background = colors.naranjaClaro; e.currentTarget.style.color = colors.naranja; }}
            onMouseLeave={(e) => { e.currentTarget.style.background = "none"; e.currentTarget.style.color = colors.textoSec; }}
          >
            <FaArrowLeft style={{ fontSize: "13px" }} /> Volver
          </button>

          {/* Header centrado */}
          <div style={{ textAlign: "center", marginBottom: "32px" }}>
            <h1 style={{ margin: "0 0 10px", fontSize: "26px", fontWeight: "800", color: colors.texto, fontFamily: "'Manrope', 'Segoe UI', sans-serif", letterSpacing: "-0.3px" }}>
              Registro de Entrada
            </h1>
            <p style={{ fontSize: "14px", color: colors.textoSec, margin: "0 auto", maxWidth: "520px", lineHeight: "1.6" }}>
              Antes de registrar un equipo, selecciona el tipo de entrada que deseas realizar. Esto nos permitirá guiarte por el flujo correcto.
            </p>
            <div style={{ display: "inline-flex", alignItems: "center", gap: "10px", background: colors.naranjaClaro, border: "1px solid #ffcc80", padding: "10px 20px", borderRadius: "9px", marginTop: "18px", color: "#9a3412", fontWeight: "600", fontSize: "13.5px" }}>
              <span style={{ fontSize: "16px" }}>ⓘ</span>
              ¿El equipo que vas a registrar es nuevo o viene reasignado de otro usuario?
            </div>
          </div>

          {/* Tarjetas */}
          <div style={{ display: "flex", gap: "24px", justifyContent: "center", flexWrap: "wrap" }}>

            {/* Equipo Nuevo */}
            <div
              style={{ background: "#fff", padding: "32px", borderRadius: "16px", width: "380px", textAlign: "center", boxShadow: "0 4px 20px rgba(0,0,0,0.04)", border: `1px solid ${colors.borde}`, transition: "box-shadow 0.18s, transform 0.18s" }}
              onMouseEnter={(e) => { e.currentTarget.style.boxShadow = "0 8px 28px rgba(255,127,34,0.12)"; e.currentTarget.style.transform = "translateY(-3px)"; }}
              onMouseLeave={(e) => { e.currentTarget.style.boxShadow = "0 4px 20px rgba(0,0,0,0.04)"; e.currentTarget.style.transform = "translateY(0)"; }}
            >
              <div style={{ width: "56px", height: "56px", background: colors.naranjaClaro, borderRadius: "14px", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px", color: colors.naranja, fontSize: "26px" }}>
                <FaLaptop />
              </div>
              <h2 style={{ margin: "0 0 10px", fontSize: "18px", fontWeight: "700", color: colors.texto, fontFamily: "'Manrope', 'Segoe UI', sans-serif" }}>Equipo Nuevo</h2>
              <p style={{ fontSize: "13px", color: colors.textoSec, lineHeight: "1.6", marginBottom: "20px" }}>
                Registra un equipo que ingresa por primera vez al Inventario. Podrás crear un nuevo registro completo incluyendo categoría, ubicación, accesorios asociados y generar la hoja de entrega correspondiente.
              </p>
              <ul style={{ textAlign: "left", padding: 0, margin: "0 0 24px", listStyle: "none", fontSize: "13px", color: "#444", lineHeight: "2.2" }}>
                {["Crear registro con categoría y ubicación", "Agregar accesorios del equipo", "Generar hoja de entrega", "Asignar usuario responsable"].map((item) => (
                  <li key={item} style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                    <span style={{ color: colors.naranja, fontWeight: "700" }}>✓</span> {item}
                  </li>
                ))}
              </ul>
              <button
                style={{ background: colors.naranja, color: "white", border: "none", padding: "13px", width: "100%", borderRadius: "9px", fontWeight: "700", cursor: "pointer", fontSize: "13.5px", transition: "background 0.15s" }}
                onMouseEnter={(e) => (e.currentTarget.style.background = colors.naranjaOscuro)}
                onMouseLeave={(e) => (e.currentTarget.style.background = colors.naranja)}
              >
                Seleccionar Equipo Nuevo
              </button>
            </div>

            {/* Equipo Reasignado */}
            <div
              style={{ background: "#fff", padding: "32px", borderRadius: "16px", width: "380px", textAlign: "center", boxShadow: "0 4px 20px rgba(0,0,0,0.04)", border: `1px solid ${colors.borde}`, transition: "box-shadow 0.18s, transform 0.18s" }}
              onMouseEnter={(e) => { e.currentTarget.style.boxShadow = "0 8px 28px rgba(255,127,34,0.12)"; e.currentTarget.style.transform = "translateY(-3px)"; }}
              onMouseLeave={(e) => { e.currentTarget.style.boxShadow = "0 4px 20px rgba(0,0,0,0.04)"; e.currentTarget.style.transform = "translateY(0)"; }}
            >
              <div style={{ width: "56px", height: "56px", background: colors.naranjaClaro, borderRadius: "14px", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px", color: colors.naranja, fontSize: "26px" }}>
                <FaUndo />
              </div>
              <h2 style={{ margin: "0 0 10px", fontSize: "18px", fontWeight: "700", color: colors.texto, fontFamily: "'Manrope', 'Segoe UI', sans-serif" }}>Equipo Reasignado</h2>
              <p style={{ fontSize: "13px", color: colors.textoSec, lineHeight: "1.6", marginBottom: "20px" }}>
                Registra un equipo que ya exista en el Inventario y será reasignado a un nuevo usuario. Podrás revisar el historial de asignaciones, verificar el estado actual y actualizar la información.
              </p>
              <ul style={{ textAlign: "left", padding: 0, margin: "0 0 24px", listStyle: "none", fontSize: "13px", color: "#444", lineHeight: "2.2" }}>
                {["Revisar historial de asignaciones", "Verificar estado actual del equipo", "Agregar accesorios y nuevo usuario", "Imprimir hoja de entrega actualizada"].map((item) => (
                  <li key={item} style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                    <span style={{ color: colors.naranja, fontWeight: "700" }}>✓</span> {item}
                  </li>
                ))}
              </ul>
              <button
                style={{ background: "white", color: colors.naranja, border: `2px solid ${colors.naranja}`, padding: "11px", width: "100%", borderRadius: "9px", fontWeight: "700", cursor: "pointer", fontSize: "13.5px", transition: "background 0.15s" }}
                onMouseEnter={(e) => (e.currentTarget.style.background = colors.naranjaClaro)}
                onMouseLeave={(e) => (e.currentTarget.style.background = "white")}
              >
                Seleccionar Equipo Reasignado
              </button>
            </div>
          </div>

          <p style={{ textAlign: "center", fontSize: "13px", color: colors.textoMuted, marginTop: "36px" }}>
            ◈ Si no estás seguro del tipo de entrada, consulta con el área de soporte técnico antes de continuar.
          </p>
        </div>
      </div>
    </div>
  );
}