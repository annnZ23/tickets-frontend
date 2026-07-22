import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import Topbar from "../components/Topbar";
import baprosaLogo from "../assets/baprosa-logo.png";
import {
  FaArrowLeft, FaPrint, FaSave,
  FaSearch, FaExchangeAlt, FaHistory, FaCheckCircle, FaLaptop,
  FaArrowDown, FaClipboardList, FaTag,
} from "react-icons/fa";

const colors = {
  naranja: "#ff7f22", naranjaOscuro: "#e66a10", naranjaClaro: "#fff1e6",
  texto: "#1e293b", textoSec: "#64748b", textoMuted: "#94a3b8",
  borde: "#eef1f5", fondo: "#FFF7F2", verde: "#16a34a", verdeClaro: "#e9f9ee",
  rojo: "#dc2626", rojoClaro: "#fee2e2", amarillo: "#d97706", amarilloClaro: "#fef3c7",
};

const AREAS = ["Logística", "Ventas", "GPS", "Mercadeo", "Contabilidad", "Bodega", "Báscula", "Suministro", "Silos", "Taller", "Producción", "Guardia", "Compras", "Caja", "Pagos", "Planin", "Transporte", "Créditos", "Gerencia", "Laboratorio", "BodegaPT", "IT"];
const ESTADOS = ["Operativo", "Detalles menores", "En mantenimiento", "En revisión", "Dañado", "Fuera de servicio"];
const CATEGORIAS = ["Laptop", "Monitor", "Impresora", "Teléfono / Celular", "Tablet", "Desktop", "Servidor", "Switch", "Router", "UPS", "Teclado + Mouse", "Otro"];

const getIniciales = (name) => {
  if (!name) return "A";
  const p = name.trim().split(" ");
  return p.length > 1 ? `${p[0][0]}${p[1][0]}`.toUpperCase() : p[0][0].toUpperCase();
};

const inputStyle = {
  padding: "9px 12px", borderRadius: "8px", border: `1px solid ${colors.borde}`,
  fontSize: "13px", color: colors.texto, outline: "none", background: "#fafbfc",
  fontFamily: "inherit", width: "100%", boxSizing: "border-box",
};

const InputField = ({ label, required, children }) => (
  <div style={{ display: "flex", flexDirection: "column", gap: "5px" }}>
    <label style={{ fontSize: "11.5px", fontWeight: "700", color: colors.textoSec }}>
      {label}{required && <span style={{ color: colors.rojo }}> *</span>}
    </label>
    {children}
  </div>
);

const colorEstadoEquipo = (estado) => {
  const e = (estado || "").toLowerCase();
  if (e.includes("operativo") || e.includes("nuevo")) return { color: colors.verde, bg: colors.verdeClaro };
  if (e.includes("dañado") || e.includes("fuera")) return { color: colors.rojo, bg: colors.rojoClaro };
  return { color: colors.naranja, bg: colors.naranjaClaro };
};

const parseAccesorios = (raw) => {
  try {
    const arr = JSON.parse(raw || "[]");
    return Array.isArray(arr) ? arr : [];
  } catch { return []; }
};

const hoy = () => new Date().toLocaleDateString("es-HN", { day: "2-digit", month: "2-digit", year: "numeric" });

export default function EquipoReasignado({ usuario, cerrarSesion }) {
  const navigate = useNavigate();
  const token = localStorage.getItem("token");
  const authHeaders = () => ({ Authorization: `Bearer ${token}` });
  const [equipos, setEquipos] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [busqueda, setBusqueda] = useState("");
  const [filtroCategoria, setFiltroCategoria] = useState("");

  const cargarEquipos = async () => {
    setCargando(true);
    try {
      const res = await fetch("http://localhost:3000/api/equipos", { headers: authHeaders() });
      const data = await res.json();
      setEquipos(Array.isArray(data) ? data : []);
    } catch { setEquipos([]); }
    finally { setCargando(false); }
  };

  useEffect(() => { cargarEquipos(); }, []);

  const equiposFiltrados = useMemo(() => {
    let lista = equipos;
    if (filtroCategoria) lista = lista.filter((eq) => eq.categoria === filtroCategoria);
    if (busqueda.trim()) {
      const q = busqueda.trim().toLowerCase();
      lista = lista.filter((eq) =>
        [eq.folio, eq.numeroSerie, eq.marca, eq.modelo, eq.responsable, eq.areaEmpresa]
          .filter(Boolean)
          .some((c) => c.toLowerCase().includes(q))
      );
    }
    return lista;
  }, [equipos, busqueda, filtroCategoria]);


  const [equipoSeleccionado, setEquipoSeleccionado] = useState(null);
  const [form, setForm] = useState({
    responsableNuevo: "", areaNuevo: "", estadoNuevo: "Operativo", observaciones: "",
  });
  const [accesoriosIncluidos, setAccesoriosIncluidos] = useState([]);
  const [guardando, setGuardando] = useState(false);
  const [ultimaAsignacion, setUltimaAsignacion] = useState(null);
  const [entregado, setEntregado] = useState(false); 

  const set = (k, v) => setForm((p) => ({ ...p, [k]: v }));

  const seleccionarEquipo = (eq) => {
    setEquipoSeleccionado(eq);
    setUltimaAsignacion(null);
    setEntregado(false);
    setForm({
      responsableNuevo: "", areaNuevo: "",
      estadoNuevo: eq.estadoInicial || "Operativo",
      observaciones: "",
    });

    setAccesoriosIncluidos(parseAccesorios(eq.accesorios));
  };

  const toggleAccesorio = (acc) =>
    setAccesoriosIncluidos((prev) =>
      prev.includes(acc) ? prev.filter((a) => a !== acc) : [...prev, acc]
    );

  const [corrigiendo, setCorrigiendo] = useState(false);
  const [correccionOk, setCorreccionOk] = useState(false);

  const corregirRegistroActual = async () => {
    if (!equipoSeleccionado) return;
    setCorrigiendo(true);
    setCorreccionOk(false);
    try {
      const res = await fetch(`http://localhost:3000/api/equipos/${equipoSeleccionado.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", ...authHeaders() },
        body: JSON.stringify({
          estadoInicial: form.estadoNuevo,
          observaciones: form.observaciones || equipoSeleccionado.observaciones || "",
        }),
      });
      const data = await res.json();
      if (!res.ok) { alert(data.message || "No se pudo corregir el registro"); return; }
      setEquipoSeleccionado(data);
      setCorreccionOk(true);
      cargarEquipos();
      setTimeout(() => setCorreccionOk(false), 2500);
    } catch {
      alert("Error al conectar con el servidor");
    } finally {
      setCorrigiendo(false);
    }
  };

  const puedeReasignar =
    !!equipoSeleccionado && !!form.responsableNuevo && !!form.areaNuevo && !!form.observaciones.trim();

  const reasignar = async () => {
    if (!equipoSeleccionado) { alert("Selecciona un equipo de la tabla primero"); return; }
    if (!form.responsableNuevo || !form.areaNuevo) {
      alert("Completa el nuevo usuario asignado y la nueva área de destino");
      return;
    }
    if (!form.observaciones.trim()) {
      alert("Escribe una observación explicando la reasignación (condición del equipo, motivo, etc.) antes de guardar.");
      return;
    }
    setGuardando(true);
    try {
      const res = await fetch(`http://localhost:3000/api/equipos/${equipoSeleccionado.id}/reasignar`, {
        method: "POST",
        headers: { "Content-Type": "application/json", ...authHeaders() },
        body: JSON.stringify({
          responsableNuevo: form.responsableNuevo,
          areaNuevo: form.areaNuevo,
          estadoNuevo: form.estadoNuevo,
          observaciones: form.observaciones,
          ubicacionNuevo: equipoSeleccionado.ubicacion || "",
          telefono: equipoSeleccionado.telefono || "",
          accesoriosIncluidos,
        }),
      });
      const data = await res.json();
      if (!res.ok) { alert(data.message || "Error al reasignar"); setGuardando(false); return; }
      setUltimaAsignacion(data.asignacion);
      setEquipoSeleccionado(data.equipo);
      setEntregado(false);
      cargarEquipos();
    } catch { alert("Error al conectar con el servidor"); }
    finally { setGuardando(false); }
  };

  const registrarEntrega = async () => {
    try {
      const res = await fetch(`http://localhost:3000/api/equipos/${equipoSeleccionado.id}/entregar`, {
        method: "POST",
        headers: { "Content-Type": "application/json", ...authHeaders() },
      });
      if (res.ok) {
        setEntregado(true);
        cargarEquipos();
        return true;
      }
      return false;
    } catch { return false; }
  };

  const imprimirHoja = async () => {
    if (!equipoSeleccionado || !ultimaAsignacion) { alert("Primero guarda la reasignación"); return; }
    const eq = equipoSeleccionado;
    const asig = ultimaAsignacion;
    const fecha = hoy();
    const art = ["a", "e", "i", "o", "u"].includes(eq.categoria[0].toLowerCase()) ? "un" : "una";
    const accs = accesoriosIncluidos.join(", ");

    if (!entregado) {
      const ok = await registrarEntrega();
      if (!ok) {
        alert("⚠️ No se pudo registrar la entrega en el sistema. La hoja se imprimirá, pero verifica el KPI de entregados.");
      }
    }

    let logoBase64 = "";
    try {
      const respuesta = await fetch(baprosaLogo);
      const blob = await respuesta.blob();
      logoBase64 = await new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result);
        reader.onerror = reject;
        reader.readAsDataURL(blob);
      });
    } catch { logoBase64 = ""; }

    const html = `<!DOCTYPE html><html><head><meta charset="UTF-8">
<style>
  body{font-family:Arial,sans-serif;margin:40px;color:#222;font-size:13px;}
  .logo{text-align:center;margin-bottom:8px;}
  .logo img{height:60px;}
  h2{text-align:center;font-size:16px;margin:16px 0 24px;}
  p{margin:0 0 10px;line-height:1.7;text-align:justify;}
  .specs p{margin:2px 0;}
  .firma-line{border-top:1px solid #222;width:280px;margin-bottom:4px;}
  .footer{text-align:center;font-size:10px;color:#666;margin-top:60px;border-top:1px solid #ccc;padding-top:8px;}
  .row{display:flex;justify-content:space-between;align-items:flex-end;margin-top:20px;}
</style></head><body>
<div class="logo">${logoBase64 ? `<img src="${logoBase64}" alt="Baprosa">` : ""}</div>
<h2>Reasignación de ${eq.categoria}</h2>
<p>Yo, <strong>${(eq.responsable || "___________________").toUpperCase()}</strong>, por medio de la presente hago constar que recibo de la empresa Beneficio de Arroz Progreso (BAPROSA), ${art} ${eq.categoria.toLowerCase()} previamente asignado a otro colaborador, para uso exclusivo en el desempeño de mis labores. Es entendido que el dispositivo es propiedad de la empresa, por el cual me comprometo a cuidarlo y darle el uso adecuado al mismo, en caso de despido o renuncia debo devolverlo en buen estado en el momento que se me solicite, en caso de extravío, daño o destrucción, autorizo a la empresa a deducir el valor equivalente al equipo, de mi salario, derechos o prestaciones laborales para la cancelación de este dispositivo.</p>
<div class="specs" style="margin:20px 0;">
  <p>Especificaciones: <strong>${(form.estadoNuevo || eq.estadoInicial || "").toUpperCase()}</strong></p>
  <p>${eq.categoria.toUpperCase()} ${eq.marca.toUpperCase()} ${eq.modelo.toUpperCase()}</p>
  ${eq.direccionIp ? `<p>IP: ${eq.direccionIp}</p>` : ""}
  <p>SN: ${eq.numeroSerie}</p>
  ${eq.areaEmpresa ? `<p>Área: ${eq.areaEmpresa}</p>` : ""}
  ${eq.telefono ? `<p>Teléfono de contacto: ${eq.telefono}</p>` : ""}
  ${accs ? `<p>Accesorios incluidos: ${accs.toUpperCase()}.</p>` : ""}
  <p>Usuario anterior: ${asig.responsableAnterior || "N/A"} (${asig.areaAnterior || "N/A"})</p>
  ${form.observaciones ? `<p>Observaciones: ${form.observaciones}</p>` : ""}
</div>
<p>Recibí conforme en la ciudad de El Progreso, Yoro. A los días ${fecha}.</p>
<p style="font-size:11px;color:#666;">Folio: ${eq.folio}</p>
<div style="margin-top:60px;">
  <div class="firma-line"></div>
  <p><strong>${(eq.responsable || "___________________").toUpperCase()}</strong></p>
  <div class="row">
    <p>ID#: ___________________</p>
    ${eq.valor ? `<p><strong>Valor: L. ${Number(eq.valor).toLocaleString("es-HN", { minimumFractionDigits: 2 })}</strong></p>` : ""}
  </div>
</div>
<div class="footer">
  Kilómetro 4 Carretera salida a Tela &bull; El Progreso, Yoro, Honduras, C.A.<br>
  Apdo. Postal 108 &bull; Tel.: 2544-0070. Fax: 2642-5640 &bull; e-mail: info@baprosa.com
</div>
</body></html>`;

    const win = window.open("", "_blank");
    win.document.write(html);
    win.document.close();
    setTimeout(() => win.print(), 500);
  };

  const accesoriosDelEquipo = equipoSeleccionado ? parseAccesorios(equipoSeleccionado.accesorios) : [];
  const badgeSel = equipoSeleccionado ? colorEstadoEquipo(equipoSeleccionado.estadoInicial) : null;

  return (
    <div style={{ display: "flex", minHeight: "100vh", backgroundColor: colors.fondo, fontFamily: "'Segoe UI', sans-serif" }}>
      <link href="https://fonts.googleapis.com/css2?family=Manrope:wght@500;700;800&display=swap" rel="stylesheet" />
      <Sidebar usuario={usuario} cerrarSesion={cerrarSesion} />

      <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>
        <Topbar usuario={usuario} cerrarSesion={cerrarSesion} />

        <div style={{ flex: 1, overflowY: "auto", padding: "24px 28px" }}>
          {/* Header */}
          <div style={{ display: "flex", alignItems: "flex-start", gap: "12px", marginBottom: "20px" }}>
            <button onClick={() => navigate("/admin/registro-entrada")}
              style={{ width: "34px", height: "34px", borderRadius: "50%", background: "#fff", border: `1px solid ${colors.borde}`, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", color: colors.textoSec, fontSize: "13px", flexShrink: 0, marginTop: "4px" }}>
              <FaArrowLeft />
            </button>
            <div style={{ flex: 1 }}>
              <p style={{ margin: "0 0 2px", fontSize: "11.5px", color: colors.naranja, fontWeight: "600", cursor: "pointer" }} onClick={() => navigate("/admin/registro-entrada")}>← Volver a selección</p>
              <h1 style={{ margin: 0, fontSize: "20px", fontWeight: "800", color: colors.texto, fontFamily: "'Manrope', sans-serif" }}>Registro de Entrada — Equipo Reasignado</h1>
              <p style={{ margin: 0, fontSize: "12px", color: colors.textoSec }}>Selecciona un equipo del historial para reasignarlo a un nuevo responsable</p>
            </div>
          </div>

          <div style={{ background: "#fff", borderRadius: "12px", border: `1px solid ${colors.borde}`, padding: "20px", marginBottom: "20px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "14px", gap: "12px", flexWrap: "wrap" }}>
              <h3 style={{ margin: 0, fontSize: "14px", fontWeight: "700", color: colors.texto, display: "flex", alignItems: "center", gap: "8px" }}>
                <FaHistory style={{ color: colors.naranja, fontSize: "13px" }} /> Historial de Equipos Asignados
              </h3>
              <div style={{ display: "flex", gap: "10px" }}>
                <div style={{ position: "relative", width: "230px" }}>
                  <FaSearch style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)", color: colors.textoMuted, fontSize: "12px" }} />
                  <input value={busqueda} onChange={(e) => setBusqueda(e.target.value)}
                    placeholder="Buscar por código o serie..."
                    style={{ ...inputStyle, paddingLeft: "32px", background: "#fff" }} />
                </div>
                <select value={filtroCategoria} onChange={(e) => setFiltroCategoria(e.target.value)}
                  style={{ ...inputStyle, width: "180px", background: "#fff", cursor: "pointer" }}>
                  <option value="">Todas las categorías</option>
                  {CATEGORIAS.map((c) => <option key={c}>{c}</option>)}
                </select>
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
                    <tr style={{ background: colors.naranjaClaro }}>
                      <th style={{ width: "36px" }}></th>
                      {["Código / Serie", "Categoría", "Usuario Anterior", "Área Anterior", "Fecha Asignación", "Estado", "Observaciones"].map((h) => (
                        <th key={h} style={{ textAlign: "left", padding: "11px 10px", color: colors.texto, fontWeight: "700", fontSize: "11.5px" }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {equiposFiltrados.slice(0, 50).map((eq) => {
                      const seleccionado = equipoSeleccionado?.id === eq.id;
                      const badge = colorEstadoEquipo(eq.estadoInicial);
                      return (
                        <tr key={eq.id} onClick={() => seleccionarEquipo(eq)}
                          style={{ borderBottom: `1px solid ${colors.fondo}`, cursor: "pointer", background: seleccionado ? colors.naranjaClaro : "transparent" }}
                          onMouseEnter={(e) => { if (!seleccionado) e.currentTarget.style.background = "#fafbfc"; }}
                          onMouseLeave={(e) => { if (!seleccionado) e.currentTarget.style.background = "transparent"; }}>
                          <td style={{ padding: "10px", textAlign: "center" }}>
                            <span style={{ display: "inline-block", width: "15px", height: "15px", borderRadius: "50%", border: `2px solid ${seleccionado ? colors.naranja : "#d1d5db"}`, background: seleccionado ? colors.naranja : "#fff", boxShadow: seleccionado ? "inset 0 0 0 3px #fff" : "none" }} />
                          </td>
                          <td style={{ padding: "10px", fontWeight: "700", color: colors.texto }}>{eq.folio || eq.numeroSerie}</td>
                          <td style={{ padding: "10px", color: colors.texto }}>{eq.categoria}</td>
                          <td style={{ padding: "10px", color: colors.texto }}>{eq.responsable || "Sin asignar"}</td>
                          <td style={{ padding: "10px", color: colors.textoSec }}>{eq.areaEmpresa || "—"}</td>
                          <td style={{ padding: "10px", color: colors.textoSec }}>{new Date(eq.createdAt).toLocaleDateString("es-HN")}</td>
                          <td style={{ padding: "10px" }}>
                            <span style={{ fontSize: "10.5px", fontWeight: "700", color: badge.color }}>{eq.estadoInicial || "—"}</span>
                          </td>
                          <td style={{ padding: "10px", color: colors.textoSec, maxWidth: "220px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{eq.observaciones || "Sin observaciones"}</td>
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


          <div style={{ display: "flex", gap: "20px", alignItems: "flex-start" }}>


            <div style={{ flex: 1, background: "#fff", borderRadius: "12px", border: `1px solid ${colors.borde}`, padding: "20px" }}>
              <h3 style={{ margin: "0 0 14px", fontSize: "14px", fontWeight: "700", color: colors.texto, display: "flex", alignItems: "center", gap: "8px" }}>
                <FaExchangeAlt style={{ color: colors.naranja, fontSize: "13px" }} /> Datos de Reasignación
              </h3>

              {!equipoSeleccionado ? (
                <div style={{ padding: "36px 10px", textAlign: "center", color: colors.textoMuted, fontSize: "13px" }}>
                  <FaLaptop style={{ fontSize: "24px", marginBottom: "8px", display: "block", margin: "0 auto 8px" }} />
                  Selecciona un equipo de la tabla para comenzar.
                </div>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: "13px" }}>

                  <div style={{ background: colors.naranjaClaro, border: `1px solid #ffd49e`, borderRadius: "9px", padding: "12px 14px", display: "flex", justifyContent: "space-between", alignItems: "center", gap: "8px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "10px", minWidth: 0 }}>
                      <FaLaptop style={{ color: colors.naranjaOscuro, fontSize: "16px", flexShrink: 0 }} />
                      <div style={{ minWidth: 0 }}>
                        <div style={{ fontSize: "12.5px", fontWeight: "800", color: colors.texto }}>
                          Equipo seleccionado: {equipoSeleccionado.folio || equipoSeleccionado.numeroSerie}
                        </div>
                        <div style={{ fontSize: "11px", color: colors.textoSec, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                          {equipoSeleccionado.categoria} — {equipoSeleccionado.areaEmpresa || "Sin área"} — {equipoSeleccionado.responsable || "Sin asignar"}
                        </div>
                      </div>
                    </div>
                    <span style={{ fontSize: "10.5px", fontWeight: "700", color: badgeSel.color, flexShrink: 0 }}>
                      {equipoSeleccionado.estadoInicial || "—"}
                    </span>
                  </div>

                  <InputField label="Estado actual del equipo">
                    <select value={form.estadoNuevo} onChange={(e) => set("estadoNuevo", e.target.value)} style={inputStyle}>
                      {ESTADOS.map((e) => <option key={e}>{e}</option>)}
                    </select>
                  </InputField>

                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "10px", background: colors.fondo, borderRadius: "8px", padding: "10px 12px" }}>
                    <span style={{ fontSize: "11.5px", color: colors.textoSec }}>
                      ¿Te equivocaste de estado u observación? Corrígelo aquí sin crear una reasignación nueva.
                    </span>
                    <button
                      type="button"
                      onClick={corregirRegistroActual}
                      disabled={corrigiendo}
                      style={{
                        flexShrink: 0, padding: "7px 14px", borderRadius: "7px", border: `1px solid ${correccionOk ? colors.verde : colors.naranja}`,
                        background: correccionOk ? colors.verdeClaro : "#fff", color: correccionOk ? colors.verde : colors.naranja,
                        fontSize: "12px", fontWeight: "700", fontFamily: "inherit", cursor: corrigiendo ? "default" : "pointer", whiteSpace: "nowrap",
                      }}
                    >
                      {corrigiendo ? "Corrigiendo..." : correccionOk ? "✓ Corregido" : "Corregir estado"}
                    </button>
                  </div>

                  <InputField label="Nuevo usuario asignado" required>
                    <input value={form.responsableNuevo} onChange={(e) => set("responsableNuevo", e.target.value)}
                      placeholder="Nombre completo" style={inputStyle} />
                  </InputField>

                  <InputField label="Nueva área de destino" required>
                    <select value={form.areaNuevo} onChange={(e) => set("areaNuevo", e.target.value)} style={inputStyle}>
                      <option value="">Seleccionar área...</option>
                      {AREAS.map((a) => <option key={a}>{a}</option>)}
                    </select>
                  </InputField>

                  <div>
                    <label style={{ fontSize: "11.5px", fontWeight: "700", color: colors.textoSec, display: "block", marginBottom: "7px" }}>Accesorios incluidos</label>
                    {accesoriosDelEquipo.length === 0 ? (
                      <p style={{ margin: 0, fontSize: "12px", color: colors.textoMuted }}>Este equipo no tiene accesorios registrados.</p>
                    ) : (
                      <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                        {accesoriosDelEquipo.map((acc) => {
                          const activo = accesoriosIncluidos.includes(acc);
                          return (
                            <label key={acc} style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "12.5px", color: colors.texto, cursor: "pointer" }}>
                              <input type="checkbox" checked={activo} onChange={() => toggleAccesorio(acc)}
                                style={{ accentColor: colors.naranja, width: "15px", height: "15px", cursor: "pointer" }} />
                              {acc}
                            </label>
                          );
                        })}
                      </div>
                    )}
                  </div>

                  <InputField label="Observaciones de reasignación" required>
                    <textarea value={form.observaciones} onChange={(e) => set("observaciones", e.target.value)}
                      rows={3} placeholder="Ej: equipo entregado en buen estado, motivo: cambio de puesto..."
                      style={{ ...inputStyle, resize: "vertical" }} />
                    <p style={{ margin: "4px 0 0", fontSize: "11px", color: colors.textoMuted }}>
                      Obligatorio — describe en qué condición se entrega el equipo y el motivo de la reasignación.
                    </p>
                  </InputField>
                </div>
              )}
            </div>


            <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: "20px" }}>


              <div style={{ background: "#fff", borderRadius: "12px", border: `1px solid ${colors.borde}`, padding: "20px" }}>
                <h3 style={{ margin: "0 0 14px", fontSize: "14px", fontWeight: "700", color: colors.texto, display: "flex", alignItems: "center", gap: "8px" }}>
                  <FaHistory style={{ color: colors.naranja, fontSize: "13px" }} /> Actualización del Historial
                </h3>

                {!equipoSeleccionado ? (
                  <p style={{ margin: 0, fontSize: "12.5px", color: colors.textoMuted, textAlign: "center", padding: "24px 0" }}>
                    Aquí verás el movimiento anterior y el nuevo al seleccionar un equipo.
                  </p>
                ) : (
                  <>

                    <div style={{ background: colors.naranjaClaro, border: `1px solid #ffd49e`, borderRadius: "10px", padding: "14px 16px" }}>
                      <p style={{ margin: "0 0 10px", fontSize: "12px", fontWeight: "800", color: colors.naranjaOscuro, display: "flex", alignItems: "center", gap: "6px" }}>
                        <FaTag style={{ fontSize: "10px" }} /> Movimiento Anterior
                      </p>
                      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px 14px", fontSize: "12px" }}>
                        <div><span style={{ color: colors.textoSec }}>Usuario:</span><br /><strong style={{ color: colors.texto }}>{ultimaAsignacion ? (ultimaAsignacion.responsableAnterior || "Sin asignar") : (equipoSeleccionado.responsable || "Sin asignar")}</strong></div>
                        <div><span style={{ color: colors.textoSec }}>Área:</span><br /><strong style={{ color: colors.texto }}>{ultimaAsignacion ? (ultimaAsignacion.areaAnterior || "—") : (equipoSeleccionado.areaEmpresa || "—")}</strong></div>
                        <div><span style={{ color: colors.textoSec }}>Fecha asignación:</span><br /><strong style={{ color: colors.texto }}>{new Date(equipoSeleccionado.createdAt).toLocaleDateString("es-HN")}</strong></div>
                        <div><span style={{ color: colors.textoSec }}>Fecha devolución:</span><br /><strong style={{ color: colors.texto }}>{hoy()}</strong></div>
                      </div>
                    </div>

                    <div style={{ textAlign: "center", padding: "8px 0" }}>
                      <FaArrowDown style={{ color: colors.naranja, fontSize: "14px" }} />
                    </div>


                    <div style={{ background: colors.verdeClaro, border: `1px solid #a7e3bc`, borderRadius: "10px", padding: "14px 16px" }}>
                      <p style={{ margin: "0 0 10px", fontSize: "12px", fontWeight: "800", color: colors.verde, display: "flex", alignItems: "center", gap: "6px" }}>
                        <FaCheckCircle style={{ fontSize: "10px" }} /> Nuevo Movimiento
                      </p>
                      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px 14px", fontSize: "12px" }}>
                        <div><span style={{ color: colors.textoSec }}>Nuevo usuario:</span><br /><strong style={{ color: colors.texto }}>{form.responsableNuevo || "—"}</strong></div>
                        <div><span style={{ color: colors.textoSec }}>Nueva área:</span><br /><strong style={{ color: colors.texto }}>{form.areaNuevo || "—"}</strong></div>
                        <div><span style={{ color: colors.textoSec }}>Fecha de reasignación:</span><br /><strong style={{ color: colors.texto }}>{hoy()}</strong></div>
                        <div><span style={{ color: colors.textoSec }}>Estado:</span><br /><strong style={{ color: colorEstadoEquipo(form.estadoNuevo).color }}>{form.estadoNuevo}</strong></div>
                      </div>
                    </div>
                  </>
                )}
              </div>


              <div style={{ background: "#fff", borderRadius: "12px", border: `1px solid ${colors.borde}`, padding: "20px" }}>
                <h3 style={{ margin: "0 0 14px", fontSize: "14px", fontWeight: "700", color: colors.texto, display: "flex", alignItems: "center", gap: "8px" }}>
                  <FaClipboardList style={{ color: colors.naranja, fontSize: "13px" }} /> Resumen de Reasignación
                </h3>

                {[
                  { label: "Equipo:", value: equipoSeleccionado ? (equipoSeleccionado.folio || equipoSeleccionado.numeroSerie) : "—" },
                  { label: "Categoría:", value: equipoSeleccionado?.categoria || "—" },
                  { label: "De:", value: ultimaAsignacion ? `${ultimaAsignacion.responsableAnterior || "Sin asignar"} — ${ultimaAsignacion.areaAnterior || "—"}` : (equipoSeleccionado ? `${equipoSeleccionado.responsable || "Sin asignar"} — ${equipoSeleccionado.areaEmpresa || "—"}` : "—") },
                  { label: "A:", value: form.responsableNuevo ? `${form.responsableNuevo} — ${form.areaNuevo || "—"}` : "—" },
                  { label: "Accesorios:", value: accesoriosIncluidos.length > 0 ? `${accesoriosIncluidos.length} incluido${accesoriosIncluidos.length !== 1 ? "s" : ""}` : "Ninguno" },
                ].map(({ label, value }) => (
                  <div key={label} style={{ display: "flex", justifyContent: "space-between", gap: "12px", padding: "7px 0", borderBottom: `1px solid ${colors.fondo}`, fontSize: "12.5px" }}>
                    <span style={{ color: colors.textoSec }}>{label}</span>
                    <span style={{ color: colors.texto, fontWeight: "700", textAlign: "right" }}>{value}</span>
                  </div>
                ))}

                {equipoSeleccionado && !form.observaciones.trim() && !ultimaAsignacion && (
                  <div style={{ background: colors.rojoClaro, border: `1px solid ${colors.rojo}`, borderRadius: "9px", padding: "10px 14px", marginTop: "14px", color: colors.rojo, fontSize: "12px", fontWeight: "600" }}>
                    Falta escribir la observación de reasignación para poder guardar.
                  </div>
                )}

                {ultimaAsignacion && !entregado && (
                  <div style={{ background: colors.verdeClaro, border: `1px solid ${colors.verde}`, borderRadius: "9px", padding: "10px 14px", marginTop: "14px", display: "flex", alignItems: "center", gap: "8px", color: colors.verde, fontSize: "12.5px", fontWeight: "700" }}>
                    <FaCheckCircle /> Reasignación guardada. Imprime la hoja de entrega como comprobante.
                  </div>
                )}

                {entregado && (
                  <div style={{ background: colors.verdeClaro, border: `1px solid ${colors.verde}`, borderRadius: "9px", padding: "10px 14px", marginTop: "14px", display: "flex", alignItems: "center", gap: "8px", color: colors.verde, fontSize: "12.5px", fontWeight: "700" }}>
                    <FaCheckCircle /> Equipo entregado — comprobante impreso. Ya se refleja en el Registro de Salida.
                  </div>
                )}

                <div style={{ display: "flex", gap: "10px", marginTop: "16px" }}>
                  <button onClick={imprimirHoja} disabled={!ultimaAsignacion}
                    style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: "7px", padding: "10px", borderRadius: "9px", border: `1px solid ${entregado ? colors.verde : colors.borde}`, background: entregado ? colors.verdeClaro : "#fff", color: ultimaAsignacion ? (entregado ? colors.verde : colors.texto) : colors.textoMuted, fontSize: "13px", fontWeight: "700", cursor: ultimaAsignacion ? "pointer" : "not-allowed", fontFamily: "inherit" }}>
                    <FaPrint /> {entregado ? "Reimprimir hoja" : "Imprimir hoja de entrega"}
                  </button>
                  <button onClick={reasignar} disabled={guardando || !puedeReasignar}
                    title={!puedeReasignar && equipoSeleccionado ? "Completa usuario, área y observaciones para guardar" : undefined}
                    style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: "7px", padding: "10px", borderRadius: "9px", border: "none", background: colors.naranja, color: "white", fontSize: "13px", fontWeight: "700", cursor: guardando || !puedeReasignar ? "default" : "pointer", fontFamily: "inherit", opacity: !puedeReasignar ? 0.6 : 1 }}
                    onMouseEnter={(e) => { if (!guardando && puedeReasignar) e.currentTarget.style.background = colors.naranjaOscuro; }}
                    onMouseLeave={(e) => { if (!guardando && puedeReasignar) e.currentTarget.style.background = colors.naranja; }}>
                    <FaSave /> {guardando ? "Guardando..." : "Guardar Cambios"}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}