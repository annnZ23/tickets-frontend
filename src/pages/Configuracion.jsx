import { useState, useEffect } from "react";
import Sidebar from "../components/Sidebar";
import Topbar from "../components/Topbar";
import { FaCog, FaClock, FaSave, FaPlus, FaTrash, FaGlobe } from "react-icons/fa";

const colors = {
  naranja: "#ff7f22", naranjaOscuro: "#e66a10", naranjaClaro: "#fff1e6",
  texto: "#1e293b", textoSec: "#64748b", textoMuted: "#94a3b8",
  borde: "#eef1f5", fondo: "#FFF7F2", verde: "#16a34a", verdeClaro: "#e9f9ee",
  rojo: "#dc2626", azul: "#2563eb", azulClaro: "#eff6ff",
};

const colorPrioridad = (p) => {
  const v = p?.toLowerCase();
  if (v === "urgente") return "#7c3aed";
  if (v === "alta") return colors.rojo;
  if (v === "media") return colors.naranja;
  return colors.verde;
};

const PRIORIDADES = ["Urgente", "Alta", "Media", "Baja"];
const ORDEN_PRIORIDAD = { Urgente: 0, Alta: 1, Media: 2, Baja: 3 };

const inputStyle = {
  padding: "8px 10px", borderRadius: "7px", border: `1px solid ${colors.borde}`,
  fontSize: "12.5px", outline: "none", fontFamily: "inherit",
};

export default function Configuracion({ usuario, cerrarSesion }) {
  const token = localStorage.getItem("token");
  const authHeaders = () => ({ Authorization: `Bearer ${token}` });

  const [slaConfig, setSlaConfig] = useState([]);
  const [areasIT, setAreasIT] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [guardandoId, setGuardandoId] = useState(null);
  const [guardadoOkId, setGuardadoOkId] = useState(null);
  const [eliminandoId, setEliminandoId] = useState(null);

  const cargarTodo = async () => {
    setCargando(true);
    try {
      const [resSla, resAreas] = await Promise.all([
        fetch("https://sistema-tickets-it.onrender.com/api/sla", { headers: authHeaders() }),
        fetch("https://sistema-tickets-it.onrender.com/api/areas-it-chat"), 
      ]);
      const dataSla = await resSla.json();
      const dataAreas = await resAreas.json();
      setSlaConfig(Array.isArray(dataSla) ? dataSla : []);
      setAreasIT(Array.isArray(dataAreas) ? dataAreas : []);
    } catch (err) {
      console.error(err);
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => { cargarTodo(); }, []);

  const actualizarHoras = (id, horas) => {
    setSlaConfig((prev) => prev.map((s) => (s.id === id ? { ...s, horasRespuesta: horas } : s)));
  };

  const guardar = async (item) => {
    setGuardandoId(item.id);
    try {
      const res = await fetch(`https://sistema-tickets-it.onrender.com/api/sla/${item.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", ...authHeaders() },
        body: JSON.stringify({ horasRespuesta: item.horasRespuesta }),
      });
      if (!res.ok) {
        const data = await res.json();
        alert(data.message || "No se pudo guardar");
        return;
      }
      setGuardadoOkId(item.id);
      setTimeout(() => setGuardadoOkId(null), 1800);
    } catch (err) {
      console.error(err);
      alert("Error al guardar");
    } finally {
      setGuardandoId(null);
    }
  };

  const eliminar = async (item) => {
    if (!window.confirm(`¿Eliminar el SLA de "${item.prioridad}" para ${item.area?.nombre || "esta área"}?`)) return;
    setEliminandoId(item.id);
    try {
      const res = await fetch(`https://sistema-tickets-it.onrender.com/api/sla/${item.id}`, {
        method: "DELETE",
        headers: authHeaders(),
      });
      if (!res.ok) {
        const data = await res.json();
        alert(data.message || "No se pudo eliminar");
        return;
      }
      cargarTodo();
    } catch (err) {
      console.error(err);
      alert("Error al eliminar");
    } finally {
      setEliminandoId(null);
    }
  };

  const [nuevaAreaId, setNuevaAreaId] = useState("");
  const [nuevaPrioridad, setNuevaPrioridad] = useState("Alta");
  const [nuevasHoras, setNuevasHoras] = useState("");
  const [guardandoNuevo, setGuardandoNuevo] = useState(false);

  const agregarSLA = async (e) => {
    e.preventDefault();
    if (!nuevasHoras || Number(nuevasHoras) <= 0) {
      alert("Ingresa un número de horas válido");
      return;
    }
    setGuardandoNuevo(true);
    try {
      const res = await fetch("https://sistema-tickets-it.onrender.com/api/sla", {
        method: "POST",
        headers: { "Content-Type": "application/json", ...authHeaders() },
        body: JSON.stringify({
          areaId: nuevaAreaId || null,
          prioridad: nuevaPrioridad,
          horasRespuesta: Number(nuevasHoras),
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        alert(data.message || "No se pudo crear el SLA");
        return;
      }
      setNuevaAreaId("");
      setNuevaPrioridad("Alta");
      setNuevasHoras("");
      cargarTodo();
    } catch (err) {
      console.error(err);
      alert("Error al crear el SLA");
    } finally {
      setGuardandoNuevo(false);
    }
  };

  const agrupados = (() => {
    const grupos = {};
    slaConfig.forEach((s) => {
      const clave = s.areaId ?? "general";
      if (!grupos[clave]) grupos[clave] = { area: s.area || null, items: [] };
      grupos[clave].items.push(s);
    });
    Object.values(grupos).forEach((g) => g.items.sort((a, b) => (ORDEN_PRIORIDAD[a.prioridad] ?? 99) - (ORDEN_PRIORIDAD[b.prioridad] ?? 99)));
    const claves = Object.keys(grupos).sort((a, b) => (a === "general" ? -1 : b === "general" ? 1 : (grupos[a].area?.nombre || "").localeCompare(grupos[b].area?.nombre || "")));
    return claves.map((clave) => ({ clave, ...grupos[clave] }));
  })();

  const FilaSLA = ({ item, esGeneral }) => (
    <div style={{ display: "flex", alignItems: "center", gap: "14px", padding: "12px 14px", background: colors.fondo, borderRadius: "10px" }}>
      <span style={{ width: "10px", height: "10px", borderRadius: "50%", background: colorPrioridad(item.prioridad), flexShrink: 0 }} />
      <span style={{ flex: 1, fontSize: "13.5px", fontWeight: "700", color: colors.texto }}>{item.prioridad}</span>
      <input
        type="number"
        min="0.5"
        step="0.5"
        value={item.horasRespuesta}
        onChange={(e) => actualizarHoras(item.id, e.target.value)}
        style={{ ...inputStyle, width: "80px", textAlign: "center" }}
      />
      <span style={{ fontSize: "12px", color: colors.textoSec, width: "36px" }}>horas</span>
      <button
        onClick={() => guardar(item)}
        disabled={guardandoId === item.id}
        style={{
          display: "flex", alignItems: "center", gap: "6px", padding: "7px 14px", borderRadius: "8px", border: "none",
          background: guardadoOkId === item.id ? colors.verde : colors.naranja, color: "white",
          fontSize: "12px", fontWeight: "700", cursor: "pointer", fontFamily: "inherit", whiteSpace: "nowrap",
        }}
      >
        <FaSave style={{ fontSize: "10px" }} /> {guardadoOkId === item.id ? "Guardado" : guardandoId === item.id ? "Guardando..." : "Guardar"}
      </button>
      {!esGeneral && (
        <button
          onClick={() => eliminar(item)}
          disabled={eliminandoId === item.id}
          title="Eliminar este SLA"
          style={{ padding: "7px 9px", borderRadius: "8px", border: `1px solid ${colors.borde}`, background: "#fff", color: colors.rojo, cursor: "pointer" }}
        >
          <FaTrash style={{ fontSize: "11px" }} />
        </button>
      )}
    </div>
  );

  return (
    <div style={{ display: "flex", minHeight: "100vh", backgroundColor: colors.fondo, fontFamily: "'Segoe UI', sans-serif" }}>
      <link href="https://fonts.googleapis.com/css2?family=Manrope:wght@500;700;800&display=swap" rel="stylesheet" />
      <Sidebar usuario={usuario} cerrarSesion={cerrarSesion} />

      <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>
        <Topbar usuario={usuario} cerrarSesion={cerrarSesion} />

        <div style={{ flex: 1, overflowY: "auto", padding: "24px 28px" }}>
          <h1 style={{ margin: "0 0 4px", fontSize: "20px", fontWeight: "800", color: colors.texto, fontFamily: "'Manrope', sans-serif", display: "flex", alignItems: "center", gap: "9px" }}>
            <FaCog style={{ color: colors.naranja, fontSize: "18px" }} /> Configuración del Sistema
          </h1>
          <p style={{ margin: "0 0 20px", fontSize: "12px", color: colors.textoSec }}>
            Tiempos de respuesta (SLA) que el sistema usa para calcular vencimientos de tickets
          </p>

          <div style={{ background: "#fff", borderRadius: "12px", border: `1px solid ${colors.borde}`, padding: "24px", maxWidth: "680px", marginBottom: "18px" }}>
            <h3 style={{ margin: "0 0 4px", fontSize: "14px", fontWeight: "700", color: colors.texto, display: "flex", alignItems: "center", gap: "8px" }}>
              <FaClock style={{ color: colors.naranja }} /> Tiempos de Respuesta por Prioridad
            </h3>
            <p style={{ margin: "0 0 18px", fontSize: "12px", color: colors.textoSec }}>
              Cuando se crea un ticket, este es el número de horas que tiene el asesor asignado antes de que se
              marque "en riesgo". Cada área de IT puede tener sus propios tiempos; si un área no tiene SLA
              configurado para una prioridad, se usa el <strong>SLA General</strong> como respaldo.
            </p>

            {cargando ? (
              <p style={{ fontSize: "13px", color: colors.textoSec }}>Cargando configuración...</p>
            ) : slaConfig.length === 0 ? (
              <p style={{ fontSize: "13px", color: colors.textoMuted }}>
                No hay configuración de SLA todavía — corre tu <code>seed.js</code> para crearla.
              </p>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: "22px" }}>
                {agrupados.map(({ clave, area, items }) => (
                  <div key={clave}>
                    <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "10px" }}>
                      {clave === "general" ? (
                        <>
                          <FaGlobe style={{ color: colors.textoSec, fontSize: "12px" }} />
                          <span style={{ fontSize: "12.5px", fontWeight: "800", color: colors.textoSec, textTransform: "uppercase", letterSpacing: "0.3px" }}>
                            SLA General (respaldo)
                          </span>
                        </>
                      ) : (
                        <>
                          <span style={{ width: "8px", height: "8px", borderRadius: "50%", background: colors.azul }} />
                          <span style={{ fontSize: "13px", fontWeight: "800", color: colors.texto }}>{area?.nombre || "Área"}</span>
                        </>
                      )}
                    </div>
                    <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                      {items.map((item) => (
                        <FilaSLA key={item.id} item={item} esGeneral={clave === "general"} />
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div style={{ background: "#fff", borderRadius: "12px", border: `1px solid ${colors.borde}`, padding: "24px", maxWidth: "680px" }}>
            <h3 style={{ margin: "0 0 4px", fontSize: "14px", fontWeight: "700", color: colors.texto, display: "flex", alignItems: "center", gap: "8px" }}>
              <FaPlus style={{ color: colors.naranja, fontSize: "12px" }} /> Agregar SLA para un área
            </h3>
            <p style={{ margin: "0 0 16px", fontSize: "12px", color: colors.textoSec }}>
              Si el área que buscas no aparece, créala primero desde <strong>Usuarios → Áreas de la Empresa</strong>
              {" "}marcándola como "Es área de IT" — aparecerá aquí automáticamente.
            </p>
            <form onSubmit={agregarSLA} style={{ display: "flex", gap: "10px", flexWrap: "wrap", alignItems: "flex-end" }}>
              <div style={{ display: "flex", flexDirection: "column", gap: "5px" }}>
                <label style={{ fontSize: "11px", fontWeight: "700", color: colors.textoSec }}>Área de IT</label>
                <select value={nuevaAreaId} onChange={(e) => setNuevaAreaId(e.target.value)} style={{ ...inputStyle, width: "200px" }}>
                  <option value="">General (todas las áreas)</option>
                  {areasIT.map((a) => (
                    <option key={a.id} value={a.id}>{a.nombre}</option>
                  ))}
                </select>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: "5px" }}>
                <label style={{ fontSize: "11px", fontWeight: "700", color: colors.textoSec }}>Prioridad</label>
                <select value={nuevaPrioridad} onChange={(e) => setNuevaPrioridad(e.target.value)} style={{ ...inputStyle, width: "140px" }}>
                  {PRIORIDADES.map((p) => <option key={p} value={p}>{p}</option>)}
                </select>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: "5px" }}>
                <label style={{ fontSize: "11px", fontWeight: "700", color: colors.textoSec }}>Horas</label>
                <input
                  type="number" min="0.5" step="0.5" placeholder="Ej. 2"
                  value={nuevasHoras}
                  onChange={(e) => setNuevasHoras(e.target.value)}
                  style={{ ...inputStyle, width: "90px" }}
                />
              </div>
              <button type="submit" disabled={guardandoNuevo}
                style={{ display: "flex", alignItems: "center", gap: "7px", padding: "9px 18px", borderRadius: "8px", border: "none", background: colors.naranja, color: "white", fontSize: "12.5px", fontWeight: "700", cursor: "pointer", fontFamily: "inherit" }}>
                <FaPlus style={{ fontSize: "10px" }} /> {guardandoNuevo ? "Agregando..." : "Agregar SLA"}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
