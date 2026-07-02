import { useState, useEffect, useMemo } from "react";
import Sidebar from "../components/Sidebar";
import baprosaLogo from "../assets/baprosa-logo.png";
import {
  FaLaptop, FaDesktop, FaTv, FaVideo, FaMobileAlt, FaHandHolding,
  FaPhoneAlt, FaNetworkWired, FaPrint, FaTabletAlt,
  FaRegBell, FaRegEnvelope, FaChevronDown, FaSearch,
  FaHistory, FaPlusCircle, FaCheckCircle, FaExchangeAlt,
  FaExclamationTriangle, FaTools, FaKey, FaSyncAlt,
} from "react-icons/fa";

const colors = {
  naranja: "#ff7f22", naranjaOscuro: "#e66a10", naranjaClaro: "#fff1e6",
  texto: "#1e293b", textoSec: "#64748b", textoMuted: "#94a3b8",
  borde: "#eef1f5", fondo: "#fdf0e6", verde: "#16a34a", verdeClaro: "#e9f9ee",
  rojo: "#dc2626", rojoClaro: "#fee2e2", amarillo: "#d97706", amarilloClaro: "#fef3c7",
};

// Mapea el valor de "categoria" que se guarda en la BD (viene de EquipoNuevo.jsx)
// al ícono + etiqueta visual que se muestra en las tarjetas.
const CATEGORIA_CONFIG = [
  { match: "Laptop", label: "Laptops", icon: <FaLaptop /> },
  { match: "Desktop", label: "Desktop", icon: <FaDesktop /> },
  { match: "Monitor", label: "Monitores", icon: <FaTv /> },
  { match: "Servidor", label: "Servidores", icon: <FaNetworkWired /> },
  { match: "Teléfono / Celular", label: "Celulares", icon: <FaMobileAlt /> },
  { match: "Switch", label: "Switch", icon: <FaExchangeAlt /> },
  { match: "Impresora", label: "Impresoras", icon: <FaPrint /> },
  { match: "Tablet", label: "Tablets", icon: <FaTabletAlt /> },
  { match: "Router", label: "Routers", icon: <FaNetworkWired /> },
  { match: "UPS", label: "UPS", icon: <FaVideo /> },
  { match: "Teclado + Mouse", label: "Teclado + Mouse", icon: <FaHandHolding /> },
  { match: "Otro", label: "Otros", icon: <FaHandHolding /> },
];

const getIniciales = (name) => {
  if (!name) return "A";
  const p = name.trim().split(" ");
  return p.length > 1 ? `${p[0][0]}${p[1][0]}`.toUpperCase() : p[0][0].toUpperCase();
};

const badgeEstado = (activo) => {
  if (activo) return { texto: "Activo", bg: colors.verdeClaro, color: colors.verde };
  return { texto: "Inactivo", bg: colors.rojoClaro, color: colors.rojo };
};

// Tarjetas de funciones adicionales dentro del detalle de una categoría.
// Algunas (Mantenimiento, Licencias, Devolución por Daños) todavía no tienen
// backend propio — quedan marcadas como "Próximamente" hasta que se modele esa parte.
const DETALLE_ITEMS = [
  { icon: <FaHistory />, titulo: "Historial de Equipos Asignados", desc: "Registro completo de asignaciones con fechas y departamentos.", disponible: true },
  { icon: <FaPlusCircle />, titulo: "Agregar Accesorios", desc: "Asociar accesorios adicionales al equipo seleccionado.", disponible: true },
  { icon: <FaCheckCircle />, titulo: "Estado Actual", desc: "Visualizar el estado operativo actual: activo, en reparación, dado de baja.", disponible: true },
  { icon: <FaExchangeAlt />, titulo: "Cambios de Ubicación", desc: "Historial de traslados entre oficinas, sucursales o departamentos.", disponible: false },
  { icon: <FaExclamationTriangle />, titulo: "Devolución por Daños", desc: "Registro de devoluciones por daños físicos o fallas técnicas.", disponible: false },
  { icon: <FaTools />, titulo: "Mantenimiento", desc: "Programación y registro de mantenimientos preventivos y correctivos.", disponible: false },
  { icon: <FaKey />, titulo: "Licencias Asignadas", desc: "Control de licencias de software instaladas.", disponible: false },
];

export default function Historial({ usuario, cerrarSesion }) {
  const token = localStorage.getItem("token");

  const [equipos, setEquipos] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [categoriaActiva, setCategoriaActiva] = useState(null);
  const [busqueda, setBusqueda] = useState("");

  const cargarEquipos = async () => {
    setCargando(true);
    try {
      const res = await fetch("http://localhost:3000/api/equipos", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      setEquipos(Array.isArray(data) ? data : []);
    } catch {
      setEquipos([]);
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => { cargarEquipos(); }, []);

  // Conteo por categoría, calculado en el cliente a partir de la lista completa de equipos.
  const conteos = useMemo(() => {
    const mapa = {};
    equipos.forEach((eq) => {
      mapa[eq.categoria] = (mapa[eq.categoria] || 0) + 1;
    });
    return mapa;
  }, [equipos]);

  const equiposFiltrados = useMemo(() => {
    let lista = equipos;
    if (categoriaActiva) lista = lista.filter((eq) => eq.categoria === categoriaActiva);
    if (busqueda.trim()) {
      const q = busqueda.trim().toLowerCase();
      lista = lista.filter((eq) =>
        [eq.folio, eq.numeroSerie, eq.marca, eq.modelo, eq.responsable, eq.direccionIp, eq.areaEmpresa]
          .filter(Boolean)
          .some((campo) => campo.toLowerCase().includes(q))
      );
    }
    return lista;
  }, [equipos, categoriaActiva, busqueda]);

  return (
    <div style={{ display: "flex", minHeight: "100vh", backgroundColor: colors.fondo, fontFamily: "'Segoe UI', sans-serif" }}>
      <link href="https://fonts.googleapis.com/css2?family=Manrope:wght@500;700;800&display=swap" rel="stylesheet" />
      <Sidebar usuario={usuario} cerrarSesion={cerrarSesion} />

      <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>
        {/* TOPBAR */}
        <div style={{ height: "65px", backgroundColor: "#fff", borderBottom: `1px solid ${colors.borde}`, boxShadow: "0 1px 4px rgba(15,23,42,0.04)", display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 28px", flexShrink: 0 }}>
          <img src={baprosaLogo} alt="Baprosa" style={{ height: "46px", objectFit: "contain" }} />
          <div style={{ display: "flex", alignItems: "center", gap: "20px" }}>
            <FaRegBell style={{ color: colors.textoMuted, fontSize: "20px" }} />
            <FaRegEnvelope style={{ color: colors.textoMuted, fontSize: "20px" }} />
            <div style={{ width: "1px", height: "22px", background: colors.borde }} />
            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              <div style={{ width: "36px", height: "36px", borderRadius: "50%", background: colors.naranjaClaro, color: colors.naranja, display: "flex", alignItems: "center", justifyContent: "center", fontWeight: "800", fontSize: "13px" }}>
                {getIniciales(usuario?.name)}
              </div>
              <div>
                <div style={{ fontSize: "13px", fontWeight: "700", color: colors.texto }}>{usuario?.name}</div>
                <div style={{ fontSize: "11px", color: colors.textoSec }}>{usuario?.areaNombre || usuario?.role}</div>
              </div>
              <FaChevronDown style={{ color: colors.textoMuted, fontSize: "10px" }} />
            </div>
          </div>
        </div>

        <div style={{ flex: 1, overflowY: "auto", padding: "24px 28px" }}>
          {/* Header */}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
            <div>
              <h1 style={{ margin: 0, fontSize: "20px", fontWeight: "800", color: colors.texto, fontFamily: "'Manrope', sans-serif" }}>Historial de Equipos</h1>
              <p style={{ margin: 0, fontSize: "12px", color: colors.textoSec }}>Vista general del inventario por categoría</p>
            </div>
            <button onClick={cargarEquipos}
              style={{ display: "flex", alignItems: "center", gap: "7px", padding: "9px 18px", borderRadius: "9px", border: "none", background: colors.texto, color: "white", fontSize: "13px", fontWeight: "700", cursor: "pointer", fontFamily: "inherit" }}>
              <FaSyncAlt style={{ fontSize: "12px" }} /> Actualizar
            </button>
          </div>

          {/* Tarjetas por categoría */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(6, 1fr)", gap: "12px", marginBottom: "20px" }}>
            {CATEGORIA_CONFIG.map(({ match, label, icon }) => {
              const total = conteos[match] || 0;
              const activa = categoriaActiva === match;
              return (
                <button
                  key={match}
                  onClick={() => setCategoriaActiva(activa ? null : match)}
                  style={{
                    display: "flex", flexDirection: "column", alignItems: "center", gap: "8px",
                    padding: "18px 10px", borderRadius: "12px",
                    border: `1.5px solid ${activa ? colors.naranja : colors.borde}`,
                    background: activa ? colors.naranjaClaro : "#fff",
                    cursor: "pointer", fontFamily: "inherit",
                    boxShadow: activa ? "0 4px 14px rgba(255,127,34,0.15)" : "none",
                    transition: "all 0.15s",
                  }}
                >
                  <div style={{ width: "40px", height: "40px", borderRadius: "10px", background: activa ? "#fff" : colors.naranjaClaro, color: colors.naranja, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "17px" }}>
                    {icon}
                  </div>
                  <div style={{ fontSize: "12.5px", fontWeight: "700", color: colors.texto }}>{label}</div>
                  <div style={{ fontSize: "11px", color: colors.textoSec }}>{total} equipo{total !== 1 ? "s" : ""}</div>
                </button>
              );
            })}
          </div>

          {/* Detalle de la categoría seleccionada */}
          {categoriaActiva && (
            <div style={{ background: "#fff", borderRadius: "12px", border: `1px solid ${colors.borde}`, padding: "20px", marginBottom: "20px" }}>
              <h3 style={{ margin: "0 0 14px", fontSize: "15px", fontWeight: "800", color: colors.texto, fontFamily: "'Manrope', sans-serif" }}>
                {CATEGORIA_CONFIG.find((c) => c.match === categoriaActiva)?.label} — Detalle del Historial
              </h3>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "12px" }}>
                {DETALLE_ITEMS.map(({ icon, titulo, desc, disponible }) => (
                  <div key={titulo}
                    style={{
                      background: colors.naranjaClaro, border: `1px solid #ffd49e`, borderRadius: "10px",
                      padding: "14px", opacity: disponible ? 1 : 0.55, position: "relative",
                    }}>
                    {!disponible && (
                      <span style={{ position: "absolute", top: "8px", right: "8px", fontSize: "9px", fontWeight: "700", color: colors.amarillo, background: colors.amarilloClaro, padding: "2px 6px", borderRadius: "6px" }}>
                        PRÓXIMAMENTE
                      </span>
                    )}
                    <div style={{ display: "flex", alignItems: "center", gap: "7px", marginBottom: "6px", color: colors.naranjaOscuro, fontSize: "13px" }}>
                      {icon}
                      <span style={{ fontSize: "12.5px", fontWeight: "700", color: "#92400e" }}>{titulo}</span>
                    </div>
                    <p style={{ margin: 0, fontSize: "11px", color: "#92400e", lineHeight: 1.4 }}>{desc}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Tabla de registros */}
          <div style={{ background: "#fff", borderRadius: "12px", border: `1px solid ${colors.borde}`, padding: "20px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
              <h3 style={{ margin: 0, fontSize: "14px", fontWeight: "700", color: colors.texto }}>
                Últimos Registros{categoriaActiva ? ` — ${CATEGORIA_CONFIG.find((c) => c.match === categoriaActiva)?.label}` : ""}
              </h3>
              <div style={{ position: "relative", width: "260px" }}>
                <FaSearch style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)", color: colors.textoMuted, fontSize: "12px" }} />
                <input
                  value={busqueda}
                  onChange={(e) => setBusqueda(e.target.value)}
                  placeholder="Buscar por folio, serie, IP..."
                  style={{ padding: "8px 12px 8px 32px", borderRadius: "8px", border: `1px solid ${colors.borde}`, fontSize: "12.5px", width: "100%", boxSizing: "border-box", outline: "none", fontFamily: "inherit" }}
                />
              </div>
            </div>

            {cargando ? (
              <p style={{ fontSize: "13px", color: colors.textoSec, textAlign: "center", padding: "30px 0" }}>Cargando equipos...</p>
            ) : equiposFiltrados.length === 0 ? (
              <p style={{ fontSize: "13px", color: colors.textoSec, textAlign: "center", padding: "30px 0" }}>No hay equipos que coincidan con la búsqueda.</p>
            ) : (
              <div style={{ overflowX: "auto" }}>
                <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "12.5px" }}>
                  <thead>
                    <tr style={{ borderBottom: `1.5px solid ${colors.borde}` }}>
                      {["Folio", "Equipo", "Marca / Modelo", "Serie", "IP", "Asignado a", "Departamento", "Estado", "Fecha"].map((h) => (
                        <th key={h} style={{ textAlign: "left", padding: "10px 8px", color: colors.textoSec, fontWeight: "700", fontSize: "11px", textTransform: "uppercase", letterSpacing: "0.3px" }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {equiposFiltrados.slice(0, 50).map((eq) => {
                      const badge = badgeEstado(eq.activo);
                      return (
                        <tr key={eq.id} style={{ borderBottom: `1px solid ${colors.fondo}` }}>
                          <td style={{ padding: "10px 8px", fontWeight: "700", color: colors.naranja }}>{eq.folio}</td>
                          <td style={{ padding: "10px 8px", color: colors.texto }}>{eq.categoria}</td>
                          <td style={{ padding: "10px 8px", color: colors.texto }}>{eq.marca} {eq.modelo}</td>
                          <td style={{ padding: "10px 8px", color: colors.textoSec }}>{eq.numeroSerie}</td>
                          <td style={{ padding: "10px 8px", color: colors.naranjaOscuro, fontWeight: "600" }}>{eq.direccionIp || "—"}</td>
                          <td style={{ padding: "10px 8px", color: colors.texto }}>{eq.responsable || "Sin asignar"}</td>
                          <td style={{ padding: "10px 8px", color: colors.textoSec }}>{eq.areaEmpresa || "—"}</td>
                          <td style={{ padding: "10px 8px" }}>
                            <span style={{ padding: "3px 10px", borderRadius: "20px", fontSize: "10.5px", fontWeight: "700", background: badge.bg, color: badge.color }}>{badge.texto}</span>
                          </td>
                          <td style={{ padding: "10px 8px", color: colors.textoSec }}>{new Date(eq.createdAt).toLocaleDateString("es-HN")}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
                {equiposFiltrados.length > 50 && (
                  <p style={{ fontSize: "11.5px", color: colors.textoSec, textAlign: "center", marginTop: "12px" }}>
                    Mostrando 50 de {equiposFiltrados.length} resultados. Usa el buscador para filtrar más.
                  </p>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}