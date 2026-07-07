import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import baprosaLogo from "../assets/baprosa-logo.png";
import {
  FaRegBell, FaRegEnvelope, FaChevronDown, FaArrowLeft, FaPrint, FaSave,
  FaSearch, FaExchangeAlt, FaHistory, FaCheckCircle, FaPhone, FaUser,
} from "react-icons/fa";

const colors = {
  naranja: "#ff7f22", naranjaOscuro: "#e66a10", naranjaClaro: "#fff1e6",
  texto: "#1e293b", textoSec: "#64748b", textoMuted: "#94a3b8",
  borde: "#eef1f5", fondo: "#fdf0e6", verde: "#16a34a", verdeClaro: "#e9f9ee",
  rojo: "#dc2626", rojoClaro: "#fee2e2",
};

const AREAS = ["Logística", "Ventas", "GPS", "Mercadeo", "Contabilidad", "Bodega", "Báscula", "Suministro", "Silos", "Taller", "Producción", "Guardia", "Compras", "Caja", "Pagos", "Planin", "Transporte", "Créditos", "Gerencia", "Laboratorio", "BodegaPT", "IT"];
const ESTADOS = ["Operativo", "Detalles menores", "En revisión", "Dañado", "Fuera de servicio"];

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

const InputField = ({ label, children }) => (
  <div style={{ display: "flex", flexDirection: "column", gap: "5px" }}>
    <label style={{ fontSize: "11.5px", fontWeight: "700", color: colors.textoSec }}>{label}</label>
    {children}
  </div>
);

export default function EquipoReasignado({ usuario, cerrarSesion }) {
  const navigate = useNavigate();
  const token = localStorage.getItem("token");
  const buscadorRef = useRef(null);

  const [busqueda, setBusqueda] = useState("");
  const [resultados, setResultados] = useState([]);
  const [buscando, setBuscando] = useState(false);
  const [mostrarResultados, setMostrarResultados] = useState(false);

  const [equipoSeleccionado, setEquipoSeleccionado] = useState(null);
  const [asignaciones, setAsignaciones] = useState([]);
  const [cargandoHistorial, setCargandoHistorial] = useState(false);

  const [form, setForm] = useState({
    responsableNuevo: "", areaNuevo: "", ubicacionNuevo: "",
    estadoNuevo: "Operativo", telefono: "", observaciones: "",
  });
  const [guardando, setGuardando] = useState(false);
  const [ultimaAsignacion, setUltimaAsignacion] = useState(null);

  const set = (k, v) => setForm((p) => ({ ...p, [k]: v }));

  // Buscador con debounce
  useEffect(() => {
    if (busqueda.trim().length < 2) { setResultados([]); return; }
    setBuscando(true);
    const timeout = setTimeout(async () => {
      try {
        const res = await fetch(`http://localhost:3000/api/equipos/buscar?q=${encodeURIComponent(busqueda)}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        setResultados(Array.isArray(data) ? data : []);
      } catch { setResultados([]); }
      finally { setBuscando(false); }
    }, 350);
    return () => clearTimeout(timeout);
  }, [busqueda, token]);

  useEffect(() => {
    const cerrarAlClickFuera = (e) => {
      if (buscadorRef.current && !buscadorRef.current.contains(e.target)) setMostrarResultados(false);
    };
    document.addEventListener("mousedown", cerrarAlClickFuera);
    return () => document.removeEventListener("mousedown", cerrarAlClickFuera);
  }, []);

  const cargarHistorial = async (equipoId) => {
    setCargandoHistorial(true);
    try {
      const res = await fetch(`http://localhost:3000/api/equipos/${equipoId}/asignaciones`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      setAsignaciones(Array.isArray(data) ? data : []);
    } catch { setAsignaciones([]); }
    finally { setCargandoHistorial(false); }
  };

  const seleccionarEquipo = (eq) => {
    setEquipoSeleccionado(eq);
    setBusqueda("");
    setMostrarResultados(false);
    setUltimaAsignacion(null);
    setForm({
      responsableNuevo: "", areaNuevo: "", ubicacionNuevo: eq.ubicacion || "",
      estadoNuevo: eq.estadoInicial || "Operativo", telefono: eq.telefono || "", observaciones: "",
    });
    cargarHistorial(eq.id);
  };

  const reasignar = async () => {
    if (!equipoSeleccionado) return;
    if (!form.responsableNuevo || !form.areaNuevo) {
      alert("Completa el nuevo responsable y área antes de guardar");
      return;
    }
    setGuardando(true);
    try {
      const res = await fetch(`http://localhost:3000/api/equipos/${equipoSeleccionado.id}/reasignar`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) { alert(data.message || "Error al reasignar"); setGuardando(false); return; }
      setEquipoSeleccionado(data.equipo);
      setUltimaAsignacion(data.asignacion);
      cargarHistorial(data.equipo.id);
    } catch { alert("Error al conectar con el servidor"); }
    finally { setGuardando(false); }
  };

  const imprimirHoja = async () => {
    if (!equipoSeleccionado || !ultimaAsignacion) { alert("Primero guarda la reasignación"); return; }
    const eq = equipoSeleccionado;
    const asig = ultimaAsignacion;
    const fecha = new Date().toLocaleDateString("es-HN", { day: "2-digit", month: "2-digit", year: "numeric" });
    const art = ["a","e","i","o","u"].includes(eq.categoria[0].toLowerCase()) ? "un" : "una";

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
  <p>Especificaciones: <strong>${eq.estadoInicial.toUpperCase()}</strong></p>
  <p>${eq.categoria.toUpperCase()} ${eq.marca.toUpperCase()} ${eq.modelo.toUpperCase()}</p>
  ${eq.direccionIp ? `<p>IP: ${eq.direccionIp}</p>` : ""}
  <p>SN: ${eq.numeroSerie}</p>
  ${eq.areaEmpresa ? `<p>Área: ${eq.areaEmpresa}</p>` : ""}
  ${eq.telefono ? `<p>Teléfono de contacto: ${eq.telefono}</p>` : ""}
  <p>Usuario anterior: ${asig.responsableAnterior || "N/A"} (${asig.areaAnterior || "N/A"})</p>
</div>
<p>Recibí conforme en la ciudad de El Progreso, Yoro. A los días ${fecha}.</p>
<p style="font-size:11px;color:#666;">Folio: ${eq.folio}</p>
<div style="margin-top:60px;">
  <div class="firma-line"></div>
  <p><strong>${(eq.responsable || "___________________").toUpperCase()}</strong></p>
  <div class="row">
    <p>ID#: ___________________</p>
    ${eq.valor ? `<p><strong>Valor: L. ${Number(eq.valor).toLocaleString("es-HN",{minimumFractionDigits:2})}</strong></p>` : ""}
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
          <div style={{ display: "flex", alignItems: "flex-start", gap: "12px", marginBottom: "20px" }}>
            <button onClick={() => navigate("/admin/registro-entrada")}
              style={{ width: "34px", height: "34px", borderRadius: "50%", background: "#fff", border: `1px solid ${colors.borde}`, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", color: colors.textoSec, fontSize: "13px", flexShrink: 0, marginTop: "4px" }}>
              <FaArrowLeft />
            </button>
            <div style={{ flex: 1 }}>
              <p style={{ margin: "0 0 2px", fontSize: "11.5px", color: colors.naranja, fontWeight: "600", cursor: "pointer" }} onClick={() => navigate("/admin/registro-entrada")}>← Volver a selección</p>
              <h1 style={{ margin: 0, fontSize: "20px", fontWeight: "800", color: colors.texto, fontFamily: "'Manrope', sans-serif" }}>Registro de Entrada — Equipo Reasignado</h1>
              <p style={{ margin: 0, fontSize: "12px", color: colors.textoSec }}>Busca un equipo existente para reasignarlo a un nuevo responsable</p>
            </div>
          </div>

          {/* Buscador principal */}
          <div ref={buscadorRef} style={{ position: "relative", marginBottom: "20px" }}>
            <div style={{ position: "relative" }}>
              <FaSearch style={{ position: "absolute", left: "14px", top: "50%", transform: "translateY(-50%)", color: colors.textoMuted, fontSize: "14px" }} />
              <input
                value={busqueda}
                onChange={(e) => { setBusqueda(e.target.value); setMostrarResultados(true); }}
                onFocus={() => setMostrarResultados(true)}
                placeholder="Buscar equipo por folio, número de serie, marca o responsable actual..."
                style={{ ...inputStyle, padding: "13px 14px 13px 38px", fontSize: "13.5px", border: `1.5px solid ${colors.borde}` }}
              />
            </div>
            {mostrarResultados && busqueda.trim().length >= 2 && (
              <div style={{ position: "absolute", top: "50px", left: 0, right: 0, background: "#fff", border: `1px solid ${colors.borde}`, borderRadius: "10px", boxShadow: "0 8px 24px rgba(15,23,42,0.12)", maxHeight: "320px", overflowY: "auto", zIndex: 50 }}>
                {buscando && <div style={{ padding: "14px", fontSize: "12.5px", color: colors.textoSec }}>Buscando...</div>}
                {!buscando && resultados.length === 0 && <div style={{ padding: "14px", fontSize: "12.5px", color: colors.textoSec }}>Sin resultados.</div>}
                {!buscando && resultados.map((eq) => (
                  <div key={eq.id} onClick={() => seleccionarEquipo(eq)}
                    style={{ padding: "12px 14px", borderBottom: `1px solid ${colors.fondo}`, cursor: "pointer" }}
                    onMouseEnter={(e) => (e.currentTarget.style.background = colors.naranjaClaro)}
                    onMouseLeave={(e) => (e.currentTarget.style.background = "#fff")}>
                    <div style={{ display: "flex", justifyContent: "space-between" }}>
                      <span style={{ fontSize: "12.5px", fontWeight: "700", color: colors.texto }}>{eq.marca} {eq.modelo}</span>
                      <span style={{ fontSize: "10.5px", color: colors.naranja, fontWeight: "700" }}>{eq.folio}</span>
                    </div>
                    <div style={{ fontSize: "11.5px", color: colors.textoSec }}>
                      SN: {eq.numeroSerie} &bull; Actual: {eq.responsable || "Sin asignar"} &bull; {eq.areaEmpresa || "—"}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {!equipoSeleccionado ? (
            <div style={{ background: "#fff", borderRadius: "12px", border: `1px solid ${colors.borde}`, padding: "60px 20px", textAlign: "center" }}>
              <FaExchangeAlt style={{ fontSize: "28px", color: colors.textoMuted, marginBottom: "10px" }} />
              <p style={{ margin: 0, fontSize: "13.5px", color: colors.textoSec }}>Busca y selecciona un equipo arriba para comenzar la reasignación.</p>
            </div>
          ) : (
            <>
              <div style={{ display: "flex", gap: "20px", alignItems: "flex-start" }}>
                {/* Historial */}
                <div style={{ flex: 1, background: "#fff", borderRadius: "12px", border: `1px solid ${colors.borde}`, padding: "20px" }}>
                  <h3 style={{ margin: "0 0 4px", fontSize: "14px", fontWeight: "700", color: colors.texto, display: "flex", alignItems: "center", gap: "7px" }}>
                    <FaHistory style={{ color: colors.naranja, fontSize: "12px" }} /> Historial de Asignaciones
                  </h3>
                  <p style={{ margin: "0 0 14px", fontSize: "12px", color: colors.textoSec }}>
                    {equipoSeleccionado.marca} {equipoSeleccionado.modelo} — {equipoSeleccionado.folio}
                  </p>
                  {cargandoHistorial ? (
                    <p style={{ fontSize: "12.5px", color: colors.textoSec }}>Cargando...</p>
                  ) : asignaciones.length === 0 ? (
                    <p style={{ fontSize: "12.5px", color: colors.textoSec }}>Este equipo no tiene reasignaciones previas — será su primera reasignación.</p>
                  ) : (
                    <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                      {asignaciones.map((a) => (
                        <div key={a.id} style={{ padding: "10px 12px", borderRadius: "8px", background: colors.fondo, fontSize: "12px" }}>
                          <div style={{ display: "flex", justifyContent: "space-between" }}>
                            <strong style={{ color: colors.texto }}>{a.responsableAnterior || "N/A"} → {a.responsableNuevo}</strong>
                            <span style={{ color: colors.textoSec }}>{new Date(a.fechaAsignacion).toLocaleDateString("es-HN")}</span>
                          </div>
                          <div style={{ color: colors.textoSec, marginTop: "3px" }}>
                            {a.areaAnterior || "N/A"} → {a.areaNuevo}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Formulario de reasignación */}
                <div style={{ flex: 1, background: "#fff", borderRadius: "12px", border: `1px solid ${colors.borde}`, padding: "20px" }}>
                  <h3 style={{ margin: "0 0 14px", fontSize: "14px", fontWeight: "700", color: colors.texto, display: "flex", alignItems: "center", gap: "7px" }}>
                    <FaUser style={{ color: colors.naranja, fontSize: "12px" }} /> Datos de Reasignación
                  </h3>
                  <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                    <InputField label="Nuevo responsable / usuario">
                      <input value={form.responsableNuevo} onChange={(e) => set("responsableNuevo", e.target.value)}
                        placeholder="Nombre completo" style={inputStyle} />
                    </InputField>
                    <InputField label="Nueva área de destino">
                      <select value={form.areaNuevo} onChange={(e) => set("areaNuevo", e.target.value)} style={inputStyle}>
                        <option value="">Selecciona...</option>
                        {AREAS.map((a) => <option key={a}>{a}</option>)}
                      </select>
                    </InputField>
                    <InputField label="Teléfono de contacto">
                      <div style={{ position: "relative" }}>
                        <FaPhone style={{ position: "absolute", left: "10px", top: "50%", transform: "translateY(-50%)", color: colors.textoMuted, fontSize: "12px" }} />
                        <input value={form.telefono} onChange={(e) => set("telefono", e.target.value)}
                          placeholder="9999-9999" style={{ ...inputStyle, paddingLeft: "30px" }} />
                      </div>
                    </InputField>
                    <InputField label="Ubicación física">
                      <input value={form.ubicacionNuevo} onChange={(e) => set("ubicacionNuevo", e.target.value)}
                        placeholder="Administración, 2do piso..." style={inputStyle} />
                    </InputField>
                    <InputField label="Estado actual del equipo">
                      <select value={form.estadoNuevo} onChange={(e) => set("estadoNuevo", e.target.value)} style={inputStyle}>
                        {ESTADOS.map((e) => <option key={e}>{e}</option>)}
                      </select>
                    </InputField>
                    <InputField label="Observaciones de reasignación">
                      <textarea value={form.observaciones} onChange={(e) => set("observaciones", e.target.value)}
                        rows={2} placeholder="Motivo del cambio, condición del equipo..." style={{ ...inputStyle, resize: "vertical" }} />
                    </InputField>
                  </div>

                  {ultimaAsignacion && (
                    <div style={{ background: colors.verdeClaro, border: `1px solid ${colors.verde}`, borderRadius: "9px", padding: "10px 14px", marginTop: "14px", display: "flex", alignItems: "center", gap: "8px", color: colors.verde, fontSize: "12.5px", fontWeight: "700" }}>
                      <FaCheckCircle /> Reasignación guardada correctamente.
                    </div>
                  )}

                  <div style={{ display: "flex", gap: "10px", marginTop: "16px" }}>
                    <button onClick={imprimirHoja} disabled={!ultimaAsignacion}
                      style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: "7px", padding: "10px", borderRadius: "9px", border: `1px solid ${colors.borde}`, background: "#fff", color: ultimaAsignacion ? colors.texto : colors.textoMuted, fontSize: "13px", fontWeight: "700", cursor: ultimaAsignacion ? "pointer" : "not-allowed", fontFamily: "inherit" }}>
                      <FaPrint /> Imprimir hoja de entrega
                    </button>
                    <button onClick={reasignar} disabled={guardando}
                      style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: "7px", padding: "10px", borderRadius: "9px", border: "none", background: colors.naranja, color: "white", fontSize: "13px", fontWeight: "700", cursor: guardando ? "default" : "pointer", fontFamily: "inherit" }}>
                      <FaSave /> {guardando ? "Guardando..." : "Guardar cambios"}
                    </button>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}