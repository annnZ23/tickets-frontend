import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import baprosaLogo from "../assets/baprosa-logo.png";
import {
  FaLaptop, FaRegBell, FaRegEnvelope, FaChevronDown,
  FaArrowLeft, FaPrint, FaSave, FaTimes, FaPlus,
  FaCheckCircle, FaTag, FaUser, FaStar, FaClipboard,
  FaDollarSign, FaWifi, FaSearch, FaPhone
} from "react-icons/fa";

const colors = {
  naranja: "#ff7f22", naranjaOscuro: "#e66a10", naranjaClaro: "#fff1e6",
  texto: "#1e293b", textoSec: "#64748b", textoMuted: "#94a3b8",
  borde: "#eef1f5", fondo: "#fdf0e6", verde: "#16a34a", verdeClaro: "#e9f9ee",
  rojo: "#dc2626", rojoClaro: "#fee2e2",
};

const CATEGORIAS = ["Laptop", "Monitor", "Impresora", "Teléfono / Celular", "Tablet", "Desktop", "Servidor", "Switch", "Router", "UPS", "Teclado + Mouse", "Otro"];
const ACCESORIOS_DEFAULT = ["Mouse", "Teclado", "Cargador", "Mochila", "Monitor externo", "Cable HDMI", "Audífonos", "Cámara web", "Cobertores", "Vidrio templado", "Base refrigerante", "Maletín de transporte"];
const AREAS = ["Logística", "Ventas", "GPS", "Mercadeo", "Contabilidad", "Bodega", "Báscula", "Suministro", "Silos", "Taller", "Producción", "Guardia", "Compras", "Caja", "Pagos", "Planin", "Transporte", "Créditos", "Gerencia", "Laboratorio", "BodegaPT", "IT"];

const getIniciales = (name) => {
  if (!name) return "A";
  const p = name.trim().split(" ");
  return p.length > 1 ? `${p[0][0]}${p[1][0]}`.toUpperCase() : p[0][0].toUpperCase();
};

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

export default function EquipoNuevo({ usuario, cerrarSesion }) {
  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  const [form, setForm] = useState({
    categoria: "", subcategoria: "", marca: "", modelo: "",
    numeroSerie: "", estadoInicial: "Nuevo", direccionIp: "",
    areaEmpresa: "", responsable: "", telefono: "", ubicacion: "",
    observaciones: "", valor: "",
  });
  const [accesorios, setAccesorios] = useState([]);
  const [accesorioCustom, setAccesorioCustom] = useState("");
  const [guardando, setGuardando] = useState(false);
  const [equipoGuardado, setEquipoGuardado] = useState(null);
  const [errores, setErrores] = useState({});

  // --- Buscador de equipos existentes ---
  const [busqueda, setBusqueda] = useState("");
  const [resultados, setResultados] = useState([]);
  const [buscando, setBuscando] = useState(false);
  const [mostrarResultados, setMostrarResultados] = useState(false);
  const buscadorRef = useRef(null);

  useEffect(() => {
    if (busqueda.trim().length < 2) {
      setResultados([]);
      return;
    }
    setBuscando(true);
    const timeout = setTimeout(async () => {
      try {
        const res = await fetch(`http://localhost:3000/api/equipos/buscar?q=${encodeURIComponent(busqueda)}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        setResultados(Array.isArray(data) ? data : []);
      } catch {
        setResultados([]);
      } finally {
        setBuscando(false);
      }
    }, 350);
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

  const set = (k, v) => setForm((p) => ({ ...p, [k]: v }));

  const toggleAccesorio = (acc) =>
    setAccesorios((prev) => prev.includes(acc) ? prev.filter((a) => a !== acc) : [...prev, acc]);

  const agregarCustom = () => {
    if (accesorioCustom.trim() && !accesorios.includes(accesorioCustom.trim())) {
      setAccesorios((p) => [...p, accesorioCustom.trim()]);
      setAccesorioCustom("");
    }
  };

  const validar = () => {
    const e = {};
    if (!form.categoria) e.categoria = true;
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
      const res = await fetch("http://localhost:3000/api/equipos", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ ...form, accesorios }),
      });
      const data = await res.json();
      if (!res.ok) { alert(data.message || "Error al guardar"); setGuardando(false); return; }
      setEquipoGuardado(data);
    } catch { alert("Error al conectar con el servidor"); }
    finally { setGuardando(false); }
  };

  const imprimirHoja = () => {
    if (!equipoGuardado) { alert("Primero guarda el registro"); return; }
    const eq = equipoGuardado;
    const fecha = new Date(eq.createdAt).toLocaleDateString("es-HN", { day: "2-digit", month: "2-digit", year: "numeric" });
    const accs = JSON.parse(eq.accesorios || "[]").join(", ");
    const art = ["a","e","i","o","u"].includes(eq.categoria[0].toLowerCase()) ? "un" : "una";
    // URL absoluta del logo — el navegador necesita la ruta completa porque la ventana
    // de impresión se abre en blanco (about:blank) y no hereda el bundling de Vite.
    // Requisito: el archivo debe existir en /public/baprosa-logo.png del proyecto frontend.
    const logoUrl = `${window.location.origin}/baprosa-logo.png`;

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
<div class="logo"><img src="${logoUrl}" alt="Baprosa"></div>
<h2>Entrega de ${eq.categoria}</h2>
<p>Yo, <strong>${(eq.responsable || "___________________").toUpperCase()}</strong>, por medio de la presente hago constar que recibo de la empresa Beneficio de Arroz Progreso (BAPROSA), ${art} ${eq.categoria.toLowerCase()} para uso exclusivo en el desempeño de mis labores y hacer eficiente la comunicación, también es entendido que el dispositivo es propiedad de la empresa, por el cual me comprometo a cuidarlo y darle el uso adecuado al mismo, en caso de despido o renuncia debo devolver en buen estado en el momento que se me solicite, en caso de extravío, daño o destrucción, autorizo a la empresa a deducir el valor equivalente al equipo, de mi salario, derechos o prestaciones laborales para la cancelación de este dispositivo.</p>
<div class="specs" style="margin:20px 0;">
  <p>Especificaciones: <strong>${eq.estadoInicial.toUpperCase()}</strong></p>
  <p>${eq.categoria.toUpperCase()} ${eq.marca.toUpperCase()} ${eq.modelo.toUpperCase()}</p>
  ${eq.direccionIp ? `<p>IP: ${eq.direccionIp}</p>` : ""}
  <p>SN: ${eq.numeroSerie}</p>
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
    { label: "Categoría seleccionada", ok: !!form.categoria },
    { label: "Marca ingresada", ok: !!form.marca },
    { label: "Modelo ingresado", ok: !!form.modelo },
    { label: "Número de serie ingresado", ok: !!form.numeroSerie },
    { label: "Estado inicial definido", ok: !!form.estadoInicial },
    { label: "Área asignada", ok: !!form.areaEmpresa },
    { label: "Responsable asignado", ok: !!form.responsable },
    { label: "Dirección IP (opcional)", ok: true },
  ];

  return (
    <div style={{ display: "flex", minHeight: "100vh", backgroundColor: colors.fondo, fontFamily: "'Segoe UI', sans-serif" }}>
      <link href="https://fonts.googleapis.com/css2?family=Manrope:wght@500;700;800&display=swap" rel="stylesheet" />
      <Sidebar usuario={usuario} cerrarSesion={cerrarSesion} />

      <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>
        {/* TOPBAR */}
        <div style={{ height: "65px", backgroundColor: "#fff", borderBottom: `1px solid ${colors.borde}`, boxShadow: "0 1px 4px rgba(15,23,42,0.04)", display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 28px", flexShrink: 0 }}>
          <img src={baprosaLogo} alt="Baprosa" style={{ height: "46px", objectFit: "contain" }} />

          {/* Buscador de equipos existentes */}
          <div ref={buscadorRef} style={{ position: "relative", flex: 1, maxWidth: "360px", margin: "0 24px" }}>
            <div style={{ position: "relative" }}>
              <FaSearch style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)", color: colors.textoMuted, fontSize: "13px" }} />
              <input
                value={busqueda}
                onChange={(e) => { setBusqueda(e.target.value); setMostrarResultados(true); }}
                onFocus={() => setMostrarResultados(true)}
                placeholder="Buscar por folio, serie, marca o responsable..."
                style={{ ...inputStyle, paddingLeft: "34px", background: colors.fondo, border: `1px solid ${colors.borde}` }}
              />
            </div>
            {mostrarResultados && busqueda.trim().length >= 2 && (
              <div style={{ position: "absolute", top: "44px", left: 0, right: 0, background: "#fff", border: `1px solid ${colors.borde}`, borderRadius: "10px", boxShadow: "0 8px 24px rgba(15,23,42,0.12)", maxHeight: "320px", overflowY: "auto", zIndex: 50 }}>
                {buscando && (
                  <div style={{ padding: "14px", fontSize: "12.5px", color: colors.textoSec }}>Buscando...</div>
                )}
                {!buscando && resultados.length === 0 && (
                  <div style={{ padding: "14px", fontSize: "12.5px", color: colors.textoSec }}>Sin resultados. Este número de serie está libre para usarse.</div>
                )}
                {!buscando && resultados.map((eq) => (
                  <div key={eq.id} style={{ padding: "10px 14px", borderBottom: `1px solid ${colors.fondo}`, cursor: "default" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <span style={{ fontSize: "12.5px", fontWeight: "700", color: colors.texto }}>{eq.marca} {eq.modelo}</span>
                      <span style={{ fontSize: "10.5px", color: colors.naranja, fontWeight: "700" }}>{eq.folio}</span>
                    </div>
                    <div style={{ fontSize: "11.5px", color: colors.textoSec }}>
                      SN: {eq.numeroSerie} &bull; {eq.responsable || "Sin asignar"} &bull; {eq.areaEmpresa || "—"}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

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
              style={{ width: "34px", height: "34px", borderRadius: "50%", background: "#fff", border: `1px solid ${colors.borde}`, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", color: colors.textoSec, fontSize: "13px", flexShrink: 0, marginTop: "4px" }}
              onMouseEnter={(e) => { e.currentTarget.style.background = colors.naranjaClaro; e.currentTarget.style.color = colors.naranja; }}
              onMouseLeave={(e) => { e.currentTarget.style.background = "#fff"; e.currentTarget.style.color = colors.textoSec; }}
            ><FaArrowLeft /></button>
            <div style={{ flex: 1 }}>
              <p style={{ margin: "0 0 2px", fontSize: "11.5px", color: colors.naranja, fontWeight: "600", cursor: "pointer" }} onClick={() => navigate("/admin/registro-entrada")}>← Volver a selección</p>
              <h1 style={{ margin: 0, fontSize: "20px", fontWeight: "800", color: colors.texto, fontFamily: "'Manrope', sans-serif" }}>Registro de Entrada — Equipo Nuevo</h1>
              <p style={{ margin: 0, fontSize: "12px", color: colors.textoSec }}>Complete los campos para registrar un nuevo equipo en el inventario</p>
            </div>
            <div style={{ display: "flex", gap: "10px", flexShrink: 0 }}>
              <button onClick={imprimirHoja} disabled={!equipoGuardado}
                style={{ display: "flex", alignItems: "center", gap: "7px", padding: "9px 18px", borderRadius: "9px", border: `1px solid ${colors.borde}`, background: "#fff", color: equipoGuardado ? colors.texto : colors.textoMuted, fontSize: "13px", fontWeight: "700", cursor: equipoGuardado ? "pointer" : "not-allowed", fontFamily: "inherit" }}>
                <FaPrint /> Imprimir hoja de entrega
              </button>
              <button onClick={guardar} disabled={guardando || !!equipoGuardado}
                style={{ display: "flex", alignItems: "center", gap: "7px", padding: "9px 18px", borderRadius: "9px", border: "none", background: equipoGuardado ? colors.verde : colors.naranja, color: "white", fontSize: "13px", fontWeight: "700", cursor: guardando || equipoGuardado ? "default" : "pointer", fontFamily: "inherit", transition: "background 0.15s" }}
                onMouseEnter={(e) => { if (!guardando && !equipoGuardado) e.currentTarget.style.background = colors.naranjaOscuro; }}
                onMouseLeave={(e) => { if (!guardando && !equipoGuardado) e.currentTarget.style.background = colors.naranja; }}>
                {equipoGuardado ? <><FaCheckCircle /> Guardado</> : <><FaSave /> {guardando ? "Guardando..." : "Guardar cambios"}</>}
              </button>
            </div>
          </div>

          {equipoGuardado && (
            <div style={{ background: colors.verdeClaro, border: `1px solid ${colors.verde}`, borderRadius: "9px", padding: "12px 18px", marginBottom: "16px", display: "flex", alignItems: "center", gap: "10px", color: colors.verde, fontSize: "13px", fontWeight: "700" }}>
              <FaCheckCircle /> Equipo registrado exitosamente. Folio: <strong>{equipoGuardado.folio}</strong> — Ya puedes imprimir la hoja de entrega.
            </div>
          )}

          {Object.keys(errores).length > 0 && (
            <div style={{ background: colors.rojoClaro, border: `1px solid ${colors.rojo}`, borderRadius: "9px", padding: "12px 18px", marginBottom: "16px", color: colors.rojo, fontSize: "13px", fontWeight: "600" }}>
              Completa los campos requeridos: {Object.keys(errores).join(", ")}
            </div>
          )}

          <div style={{ display: "flex", gap: "20px", alignItems: "flex-start" }}>
            {/* FORMULARIO */}
            <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: "16px" }}>

              {/* Información del Equipo */}
              <div style={{ background: "#fff", borderRadius: "12px", border: `1px solid ${colors.borde}`, padding: "22px" }}>
                <SeccionHeader icon={<FaLaptop />} titulo="Información del Equipo" />
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "14px" }}>
                  <InputField label="Categoría del equipo" required>
                    <select value={form.categoria} onChange={(e) => set("categoria", e.target.value)}
                      style={{ ...inputStyle, borderColor: errores.categoria ? colors.rojo : colors.borde }}
                      onFocus={(e) => (e.target.style.borderColor = colors.naranja)}
                      onBlur={(e) => (e.target.style.borderColor = errores.categoria ? colors.rojo : colors.borde)}>
                      <option value="">Selecciona...</option>
                      {CATEGORIAS.map((c) => <option key={c}>{c}</option>)}
                    </select>
                  </InputField>
                  <InputField label="Subcategoría / Tipo específico">
                    <input value={form.subcategoria} onChange={(e) => set("subcategoria", e.target.value)}
                      placeholder="Laptop corporativa..." style={inputStyle}
                      onFocus={(e) => (e.target.style.borderColor = colors.naranja)}
                      onBlur={(e) => (e.target.style.borderColor = colors.borde)} />
                  </InputField>
                  <InputField label="Marca" required>
                    <input value={form.marca} onChange={(e) => set("marca", e.target.value)}
                      placeholder="Dell, HP, Apple..." style={{ ...inputStyle, borderColor: errores.marca ? colors.rojo : colors.borde }}
                      onFocus={(e) => (e.target.style.borderColor = colors.naranja)}
                      onBlur={(e) => (e.target.style.borderColor = errores.marca ? colors.rojo : colors.borde)} />
                  </InputField>
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "14px", marginTop: "14px" }}>
                  <InputField label="Modelo" required>
                    <input value={form.modelo} onChange={(e) => set("modelo", e.target.value)}
                      placeholder="Latitude 5540, A16..." style={{ ...inputStyle, borderColor: errores.modelo ? colors.rojo : colors.borde }}
                      onFocus={(e) => (e.target.style.borderColor = colors.naranja)}
                      onBlur={(e) => (e.target.style.borderColor = errores.modelo ? colors.rojo : colors.borde)} />
                  </InputField>
                  <InputField label="Número de serie / Código interno" required>
                    <input value={form.numeroSerie} onChange={(e) => set("numeroSerie", e.target.value)}
                      placeholder="SN-DL5540-2024-0087" style={{ ...inputStyle, borderColor: errores.numeroSerie ? colors.rojo : colors.borde }}
                      onFocus={(e) => (e.target.style.borderColor = colors.naranja)}
                      onBlur={(e) => (e.target.style.borderColor = errores.numeroSerie ? colors.rojo : colors.borde)} />
                  </InputField>
                  <InputField label="Estado inicial">
                    <select value={form.estadoInicial} onChange={(e) => set("estadoInicial", e.target.value)} style={inputStyle}
                      onFocus={(e) => (e.target.style.borderColor = colors.naranja)}
                      onBlur={(e) => (e.target.style.borderColor = colors.borde)}>
                      <option>Nuevo</option>
                      <option>Usado</option>
                      <option>Reparado</option>
                      <option>Reacondicionado</option>
                    </select>
                  </InputField>
                </div>
                <div style={{ marginTop: "14px", maxWidth: "33%" }}>
                  <InputField label="Dirección IP (opcional — no aplica para celulares)">
                    <div style={{ position: "relative" }}>
                      <FaWifi style={{ position: "absolute", left: "10px", top: "50%", transform: "translateY(-50%)", color: colors.textoMuted, fontSize: "13px" }} />
                      <input value={form.direccionIp} onChange={(e) => set("direccionIp", e.target.value)}
                        placeholder="192.168.1.145" style={{ ...inputStyle, paddingLeft: "30px" }}
                        onFocus={(e) => (e.target.style.borderColor = colors.naranja)}
                        onBlur={(e) => (e.target.style.borderColor = colors.borde)} />
                    </div>
                  </InputField>
                </div>
              </div>

              {/* Asignación */}
              <div style={{ background: "#fff", borderRadius: "12px", border: `1px solid ${colors.borde}`, padding: "22px" }}>
                <SeccionHeader icon={<FaUser />} titulo="Asignación" />
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr", gap: "14px" }}>
                  <InputField label="Área de la empresa">
                    <select value={form.areaEmpresa} onChange={(e) => set("areaEmpresa", e.target.value)} style={inputStyle}
                      onFocus={(e) => (e.target.style.borderColor = colors.naranja)}
                      onBlur={(e) => (e.target.style.borderColor = colors.borde)}>
                      <option value="">Selecciona...</option>
                      {AREAS.map((a) => <option key={a}>{a}</option>)}
                    </select>
                  </InputField>
                  <InputField label="Responsable / Usuario asignado">
                    <input value={form.responsable} onChange={(e) => set("responsable", e.target.value)}
                      placeholder="Nombre completo" style={inputStyle}
                      onFocus={(e) => (e.target.style.borderColor = colors.naranja)}
                      onBlur={(e) => (e.target.style.borderColor = colors.borde)} />
                  </InputField>
                  <InputField label="Teléfono de contacto">
                    <div style={{ position: "relative" }}>
                      <FaPhone style={{ position: "absolute", left: "10px", top: "50%", transform: "translateY(-50%)", color: colors.textoMuted, fontSize: "12px" }} />
                      <input value={form.telefono} onChange={(e) => set("telefono", e.target.value)}
                        placeholder="9999-9999" style={{ ...inputStyle, paddingLeft: "30px" }}
                        onFocus={(e) => (e.target.style.borderColor = colors.naranja)}
                        onBlur={(e) => (e.target.style.borderColor = colors.borde)} />
                    </div>
                  </InputField>
                  <InputField label="Ubicación física">
                    <input value={form.ubicacion} onChange={(e) => set("ubicacion", e.target.value)}
                      placeholder="Administración, 2do piso..." style={inputStyle}
                      onFocus={(e) => (e.target.style.borderColor = colors.naranja)}
                      onBlur={(e) => (e.target.style.borderColor = colors.borde)} />
                  </InputField>
                </div>
              </div>

              {/* Accesorios */}
              <div style={{ background: "#fff", borderRadius: "12px", border: `1px solid ${colors.borde}`, padding: "22px" }}>
                <SeccionHeader icon={<FaStar />} titulo="Accesorios opcionales" />
                <div style={{ display: "flex", flexWrap: "wrap", gap: "8px", marginBottom: "12px" }}>
                  {ACCESORIOS_DEFAULT.map((acc) => (
                    <button key={acc} type="button" onClick={() => toggleAccesorio(acc)}
                      style={{ padding: "6px 14px", borderRadius: "20px", border: `1.5px solid ${accesorios.includes(acc) ? colors.naranja : colors.borde}`, background: accesorios.includes(acc) ? colors.naranjaClaro : "#fff", color: accesorios.includes(acc) ? colors.naranja : colors.textoSec, fontSize: "12.5px", fontWeight: "600", cursor: "pointer", fontFamily: "inherit", display: "flex", alignItems: "center", gap: "5px" }}>
                      {accesorios.includes(acc) && <FaTimes style={{ fontSize: "10px" }} />}
                      {acc}
                    </button>
                  ))}
                  <div style={{ display: "flex", gap: "6px", alignItems: "center" }}>
                    <input value={accesorioCustom} onChange={(e) => setAccesorioCustom(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && agregarCustom()}
                      placeholder="Agregar otro..." style={{ ...inputStyle, width: "140px", padding: "6px 10px", fontSize: "12.5px" }}
                      onFocus={(e) => (e.target.style.borderColor = colors.naranja)}
                      onBlur={(e) => (e.target.style.borderColor = colors.borde)} />
                    <button onClick={agregarCustom} style={{ padding: "6px 10px", borderRadius: "8px", border: "none", background: colors.naranja, color: "white", cursor: "pointer", fontSize: "12px" }}>
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

              {/* Observaciones */}
              <div style={{ background: "#fff", borderRadius: "12px", border: `1px solid ${colors.borde}`, padding: "22px" }}>
                <SeccionHeader icon={<FaClipboard />} titulo="Observaciones" />
                <textarea value={form.observaciones} onChange={(e) => set("observaciones", e.target.value)}
                  placeholder="Escriba observaciones adicionales sobre el equipo..." rows={3}
                  style={{ ...inputStyle, resize: "vertical", fontFamily: "inherit" }}
                  onFocus={(e) => (e.target.style.borderColor = colors.naranja)}
                  onBlur={(e) => (e.target.style.borderColor = colors.borde)} />
              </div>

              {/* Valor */}
              <div style={{ background: "#fff", borderRadius: "12px", border: `1px solid ${colors.borde}`, padding: "22px" }}>
                <SeccionHeader icon={<FaDollarSign />} titulo="Valor del equipo" />
                <InputField label="Valor (L.) — opcional">
                  <div style={{ position: "relative", maxWidth: "220px" }}>
                    <span style={{ position: "absolute", left: "10px", top: "50%", transform: "translateY(-50%)", color: colors.textoMuted, fontSize: "13px", fontWeight: "700" }}>L.</span>
                    <input type="number" value={form.valor} onChange={(e) => set("valor", e.target.value)}
                      placeholder="3995.00" style={{ ...inputStyle, paddingLeft: "28px" }}
                      onFocus={(e) => (e.target.style.borderColor = colors.naranja)}
                      onBlur={(e) => (e.target.style.borderColor = colors.borde)} />
                  </div>
                </InputField>
              </div>
            </div>

            {/* PANEL LATERAL */}
            <div style={{ width: "260px", display: "flex", flexDirection: "column", gap: "14px", flexShrink: 0 }}>

              {/* Resumen */}
              <div style={{ background: "#fff", borderRadius: "12px", border: `1px solid ${colors.borde}`, padding: "18px" }}>
                <h4 style={{ margin: "0 0 14px", fontSize: "13px", fontWeight: "700", color: colors.texto, display: "flex", alignItems: "center", gap: "7px" }}>
                  <FaTag style={{ color: colors.naranja, fontSize: "12px" }} /> Resumen del registro
                </h4>
                {[
                  { label: "Tipo de registro", value: "Equipo nuevo" },
                  { label: "Categoría", value: form.categoria || "—" },
                  { label: "Marca / Modelo", value: form.marca && form.modelo ? `${form.marca} ${form.modelo}` : form.marca || "—" },
                  { label: "Número de serie", value: form.numeroSerie || "—" },
                  { label: "Área", value: form.areaEmpresa || "—" },
                  { label: "Responsable", value: form.responsable || "—" },
                  { label: "Teléfono", value: form.telefono || "—" },
                  { label: "Accesorios", value: accesorios.length > 0 ? `${accesorios.length} seleccionados` : "Ninguno" },
                  { label: "Dirección IP", value: form.direccionIp || "—" },
                ].map(({ label, value }) => (
                  <div key={label} style={{ display: "flex", justifyContent: "space-between", padding: "6px 0", borderBottom: `1px solid ${colors.fondo}`, fontSize: "12px" }}>
                    <span style={{ color: colors.textoSec }}>{label}</span>
                    <span style={{ color: colors.texto, fontWeight: "600", textAlign: "right", maxWidth: "130px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{value}</span>
                  </div>
                ))}
              </div>

              {/* Validaciones */}
              <div style={{ background: "#fff", borderRadius: "12px", border: `1px solid ${colors.borde}`, padding: "18px" }}>
                <h4 style={{ margin: "0 0 12px", fontSize: "13px", fontWeight: "700", color: colors.texto, display: "flex", alignItems: "center", gap: "7px" }}>
                  <FaCheckCircle style={{ color: colors.verde, fontSize: "12px" }} /> Validaciones
                </h4>
                {validaciones.map(({ label, ok }) => (
                  <div key={label} style={{ display: "flex", alignItems: "center", gap: "8px", padding: "4px 0", fontSize: "12px", color: ok ? colors.verde : colors.textoMuted }}>
                    <FaCheckCircle style={{ fontSize: "12px", color: ok ? colors.verde : "#d1d5db", flexShrink: 0 }} />
                    {label}
                  </div>
                ))}
              </div>

              {/* Tip */}
              <div style={{ background: colors.naranjaClaro, borderRadius: "12px", border: `1px solid #ffd49e`, padding: "14px" }}>
                <p style={{ margin: "0 0 6px", fontSize: "12px", fontWeight: "700", color: "#92400e", display: "flex", alignItems: "center", gap: "6px" }}>
                  <FaTag style={{ fontSize: "11px" }} /> ¿Tipo de registro incorrecto?
                </p>
                <p style={{ margin: "0 0 10px", fontSize: "11.5px", color: "#92400e" }}>Si el equipo ya fue usado anteriormente y será reasignado, cambia el tipo de registro.</p>
                <button onClick={() => navigate("/admin/registro-entrada")} style={{ background: "none", border: "none", color: colors.naranja, fontWeight: "700", fontSize: "12px", cursor: "pointer", padding: 0, fontFamily: "inherit" }}>
                  Cambiar a equipo reasignado →
                </button>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "20px", paddingTop: "16px", borderTop: `1px solid ${colors.borde}` }}>
            <button onClick={() => navigate("/admin/registro-entrada")}
              style={{ display: "flex", alignItems: "center", gap: "7px", padding: "9px 18px", borderRadius: "9px", border: `1px solid ${colors.borde}`, background: "#fff", color: colors.textoSec, fontSize: "13px", fontWeight: "700", cursor: "pointer", fontFamily: "inherit" }}>
              <FaTimes /> Cancelar
            </button>
            <div style={{ display: "flex", gap: "10px" }}>
              <button onClick={imprimirHoja} disabled={!equipoGuardado}
                style={{ display: "flex", alignItems: "center", gap: "7px", padding: "9px 18px", borderRadius: "9px", border: `1px solid ${colors.borde}`, background: "#fff", color: equipoGuardado ? colors.texto : colors.textoMuted, fontSize: "13px", fontWeight: "700", cursor: equipoGuardado ? "pointer" : "not-allowed", fontFamily: "inherit" }}>
                <FaPrint /> Imprimir hoja de entrega
              </button>
              <button onClick={guardar} disabled={guardando || !!equipoGuardado}
                style={{ display: "flex", alignItems: "center", gap: "7px", padding: "9px 18px", borderRadius: "9px", border: "none", background: equipoGuardado ? colors.verde : colors.naranja, color: "white", fontSize: "13px", fontWeight: "700", cursor: guardando || equipoGuardado ? "default" : "pointer", fontFamily: "inherit" }}>
                {equipoGuardado ? <><FaCheckCircle /> Guardado</> : <><FaSave /> {guardando ? "Guardando..." : "Guardar cambios"}</>}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}