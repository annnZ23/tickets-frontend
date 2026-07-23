import { useEffect, useState } from "react";
import Sidebar from "../components/Sidebar";
import Topbar from "../components/Topbar";
import { FaChartBar, FaFileExcel, FaStar, FaBuilding, FaRobot } from "react-icons/fa";
import TablaTickets from "../components/TablaTickets"; // ajusta la ruta si es necesario

const colors = {
  naranja: "#ff7f22", naranjaOscuro: "#e66a10", naranjaClaro: "#fff1e6",
  texto: "#1e293b", textoSec: "#64748b", textoMuted: "#94a3b8",
  borde: "#eef1f5", fondo: "#FFF7F2", verde: "#16a34a", verdeClaro: "#e9f9ee",
  rojo: "#dc2626", rojoClaro: "#fee2e2", amarillo: "#d97706", amarilloClaro: "#fef3e2",
};

const getIniciales = (email) => (email ? email.charAt(0).toUpperCase() : "U");

const formatearDuracion = (ms) => {
  if (ms == null || ms < 0) return "Sin datos";
  const horas = Math.floor(ms / 3600000);
  const minutos = Math.floor((ms % 3600000) / 60000);
  if (horas === 0) return `${minutos} min`;
  return `${horas}h ${minutos}min`;
};

export default function Reportes({ usuario, cerrarSesion }) {
  const [tickets, setTickets] = useState([]);
  const [porArea, setPorArea] = useState([]);
  const [porAsesor, setPorAsesor] = useState([]);
  const [estadisticas, setEstadisticas] = useState({
    totalTickets: 0, resueltos: 0, promedioSatisfaccion: null,
    areaTop: null, asesorTop: null, tiempoPromedioResolucionMs: null,
    generadosPorIA: 0,
  });
  const [tabActiva, setTabActiva] = useState("todos"); // "todos" | "area" | "asesor"
  const [loading, setLoading] = useState(true);
  const [exportando, setExportando] = useState(false);
  const [paginaActual, setPaginaActual] = useState(1);
  const [totalPaginas, setTotalPaginas] = useState(1);
  const user = usuario || JSON.parse(localStorage.getItem("user") || "null");
  const token = localStorage.getItem("token");
  const headers = { Authorization: `Bearer ${token}` };

  useEffect(() => {
    let unmounted = false;
    const obtenerDatos = async () => {
      try {
        setLoading(true);
        const [resTickets, resStats, resArea, resAsesor] = await Promise.all([
          fetch(`https://sistema-tickets-it.onrender.com/api/reportes/todos?page=${paginaActual}&limit=15`, { headers }),
          fetch("https://sistema-tickets-it.onrender.com/api/reportes/estadisticas", { headers }),
          fetch("https://sistema-tickets-it.onrender.com/api/reportes/por-area", { headers }),
          fetch("https://sistema-tickets-it.onrender.com/api/reportes/por-asesor", { headers }),
        ]);
        const dataTickets = await resTickets.json();
        const dataStats = await resStats.json();
        const dataArea = await resArea.json();
        const dataAsesor = await resAsesor.json();
        if (!unmounted) {
          setTickets(Array.isArray(dataTickets.tickets) ? dataTickets.tickets : []);
          setTotalPaginas(dataTickets.meta?.totalPages || 1);
          setEstadisticas(dataStats);
          setPorArea(Array.isArray(dataArea) ? dataArea : []);
          setPorAsesor(Array.isArray(dataAsesor) ? dataAsesor : []);
          setLoading(false);
        }
      } catch (err) {
        console.error("Error cargando reportes:", err);
        if (!unmounted) setLoading(false);
      }
    };
    obtenerDatos();
    return () => { unmounted = true; };
  }, [token, paginaActual]);

  const manejarExportacion = async () => {
    setExportando(true);
    try {
      const res = await fetch(`https://sistema-tickets-it.onrender.com/api/reportes/exportar?vista=${tabActiva}`, { headers });
      if (!res.ok) throw new Error("No se pudo generar el archivo");
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `Reporte_Baprosa_Tickets_${Date.now()}.xlsx`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error("Error exportando:", err);
      alert("No se pudo exportar el reporte.");
    } finally {
      setExportando(false);
    }
  };

  const kpis = [
    { label: "Histórico Total Creados", valor: estadisticas.totalTickets || 0, icon: <FaChartBar />, bg: colors.naranjaClaro, color: colors.naranja },
    { label: "Tickets Finalizados", valor: estadisticas.resueltos || 0, icon: <FaChartBar />, bg: colors.verdeClaro, color: colors.verde },
    { label: "Área con más tickets", valor: estadisticas.areaTop ? `${estadisticas.areaTop.nombre} (${estadisticas.areaTop.cantidad})` : "Sin datos", icon: <FaBuilding />, bg: colors.amarilloClaro, color: colors.amarillo },
    { label: "Generados por el Chatbot (IA)", valor: estadisticas.generadosPorIA || 0, icon: <FaRobot />, bg: "#e0f2fe", color: "#0284c7" },
    { label: "Promedio de Satisfacción", valor: estadisticas.promedioSatisfaccion ? `${estadisticas.promedioSatisfaccion} ★` : "Sin datos", icon: <FaStar />, bg: colors.amarilloClaro, color: colors.amarillo },
  ];

  const tabs = [
    { id: "todos", label: "Todos los tickets" },
    { id: "area", label: "Por área" },
    { id: "asesor", label: "Por asesor" },
  ];

  return (
    <div style={{ display: "flex", minHeight: "100vh", backgroundColor: colors.fondo, fontFamily: "'Segoe UI', sans-serif" }}>
      <link href="https://fonts.googleapis.com/css2?family=Manrope:wght@500;700;800&display=swap" rel="stylesheet" />
      <Sidebar usuario={user} cerrarSesion={cerrarSesion} />
      <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>
        <Topbar usuario={user} cerrarSesion={cerrarSesion} />

        <div style={{ flex: 1, overflowY: "auto", padding: "24px 28px" }}>
          {/* Header */}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "22px" }}>
            <div>
              <h1 style={{ margin: 0, fontSize: "20px", fontWeight: "800", color: colors.texto, fontFamily: "'Manrope', sans-serif", display: "flex", alignItems: "center", gap: "9px" }}>
                <FaChartBar style={{ color: colors.naranja, fontSize: "18px" }} /> Historial de Reportes y Auditoría IT
              </h1>
              <p style={{ margin: 0, fontSize: "12px", color: colors.textoSec }}>Estadísticas generales y exportación de tickets</p>
            </div>
            <button
              onClick={manejarExportacion}
              disabled={exportando}
              style={{ display: "flex", alignItems: "center", gap: "8px", background: colors.verde, color: "white", border: "none", padding: "10px 18px", borderRadius: "9px", fontWeight: "700", fontSize: "13px", cursor: exportando ? "default" : "pointer", opacity: exportando ? 0.7 : 1, fontFamily: "inherit" }}
            >
              <FaFileExcel /> {exportando ? "Generando..." : "Exportar a Excel"}
            </button>
          </div>

          {/* KPIs */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "16px", marginBottom: "22px" }}>
            {kpis.map((k) => (
              <div key={k.label} style={{ background: "#fff", borderRadius: "12px", border: `1px solid ${colors.borde}`, padding: "18px 20px" }}>
                <div style={{ width: "34px", height: "34px", borderRadius: "9px", background: k.bg, color: k.color, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "15px", marginBottom: "12px" }}>
                  {k.icon}
                </div>
                <h3 style={{ margin: 0, fontSize: "20px", fontWeight: "800", color: colors.texto, fontFamily: "'Manrope', sans-serif" }}>{k.valor}</h3>
                <p style={{ margin: "3px 0 0", fontSize: "12.5px", color: colors.textoSec }}>{k.label}</p>
              </div>
            ))}
          </div>

          {/* Tabs */}
          <div style={{ display: "flex", gap: "8px", marginBottom: "14px" }}>
            {tabs.map((t) => (
              <button
                key={t.id}
                onClick={() => setTabActiva(t.id)}
                style={{
                  padding: "9px 16px", borderRadius: "8px", fontSize: "13px", fontWeight: "700", cursor: "pointer",
                  border: `1px solid ${tabActiva === t.id ? colors.naranja : colors.borde}`,
                  background: tabActiva === t.id ? colors.naranjaClaro : "#fff",
                  color: tabActiva === t.id ? colors.naranja : colors.textoSec,
                }}
              >
                {t.label}
              </button>
            ))}
          </div>

          {tabActiva === "todos" && (
            <>
              <TablaTickets
                tickets={tickets}
                usuario={user}
                colors={colors}
                cargando={loading}
                error={null}
                modoHistorial={true}
                onAbrirTicket={null}
              />
              <div style={{ display: "flex", justifyContent: "center", gap: "10px", marginTop: "14px" }}>
                <button disabled={paginaActual <= 1} onClick={() => setPaginaActual((p) => p - 1)} style={{ padding: "6px 14px", borderRadius: "7px", border: `1px solid ${colors.borde}`, background: "#fff", cursor: paginaActual <= 1 ? "default" : "pointer", opacity: paginaActual <= 1 ? 0.5 : 1 }}>Anterior</button>
                <span style={{ fontSize: "13px", color: colors.textoSec, alignSelf: "center" }}>Página {paginaActual} de {totalPaginas}</span>
                <button disabled={paginaActual >= totalPaginas} onClick={() => setPaginaActual((p) => p + 1)} style={{ padding: "6px 14px", borderRadius: "7px", border: `1px solid ${colors.borde}`, background: "#fff", cursor: paginaActual >= totalPaginas ? "default" : "pointer", opacity: paginaActual >= totalPaginas ? 0.5 : 1 }}>Siguiente</button>
              </div>
            </>
          )}

          {tabActiva === "area" && (
            <div style={{ background: "#fff", borderRadius: "12px", border: `1px solid ${colors.borde}`, overflow: "hidden" }}>
              <div style={{ padding: "16px 20px", borderBottom: `1px solid ${colors.borde}` }}>
                <h3 style={{ margin: 0, fontSize: "14px", fontWeight: "700", color: colors.texto }}>Tickets generados por área</h3>
              </div>
              <table style={{ width: "100%", borderCollapse: "collapse" }}>
                <thead>
                  <tr style={{ background: colors.fondo, color: colors.textoSec, fontSize: "12px" }}>
                    <th style={{ padding: "12px 16px", textAlign: "left" }}>Área</th>
                    <th style={{ padding: "12px 16px", textAlign: "left" }}>Tickets generados</th>
                  </tr>
                </thead>
                <tbody>
                  {porArea.length === 0 ? (
                    <tr><td colSpan="2" style={{ padding: "30px", textAlign: "center", color: colors.textoMuted }}>Sin datos</td></tr>
                  ) : porArea.map((a) => (
                    <tr key={a.nombre} style={{ borderBottom: `1px solid ${colors.fondo}` }}>
                      <td style={{ padding: "12px 16px", fontWeight: "600" }}>{a.nombre}</td>
                      <td style={{ padding: "12px 16px" }}>{a.cantidad}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {tabActiva === "asesor" && (
            <div style={{ background: "#fff", borderRadius: "12px", border: `1px solid ${colors.borde}`, overflow: "hidden" }}>
              <div style={{ padding: "16px 20px", borderBottom: `1px solid ${colors.borde}` }}>
                <h3 style={{ margin: 0, fontSize: "14px", fontWeight: "700", color: colors.texto }}>Tickets atendidos por asesor</h3>
              </div>
              <table style={{ width: "100%", borderCollapse: "collapse" }}>
                <thead>
                  <tr style={{ background: colors.fondo, color: colors.textoSec, fontSize: "12px" }}>
                    <th style={{ padding: "12px 16px", textAlign: "left" }}>Asesor</th>
                    <th style={{ padding: "12px 16px", textAlign: "left" }}>Asignados</th>
                    <th style={{ padding: "12px 16px", textAlign: "left" }}>Resueltos</th>
                    <th style={{ padding: "12px 16px", textAlign: "left" }}>Tiempo prom. resolución</th>
                  </tr>
                </thead>
                <tbody>
                  {porAsesor.length === 0 ? (
                    <tr><td colSpan="4" style={{ padding: "30px", textAlign: "center", color: colors.textoMuted }}>Sin datos</td></tr>
                  ) : porAsesor.map((a) => (
                    <tr key={a.nombre} style={{ borderBottom: `1px solid ${colors.fondo}` }}>
                      <td style={{ padding: "12px 16px", fontWeight: "600" }}>{a.nombre}</td>
                      <td style={{ padding: "12px 16px" }}>{a.asignados}</td>
                      <td style={{ padding: "12px 16px" }}>{a.resueltos}</td>
                      <td style={{ padding: "12px 16px" }}>{formatearDuracion(a.tiempoPromedioMs)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
