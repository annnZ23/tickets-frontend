import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import baprosaLogo from "../assets/baprosa-logo.png";
import * as XLSX from "xlsx";
import {
  FaRegBell, FaRegEnvelope, FaChevronDown, FaArrowLeft, FaExchangeAlt,
  FaFileExcel, FaSearch, FaLaptop, FaTicketAlt, FaCog, FaBoxOpen,
  FaClipboardList, FaSyncAlt, FaQuestion,
} from "react-icons/fa";

const URLS_MOVIMIENTOS = [
  "https://sistema-tickets-it.onrender.com/api/movimientos",
  "https://sistema-tickets-it.onrender.com/api/movimientos/todos",
  "https://sistema-tickets-it.onrender.com/api/movimientos/recientes",
  "https://sistema-tickets-it.onrender.com/api/registro-salida/movimientos",
  "https://sistema-tickets-it.onrender.com/api/salidas/movimientos",
];

const colors = {
  naranja: "#ff7f22", naranjaOscuro: "#e66a10", naranjaClaro: "#fff1e6",
  texto: "#1e293b", textoSec: "#64748b", textoMuted: "#94a3b8",
  borde: "#eef1f5", fondo: "#FFF7F2", verde: "#16a34a", verdeClaro: "#e9f9ee",
  rojo: "#dc2626", azul: "#2563eb", azulClaro: "#eff6ff",
  morado: "#7c3aed", moradoClaro: "#f3e8ff", amarillo: "#d97706", amarilloClaro: "#fef3c7",
};

const MESES = ["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"];

const CATEGORIAS = [
  { key: "tickets", label: "Tickets", icon: <FaTicketAlt />, color: colors.naranja, bg: colors.naranjaClaro, test: (d) => /ticket|pausado|reanudado|resuelto|encuesta/i.test(d) },
  { key: "equipos", label: "Registro de Equipos", icon: <FaLaptop />, color: colors.azul, bg: colors.azulClaro, test: (d) => /equipo|reasign|folio/i.test(d) },
  { key: "suministros", label: "Salida de Suministros", icon: <FaBoxOpen />, color: colors.verde, bg: colors.verdeClaro, test: (d) => /suministro|salida|almac[eé]n|bodega/i.test(d) },
  { key: "subtareas", label: "Sub-tareas / Tareas", icon: <FaClipboardList />, color: colors.morado, bg: colors.moradoClaro, test: (d) => /sub-?tarea|tarea/i.test(d) },
  { key: "configuracion", label: "Configuración", icon: <FaCog />, color: colors.amarillo, bg: colors.amarilloClaro, test: (d) => /configuraci[oó]n|sla|usuario creado|rol|área/i.test(d) },
];

const categoriaDe = (descripcion) => {
  const d = descripcion || "";
  for (const c of CATEGORIAS) if (c.test(d)) return c;
  return { key: "otros", label: "Otros", icon: <FaQuestion />, color: colors.textoSec, bg: "#f1f5f9" };
};

const normalizar = (m) => ({
  id: m.id,
  descripcion:
    m.descripcion ||
    m.detalle ||
    [m.titulo, m.accion].filter(Boolean).join(" — ") ||
    "Movimiento sin descripción",
  usuario:
    (typeof m.usuario === "string" ? m.usuario : m.usuario?.name) ||
    m.usuarioNombre || m.autor || m.realizadoPor || m.enviadoPor || m.hechoPor || "Sistema",
  fecha: new Date(m.creadoAt || m.fecha || m.createdAt),
});

const getIniciales = (name) => {
  if (!name) return "A";
  const p = name.trim().split(" ");
  return p.length > 1 ? `${p[0][0]}${p[1][0]}`.toUpperCase() : p[0][0].toUpperCase();
};

const inicioSemana = () => {
  const hoy = new Date();
  const dia = hoy.getDay() === 0 ? 7 : hoy.getDay(); 
  const lunes = new Date(hoy);
  lunes.setDate(hoy.getDate() - dia + 1);
  lunes.setHours(0, 0, 0, 0);
  return lunes;
};

export default function HistorialMovimientos({ usuario, cerrarSesion }) {
  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  const [movimientos, setMovimientos] = useState([]);
  const [cargando, setCargando] = useState(true);
  const anioActual = new Date().getFullYear();
  const [anio, setAnio] = useState(anioActual);
  const [mes, setMes] = useState("todos"); 
  const [soloSemana, setSoloSemana] = useState(false);
  const [categoria, setCategoria] = useState("todas");
  const [busqueda, setBusqueda] = useState("");

  useEffect(() => {
    const cargar = async () => {
      for (const url of URLS_MOVIMIENTOS) {
        try {
          const r = await fetch(url, { headers: { Authorization: `Bearer ${token}` } });
          if (!r.ok) continue;
          const data = await r.json();
          const lista = Array.isArray(data) ? data : data.movimientos || data.datos || data.data || data.resultados || null;
          if (Array.isArray(lista)) {
            console.log(`Movimientos cargados desde: ${url} (${lista.length})`);
            setMovimientos(lista.map(normalizar).sort((a, b) => b.fecha - a.fecha));
            setCargando(false);
            return;
          }
        } catch (e) {
          console.warn(`Falló ${url}:`, e.message);
        }
      }
      console.error("Ningún endpoint de movimientos respondió. Revisa URLS_MOVIMIENTOS.");
      setCargando(false);
    };
    cargar();
  }, []);

  const aniosDisponibles = useMemo(() => {
    const set = new Set(movimientos.map((m) => m.fecha.getFullYear()));
    set.add(anioActual);
    return [...set].sort((a, b) => b - a);
  }, [movimientos, anioActual]);

  const filtrados = useMemo(() => {
    const lunes = inicioSemana();
    return movimientos.filter((m) => {
      if (soloSemana) {
        if (m.fecha < lunes) return false;
      } else {
        if (m.fecha.getFullYear() !== Number(anio)) return false;
        if (mes !== "todos" && m.fecha.getMonth() !== Number(mes)) return false;
      }
      if (categoria !== "todas" && categoriaDe(m.descripcion).key !== categoria) return false;
      if (busqueda.trim()) {
        const q = busqueda.trim().toLowerCase();
        if (!m.descripcion.toLowerCase().includes(q) && !m.usuario.toLowerCase().includes(q)) return false;
      }
      return true;
    });
  }, [movimientos, anio, mes, soloSemana, categoria, busqueda]);

  const conteoCategorias = useMemo(() => {
    const mapa = {};
    filtrados.forEach((m) => {
      const c = categoriaDe(m.descripcion).key;
      mapa[c] = (mapa[c] || 0) + 1;
    });
    return mapa;
  }, [filtrados]);
  const exportarExcel = () => {
    if (filtrados.length === 0) { alert("No hay movimientos para exportar con estos filtros"); return; }

    const aFila = (m) => ({
      "Fecha": m.fecha.toLocaleDateString("es-HN", { day: "2-digit", month: "2-digit", year: "numeric" }),
      "Hora": m.fecha.toLocaleTimeString("es-HN", { hour: "2-digit", minute: "2-digit" }),
      "Usuario": m.usuario,
      "Categoría": categoriaDe(m.descripcion).label,
      "Descripción del movimiento": m.descripcion,
    });

    const wb = XLSX.utils.book_new();

    if (soloSemana || mes !== "todos") {
      const nombreHoja = soloSemana ? "Semana actual" : `${MESES[Number(mes)]} ${anio}`;
      const ws = XLSX.utils.json_to_sheet(filtrados.map(aFila));
      ws["!cols"] = [{ wch: 12 }, { wch: 10 }, { wch: 26 }, { wch: 22 }, { wch: 70 }];
      XLSX.utils.book_append_sheet(wb, ws, nombreHoja.slice(0, 31));
    } else {
      for (let i = 0; i < 12; i++) {
        const delMes = filtrados.filter((m) => m.fecha.getMonth() === i);
        if (delMes.length === 0) continue;
        const ws = XLSX.utils.json_to_sheet(delMes.map(aFila));
        ws["!cols"] = [{ wch: 12 }, { wch: 10 }, { wch: 26 }, { wch: 22 }, { wch: 70 }];
        XLSX.utils.book_append_sheet(wb, ws, `${MESES[i]} ${anio}`.slice(0, 31));
      }
    }

    const nombre = soloSemana
      ? `movimientos_semana_${new Date().toISOString().slice(0, 10)}.xlsx`
      : mes !== "todos"
      ? `movimientos_${MESES[Number(mes)].toLowerCase()}_${anio}.xlsx`
      : `movimientos_${anio}.xlsx`;

    XLSX.writeFile(wb, nombre);
  };

  const btnFiltro = (activo) => ({
    padding: "8px 14px", borderRadius: "9px", fontSize: "12.5px", fontWeight: "700",
    cursor: "pointer", fontFamily: "inherit", whiteSpace: "nowrap",
    border: `1px solid ${activo ? colors.naranja : colors.borde}`,
    background: activo ? colors.naranjaClaro : "#fff",
    color: activo ? colors.naranja : colors.textoSec,
  });

  const selectStyle = {
    padding: "8px 12px", borderRadius: "9px", border: `1px solid ${colors.borde}`,
    fontSize: "12.5px", fontWeight: "600", color: colors.texto, outline: "none",
    background: "#fff", cursor: "pointer", fontFamily: "inherit",
  };

  return (
    <div style={{ display: "flex", minHeight: "100vh", backgroundColor: colors.fondo, fontFamily: "'Segoe UI', sans-serif" }}>
      <link href="https://fonts.googleapis.com/css2?family=Manrope:wght@500;700;800&display=swap" rel="stylesheet" />
      <Sidebar usuario={usuario} cerrarSesion={cerrarSesion} />

      <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>
       
        <div style={{ height: "65px", backgroundColor: "#fff", borderBottom: `1px solid ${colors.borde}`, boxShadow: "0 1px 4px rgba(15,23,42,0.04)", display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 28px", flexShrink: 0 }}>
          <img src={baprosaLogo} alt="Baprosa" style={{ height: "46px", objectFit: "contain" }} />
          <div style={{ display: "flex", alignItems: "center", gap: "20px" }}>
            <FaRegEnvelope style={{ color: colors.textoMuted, fontSize: "20px" }} />
            <FaRegBell style={{ color: colors.textoMuted, fontSize: "20px" }} />
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
         
          <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: "12px", marginBottom: "20px", flexWrap: "wrap" }}>
            <div style={{ display: "flex", gap: "12px", alignItems: "flex-start" }}>
              <button onClick={() => navigate("/admin/registro-salida")}
                style={{ width: "34px", height: "34px", borderRadius: "50%", background: "#fff", border: `1px solid ${colors.borde}`, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", color: colors.textoSec, fontSize: "13px", flexShrink: 0, marginTop: "4px" }}>
                <FaArrowLeft />
              </button>
              <div>
                <h1 style={{ margin: 0, fontSize: "20px", fontWeight: "800", color: colors.texto, fontFamily: "'Manrope', sans-serif", display: "flex", alignItems: "center", gap: "10px" }}>
                  <FaExchangeAlt style={{ color: colors.naranja, fontSize: "17px" }} /> Movimientos del Sistema
                </h1>
                <p style={{ margin: 0, fontSize: "12px", color: colors.textoSec }}>
                  Vista previa de la bitácora completa — quién hizo qué, cuándo y a qué hora. Filtra y exporta a Excel.
                </p>
              </div>
            </div>
            <button onClick={exportarExcel}
              style={{ display: "flex", alignItems: "center", gap: "8px", padding: "10px 20px", borderRadius: "9px", border: "none", background: colors.verde, color: "white", fontSize: "13px", fontWeight: "700", cursor: "pointer", fontFamily: "inherit" }}
              onMouseEnter={(e) => (e.currentTarget.style.background = "#15803d")}
              onMouseLeave={(e) => (e.currentTarget.style.background = colors.verde)}>
              <FaFileExcel style={{ fontSize: "15px" }} /> Exportar Excel
            </button>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(6, 1fr)", gap: "12px", marginBottom: "18px" }}>
            <button onClick={() => setCategoria("todas")}
              style={{ ...btnFiltro(categoria === "todas"), display: "flex", flexDirection: "column", alignItems: "center", gap: "6px", padding: "14px 8px", borderRadius: "12px", borderWidth: "1.5px" }}>
              <FaSyncAlt style={{ fontSize: "16px" }} />
              <span style={{ fontSize: "12px" }}>Todas</span>
              <span style={{ fontSize: "11px", fontWeight: "600", opacity: 0.8 }}>{filtrados.length + (categoria !== "todas" ? 0 : 0)} mov.</span>
            </button>
            {CATEGORIAS.map((c) => (
              <button key={c.key} onClick={() => setCategoria(categoria === c.key ? "todas" : c.key)}
                style={{
                  display: "flex", flexDirection: "column", alignItems: "center", gap: "6px", padding: "14px 8px",
                  borderRadius: "12px", cursor: "pointer", fontFamily: "inherit",
                  border: `1.5px solid ${categoria === c.key ? c.color : colors.borde}`,
                  background: categoria === c.key ? c.bg : "#fff",
                }}>
                <span style={{ fontSize: "16px", color: c.color, display: "flex" }}>{c.icon}</span>
                <span style={{ fontSize: "12px", fontWeight: "700", color: colors.texto, textAlign: "center", lineHeight: 1.2 }}>{c.label}</span>
                <span style={{ fontSize: "11px", color: colors.textoSec, fontWeight: "600" }}>{conteoCategorias[c.key] || 0} mov.</span>
              </button>
            ))}
          </div>

          <div style={{ background: "#fff", borderRadius: "12px", border: `1px solid ${colors.borde}`, padding: "14px 18px", marginBottom: "16px", display: "flex", gap: "10px", alignItems: "center", flexWrap: "wrap" }}>
            <button onClick={() => setSoloSemana((v) => !v)} style={btnFiltro(soloSemana)}>
              Esta semana
            </button>
            <div style={{ width: "1px", height: "24px", background: colors.borde }} />
            <select value={anio} onChange={(e) => { setAnio(e.target.value); setSoloSemana(false); }} style={selectStyle} disabled={soloSemana}>
              {aniosDisponibles.map((a) => <option key={a} value={a}>{a}</option>)}
            </select>
            <select value={mes} onChange={(e) => { setMes(e.target.value); setSoloSemana(false); }} style={selectStyle} disabled={soloSemana}>
              <option value="todos">Todos los meses</option>
              {MESES.map((m, i) => <option key={m} value={i}>{m}</option>)}
            </select>
            <div style={{ position: "relative", flex: 1, minWidth: "200px", maxWidth: "320px", marginLeft: "auto" }}>
              <FaSearch style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)", color: colors.textoMuted, fontSize: "12px" }} />
              <input value={busqueda} onChange={(e) => setBusqueda(e.target.value)}
                placeholder="Buscar por usuario o descripción..."
                style={{ width: "100%", padding: "8px 12px 8px 32px", borderRadius: "9px", border: `1px solid ${colors.borde}`, fontSize: "12.5px", outline: "none", boxSizing: "border-box", fontFamily: "inherit" }}
                onFocus={(e) => (e.target.style.borderColor = colors.naranja)}
                onBlur={(e) => (e.target.style.borderColor = colors.borde)} />
            </div>
          </div>

          <div style={{ background: "#fff", borderRadius: "12px", border: `1px solid ${colors.borde}`, padding: "20px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "14px" }}>
              <h3 style={{ margin: 0, fontSize: "14px", fontWeight: "700", color: colors.texto }}>
                Vista previa {soloSemana ? "— Semana actual" : mes !== "todos" ? `— ${MESES[Number(mes)]} ${anio}` : `— Año ${anio} (el Excel saldrá con una hoja por mes)`}
              </h3>
              <span style={{ fontSize: "12px", color: colors.textoSec, fontWeight: "600" }}>
                {filtrados.length} movimiento{filtrados.length !== 1 ? "s" : ""}
              </span>
            </div>

            {cargando ? (
              <p style={{ fontSize: "13px", color: colors.textoSec, textAlign: "center", padding: "30px 0" }}>Cargando movimientos...</p>
            ) : filtrados.length === 0 ? (
              <p style={{ fontSize: "13px", color: colors.textoSec, textAlign: "center", padding: "30px 0" }}>No hay movimientos con estos filtros.</p>
            ) : (
              <div style={{ overflowX: "auto" }}>
                <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "12.5px" }}>
                  <thead>
                    <tr style={{ background: colors.naranjaClaro }}>
                      {["Fecha", "Hora", "Usuario", "Categoría", "Descripción del movimiento"].map((h) => (
                        <th key={h} style={{ textAlign: "left", padding: "11px 10px", color: colors.texto, fontWeight: "700", fontSize: "11.5px", whiteSpace: "nowrap" }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {filtrados.slice(0, 200).map((m) => {
                      const c = categoriaDe(m.descripcion);
                      return (
                        <tr key={m.id} style={{ borderBottom: `1px solid ${colors.fondo}` }}>
                          <td style={{ padding: "10px", color: colors.texto, fontWeight: "600", whiteSpace: "nowrap" }}>
                            {m.fecha.toLocaleDateString("es-HN", { day: "2-digit", month: "2-digit", year: "numeric" })}
                          </td>
                          <td style={{ padding: "10px", color: colors.textoSec, whiteSpace: "nowrap" }}>
                            {m.fecha.toLocaleTimeString("es-HN", { hour: "2-digit", minute: "2-digit" })}
                          </td>
                          <td style={{ padding: "10px", color: colors.texto, fontWeight: "600", whiteSpace: "nowrap" }}>{m.usuario}</td>
                          <td style={{ padding: "10px" }}>
                            <span style={{ display: "inline-flex", alignItems: "center", gap: "6px", fontSize: "10.5px", fontWeight: "700", padding: "3px 10px", borderRadius: "20px", background: c.bg, color: c.color, whiteSpace: "nowrap" }}>
                              {c.icon} {c.label}
                            </span>
                          </td>
                          <td style={{ padding: "10px", color: colors.textoSec }}>{m.descripcion}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
                {filtrados.length > 200 && (
                  <p style={{ fontSize: "11.5px", color: colors.textoSec, textAlign: "center", marginTop: "12px" }}>
                    Mostrando 200 de {filtrados.length} en pantalla — el Excel exportado sí incluye todos.
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
