import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import Topbar from "../components/Topbar";
import {
  FaLaptop, FaCheckCircle, FaBoxes, FaExchangeAlt, FaBoxOpen, FaClipboardCheck,
} from "react-icons/fa";

const colors = {
  naranja: "#ff7f22", naranjaOscuro: "#e66a10", naranjaClaro: "#fff1e6",
  texto: "#1e293b", textoSec: "#64748b", textoMuted: "#94a3b8",
  borde: "#eef1f5", fondo: "#FFF7F2", verde: "#16a34a", verdeClaro: "#e9f9ee",
  rojo: "#dc2626", rojoClaro: "#fee2e2", amarillo: "#d97706", amarilloClaro: "#fef3e2",
};

const badgeEstado = (estado) => {
  if (estado === "Entregado") return { bg: colors.verdeClaro, color: colors.verde };
  if (estado === "En proceso" || estado === "En Proceso") return { bg: colors.amarilloClaro, color: colors.amarillo };
  return { bg: "#f1f5f9", color: colors.textoSec };
};

const iconoMovimiento = (accion) => {
  if (accion?.includes("crear") || accion?.includes("ingreso")) return <FaBoxOpen />;
  if (accion?.includes("salida")) return <FaExchangeAlt />;
  if (accion?.includes("entreg")) return <FaClipboardCheck />;
  return <FaExchangeAlt />;
};

export default function RegistroSalida({ usuario, cerrarSesion }) {
  const navigate = useNavigate();
  const token = localStorage.getItem("token");
  const [resumen, setResumen] = useState(null);
  const [cargando, setCargando] = useState(true);
  const [busqueda, setBusqueda] = useState("");

  const authHeaders = useCallback(() => ({ Authorization: `Bearer ${token}` }), [token]);

  const cargarResumen = useCallback(async () => {
    setCargando(true);
    try {
      const res = await fetch("http://localhost:3000/api/registro-salida/resumen", { headers: authHeaders() });
      const data = await res.json();
      setResumen(data);
    } catch (err) {
      console.error("Error al cargar resumen de Registro de Salida:", err);
    } finally {
      setCargando(false);
    }
  }, [authHeaders]);

  useEffect(() => {
    cargarResumen();
  }, [cargarResumen]);

  const equiposFiltrados = (resumen?.equiposHoy || []).filter((e) => {
    if (!busqueda.trim()) return true;
    const q = busqueda.trim().toLowerCase();
    return (
      e.usuario?.toLowerCase().includes(q) ||
      e.equipo?.toLowerCase().includes(q) ||
      e.tecnico?.toLowerCase().includes(q) ||
      String(e.id).includes(q)
    );
  });

  const kpis = [
    { icon: <FaLaptop />, title: "Equipos Registrados Hoy", val: resumen?.kpis.equiposRegistradosHoy ?? 0 },
    { icon: <FaCheckCircle />, title: "Equipos Entregados", val: resumen?.kpis.equiposEntregados ?? 0 },
    { icon: <FaBoxes />, title: "Suministros Utilizados", val: resumen?.kpis.suministrosUtilizados ?? 0 },
    { icon: <FaExchangeAlt />, title: "Movimientos del Sistema", val: resumen?.kpis.movimientosDelSistema ?? 0 },
  ];

  const fechaHoy = new Date().toLocaleDateString("es-HN", { weekday: "long", day: "numeric", month: "long", year: "numeric" });

  return (
    <div style={{ display: "flex", minHeight: "100vh", backgroundColor: colors.fondo, fontFamily: "'Segoe UI', sans-serif" }}>
      <link href="https://fonts.googleapis.com/css2?family=Manrope:wght@500;700;800&display=swap" rel="stylesheet" />
      <Sidebar usuario={usuario} cerrarSesion={cerrarSesion} />

      <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>
        <Topbar usuario={usuario} cerrarSesion={cerrarSesion} />

        <div style={{ flex: 1, overflowY: "auto", padding: "24px 28px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
            <div>
              <h1 style={{ margin: 0, fontSize: "24px", fontWeight: "800", color: colors.texto, fontFamily: "'Manrope', sans-serif" }}>Registro de Salida</h1>
              <p style={{ margin: "3px 0 0", fontSize: "13px", color: colors.textoSec }}>Resumen diario — <span style={{ textTransform: "capitalize" }}>{fechaHoy}</span></p>
            </div>
            <button
              onClick={cargarResumen}
              disabled={cargando}
              style={{ background: colors.naranja, color: "white", padding: "11px 24px", borderRadius: "9px", fontWeight: "700", fontSize: "13.5px", border: "none", cursor: "pointer", fontFamily: "inherit" }}
            >
              {cargando ? "Actualizando..." : "Actualizar"}
            </button>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "18px", marginBottom: "22px" }}>
            {kpis.map((card, i) => (
              <div key={i} style={{ background: "#fff", padding: "20px 22px", borderRadius: "14px", border: `1px solid ${colors.borde}`, display: "flex", alignItems: "center", gap: "16px" }}>
                <div style={{ background: colors.naranjaClaro, padding: "13px", borderRadius: "10px", color: colors.naranja, fontSize: "17px" }}>{card.icon}</div>
                <div>
                  <p style={{ margin: 0, fontSize: "12px", color: colors.textoSec, fontWeight: "600" }}>{card.title}</p>
                  <p style={{ margin: "3px 0 0", fontSize: "24px", fontWeight: "800", color: colors.texto, fontFamily: "'Manrope', sans-serif" }}>{card.val}</p>
                </div>
              </div>
            ))}
          </div>

          <div style={{ background: "#fff", padding: "24px", borderRadius: "14px", border: `1px solid ${colors.borde}`, marginBottom: "20px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
              <h2 style={{ margin: 0, fontSize: "16px", fontWeight: "700", color: colors.texto, display: "flex", alignItems: "center", gap: "9px" }}>
                <FaLaptop style={{ color: colors.naranja }} /> Equipos Registrados Hoy
              </h2>
              <div style={{ display: "flex", border: `1px solid ${colors.borde}`, borderRadius: "9px", overflow: "hidden", background: "#fff" }}>
                <input
                  value={busqueda}
                  onChange={(e) => setBusqueda(e.target.value)}
                  placeholder="Buscar equipo..."
                  style={{ padding: "8px 12px", fontSize: "13px", outline: "none", border: "none", width: "230px" }}
                />
                <div style={{ background: colors.naranjaClaro, padding: "8px 16px", color: colors.naranja, fontSize: "13px", fontWeight: "700", borderLeft: `1px solid ${colors.borde}` }}>
                  {equiposFiltrados.length}
                </div>
              </div>
            </div>

            {cargando ? (
              <p style={{ fontSize: "13px", color: colors.textoMuted, textAlign: "center", padding: "24px 0" }}>Cargando...</p>
            ) : equiposFiltrados.length === 0 ? (
              <p style={{ fontSize: "13px", color: colors.textoMuted, textAlign: "center", padding: "24px 0" }}>
                No hay equipos registrados hoy todavía. Se llenará conforme se creen órdenes de servicio.
              </p>
            ) : (
              <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "13.5px" }}>
                <thead>
                  <tr style={{ borderBottom: `1px solid ${colors.borde}` }}>
                    {["ID", "Usuario", "Equipo", "Técnico", "Diagnóstico", "Estado", "Hora Salida"].map((h) => (
                      <th key={h} style={{ padding: "10px 12px", textAlign: "left", color: colors.textoSec, fontWeight: "700", fontSize: "12.5px" }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {equiposFiltrados.map((e) => {
                    const badge = badgeEstado(e.estado);
                    return (
                      <tr key={e.id} style={{ borderBottom: `1px solid ${colors.fondo}` }}>
                        <td style={{ padding: "12px", fontWeight: "700", color: colors.texto }}>#{e.id}</td>
                        <td style={{ padding: "12px", color: colors.texto }}>{e.usuario}</td>
                        <td style={{ padding: "12px", color: colors.texto }}>{e.equipo}</td>
                        <td style={{ padding: "12px", color: colors.textoSec }}>{e.tecnico}</td>
                        <td style={{ padding: "12px", color: colors.textoSec }}>{e.diagnostico}</td>
                        <td style={{ padding: "12px" }}>
                          <span style={{ padding: "3px 12px", borderRadius: "20px", fontSize: "11.5px", fontWeight: "700", background: badge.bg, color: badge.color }}>
                            {e.estado}
                          </span>
                        </td>
                        <td style={{ padding: "12px", color: colors.textoSec }}>{e.horaSalida}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px" }}>
            <div style={{ background: "#fff", padding: "22px", borderRadius: "14px", border: `1px solid ${colors.borde}` }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
                <h3 style={{ margin: 0, fontSize: "15px", fontWeight: "700", color: colors.texto, display: "flex", alignItems: "center", gap: "8px" }}>
                  <FaBoxes style={{ color: colors.naranja }} /> Salida de Suministros — Almacén
                </h3>
                <span onClick={() => navigate("/admin/almacen")} style={{ color: colors.naranja, fontSize: "11.5px", fontWeight: "700", cursor: "pointer" }}>Ver almacén completo →</span>
              </div>
              {(resumen?.salidasSuministro || []).length === 0 ? (
                <p style={{ fontSize: "13px", color: colors.textoMuted, padding: "10px 0" }}>Sin salidas de suministro registradas hoy.</p>
              ) : (
                <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "13px" }}>
                  <thead>
                    <tr style={{ borderBottom: `1px solid ${colors.borde}` }}>
                      {["Suministro", "Cant.", "Equipo Asociado", "Stock Restante"].map((h) => (
                        <th key={h} style={{ padding: "8px 10px", textAlign: "left", color: colors.textoSec, fontWeight: "700", fontSize: "11.5px" }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {resumen.salidasSuministro.map((s) => (
                      <tr key={s.id} style={{ borderBottom: `1px solid ${colors.fondo}` }}>
                        <td style={{ padding: "10px", color: colors.texto, fontWeight: "600" }}>{s.suministro}</td>
                        <td style={{ padding: "10px", color: colors.naranja, fontWeight: "700" }}>{s.cantidad}</td>
                        <td style={{ padding: "10px", color: colors.textoSec }}>{s.ordenId ? `#${s.ordenId}` : "—"}</td>
                        <td style={{ padding: "10px", color: colors.textoSec }}>{s.stockRestante} unidades</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>

            <div style={{ background: "#fff", padding: "22px", borderRadius: "14px", border: `1px solid ${colors.borde}` }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
                <h3 style={{ margin: 0, fontSize: "15px", fontWeight: "700", color: colors.texto, display: "flex", alignItems: "center", gap: "8px" }}>
                  <FaExchangeAlt style={{ color: colors.naranja }} /> Reporte de Movimientos
                </h3>
                <span onClick={() => navigate("/admin/movimientos")} style={{ color: colors.naranja, fontSize: "11.5px", fontWeight: "700", cursor: "pointer" }}>Ver historial completo →</span>
              </div>
              {(resumen?.movimientosRecientes || []).length === 0 ? (
                <p style={{ fontSize: "13px", color: colors.textoMuted, padding: "10px 0" }}>Sin movimientos registrados hoy.</p>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: "4px", maxHeight: "320px", overflowY: "auto" }}>
                  {resumen.movimientosRecientes.map((m) => (
                    <div key={m.id} style={{ display: "flex", gap: "12px", alignItems: "flex-start", padding: "10px 8px", borderBottom: `1px solid ${colors.fondo}` }}>
                      <div style={{ width: "30px", height: "30px", borderRadius: "50%", background: colors.naranjaClaro, color: colors.naranja, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "12px", flexShrink: 0 }}>
                        {iconoMovimiento(m.accion)}
                      </div>
                      <div style={{ flex: 1 }}>
                        <p style={{ margin: 0, fontSize: "13px", fontWeight: "700", color: colors.texto }}>{m.detalle || m.accion}</p>
                        <p style={{ margin: "2px 0 0", fontSize: "11.5px", color: colors.textoSec }}>{m.usuario}</p>
                      </div>
                      <span style={{ fontSize: "11px", color: colors.textoMuted, flexShrink: 0 }}>{m.hora}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}