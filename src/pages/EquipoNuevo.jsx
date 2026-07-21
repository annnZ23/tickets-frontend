import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import Topbar from "../components/Topbar";
import baprosaLogo from "../assets/baprosa-logo.png";
import {
  FaLaptop, FaArrowLeft, FaPrint, FaSave, FaTimes, FaPlus,
  FaCheckCircle, FaTag, FaUser, FaStar, FaClipboard,
  FaDollarSign, FaWifi, FaSearch, FaPhone, FaKey, FaPen,
} from "react-icons/fa";

const colors = {
  naranja: "#ff7f22", naranjaOscuro: "#e66a10", naranjaClaro: "#fff1e6",
  texto: "#1e293b", textoSec: "#64748b", textoMuted: "#94a3b8",
  borde: "#eef1f5", fondo: "#FFF7F2", verde: "#16a34a", verdeClaro: "#e9f9ee",
  rojo: "#dc2626", rojoClaro: "#fee2e2", azul: "#2563eb", azulClaro: "#eff6ff",
};

const CATEGORIAS = ["Laptop", "Monitor", "Impresora", "Teléfono / Celular", "Tablet", "Desktop", "Servidor", "Switch", "Router", "UPS", "Teclado + Mouse"];
const LICENCIAS = ["Windows 11 Pro", "Windows 10 Pro", "Office 365", "Microsoft 365", "Windows 11 Pro + Microsoft 365", "Antivirus corporativo", "N/A"];
const ESTADOS_INICIALES = ["Nuevo", "Usado", "Reparado", "Reacondicionado"];
const ACCESORIOS_DEFAULT = ["Mouse", "Teclado", "Cargador", "Mochila", "Monitor externo", "Cable HDMI", "Audífonos", "Cámara web", "Cobertores", "Vidrio templado", "Base refrigerante", "Maletín de transporte"];
const AREAS = ["Logística", "Ventas", "GPS", "Mercadeo", "Contabilidad", "Bodega", "Báscula", "Suministro", "Silos", "Taller", "Producción", "Guardia", "Compras", "Caja", "Pagos", "Planin", "Transporte", "Créditos", "Gerencia", "Laboratorio", "BodegaPT", "IT"];
const OTROS = "Otros";

const GlobalStyles = () => (
  <style>{`
    .bp-input, .bp-select, .bp-textarea {
      transition: all 0.3s ease;
    }
    .bp-input:focus, .bp-select:focus, .bp-textarea:focus {
      border-color: ${colors.naranja} !important;
      box-shadow: 0 0 0 3px rgba(255, 127, 34, 0.15);
      background: #fff !important;
    }
    .bp-input:hover:not(:focus):not(:disabled),
    .bp-select:hover:not(:focus):not(:disabled) {
      border-color: #ffd0ab !important;
    }
    .bp-btn {
      transition: all 0.3s ease;
      cursor: pointer;
    }
    .bp-btn:hover:not(:disabled) {
      transform: scale(1.02);
    }
    .bp-btn:active:not(:disabled) {
      transform: scale(0.98);
    }
    .bp-btn-primary:hover:not(:disabled) {
      background: ${colors.naranjaOscuro} !important;
      box-shadow: 0 4px 14px rgba(230, 106, 16, 0.35);
    }
    .bp-btn-outline:hover:not(:disabled) {
      background: ${colors.naranjaClaro} !important;
      border-color: ${colors.naranja} !important;
      color: ${colors.naranja} !important;
    }
    .bp-btn:disabled {
      background: #cbd5e1 !important;
      color: #f1f5f9 !important;
      cursor: not-allowed !important;
      transform: none !important;
      box-shadow: none !important;
      opacity: 0.8;
    }
    .bp-btn-outline:disabled {
      background: #f8fafc !important;
      color: ${colors.textoMuted} !important;
      border-color: ${colors.borde} !important;
    }
    .bp-resultado {
      transition: all 0.3s ease;
      cursor: pointer;
    }
    .bp-resultado:hover {
      background: ${colors.naranjaClaro};
      padding-left: 18px !important;
    }
    .bp-chip { transition: all 0.3s ease; cursor: pointer; }
    .bp-chip:hover { transform: scale(1.04); border-color: ${colors.naranja} !important; }
    @keyframes bpSlideDown {
      from { opacity: 0; transform: translateY(-6px); max-height: 0; }
      to   { opacity: 1; transform: translateY(0);    max-height: 90px; }
    }
    .bp-campo-otro { animation: bpSlideDown 0.3s ease; overflow: hidden; }
    @keyframes bpFadeIn {
      from { opacity: 0; transform: translateY(-4px); }
      to   { opacity: 1; transform: translateY(0); }
    }
    .bp-banner, .bp-dropdown { animation: bpFadeIn 0.25s ease; }
    @keyframes bpSpin { to { transform: rotate(360deg); } }
    .bp-spinner {
      width: 13px; height: 13px; border: 2px solid rgba(255,255,255,0.4);
      border-top-color: #fff; border-radius: 50%;
      animation: bpSpin 0.7s linear infinite; display: inline-block;
    }
  `}</style>
);

const SeccionHeader = ({ icon, titulo }) => (
  <div style={{ display: "flex", alignItems: "center", gap: "9px", marginBottom: "18px" }}>
    <div style={{ width: "30px", height: "30px", borderRadius: "8px", background: colors.naranjaClaro, display: "flex", alignItems: "center", justifyContent: "center", color: colors.naranja, fontSize: "14px" }}>
      {icon}
    </div>
    <h3 style={{ margin: 0, fontSize: "14px", fontWeight: "700", color: colors.naranja }}>{titulo}</h3>
  </div>
);

const InputField = ({ label, required, children }) => (
  <div style={{ display: "flex", flexDirection: "column", gap: "5px" }}>
    <label style={{ fontSize: "11.5px", fontWeight: "700", color: colors.textoSec }}>
      {label}{required && <span style={{ color: colors.rojo }}> *</span>}
    </label>
    {children}
  </div>
);

const inputStyle = {
  padding: "9px 12px", borderRadius: "8px", border: `1px solid ${colors.borde}`,
  fontSize: "13px", color: colors.texto, outline: "none", background: "#fafbfc",
  fontFamily: "inherit", width: "100%", boxSizing: "border-box",
};

const SelectConOtros = ({ opciones, value, otroValue, onChange, onChangeOtro, error, placeholder = "Selecciona...", placeholderOtro = "Escribe el valor...", styleAdicional = {} }) => (
  <>
    <select
      className="bp-select"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      style={{ ...inputStyle, borderColor: error ? colors.rojo : colors.borde, ...styleAdicional }}
    >
      <option value="">{placeholder}</option>
      {opciones.map((o) => <option key={o}>{o}</option>)}
      <option value={OTROS}>{OTROS}</option>
    </select>
    {value === OTROS && (
      <div className="bp-campo-otro" style={{ marginTop: "6px" }}>
        <input
          className="bp-input"
          value={otroValue}
          onChange={(e) => onChangeOtro(e.target.value)}
          placeholder={placeholderOtro}
          autoFocus
          style={{ ...inputStyle, borderColor: error ? colors.rojo : colors.naranja, background: colors.naranjaClaro }}
        />
      </div>
    )}
  </>
);

export default function EquipoNuevo({ usuario, cerrarSesion }) {
  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  const formVacio = {
    categoria: "", categoriaOtro: "",
    subcategoria: "",
    marca: "",
    modelo: "", numeroSerie: "", estadoInicial: "Nuevo", estadoInicialOtro: "", direccionIp: "",
    licencia: "", licenciaOtro: "",
    areaEmpresa: "", areaOtro: "",
    responsable: "", telefono: "", ubicacion: "",
    observaciones: "", valor: "",
  };

  const [form, setForm] = useState(formVacio);
  const [accesorios, setAccesorios] = useState([]);
  const [accesorioCustom, setAccesorioCustom] = useState("");
  const [guardando, setGuardando] = useState(false);
  const [equipoGuardado, setEquipoGuardado] = useState(null);
  const [errores, setErrores] = useState({});
  const [editando, setEditando] = useState(false);
  const [modoCorreccion, setModoCorreccion] = useState(false); 
  const [busqueda, setBusqueda] = useState("");
  const [resultados, setResultados] = useState([]);
  const [buscando, setBuscando] = useState(false);
  const [mostrarResultados, setMostrarResultados] = useState(false);
  const buscadorRef = useRef(null);

  const soloLectura = !!equipoGuardado && !editando;
  const activarEdicion = () => setEditando(true);

  const ejecutarBusqueda = async (texto) => {
    if (texto.trim().length < 2) { setResultados([]); return; }
    setBuscando(true);
    try {
      const res = await fetch(`http://localhost:3000/api/equipos/buscar?q=${encodeURIComponent(texto)}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      setResultados(Array.isArray(data) ? data : []);
    } catch {
      setResultados([]);
    } finally {
      setBuscando(false);
    }
  };

  useEffect(() => {
    if (busqueda.trim().length < 2) { setResultados([]); return; }
    setBuscando(true);
    const timeout = setTimeout(() => ejecutarBusqueda(busqueda), 350);
    return () => clearTimeout(timeout);
  }, [busqueda, token]);

  useEffect(() => {
    const cerrarAlClickFuera = (e) => {
      if (buscadorRef.current && !buscadorRef.current.contains(e.target)) {
        setMostrarResultados(false);
      }
    };
    document.addEventListener("mousedown", cerrarAlClickFuera);
    return () => document.removeEventListener("mousedown", cerrarAlClickFuera);
  }, []);

  const cargarEquipo = (eq) => {
    const resolver = (valor, lista) => {
      if (!valor) return { sel: "", otro: "" };
      return lista.includes(valor) ? { sel: valor, otro: "" } : { sel: OTROS, otro: valor };
    };

    const cat = resolver(eq.categoria, CATEGORIAS);
    const est = resolver(eq.estadoInicial, ESTADOS_INICIALES);

    // "licencias" es un JSON array en la base de datos (ej: '["Office 365"]').
    // El formulario solo maneja una licencia a la vez, así que tomamos la primera.
    let licenciaGuardada = "";
    try {
      const arr = JSON.parse(eq.licencias || "[]");
      licenciaGuardada = Array.isArray(arr) ? (arr[0] || "") : "";
    } catch {
      licenciaGuardada = "";
    }
    const lic = resolver(licenciaGuardada, LICENCIAS);
    const are = resolver(eq.areaEmpresa, AREAS);

    setForm({
      categoria: cat.sel, categoriaOtro: cat.otro,
      subcategoria: eq.subcategoria || "",
      marca: eq.marca || "",
      modelo: eq.modelo || "",
      numeroSerie: eq.numeroSerie || "",
      estadoInicial: est.sel, estadoInicialOtro: est.otro,
      direccionIp: eq.direccionIp || "",
      licencia: lic.sel, licenciaOtro: lic.otro,
      areaEmpresa: are.sel, areaOtro: are.otro,
      responsable: eq.responsable || "",
      telefono: eq.telefono || "",
      ubicacion: eq.ubicacion || "",
      observaciones: eq.observaciones || "",
      valor: eq.valor || "",
    });
    try { setAccesorios(JSON.parse(eq.accesorios || "[]")); } catch { setAccesorios([]); }
    setEquipoGuardado(eq);
    setEditando(true);
    setModoCorreccion(true);
    setErrores({});
    setMostrarResultados(false);
    setBusqueda("");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const nuevoRegistro = () => {
    setForm(formVacio);
    setAccesorios([]);
    setEquipoGuardado(null);
    setEditando(false);
    setModoCorreccion(false);
    setErrores({});
  };

  const set = (k, v) => setForm((p) => ({ ...p, [k]: v }));
  const toggleAccesorio = (acc) =>
    setAccesorios((prev) => prev.includes(acc) ? prev.filter((a) => a !== acc) : [...prev, acc]);

  const agregarCustom = () => {
    if (accesorioCustom.trim() && !accesorios.includes(accesorioCustom.trim())) {
      setAccesorios((p) => [...p, accesorioCustom.trim()]);
      setAccesorioCustom("");
    }
  };

  const valorFinal = (sel, otro) => (sel === OTROS ? otro.trim() : sel);

  const validar = () => {
    const e = {};
    if (!valorFinal(form.categoria, form.categoriaOtro)) e.categoria = true;
    if (!form.marca) e.marca = true;
    if (!form.modelo) e.modelo = true;
    if (!form.numeroSerie) e.numeroSerie = true;
    setErrores(e);
    return Object.keys(e).length === 0;
  };

  const guardar = async () => {
    if (!validar()) return;
    setGuardando(true);
    try {
      const esEdicion = editando && equipoGuardado?.id;
      const url = esEdicion
        ? `http://localhost:3000/api/equipos/${equipoGuardado.id}`
        : "http://localhost:3000/api/equipos";
      
      const payload = {
        categoria: valorFinal(form.categoria, form.categoriaOtro),
        subcategoria: form.subcategoria,
        marca: form.marca.trim(),
        modelo: form.modelo,
        numeroSerie: form.numeroSerie,
        estadoInicial: valorFinal(form.estadoInicial, form.estadoInicialOtro),
        direccionIp: form.direccionIp,
        licencia: valorFinal(form.licencia, form.licenciaOtro),
        areaEmpresa: valorFinal(form.areaEmpresa, form.areaOtro),
        responsable: form.responsable,
        telefono: form.telefono,
        ubicacion: form.ubicacion,
        observaciones: form.observaciones,
        valor: form.valor,
        accesorios,
      };

      const res = await fetch(url, {
        method: esEdicion ? "PUT" : "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) { alert(data.message || "Error al guardar"); setGuardando(false); return; }
      setEquipoGuardado(data);
      setEditando(false);
      setModoCorreccion(false);
    } catch { alert("Error al conectar con el servidor"); }
    finally { setGuardando(false); }
  };

  const imprimirHoja = async () => {
    if (!equipoGuardado) { alert("Primero guarda el registro"); return; }
    const eq = equipoGuardado;
    const fecha = new Date(eq.createdAt).toLocaleDateString("es-HN", { day: "2-digit", month: "2-digit", year: "numeric" });
    const accs = JSON.parse(eq.accesorios || "[]").join(", ");
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
    } catch {
      logoBase64 = "";
    }
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
<h2>Entrega de ${eq.categoria}</h2>
<p>Yo, <strong>${(eq.responsable || "___________________").toUpperCase()}</strong>, por medio de la presente hago constar que recibo de la empresa Beneficio de Arroz Progreso (BAPROSA), ${art} ${eq.categoria.toLowerCase()} para uso exclusivo en el desempeño de mis labores y hacer eficiente la comunicación, también es entendido que el dispositivo es propiedad de la empresa, por el cual me comprometo a cuidarlo y darle el uso adecuado al mismo, en caso de despido o renuncia debo devolver en buen estado en el momento que se me solicite, en caso de extravío, daño o destrucción, autorizo a la empresa a deducir el valor equivalente al equipo, de mi salario, derechos o prestaciones laborales para la cancelación de este dispositivo.</p>
<div class="specs" style="margin:20px 0;">
  <p>Especificaciones: <strong>${eq.estadoInicial.toUpperCase()}</strong></p>
  <p>${eq.categoria.toUpperCase()} ${eq.marca.toUpperCase()} ${eq.modelo.toUpperCase()}</p>
  ${eq.direccionIp ? `<p>IP: ${eq.direccionIp}</p>` : ""}
  <p>SN: ${eq.numeroSerie}</p>
  ${eq.licencia ? `<p>Licencia asignada: ${eq.licencia.toUpperCase()}</p>` : ""}
  ${eq.areaEmpresa ? `<p>Área: ${eq.areaEmpresa}</p>` : ""}
  ${eq.telefono ? `<p>Teléfono de contacto: ${eq.telefono}</p>` : ""}
  ${accs ? `<p>Accesorios: ${accs.toUpperCase()}.</p>` : ""}
  ${eq.observaciones ? `<p>Observaciones: ${eq.observaciones}</p>` : ""}
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

  const validaciones = [
    { label: "Categoría seleccionada", ok: !!valorFinal(form.categoria, form.categoriaOtro) },
    { label: "Marca ingresada", ok: !!form.marca },
    { label: "Modelo ingresado", ok: !!form.modelo },
    { label: "Número de serie ingresado", ok: !!form.numeroSerie },
    { label: "Estado inicial definido", ok: !!valorFinal(form.estadoInicial, form.estadoInicialOtro) },
    { label: "Área asignada", ok: !!valorFinal(form.areaEmpresa, form.areaOtro) },
    { label: "Responsable asignado", ok: !!form.responsable },
    { label: "Licencia asignada (opcional)", ok: true },
    { label: "Dirección IP (opcional)", ok: true },
  ];

  const textoBotonGuardar = guardando
    ? "Guardando..."
    : editando
      ? (modoCorreccion ? "Actualizar equipo" : "Guardar edición")
      : "Guardar cambios";

  return (
    <div style={{ display: "flex", minHeight: "100vh", backgroundColor: colors.fondo, fontFamily: "'Segoe UI', sans-serif" }}>
      <link href="https://fonts.googleapis.com/css2?family=Manrope:wght@500;700;800&display=swap" rel="stylesheet" />
      <GlobalStyles />
      <Sidebar usuario={usuario} cerrarSesion={cerrarSesion} />
      <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>
        {/* ============ TOPBAR ============ */}
        <Topbar usuario={usuario} cerrarSesion={cerrarSesion} />
        {/* ============ CONTENIDO ============ */}
        <div style={{ flex: 1, overflowY: "auto", padding: "24px 28px" }}>
          {/* NUEVO/RECUPERADO: buscador de equipos existentes — antes vivía
              junto al logo en el topbar viejo; con el <Topbar/> compartido
              ya no cabe ahí, así que queda aquí arriba del formulario. */}
          <div ref={buscadorRef} style={{ position: "relative", marginBottom: "18px", maxWidth: "460px" }}>
            <div style={{ position: "relative" }}>
              <FaSearch style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)", color: colors.textoMuted, fontSize: "13px" }} />
              <input
                value={busqueda}
                onChange={(e) => { setBusqueda(e.target.value); setMostrarResultados(true); }}
                onFocus={() => setMostrarResultados(true)}
                placeholder="Buscar equipo existente por folio, serie, marca o responsable..."
                style={{ ...inputStyle, paddingLeft: "34px", background: "#fff" }}
              />
            </div>
            {mostrarResultados && busqueda.trim().length >= 2 && (
              <div className="bp-dropdown" style={{ position: "absolute", top: "40px", left: 0, right: 0, background: "#fff", border: `1px solid ${colors.borde}`, borderRadius: "10px", boxShadow: "0 12px 28px rgba(15,23,42,0.12)", zIndex: 40, maxHeight: "260px", overflowY: "auto" }}>
                {buscando ? (
                  <p style={{ padding: "14px", margin: 0, fontSize: "12.5px", color: colors.textoMuted }}>Buscando...</p>
                ) : resultados.length === 0 ? (
                  <p style={{ padding: "14px", margin: 0, fontSize: "12.5px", color: colors.textoMuted }}>Sin resultados para "{busqueda}".</p>
                ) : (
                  resultados.map((eq) => (
                    <div key={eq.id} className="bp-resultado" onClick={() => cargarEquipo(eq)}
                      style={{ padding: "10px 14px", borderBottom: `1px solid ${colors.fondo}`, fontSize: "12.5px" }}>
                      <strong style={{ color: colors.naranja }}>{eq.folio}</strong> — {eq.categoria} {eq.marca} {eq.modelo}
                      <div style={{ color: colors.textoMuted, fontSize: "11px" }}>{eq.numeroSerie} · {eq.responsable || "Sin responsable"}</div>
                    </div>
                  ))
                )}
              </div>
            )}
          </div>
          <div style={{ display: "flex", alignItems: "flex-start", gap: "12px", marginBottom: "20px" }}>
            <button className="bp-btn" onClick={() => navigate("/admin/registro-entrada")}
              style={{ width: "34px", height: "34px", borderRadius: "50%", background: "#fff", border: `1px solid ${colors.borde}`, display: "flex", alignItems: "center", justifyContent: "center", color: colors.textoSec, fontSize: "13px", flexShrink: 0, marginTop: "4px" }}
              onMouseEnter={(e) => { e.currentTarget.style.background = colors.naranjaClaro; e.currentTarget.style.color = colors.naranja; }}
              onMouseLeave={(e) => { e.currentTarget.style.background = "#fff"; e.currentTarget.style.color = colors.textoSec; }}
            ><FaArrowLeft /></button>
            <div style={{ flex: 1 }}>
              <p style={{ margin: "0 0 2px", fontSize: "11.5px", color: colors.naranja, fontWeight: "600", cursor: "pointer" }} onClick={() => navigate("/admin/registro-entrada")}>← Volver a selección</p>
              <h1 style={{ margin: 0, fontSize: "20px", fontWeight: "800", color: colors.texto, fontFamily: "'Manrope', sans-serif" }}>
                {modoCorreccion ? "Corrección de Registro — Equipo Existente" : "Registro de Entrada — Equipo Nuevo"}
              </h1>
              <p style={{ margin: 0, fontSize: "12px", color: colors.textoSec }}>
                {modoCorreccion
                  ? "Corrige los datos con error y presiona \"Actualizar equipo\""
                  : "Complete los campos para registrar un nuevo equipo en el inventario"}
              </p>
            </div>
            <div style={{ display: "flex", gap: "10px", flexShrink: 0 }}>
              <button className="bp-btn bp-btn-outline" onClick={imprimirHoja} disabled={!equipoGuardado}
                style={{ display: "flex", alignItems: "center", gap: "7px", padding: "9px 18px", borderRadius: "9px", border: `1px solid ${colors.borde}`, background: "#fff", color: equipoGuardado ? colors.texto : colors.textoMuted, fontSize: "13px", fontWeight: "700", fontFamily: "inherit" }}>
                <FaPrint /> Imprimir hoja de entrega
              </button>
              {soloLectura && (
                <button className="bp-btn bp-btn-outline" onClick={activarEdicion}
                  style={{ display: "flex", alignItems: "center", gap: "7px", padding: "9px 18px", borderRadius: "9px", border: `1px solid ${colors.naranja}`, background: "#fff", color: colors.naranja, fontSize: "13px", fontWeight: "700", fontFamily: "inherit" }}>
                  <FaPen style={{ fontSize: "11px" }} /> Editar registro
                </button>
              )}
              <button className="bp-btn bp-btn-primary" onClick={guardar} disabled={guardando || soloLectura}
                style={{ display: "flex", alignItems: "center", gap: "7px", padding: "9px 18px", borderRadius: "9px", border: "none", background: soloLectura ? colors.verde : colors.naranja, color: "white", fontSize: "13px", fontWeight: "700", fontFamily: "inherit" }}>
                {soloLectura
                  ? <><FaCheckCircle /> Guardado</>
                  : <>{guardando ? <span className="bp-spinner" /> : <FaSave />} {textoBotonGuardar}</>}
              </button>
            </div>
          </div>
          {/* ============ BANNERS ============ */}
          {modoCorreccion && editando && (
            <div className="bp-banner" style={{ background: colors.azulClaro, border: `1px solid ${colors.azul}`, borderRadius: "9px", padding: "12px 18px", marginBottom: "16px", display: "flex", alignItems: "center", justifyContent: "space-between", gap: "10px", color: colors.azul, fontSize: "13px", fontWeight: "700" }}>
              <span style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                <FaPen /> Equipo <strong>{equipoGuardado?.folio}</strong> cargado desde la búsqueda. Todos los campos son editables — corrige el error y presiona "Actualizar equipo".
              </span>
              <button className="bp-btn" onClick={nuevoRegistro}
                style={{ background: "none", border: `1px solid ${colors.azul}`, color: colors.azul, borderRadius: "7px", padding: "5px 12px", fontSize: "12px", fontWeight: "700", fontFamily: "inherit", flexShrink: 0 }}>
                <FaPlus style={{ fontSize: "10px", marginRight: "5px" }} />Nuevo registro
              </button>
            </div>
          )}
          {equipoGuardado && !editando && (
            <div className="bp-banner" style={{ background: colors.verdeClaro, border: `1px solid ${colors.verde}`, borderRadius: "9px", padding: "12px 18px", marginBottom: "16px", display: "flex", alignItems: "center", gap: "10px", color: colors.verde, fontSize: "13px", fontWeight: "700" }}>
              <FaCheckCircle /> Equipo {modoCorreccion ? "actualizado" : "registrado"} exitosamente. Folio: <strong>{equipoGuardado.folio}</strong> — Ya puedes imprimir la hoja de entrega, o editarlo si hay algún error.
            </div>
          )}
          {editando && !modoCorreccion && (
            <div className="bp-banner" style={{ background: colors.naranjaClaro, border: `1px solid ${colors.naranja}`, borderRadius: "9px", padding: "12px 18px", marginBottom: "16px", display: "flex", alignItems: "center", gap: "10px", color: colors.naranjaOscuro, fontSize: "13px", fontWeight: "700" }}>
              Modo edición activado — corrige los campos necesarios y presiona "Guardar edición". El folio <strong>{equipoGuardado?.folio}</strong> no cambia.
            </div>
          )}
          {Object.keys(errores).length > 0 && (
            <div className="bp-banner" style={{ background: colors.rojoClaro, border: `1px solid ${colors.rojo}`, borderRadius: "9px", padding: "12px 18px", marginBottom: "16px", color: colors.rojo, fontSize: "13px", fontWeight: "600" }}>
              Completa los campos requeridos: {Object.keys(errores).join(", ")}
            </div>
          )}
          <div style={{ display: "flex", gap: "20px", alignItems: "flex-start" }}>
            <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: "16px" }}>
              {/* ============ INFORMACIÓN DEL EQUIPO ============ */}
              <div style={{ background: "#fff", borderRadius: "12px", border: `1px solid ${colors.borde}`, padding: "22px", transition: "all 0.3s ease" }}>
                <SeccionHeader icon={<FaLaptop />} titulo="Información del Equipo" />
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "14px" }}>
                  <InputField label="Categoría del equipo" required>
                    <SelectConOtros
                      opciones={CATEGORIAS}
                      value={form.categoria}
                      otroValue={form.categoriaOtro}
                      onChange={(v) => { set("categoria", v); if (v !== OTROS) set("categoriaOtro", ""); }}
                      onChangeOtro={(v) => set("categoriaOtro", v)}
                      error={errores.categoria}
                      placeholderOtro="Escribe la categoría..."
                    />
                  </InputField>
                  <InputField label="Subcategoría / Tipo específico">
                    <input className="bp-input" value={form.subcategoria} onChange={(e) => set("subcategoria", e.target.value)}
                      placeholder="Laptop corporativa..." style={inputStyle} />
                  </InputField>
                  <InputField label="Marca" required>
                    <input 
                      className="bp-input" 
                      value={form.marca} 
                      onChange={(e) => set("marca", e.target.value)}
                      placeholder="Escribe la marca del equipo..." 
                      style={{ ...inputStyle, borderColor: errores.marca ? colors.rojo : colors.borde }} 
                    />
                  </InputField>
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "14px", marginTop: "14px" }}>
                  <InputField label="Modelo" required>
                    <input className="bp-input" value={form.modelo} onChange={(e) => set("modelo", e.target.value)}
                      placeholder="Latitude 5540, A16..." style={{ ...inputStyle, borderColor: errores.modelo ? colors.rojo : colors.borde }} />
                  </InputField>
                  <InputField label="Número de serie / Código interno" required>
                    <input className="bp-input" value={form.numeroSerie} onChange={(e) => set("numeroSerie", e.target.value)}
                      placeholder="SN-DL5540-2024-0087" style={{ ...inputStyle, borderColor: errores.numeroSerie ? colors.rojo : colors.borde }} />
                  </InputField>
                  <InputField label="Estado inicial">
                    <SelectConOtros
                      opciones={ESTADOS_INICIALES}
                      value={form.estadoInicial}
                      otroValue={form.estadoInicialOtro}
                      onChange={(v) => { set("estadoInicial", v); if (v !== OTROS) set("estadoInicialOtro", ""); }}
                      onChangeOtro={(v) => set("estadoInicialOtro", v)}
                      placeholder="Selecciona el estado..."
                      placeholderOtro="Escribe el estado del equipo..."
                    />
                  </InputField>
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "14px", marginTop: "14px" }}>
                  <InputField label="Dirección IP (opcional — no aplica para celulares)">
                    <div style={{ position: "relative" }}>
                      <FaWifi style={{ position: "absolute", left: "10px", top: "50%", transform: "translateY(-50%)", color: colors.textoMuted, fontSize: "13px", zIndex: 1 }} />
                      <input className="bp-input" value={form.direccionIp} onChange={(e) => set("direccionIp", e.target.value)}
                        placeholder="192.168.1.145" style={{ ...inputStyle, paddingLeft: "30px" }} />
                    </div>
                  </InputField>
                  <InputField label="Licencia asignada">
                    <div style={{ position: "relative" }}>
                      <FaKey style={{ position: "absolute", left: "10px", top: "13px", color: colors.textoMuted, fontSize: "12px", zIndex: 1 }} />
                      <SelectConOtros
                        opciones={LICENCIAS}
                        value={form.licencia}
                        otroValue={form.licenciaOtro}
                        onChange={(v) => { set("licencia", v); if (v !== OTROS) set("licenciaOtro", ""); }}
                        onChangeOtro={(v) => set("licenciaOtro", v)}
                        placeholder="Selecciona la licencia..."
                        placeholderOtro="Escribe la licencia..."
                        styleAdicional={{ paddingLeft: "30px" }}
                      />
                    </div>
                  </InputField>
                </div>
              </div>
              {/* ============ ASIGNACIÓN ============ */}
              <div style={{ background: "#fff", borderRadius: "12px", border: `1px solid ${colors.borde}`, padding: "22px", transition: "all 0.3s ease" }}>
                <SeccionHeader icon={<FaUser />} titulo="Asignación" />
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr", gap: "14px" }}>
                  <InputField label="Área de la empresa">
                    <SelectConOtros
                      opciones={AREAS}
                      value={form.areaEmpresa}
                      otroValue={form.areaOtro}
                      onChange={(v) => { set("areaEmpresa", v); if (v !== OTROS) set("areaOtro", ""); }}
                      onChangeOtro={(v) => set("areaOtro", v)}
                      placeholderOtro="Escribe el área..."
                    />
                  </InputField>
                  <InputField label="Responsable / Usuario asignado">
                    <input className="bp-input" value={form.responsable} onChange={(e) => set("responsable", e.target.value)}
                      placeholder="Nombre completo" style={inputStyle} />
                  </InputField>
                  <InputField label="Teléfono de contacto">
                    <div style={{ position: "relative" }}>
                      <FaPhone style={{ position: "absolute", left: "10px", top: "50%", transform: "translateY(-50%)", color: colors.textoMuted, fontSize: "12px", zIndex: 1 }} />
                      <input className="bp-input" value={form.telefono} onChange={(e) => set("telefono", e.target.value)}
                        placeholder="9999-9999" style={{ ...inputStyle, paddingLeft: "30px" }} />
                    </div>
                  </InputField>
                  <InputField label="Ubicación física">
                    <input className="bp-input" value={form.ubicacion} onChange={(e) => set("ubicacion", e.target.value)}
                      placeholder="Administración, 2do piso..." style={inputStyle} />
                  </InputField>
                </div>
              </div>
              {/* ============ ACCESORIOS ============ */}
              <div style={{ background: "#fff", borderRadius: "12px", border: `1px solid ${colors.borde}`, padding: "22px", transition: "all 0.3s ease" }}>
                <SeccionHeader icon={<FaStar />} titulo="Accesorios opcionales" />
                <div style={{ display: "flex", flexWrap: "wrap", gap: "8px", marginBottom: "12px" }}>
                  {ACCESORIOS_DEFAULT.map((acc) => (
                    <button key={acc} type="button" className="bp-chip" onClick={() => toggleAccesorio(acc)}
                      style={{ padding: "6px 14px", borderRadius: "20px", border: `1.5px solid ${accesorios.includes(acc) ? colors.naranja : colors.borde}`, background: accesorios.includes(acc) ? colors.naranjaClaro : "#fff", color: accesorios.includes(acc) ? colors.naranja : colors.textoSec, fontSize: "12.5px", fontWeight: "600", fontFamily: "inherit", display: "flex", alignItems: "center", gap: "5px" }}>
                      {accesorios.includes(acc) && <FaTimes style={{ fontSize: "10px" }} />}
                      {acc}
                    </button>
                  ))}
                  <div style={{ display: "flex", gap: "6px", alignItems: "center" }}>
                    <input className="bp-input" value={accesorioCustom} onChange={(e) => setAccesorioCustom(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && agregarCustom()}
                      placeholder="Agregar otro..." style={{ ...inputStyle, width: "140px", padding: "6px 10px", fontSize: "12.5px" }} />
                    <button className="bp-btn bp-btn-primary" onClick={agregarCustom} style={{ padding: "6px 10px", borderRadius: "8px", border: "none", background: colors.naranja, color: "white", fontSize: "12px" }}>
                      <FaPlus />
                    </button>
                  </div>
                </div>
                {accesorios.length > 0 && (
                  <p style={{ fontSize: "12px", color: colors.textoSec, margin: 0 }}>
                    Seleccionados: <strong style={{ color: colors.naranja }}>{accesorios.join(", ")}</strong>
                  </p>
                )}
              </div>
              {/* ============ OBSERVACIONES ============ */}
              <div style={{ background: "#fff", borderRadius: "12px", border: `1px solid ${colors.borde}`, padding: "22px", transition: "all 0.3s ease" }}>
                <SeccionHeader icon={<FaClipboard />} titulo="Observaciones" />
                <textarea className="bp-textarea" value={form.observaciones} onChange={(e) => set("observaciones", e.target.value)}
                  placeholder="Escriba observaciones adicionales sobre el equipo..." rows={3}
                  style={{ ...inputStyle, resize: "vertical", fontFamily: "inherit" }} />
              </div>
              {/* ============ VALOR ============ */}
              <div style={{ background: "#fff", borderRadius: "12px", border: `1px solid ${colors.borde}`, padding: "22px", transition: "all 0.3s ease" }}>
                <SeccionHeader icon={<FaDollarSign />} titulo="Valor del equipo" />
                <InputField label="Valor (L.) — opcional">
                  <div style={{ position: "relative", maxWidth: "220px" }}>
                    <span style={{ position: "absolute", left: "10px", top: "50%", transform: "translateY(-50%)", color: colors.textoMuted, fontSize: "13px", fontWeight: "700", zIndex: 1 }}>L.</span>
                    <input className="bp-input" type="number" value={form.valor} onChange={(e) => set("valor", e.target.value)}
                      placeholder="3995.00" style={{ ...inputStyle, paddingLeft: "28px" }} />
                  </div>
                </InputField>
              </div>
            </div>
            {/*PANEL DERECHO*/}
            <div style={{ width: "260px", display: "flex", flexDirection: "column", gap: "14px", flexShrink: 0 }}>
              <div style={{ background: "#fff", borderRadius: "12px", border: `1px solid ${colors.borde}`, padding: "18px" }}>
                <h4 style={{ margin: "0 0 14px", fontSize: "13px", fontWeight: "700", color: colors.texto, display: "flex", alignItems: "center", gap: "7px" }}>
                  <FaTag style={{ color: colors.naranja, fontSize: "12px" }} /> Resumen del registro
                </h4>
                {[
                  { label: "Tipo de registro", value: modoCorreccion ? "Corrección" : "Equipo nuevo" },
                  { label: "Categoría", value: valorFinal(form.categoria, form.categoriaOtro) || "—" },
                  { label: "Marca / Modelo", value: form.marca && form.modelo ? `${form.marca} ${form.modelo}` : form.marca || "—" },
                  { label: "Número de serie", value: form.numeroSerie || "—" },
                  { label: "Licencia", value: valorFinal(form.licencia, form.licenciaOtro) || "—" },
                  { label: "Área", value: valorFinal(form.areaEmpresa, form.areaOtro) || "—" },
                  { label: "Responsable", value: form.responsable || "—" },
                  { label: "Teléfono", value: form.telefono || "—" },
                  { label: "Accesorios", value: accesorios.length > 0 ? `${accesorios.length} seleccionados` : "Ninguno" },
                  { label: "Dirección IP", value: form.direccionIp || "—" },
                ].map(({ label, value }) => (
                  <div key={label} style={{ display: "flex", justifyContent: "space-between", padding: "6px 0", borderBottom: `1px solid ${colors.fondo}`, fontSize: "12px" }}>
                    <span style={{ color: colors.textoSec }}>{label}</span>
                    <span style={{ color: colors.texto, fontWeight: "600", textAlign: "right", maxWidth: "130px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", transition: "all 0.3s ease" }}>{value}</span>
                  </div>
                ))}
              </div>
              <div style={{ background: "#fff", borderRadius: "12px", border: `1px solid ${colors.borde}`, padding: "18px" }}>
                <h4 style={{ margin: "0 0 12px", fontSize: "13px", fontWeight: "700", color: colors.texto, display: "flex", alignItems: "center", gap: "7px" }}>
                  <FaCheckCircle style={{ color: colors.verde, fontSize: "12px" }} /> Validaciones
                </h4>
                {validaciones.map(({ label, ok }) => (
                  <div key={label} style={{ display: "flex", alignItems: "center", gap: "8px", padding: "4px 0", fontSize: "12px", color: ok ? colors.verde : colors.textoMuted, transition: "all 0.3s ease" }}>
                    <FaCheckCircle style={{ fontSize: "12px", color: ok ? colors.verde : "#d1d5db", flexShrink: 0, transition: "all 0.3s ease" }} />
                    {label}
                  </div>
                ))}
              </div>
              <div style={{ background: colors.naranjaClaro, borderRadius: "12px", border: `1px solid #ffd49e`, padding: "14px" }}>
                <p style={{ margin: "9px 0 6px", fontSize: "12px", fontWeight: "700", color: "#92400e", display: "flex", alignItems: "center", gap: "6px" }}>
                  <FaTag style={{ fontSize: "11px" }} /> ¿Tipo de registro incorrecto?
                </p>
                <p style={{ margin: "0 0 10px", fontSize: "11.5px", color: "#92400e" }}>Si el equipo ya fue usado anteriormente y será reasignado, cambia el tipo de registro.</p>
                <button className="bp-btn" onClick={() => navigate("/admin/registro-entrada")} style={{ background: "none", border: "none", color: colors.naranja, fontWeight: "700", fontSize: "12px", padding: 0, fontFamily: "inherit" }}>
                  Cambiar a equipo reasignado →
                </button>
              </div>
            </div>
          </div>
        
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "20px", paddingTop: "16px", borderTop: `1px solid ${colors.borde}` }}>
            <button className="bp-btn bp-btn-outline" onClick={() => navigate("/admin/registro-entrada")}
              style={{ display: "flex", alignItems: "center", gap: "7px", padding: "9px 18px", borderRadius: "9px", border: `1px solid ${colors.borde}`, background: "#fff", color: colors.textoSec, fontSize: "13px", fontWeight: "700", fontFamily: "inherit" }}>
              <FaTimes /> Cancelar
            </button>
            <div style={{ display: "flex", gap: "10px" }}>
              <button className="bp-btn bp-btn-outline" onClick={imprimirHoja} disabled={!equipoGuardado}
                style={{ display: "flex", alignItems: "center", gap: "7px", padding: "9px 18px", borderRadius: "9px", border: `1px solid ${colors.borde}`, background: "#fff", color: equipoGuardado ? colors.texto : colors.textoMuted, fontSize: "13px", fontWeight: "700", fontFamily: "inherit" }}>
                <FaPrint /> Imprimir hoja de entrega
              </button>
              {soloLectura && (
                <button className="bp-btn bp-btn-outline" onClick={activarEdicion}
                  style={{ display: "flex", alignItems: "center", gap: "7px", padding: "9px 18px", borderRadius: "9px", border: `1px solid ${colors.naranja}`, background: "#fff", color: colors.naranja, fontSize: "13px", fontWeight: "700", fontFamily: "inherit" }}>
                  <FaPen style={{ fontSize: "11px" }} /> Editar registro
                </button>
              )}
              <button className="bp-btn bp-btn-primary" onClick={guardar} disabled={guardando || soloLectura}
                style={{ display: "flex", alignItems: "center", gap: "7px", padding: "9px 18px", borderRadius: "9px", border: "none", background: soloLectura ? colors.verde : colors.naranja, color: "white", fontSize: "13px", fontWeight: "700", fontFamily: "inherit" }}>
                {soloLectura
                  ? <><FaCheckCircle /> Guardado</>
                  : <>{guardando ? <span className="bp-spinner" /> : <FaSave />} {textoBotonGuardar}</>}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}