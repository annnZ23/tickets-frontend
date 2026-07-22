import { useState, useEffect, useCallback, useRef } from "react";
import { useNavigate } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import Topbar from "../components/Topbar";
import baprosaLogo from "../assets/baprosa-logo.png";
import {
  FaLaptop, FaDesktop, FaMobileAlt, FaPrint, FaTabletAlt, FaNetworkWired,
  FaServer, FaExchangeAlt, FaHandshake, FaSyncAlt, FaTools, FaHistory, FaPlus,
  FaBoxOpen, FaCheckCircle, FaExclamationTriangle, FaMapMarkerAlt,
  FaKey, FaWrench, FaTimes, FaSearch, FaVideo, FaBatteryFull, FaCube,
  FaChevronRight, FaListUl, FaArrowLeft, FaBan,
} from "react-icons/fa";

const colors = {
  naranja: "#ff7f22", naranjaOscuro: "#e66a10", naranjaClaro: "#fff1e6",
  texto: "#1e293b", textoSec: "#64748b", textoMuted: "#94a3b8",
  borde: "#eef1f5", fondo: "#FFF7F2",
  verde: "#16a34a", verdeClaro: "#e9f9ee",
  rojo: "#dc2626", rojoClaro: "#fee2e2",
  amarillo: "#d97706", amarilloClaro: "#fef3c7",
  azul: "#2563eb", azulClaro: "#eff6ff",
  gris: "#94a3b8", grisClaro: "#f1f5f9",
};

const CATEGORIAS = [
  { key: "laptop",    label: "Laptops",     icono: <FaLaptop /> },
  { key: "desktop",   label: "Desktop",     icono: <FaDesktop /> },
  { key: "monitor",   label: "Monitores",   icono: <FaDesktop /> },
  { key: "servidor",  label: "Servidores",  icono: <FaServer /> },
  { key: "celular",   label: "Celulares",   icono: <FaMobileAlt /> },
  { key: "switch",    label: "Switch",      icono: <FaNetworkWired /> },
  { key: "impresora", label: "Impresoras",  icono: <FaPrint /> },
  { key: "tablet",    label: "Tablets",     icono: <FaTabletAlt /> },
  { key: "router",    label: "Routers",     icono: <FaNetworkWired /> },
  { key: "camara",    label: "Cámaras",     icono: <FaVideo /> },
  { key: "ups",       label: "UPS",         icono: <FaBatteryFull /> },
  { key: "rentado",   label: "Equipo rentado", icono: <FaHandshake /> },
  { key: "otros",     label: "Otros",       icono: <FaCube /> },
];

const COLUMNAS_GRID_CATEGORIAS = Math.ceil(CATEGORIAS.length / 2);

const ESTADOS_EQUIPO = [
  "Operativo", "Detalles menores", "En revisión",
  "Mantenimiento", "Devolución por daños", "Dañado", "Fuera de servicio",
];

const AREAS = ["Logística", "Ventas", "GPS", "Mercadeo", "Contabilidad", "Bodega", "Báscula", "Suministro", "Silos", "Taller", "Producción", "Guardia", "Compras", "Caja", "Pagos", "Planin", "Transporte", "Créditos", "Gerencia", "Laboratorio", "BodegaPT", "IT"];

const parseArray = (raw) => {
  try { const a = JSON.parse(raw || "[]"); return Array.isArray(a) ? a : []; }
  catch { return []; }
};

const colorEstado = (estado) => {
  const e = (estado || "").toLowerCase();
  if (e.includes("operativo")) return { bg: colors.verdeClaro, color: colors.verde };
  if (e.includes("dañado") || e.includes("fuera")) return { bg: colors.rojoClaro, color: colors.rojo };
  if (e.includes("mantenimiento") || e.includes("devolución") || e.includes("devolucion")) return { bg: colors.azulClaro, color: colors.azul };
  return { bg: colors.amarilloClaro, color: colors.amarillo };
};

const inputStyle = {
  padding: "9px 12px", borderRadius: "8px", border: `1px solid ${colors.borde}`,
  fontSize: "12.5px", color: colors.texto, outline: "none", background: "#fff",
  fontFamily: "inherit", width: "100%", boxSizing: "border-box",
};

const InputField = ({ label, children, required }) => (
  <div style={{ display: "flex", flexDirection: "column", gap: "5px" }}>
    <label style={{ fontSize: "11.5px", fontWeight: "700", color: colors.textoSec }}>
      {label}{required && <span style={{ color: colors.rojo }}> *</span>}
    </label>
    {children}
  </div>
);

const modalOverlay = { position: "fixed", inset: 0, background: "rgba(15,23,42,0.55)", zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center", padding: "20px" };
const modalContenido = { background: "#fff", borderRadius: "14px", boxShadow: "0 20px 60px rgba(15,23,42,0.25)", width: "100%", maxWidth: "560px", maxHeight: "90vh", overflowY: "auto" };

function EditorLista({ items, setItems, placeholder = "Agregar otro...", sugerencias = [] }) {
  const [valor, setValor] = useState("");
  const listId = useRef(`sugerencias-${Math.random().toString(36).slice(2)}`).current;

  const agregar = (texto) => {
    const v = (texto ?? valor).trim();
    if (!v || items.includes(v)) { setValor(""); return; }
    setItems([...items, v]);
    setValor("");
  };

  const disponibles = sugerencias.filter((s) => !items.includes(s));

  return (
    <div>

      {items.length > 0 && (
        <div style={{ display: "flex", flexWrap: "wrap", gap: "6px", marginBottom: "10px" }}>
          {items.map((it) => (
            <span key={it} style={{
              display: "inline-flex", alignItems: "center", gap: "8px",
              background: "#f8fafc", color: colors.texto,
              border: `1px solid ${colors.borde}`,
              padding: "6px 12px", borderRadius: "24px",
              fontSize: "12.5px", fontWeight: "600",
            }}>
              {it}
              <button
                type="button"
                onClick={() => setItems(items.filter((x) => x !== it))}
                style={{ background: "none", border: "none", color: colors.textoMuted, cursor: "pointer", padding: 0, display: "flex", alignItems: "center" }}
                title="Quitar"
              >
                <FaTimes style={{ fontSize: "10px" }} />
              </button>
            </span>
          ))}
        </div>
      )}
      
      {disponibles.length > 0 && (
        <div style={{ display: "flex", flexWrap: "wrap", gap: "6px", marginBottom: "10px" }}>
          {disponibles.map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => agregar(s)}
              style={{
                fontSize: "11.5px", fontWeight: "700", color: colors.naranja,
                background: colors.naranjaClaro, border: `1px dashed ${colors.naranja}55`,
                borderRadius: "20px", padding: "5px 10px", cursor: "pointer",
                display: "inline-flex", alignItems: "center", gap: "5px",
              }}
            >
              <FaPlus style={{ fontSize: "8px" }} /> {s}
            </button>
          ))}
        </div>
      )}

      <div style={{
        display: "flex", alignItems: "center", gap: "8px",
        background: "#fff", border: `1px solid ${colors.borde}`,
        borderRadius: "24px", padding: "4px 4px 4px 16px",
        transition: "border-color 0.15s",
      }}>
        <input
          value={valor}
          onChange={(e) => setValor(e.target.value)}
          onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); agregar(); } }}
          placeholder={placeholder}
          list={listId}
          style={{
            flex: 1, border: "none", outline: "none",
            background: "transparent",
            fontSize: "12.5px", color: colors.texto,
            padding: "8px 0", fontFamily: "inherit",
          }}
        />
        <datalist id={listId}>
          {sugerencias.map((s) => <option key={s} value={s} />)}
        </datalist>
        <button
          type="button"
          onClick={() => agregar()}
          disabled={!valor.trim()}
          style={{
            width: "34px", height: "34px", borderRadius: "50%",
            border: "none",
            background: valor.trim() ? colors.naranja : "#f1f5f9",
            color: valor.trim() ? "#fff" : colors.textoMuted,
            cursor: valor.trim() ? "pointer" : "default",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: "14px", fontWeight: "800", flexShrink: 0,
            transition: "background 0.15s",
          }}
          title="Agregar"
        >
          <FaPlus style={{ fontSize: "12px" }} />
        </button>
      </div>
    </div>
  );
}

export default function Historial({ usuario, cerrarSesion }) {
  const navigate = useNavigate();
  const token = localStorage.getItem("token");
  const authHeaders = () => ({ Authorization: `Bearer ${token}` });

  const [equipos, setEquipos] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [categoriaActiva, setCategoriaActiva] = useState(null);

  const cargar = useCallback(async () => {
    setCargando(true);
    try {
      const res = await fetch("http://localhost:3000/api/equipos", { headers: authHeaders() });
      const data = await res.json();
      const lista = Array.isArray(data) ? data : [];
      setEquipos(lista);
      setEquipoSel((prev) => {
        if (!prev) return prev;
        const actualizado = lista.find((eq) => eq.id === prev.id);
        return actualizado || prev;
      });
    } catch (e) { console.error(e); setEquipos([]); }
    finally { setCargando(false); }
  }, []);

  useEffect(() => { cargar(); }, [cargar]);
  const perteneceA = (eq, key) => {
    if (!eq.categoria) return false;
    const cat = eq.categoria.toLowerCase();
    const label = CATEGORIAS.find((c) => c.key === key)?.label || "";
    return cat.includes(key) || cat.includes(label.toLowerCase().slice(0, -1));
  };

  const categoriaDeEquipo = (eq) => {
    const fijas = CATEGORIAS.filter((c) => c.key !== "otros").map((c) => c.key);
    const match = fijas.find((k) => perteneceA(eq, k));
    return match || "otros";
  };

  const conteoPorCategoria = (key) => {
    if (key === "otros") {
      const fijas = CATEGORIAS.filter((c) => c.key !== "otros").map((c) => c.key);
      return equipos.filter((eq) => !fijas.some((k) => perteneceA(eq, k)) && eq.activo !== false).length;
    }
    return equipos.filter((eq) => perteneceA(eq, key) && eq.activo !== false).length;
  };

  const equiposDeCategoriaActiva = () => {
    if (!categoriaActiva) return [];
    if (categoriaActiva === "otros") {
      const fijas = CATEGORIAS.filter((c) => c.key !== "otros").map((c) => c.key);
      return equipos.filter((eq) => !fijas.some((k) => perteneceA(eq, k)));
    }
    return equipos.filter((eq) => perteneceA(eq, categoriaActiva));
  };

  const [busquedaCategoria, setBusquedaCategoria] = useState("");
  const equiposFiltradosCategoria = () => {
    const base = equiposDeCategoriaActiva();
    const q = busquedaCategoria.trim().toLowerCase();
    if (!q) return base;
    return base.filter((eq) =>
      [eq.responsable, eq.folio, eq.numeroSerie, eq.marca, eq.modelo]
        .filter(Boolean)
        .some((campo) => String(campo).toLowerCase().includes(q))
    );
  };

  const [paginaCategoria, setPaginaCategoria] = useState(1);
  const PORPAGINA_CATEGORIA = 8;
  const equiposPaginadosCategoria = () => {
    const filtrados = equiposFiltradosCategoria();
    const inicio = (paginaCategoria - 1) * PORPAGINA_CATEGORIA;
    return filtrados.slice(inicio, inicio + PORPAGINA_CATEGORIA);
  };
  const totalPaginasCategoria = () => Math.max(1, Math.ceil(equiposFiltradosCategoria().length / PORPAGINA_CATEGORIA));

  useEffect(() => { setBusquedaCategoria(""); setPaginaCategoria(1); }, [categoriaActiva]);
  useEffect(() => { setPaginaCategoria(1); }, [busquedaCategoria]);

 
  const [busquedaGlobal, setBusquedaGlobal] = useState("");
  const [mostrarResultados, setMostrarResultados] = useState(false);
  const buscadorRef = useRef(null);

  useEffect(() => {
    const cerrar = (e) => { if (buscadorRef.current && !buscadorRef.current.contains(e.target)) setMostrarResultados(false); };
    document.addEventListener("mousedown", cerrar);
    return () => document.removeEventListener("mousedown", cerrar);
  }, []);

  const resultadosBusqueda = (() => {
    const q = busquedaGlobal.trim().toLowerCase();
    if (!q) return [];
    return equipos.filter((eq) =>
      [eq.folio, eq.numeroSerie, eq.marca, eq.modelo, eq.responsable, eq.areaEmpresa, eq.categoria]
        .filter(Boolean)
        .some((campo) => String(campo).toLowerCase().includes(q))
    ).slice(0, 20);
  })();


  const [modalAgregar, setModalAgregar] = useState(false);
  const [modalHistorial, setModalHistorial] = useState(false);
  const [modalAccesorios, setModalAccesorios] = useState(false);
  const [modalEstado, setModalEstado] = useState(false);
  const [modalLicencias, setModalLicencias] = useState(false);
  const [modalMantenimiento, setModalMantenimiento] = useState(false);
  const [modalDanos, setModalDanos] = useState(false);
  const [modalUbicacion, setModalUbicacion] = useState(false);
  const [modalPanel, setModalPanel] = useState(false); 
  const [modalElegirEquipo, setModalElegirEquipo] = useState(false); 
  const [modalBaja, setModalBaja] = useState(false); // NUEVO
  const [equiposParaElegir, setEquiposParaElegir] = useState([]);
  const [accionPendiente, setAccionPendiente] = useState(null); 
  const [equipoSel, setEquipoSel] = useState(null);
  const [asignaciones, setAsignaciones] = useState([]);


  const seleccionarDesdeBusqueda = (eq) => {
    setEquipoSel(eq);
    setCategoriaActiva(categoriaDeEquipo(eq));
    setBusquedaGlobal("");
    setMostrarResultados(false);
    setModalPanel(true);
  };

  const elegirEquipoYAbrir = (setModalFn) => {
    const eqsCat = equiposDeCategoriaActiva();
    if (eqsCat.length === 0) { alert("No hay equipos en esta categoría todavía"); return; }
    if (eqsCat.length === 1) {
      setEquipoSel(eqsCat[0]);
      setModalFn(true);
      return;
    }
    setEquiposParaElegir(eqsCat);
    setAccionPendiente(() => (eq) => { setEquipoSel(eq); setModalFn(true); });
    setModalElegirEquipo(true);
  };

  const [aeCategoria, setAeCategoria] = useState("");
  const [aeCategoriaOtra, setAeCategoriaOtra] = useState("");
  const [aeMarca, setAeMarca] = useState("");
  const [aeModelo, setAeModelo] = useState("");
  const [aeSerie, setAeSerie] = useState("");
  const [aeResponsable, setAeResponsable] = useState("");
  const [aeArea, setAeArea] = useState("");
  const [aeEstado, setAeEstado] = useState("Operativo");
  const [aeEstadoOtro, setAeEstadoOtro] = useState("");
  const [aeAreaOtra, setAeAreaOtra] = useState("");
  const [aeAccesorios, setAeAccesorios] = useState([]);
  const [aeLicencias, setAeLicencias] = useState([]);
  const [aeObservaciones, setAeObservaciones] = useState("");
  const [guardandoAE, setGuardandoAE] = useState(false);
  const [aeEquipoGuardado, setAeEquipoGuardado] = useState(null);

  const resetAE = () => {
    setAeCategoria(""); setAeCategoriaOtra(""); setAeMarca(""); setAeModelo("");
    setAeSerie(""); setAeResponsable(""); setAeArea(""); setAeAreaOtra("");
    setAeEstado("Operativo"); setAeEstadoOtro("");
    setAeAccesorios([]); setAeLicencias([]); setAeObservaciones("");
    setAeEquipoGuardado(null);
  };

  const cerrarModalAgregar = () => {
    setModalAgregar(false);
    resetAE();
  };

  const guardarEquipoHistorial = async () => {
    const categoriaFinal = aeCategoria === "Otra" ? aeCategoriaOtra.trim() : aeCategoria;
    const estadoFinal = aeEstado === "Otro" ? aeEstadoOtro.trim() : aeEstado;
    const areaFinal = aeArea === "Otra" ? aeAreaOtra.trim() : aeArea;

    if (!categoriaFinal || !aeMarca.trim() || !aeSerie.trim()) {
      alert("Categoría, marca y número de serie son obligatorios");
      return;
    }
    if (aeEstado === "Otro" && !estadoFinal) { alert("Escribe el estado personalizado"); return; }
    if (aeArea === "Otra" && !areaFinal) { alert("Escribe el nombre de la nueva área"); return; }

    setGuardandoAE(true);
    try {
      const payload = {
        categoria: categoriaFinal,
        marca: aeMarca, modelo: aeModelo, numeroSerie: aeSerie,
        responsable: aeResponsable, areaEmpresa: areaFinal,
        estadoInicial: estadoFinal,
        accesorios: JSON.stringify(aeAccesorios),
        licencias: JSON.stringify(aeLicencias),
        observaciones: aeObservaciones,
      };
      const res = await fetch("http://localhost:3000/api/equipos", {
        method: "POST",
        headers: { "Content-Type": "application/json", ...authHeaders() },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) {
        alert(data.message || data.error || "No se pudo agregar el equipo");
        return;
      }
      setAeEquipoGuardado(data);
      cargar();
    } catch (e) {
      console.error(e);
      alert("Error de conexión");
    } finally {
      setGuardandoAE(false);
    }
  };

  const imprimirHojaDesdeHistorial = async () => {
    const eq = aeEquipoGuardado;
    if (!eq) return;
    const fecha = new Date(eq.createdAt).toLocaleDateString("es-HN", { day: "2-digit", month: "2-digit", year: "numeric" });
    const accs = parseArray(eq.accesorios).join(", ");
    const art = ["a", "e", "i", "o", "u"].includes((eq.categoria[0] || "").toLowerCase()) ? "un" : "una";
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
  <p>Especificaciones: <strong>${(eq.estadoInicial || "").toUpperCase()}</strong></p>
  <p>${eq.categoria.toUpperCase()} ${(eq.marca || "").toUpperCase()} ${(eq.modelo || "").toUpperCase()}</p>
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

  const cargarHistorialDe = async (eq) => {
    setEquipoSel(eq);
    try {
      const res = await fetch(`http://localhost:3000/api/equipos/${eq.id}/asignaciones`, { headers: authHeaders() });
      const data = await res.json();
      setAsignaciones(Array.isArray(data) ? data : []);
    } catch { setAsignaciones([]); }
    setModalHistorial(true);
  };

  const [mtEquipoId, setMtEquipoId] = useState("");
  const [mtDescripcion, setMtDescripcion] = useState("");
  const [mtFecha, setMtFecha] = useState("");

  const registrarEvento = async (nuevoEstado, tipoEvento) => {
    if (!mtEquipoId) { alert("Selecciona el equipo"); return; }
    if (!mtDescripcion.trim()) { alert("Describe brevemente el motivo"); return; }
    try {
      await fetch(`http://localhost:3000/api/equipos/${mtEquipoId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", ...authHeaders() },
        body: JSON.stringify({
          estadoInicial: nuevoEstado,
          observaciones: `[${tipoEvento} ${mtFecha || new Date().toLocaleDateString("es-HN")}] ${mtDescripcion}`,
        }),
      });
      alert(`${tipoEvento} registrado correctamente`);
      setModalMantenimiento(false);
      setModalDanos(false);
      setMtEquipoId(""); setMtDescripcion(""); setMtFecha("");
      cargar();
    } catch (e) {
      console.error(e);
      alert("No se pudo registrar el evento");
    }
  };

  const [bajaMotivo, setBajaMotivo] = useState("");
  const [guardandoBaja, setGuardandoBaja] = useState(false);

  const confirmarBaja = async () => {
    if (!equipoSel) return;
    if (!bajaMotivo.trim()) { alert("Escribe el motivo por el que se da de baja el equipo"); return; }
    setGuardandoBaja(true);
    try {
      const res = await fetch(`http://localhost:3000/api/equipos/${equipoSel.id}/dar-baja`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", ...authHeaders() },
        body: JSON.stringify({ motivo: bajaMotivo }),
      });
      const data = await res.json();
      if (!res.ok) { alert(data.message || "No se pudo dar de baja el equipo"); return; }
      setEquipoSel(data);
      setModalBaja(false);
      setBajaMotivo("");
      cargar();
      alert("Equipo dado de baja. Queda documentado en el historial como fuera de servicio.");
    } catch (e) {
      console.error(e);
      alert("Error de conexión al dar de baja el equipo");
    } finally {
      setGuardandoBaja(false);
    }
  };

  const [estadoNuevo, setEstadoNuevo] = useState("");
  const [estadoNuevoOtro, setEstadoNuevoOtro] = useState("");
  const [guardandoEstado, setGuardandoEstado] = useState(false);

  useEffect(() => {
    if (modalEstado && equipoSel) {
      const actual = equipoSel.estadoInicial || "";
      if (actual && !ESTADOS_EQUIPO.includes(actual)) {
        setEstadoNuevo("Otro");
        setEstadoNuevoOtro(actual);
      } else {
        setEstadoNuevo(actual || "Operativo");
        setEstadoNuevoOtro("");
      }
    }
  }, [modalEstado, equipoSel]);

  const guardarEstadoEquipo = async () => {
    const valorFinal = estadoNuevo === "Otro" ? estadoNuevoOtro.trim() : estadoNuevo;
    if (!valorFinal) { alert("Escribe el estado personalizado"); return; }
    setGuardandoEstado(true);
    try {
      const res = await fetch(`http://localhost:3000/api/equipos/${equipoSel.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", ...authHeaders() },
        body: JSON.stringify({ estadoInicial: valorFinal }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        alert(data.message || data.error || "No se pudo actualizar el estado");
        return;
      }
      setEquipoSel({ ...equipoSel, estadoInicial: valorFinal });
      cargar();
    } catch (e) {
      console.error(e);
      alert("Error de conexión al actualizar el estado");
    } finally {
      setGuardandoEstado(false);
    }
  };

  const [estadoGuardadoLicencias, setEstadoGuardadoLicencias] = useState(null);
  const [estadoGuardadoAccesorios, setEstadoGuardadoAccesorios] = useState(null);

  const actualizarCampoLista = async (campo, nuevos, setEstado) => {
    setEstado("guardando");
    try {
    
      const anteriores = parseArray(equipoSel[campo]);
      const agregados = nuevos.filter((x) => !anteriores.includes(x));
      const quitados = anteriores.filter((x) => !nuevos.includes(x));
      const etiqueta = campo === "licencias" ? "Licencia" : "Accesorio";
      const fecha = new Date().toLocaleDateString("es-HN");
      const lineas = [
        ...agregados.map((a) => `[${etiqueta} agregado — ${fecha}] ${a}`),
        ...quitados.map((q) => `[${etiqueta} removido — ${fecha}] ${q}`),
      ];
      const observacionesNuevas = lineas.length
        ? `${equipoSel.observaciones ? equipoSel.observaciones + "\n" : ""}${lineas.join("\n")}`
        : equipoSel.observaciones;

      const res = await fetch(`http://localhost:3000/api/equipos/${equipoSel.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", ...authHeaders() },
        body: JSON.stringify({ [campo]: JSON.stringify(nuevos), observaciones: observacionesNuevas }),
      });
      if (!res.ok) throw new Error("No se pudo guardar");
      setEquipoSel((prev) => ({ ...prev, [campo]: JSON.stringify(nuevos), observaciones: observacionesNuevas }));
      cargar();
      setEstado("ok");
      setTimeout(() => setEstado(null), 2000);
    } catch (e) {
      console.error(e);
      setEstado("error");
      setTimeout(() => setEstado(null), 2500);
    }
  };

  const BarraGuardado = ({ estado }) => {
    if (!estado) return null;
    const cfg = {
      guardando: { bg: "#f1f5f9", color: colors.textoSec, texto: "Guardando cambios..." },
      ok: { bg: colors.verdeClaro, color: colors.verde, texto: "✓ Cambios guardados" },
      error: { bg: colors.rojoClaro, color: colors.rojo, texto: "No se pudo guardar, intenta de nuevo" },
    }[estado];
    return (
      <div style={{
        background: cfg.bg, color: cfg.color, fontSize: "11.5px", fontWeight: "700",
        padding: "7px 12px", borderRadius: "8px", marginBottom: "12px",
        display: "flex", alignItems: "center", gap: "6px",
      }}>
        {cfg.texto}
      </div>
    );
  };


  const catActiva = CATEGORIAS.find((c) => c.key === categoriaActiva);

  const Tarjeta = ({ icono, label, count, activa, onClick }) => (
    <button
      onClick={onClick}
      style={{
        width: "100%", background: "#fff", borderRadius: "12px", padding: "22px 14px",
        border: `2px solid ${activa ? colors.naranja : "transparent"}`,
        display: "flex", flexDirection: "column", alignItems: "center", gap: "10px",
        cursor: "pointer", fontFamily: "inherit",
        boxShadow: activa ? "0 6px 18px rgba(255,127,34,0.18)" : "0 1px 3px rgba(15,23,42,0.04)",
        transition: "all 0.15s",
      }}
    >
      <div style={{ width: "48px", height: "48px", borderRadius: "12px", background: colors.naranjaClaro, color: colors.naranja, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "20px" }}>
        {icono}
      </div>
      <div style={{ fontSize: "13.5px", fontWeight: "800", color: colors.texto, textAlign: "center" }}>{label}</div>
      <div style={{ fontSize: "12px", color: colors.textoSec }}>{count} {count === 1 ? "equipo" : "equipos"}</div>
    </button>
  );

  const AccionCard = ({ icono, titulo, desc, color, bg, onClick, vacio }) => {
    const colorFinal = vacio ? colors.gris : color;
    const bgFinal = vacio ? colors.grisClaro : bg;
    return (
      <button
        onClick={onClick}
        style={{
          background: bgFinal, borderRadius: "12px", padding: "16px 18px", textAlign: "left",
          border: `1px solid ${vacio ? colors.borde : colors.borde}`, cursor: "pointer", fontFamily: "inherit",
          display: "flex", flexDirection: "column", gap: "6px",
          transition: "transform 0.15s, box-shadow 0.15s",
        }}
        onMouseEnter={(e) => { e.currentTarget.style.transform = "translateY(-2px)"; e.currentTarget.style.boxShadow = "0 6px 18px rgba(15,23,42,0.08)"; }}
        onMouseLeave={(e) => { e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.boxShadow = "none"; }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "8px", color: colorFinal, fontWeight: "800", fontSize: "13.5px" }}>
          {icono} {titulo}
        </div>
        <p style={{ margin: 0, fontSize: "12px", color: colors.textoSec, lineHeight: 1.4 }}>
          {vacio ? "Sin registrar todavía — click para agregar." : desc}
        </p>
      </button>
    );
  };

  return (
    <div style={{ display: "flex", minHeight: "100vh", background: colors.fondo, fontFamily: "'Segoe UI', sans-serif" }}>
      <Sidebar usuario={usuario} cerrarSesion={cerrarSesion} />

      <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>
       
        <Topbar usuario={usuario} cerrarSesion={cerrarSesion} />

        <div style={{ flex: 1, overflowY: "auto", padding: "24px 28px" }}>

          <button
            onClick={() => navigate(-1)}
            style={{ display: "flex", alignItems: "center", gap: "8px", background: "none", border: "none", color: colors.textoSec, fontSize: "12.5px", fontWeight: "700", cursor: "pointer", padding: "0 0 14px", fontFamily: "inherit" }}
            onMouseEnter={(e) => (e.currentTarget.style.color = colors.naranja)}
            onMouseLeave={(e) => (e.currentTarget.style.color = colors.textoSec)}
          >
            <FaArrowLeft style={{ fontSize: "11px" }} /> Volver al menú
          </button>
        
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "22px", gap: "12px", flexWrap: "wrap" }}>
            <div>
              <h1 style={{ margin: 0, fontSize: "22px", fontWeight: "800", color: colors.texto, fontFamily: "'Manrope', sans-serif" }}>
                Historial de Equipos
              </h1>
              <p style={{ margin: "3px 0 0", fontSize: "13px", color: colors.textoSec }}>
                Vista general del inventario por categoría
              </p>
            </div>

            <div style={{ display: "flex", gap: "10px", alignItems: "center", flexWrap: "wrap" }}>
           
              <div ref={buscadorRef} style={{ position: "relative", width: "280px" }}>
                <div style={{
                  display: "flex", alignItems: "center", gap: "8px",
                  background: "#fff", border: `1px solid ${colors.borde}`,
                  borderRadius: "10px", padding: "0 6px 0 12px", height: "40px",
                }}>
                  <input
                    value={busquedaGlobal}
                    onChange={(e) => { setBusquedaGlobal(e.target.value); setMostrarResultados(true); }}
                    onFocus={() => setMostrarResultados(true)}
                    onKeyDown={(e) => { if (e.key === "Enter" && resultadosBusqueda.length > 0) seleccionarDesdeBusqueda(resultadosBusqueda[0]); }}
                    placeholder="Buscar equipo por folio, serie, marca, responsable..."
                    style={{ flex: 1, border: "none", outline: "none", fontSize: "12.5px", color: colors.texto, fontFamily: "inherit", background: "transparent" }}
                  />
                  <button
                    type="button"
                    onClick={() => setMostrarResultados(true)}
                    title="Buscar"
                    style={{
                      width: "30px", height: "30px", borderRadius: "8px", border: "none",
                      background: colors.naranjaClaro, color: colors.naranja,
                      display: "flex", alignItems: "center", justifyContent: "center",
                      cursor: "pointer", flexShrink: 0,
                    }}
                  >
                    <FaSearch style={{ fontSize: "12px" }} />
                  </button>
                </div>

                {mostrarResultados && busquedaGlobal.trim() && (
                  <div style={{
                    position: "absolute", top: "calc(100% + 6px)", left: 0, right: 0,
                    background: "#fff", border: `1px solid ${colors.borde}`, borderRadius: "10px",
                    boxShadow: "0 10px 30px rgba(15,23,42,0.12)", maxHeight: "320px", overflowY: "auto", zIndex: 60,
                  }}>
                    {resultadosBusqueda.length === 0 ? (
                      <div style={{ padding: "16px", textAlign: "center", fontSize: "12.5px", color: colors.textoSec }}>
                        Sin resultados para "{busquedaGlobal}"
                      </div>
                    ) : resultadosBusqueda.map((eq) => (
                      <div
                        key={eq.id}
                        onClick={() => seleccionarDesdeBusqueda(eq)}
                        style={{
                          padding: "10px 14px", borderBottom: `1px solid ${colors.borde}`,
                          cursor: "pointer", display: "flex", justifyContent: "space-between", alignItems: "center", gap: "8px",
                        }}
                        onMouseEnter={(e) => (e.currentTarget.style.background = colors.fondo)}
                        onMouseLeave={(e) => (e.currentTarget.style.background = "#fff")}
                      >
                        <div>
                          <div style={{ fontSize: "12.5px", fontWeight: "700", color: colors.texto }}>{eq.folio || eq.numeroSerie}</div>
                          <div style={{ fontSize: "11px", color: colors.textoSec }}>{eq.marca} {eq.modelo} · {eq.responsable || "Sin asignar"}</div>
                        </div>
                        <FaChevronRight style={{ fontSize: "10px", color: colors.textoMuted, flexShrink: 0 }} />
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <button
                onClick={() => setModalAgregar(true)}
                style={{ display: "flex", alignItems: "center", gap: "8px", padding: "10px 18px", borderRadius: "10px", border: "none", background: colors.naranja, color: "#fff", fontSize: "13px", fontWeight: "800", cursor: "pointer", fontFamily: "inherit" }}
                onMouseEnter={(e) => (e.currentTarget.style.background = colors.naranjaOscuro)}
                onMouseLeave={(e) => (e.currentTarget.style.background = colors.naranja)}
              >
                <FaPlus /> Agregar equipo
              </button>
              <button
                onClick={cargar}
                style={{ display: "flex", alignItems: "center", gap: "8px", padding: "10px 18px", borderRadius: "10px", border: `1px solid ${colors.borde}`, background: "#fff", color: colors.texto, fontSize: "13px", fontWeight: "700", cursor: "pointer", fontFamily: "inherit" }}
              >
                <FaSyncAlt /> Actualizar
              </button>
            </div>
          </div>

          <div style={{
            display: "grid",
            gridTemplateColumns: `repeat(${COLUMNAS_GRID_CATEGORIAS}, 1fr)`,
            gap: "14px",
            marginBottom: "22px",
          }}>
            {CATEGORIAS.map((c) => (
              <Tarjeta
                key={c.key}
                icono={c.icono}
                label={c.label}
                count={conteoPorCategoria(c.key)}
                activa={categoriaActiva === c.key}
                onClick={() => setCategoriaActiva(categoriaActiva === c.key ? null : c.key)}
              />
            ))}
          </div>

          {catActiva && (
            <div style={{ background: "#fff", borderRadius: "14px", border: `1px solid ${colors.borde}`, padding: "22px", marginBottom: "20px" }}>
              <h3 style={{ margin: "0 0 16px", fontSize: "16px", fontWeight: "800", color: colors.texto, fontFamily: "'Manrope', sans-serif" }}>
                {catActiva.label} — Detalle del Historial
              </h3>

              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "12px" }}>
                <AccionCard
                  icono={<FaHistory />} titulo="Historial de Equipos Asignados" color={colors.naranja} bg={colors.naranjaClaro}
                  desc="Registro completo de asignaciones con fechas y departamentos."
                  onClick={() => {
                    const eqsCat = equiposDeCategoriaActiva();
                    if (eqsCat.length === 0) { alert("No hay equipos en esta categoría todavía"); return; }
                    if (eqsCat.length === 1) { cargarHistorialDe(eqsCat[0]); return; }
                    setEquiposParaElegir(eqsCat);
                    setAccionPendiente(() => (eq) => cargarHistorialDe(eq));
                    setModalElegirEquipo(true);
                  }}
                />
                <AccionCard
                  icono={<FaBoxOpen />} titulo="Agregar Accesorios" color={colors.naranja} bg={colors.naranjaClaro}
                  desc="Asociar accesorios adicionales al equipo seleccionado."
                  onClick={() => elegirEquipoYAbrir(setModalAccesorios)}
                />
                <AccionCard
                  icono={<FaCheckCircle />} titulo="Estado Actual" color={colors.naranja} bg={colors.naranjaClaro}
                  desc="Visualizar y actualizar el estado operativo actual del equipo."
                  onClick={() => elegirEquipoYAbrir(setModalEstado)}
                />
                <AccionCard
                  icono={<FaMapMarkerAlt />} titulo="Cambios de Ubicación" color={colors.naranja} bg={colors.naranjaClaro}
                  desc="Historial de traslados entre oficinas, sucursales o departamentos."
                  onClick={() => elegirEquipoYAbrir(setModalUbicacion)}
                />
                <AccionCard
                  icono={<FaExclamationTriangle />} titulo="Devolución por Daños" color={colors.rojo} bg={colors.rojoClaro}
                  desc="Registro de devoluciones por daños físicos o fallas técnicas."
                  onClick={() => setModalDanos(true)}
                />
                <AccionCard
                  icono={<FaWrench />} titulo="Mantenimiento" color={colors.azul} bg={colors.azulClaro}
                  desc="Programación y registro de mantenimientos preventivos y correctivos."
                  onClick={() => setModalMantenimiento(true)}
                />
                <AccionCard
                  icono={<FaKey />} titulo="Licencias Asignadas" color={colors.verde} bg={colors.verdeClaro}
                  desc="Control de licencias de software instaladas por equipo."
                  onClick={() => elegirEquipoYAbrir(setModalLicencias)}
                />
              </div>

              <div style={{ marginTop: "18px", marginBottom: "10px", position: "relative", maxWidth: "320px" }}>
                <FaSearch style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)", color: colors.textoMuted, fontSize: "12px" }} />
                <input
                  value={busquedaCategoria}
                  onChange={(e) => setBusquedaCategoria(e.target.value)}
                  placeholder="Buscar por responsable..."
                  style={{ ...inputStyle, paddingLeft: "32px" }}
                />
              </div>

              <div style={{ overflowX: "auto", border: `1px solid ${colors.borde}`, borderRadius: "10px" }}>
                <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "12.5px" }}>
                  <thead>
                    <tr style={{ background: colors.naranjaClaro }}>
                      {["Folio / Serie", "Marca / Modelo", "Responsable", "Área", "Estado", ""].map((h) => (
                        <th key={h} style={{ textAlign: "left", padding: "10px 12px", fontSize: "11px", fontWeight: "700", color: colors.texto, textTransform: "uppercase" }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {equiposFiltradosCategoria().length === 0 ? (
                      <tr><td colSpan={6} style={{ padding: "24px", textAlign: "center", color: colors.textoSec }}>
                        {busquedaCategoria ? `Sin resultados para "${busquedaCategoria}"` : "Sin equipos en esta categoría todavía."}
                      </td></tr>
                    ) : equiposPaginadosCategoria().map((eq) => {
                      const c = eq.activo === false
                        ? { bg: "#f1f5f9", color: colors.gris }
                        : colorEstado(eq.estadoInicial);
                      return (
                        <tr
                          key={eq.id}
                          onClick={() => { setEquipoSel(eq); setModalPanel(true); }}
                          style={{ borderTop: `1px solid ${colors.borde}`, cursor: "pointer" }}
                          onMouseEnter={(e) => (e.currentTarget.style.background = colors.fondo)}
                          onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                        >
                          <td style={{ padding: "10px 12px", fontWeight: "700" }}>{eq.folio || eq.numeroSerie}</td>
                          <td style={{ padding: "10px 12px" }}>{eq.marca} {eq.modelo}</td>
                          <td style={{ padding: "10px 12px", color: colors.textoSec }}>{eq.responsable || "Sin asignar"}</td>
                          <td style={{ padding: "10px 12px", color: colors.textoSec }}>{eq.areaEmpresa || "—"}</td>
                          <td style={{ padding: "10px 12px" }}>
                            <span style={{ padding: "3px 10px", borderRadius: "20px", fontSize: "10.5px", fontWeight: "700", background: c.bg, color: c.color }}>
                              {eq.activo === false ? "Dado de baja" : (eq.estadoInicial || "—")}
                            </span>
                          </td>
                          <td style={{ padding: "10px 12px", textAlign: "right" }}>
                            <button
                              onClick={(e) => { e.stopPropagation(); setEquipoSel(eq); setModalPanel(true); }}
                              style={{ padding: "5px 10px", fontSize: "11px", borderRadius: "6px", border: `1px solid ${colors.borde}`, background: "#fff", color: colors.texto, cursor: "pointer", fontWeight: "700", fontFamily: "inherit" }}
                            >
                              Ver
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
              
              {equiposFiltradosCategoria().length > PORPAGINA_CATEGORIA && (
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "12px 4px 0" }}>
                  <span style={{ fontSize: "11.5px", color: colors.textoSec }}>
                    Mostrando {(paginaCategoria - 1) * PORPAGINA_CATEGORIA + 1}
                    –{Math.min(paginaCategoria * PORPAGINA_CATEGORIA, equiposFiltradosCategoria().length)}
                    {" "}de {equiposFiltradosCategoria().length}
                  </span>
                  <div style={{ display: "flex", gap: "6px" }}>
                    <button
                      onClick={() => setPaginaCategoria((p) => Math.max(1, p - 1))}
                      disabled={paginaCategoria === 1}
                      style={{ padding: "5px 10px", borderRadius: "6px", border: `1px solid ${colors.borde}`, background: "#fff", cursor: paginaCategoria === 1 ? "not-allowed" : "pointer", fontSize: "12px", color: colors.textoSec }}
                    >‹</button>
                    {Array.from({ length: totalPaginasCategoria() }, (_, i) => i + 1).slice(0, 6).map((p) => (
                      <button
                        key={p}
                        onClick={() => setPaginaCategoria(p)}
                        style={{ padding: "5px 11px", borderRadius: "6px", border: "none", background: p === paginaCategoria ? colors.naranja : "#f1f5f9", color: p === paginaCategoria ? "#fff" : colors.textoSec, cursor: "pointer", fontSize: "12px", fontWeight: "700" }}
                      >
                        {p}
                      </button>
                    ))}
                    <button
                      onClick={() => setPaginaCategoria((p) => Math.min(totalPaginasCategoria(), p + 1))}
                      disabled={paginaCategoria === totalPaginasCategoria()}
                      style={{ padding: "5px 10px", borderRadius: "6px", border: `1px solid ${colors.borde}`, background: "#fff", cursor: paginaCategoria === totalPaginasCategoria() ? "not-allowed" : "pointer", fontSize: "12px", color: colors.textoSec }}
                    >›</button>
                  </div>
                </div>
              )}
            </div>
          )}

          {!catActiva && !cargando && (
            <div style={{ background: "#fff", borderRadius: "14px", border: `1px solid ${colors.borde}`, padding: "40px", textAlign: "center", color: colors.textoSec, fontSize: "13.5px" }}>
              Selecciona una categoría de arriba, o usa el buscador para encontrar un equipo específico.
            </div>
          )}
        </div>
      </div>

      {modalElegirEquipo && (
        <div style={modalOverlay} onClick={() => setModalElegirEquipo(false)}>
          <div style={modalContenido} onClick={(e) => e.stopPropagation()}>
            <div style={{ padding: "18px 22px", borderBottom: `1px solid ${colors.borde}`, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <h3 style={{ margin: 0, fontSize: "16px", fontWeight: "800", color: colors.texto }}>¿Sobre cuál equipo?</h3>
              <FaTimes onClick={() => setModalElegirEquipo(false)} style={{ cursor: "pointer", color: colors.textoSec }} />
            </div>
            <div style={{ padding: "12px 0" }}>
              {equiposParaElegir.map((eq) => (
                <div
                  key={eq.id}
                  onClick={() => { setModalElegirEquipo(false); if (accionPendiente) accionPendiente(eq); }}
                  style={{
                    padding: "12px 22px", display: "flex", justifyContent: "space-between", alignItems: "center",
                    cursor: "pointer", borderBottom: `1px solid ${colors.borde}`,
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.background = colors.fondo)}
                  onMouseLeave={(e) => (e.currentTarget.style.background = "#fff")}
                >
                  <div>
                    <div style={{ fontSize: "13px", fontWeight: "700", color: colors.texto }}>{eq.folio || eq.numeroSerie}</div>
                    <div style={{ fontSize: "11.5px", color: colors.textoSec }}>{eq.marca} {eq.modelo} · {eq.responsable || "Sin asignar"}</div>
                  </div>
                  <FaChevronRight style={{ fontSize: "11px", color: colors.textoMuted }} />
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {modalPanel && equipoSel && (
        <div style={modalOverlay} onClick={() => setModalPanel(false)}>
          <div style={modalContenido} onClick={(e) => e.stopPropagation()}>
            <div style={{ padding: "18px 22px", borderBottom: `1px solid ${colors.borde}`, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div>
                <h3 style={{ margin: 0, fontSize: "16px", fontWeight: "800", color: colors.texto }}>
                  {equipoSel.folio || equipoSel.numeroSerie}
                  {equipoSel.activo === false && (
                    <span style={{ marginLeft: "8px", fontSize: "10.5px", fontWeight: "700", color: colors.gris, background: colors.grisClaro, padding: "3px 9px", borderRadius: "20px" }}>
                      Dado de baja
                    </span>
                  )}
                </h3>
                <p style={{ margin: "2px 0 0", fontSize: "12px", color: colors.textoSec }}>{equipoSel.marca} {equipoSel.modelo} · {equipoSel.responsable || "Sin asignar"}</p>
              </div>
              <FaTimes onClick={() => setModalPanel(false)} style={{ cursor: "pointer", color: colors.textoSec }} />
            </div>
            <div style={{ padding: "18px 22px", display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
              <AccionCard icono={<FaCheckCircle />} titulo="Estado Actual" color={colors.naranja} bg={colors.naranjaClaro}
                desc="Ver y actualizar el estado." onClick={() => { setModalPanel(false); setModalEstado(true); }} />
              <AccionCard icono={<FaKey />} titulo="Licencias" color={colors.verde} bg={colors.verdeClaro}
                desc="Agregar o quitar licencias." vacio={parseArray(equipoSel.licencias).length === 0}
                onClick={() => { setModalPanel(false); setModalLicencias(true); }} />
              <AccionCard icono={<FaBoxOpen />} titulo="Accesorios" color={colors.naranja} bg={colors.naranjaClaro}
                desc="Agregar o quitar accesorios." vacio={parseArray(equipoSel.accesorios).length === 0}
                onClick={() => { setModalPanel(false); setModalAccesorios(true); }} />
              <AccionCard icono={<FaMapMarkerAlt />} titulo="Ubicación" color={colors.naranja} bg={colors.naranjaClaro}
                desc="Ver área y ubicación actual." vacio={!equipoSel.ubicacion}
                onClick={() => { setModalPanel(false); setModalUbicacion(true); }} />
              <AccionCard icono={<FaHistory />} titulo="Historial" color={colors.naranja} bg={colors.naranjaClaro}
                desc="Ver asignaciones anteriores." onClick={() => { setModalPanel(false); cargarHistorialDe(equipoSel); }} />
              <AccionCard icono={<FaWrench />} titulo="Mantenimiento" color={colors.azul} bg={colors.azulClaro}
                desc="Registrar un mantenimiento." onClick={() => { setModalPanel(false); setMtEquipoId(String(equipoSel.id)); setModalMantenimiento(true); }} />
              {/* NUEVO: Dar de baja — ocupa las 2 columnas, siempre visible salvo que ya esté de baja */}
              {equipoSel.activo !== false && (
                <div style={{ gridColumn: "1 / -1" }}>
                  <AccionCard icono={<FaBan />} titulo="Dar de baja" color={colors.rojo} bg={colors.rojoClaro}
                    desc="Marcar este equipo como dañado / fuera de servicio permanentemente."
                    onClick={() => { setModalPanel(false); setModalBaja(true); }} />
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/*MODAL: Agregar equipo al historial*/}
      {modalAgregar && (
        <div style={modalOverlay} onClick={cerrarModalAgregar}>
          <div style={modalContenido} onClick={(e) => e.stopPropagation()}>
            <div style={{ padding: "18px 22px", borderBottom: `1px solid ${colors.borde}`, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <h3 style={{ margin: 0, fontSize: "16px", fontWeight: "800", color: colors.texto }}>Agregar equipo al historial</h3>
              <FaTimes onClick={cerrarModalAgregar} style={{ cursor: "pointer", color: colors.textoSec }} />
            </div>

            {aeEquipoGuardado ? (
              <div style={{ padding: "24px 22px" }}>
                <div style={{ background: colors.verdeClaro, border: `1px solid ${colors.verde}`, borderRadius: "10px", padding: "14px 16px", marginBottom: "18px", display: "flex", alignItems: "center", gap: "10px", color: colors.verde, fontSize: "13px", fontWeight: "700" }}>
                  <FaCheckCircle /> Equipo registrado exitosamente. Folio: <strong>{aeEquipoGuardado.folio}</strong>
                </div>
                <p style={{ margin: "0 0 18px", fontSize: "12.5px", color: colors.textoSec }}>
                  Ya puedes imprimir la hoja de entrega como comprobante, o cerrar y registrar otro equipo.
                </p>
                <div style={{ display: "flex", gap: "10px", justifyContent: "flex-end" }}>
                  <button onClick={cerrarModalAgregar} style={{ padding: "10px 18px", borderRadius: "9px", border: `1px solid ${colors.borde}`, background: "#fff", color: colors.textoSec, fontWeight: "700", fontSize: "12.5px", fontFamily: "inherit", cursor: "pointer" }}>
                    Cerrar
                  </button>
                  <button onClick={imprimirHojaDesdeHistorial}
                    style={{ display: "flex", alignItems: "center", gap: "7px", padding: "10px 20px", borderRadius: "9px", border: "none", background: colors.naranja, color: "#fff", fontWeight: "800", fontSize: "12.5px", fontFamily: "inherit", cursor: "pointer" }}>
                    <FaPrint /> Imprimir hoja de entrega
                  </button>
                </div>
              </div>
            ) : (
            <div style={{ padding: "20px 22px", display: "flex", flexDirection: "column", gap: "14px" }}>
              <p style={{ margin: 0, fontSize: "12.5px", color: colors.textoSec }}>
                Registra un equipo que ya está en uso en la empresa (compras anteriores o traspasos).
              </p>

              <InputField label="Categoría" required>
                <select value={aeCategoria} onChange={(e) => setAeCategoria(e.target.value)} style={inputStyle}>
                  <option value="">Selecciona categoría...</option>
                  {CATEGORIAS.map((c) => <option key={c.key} value={c.label}>{c.label}</option>)}
                  <option value="Otra">Otra... (escribe una nueva)</option>
                </select>
                {aeCategoria === "Otra" && (
                  <input placeholder="Nombre de la nueva categoría" value={aeCategoriaOtra} onChange={(e) => setAeCategoriaOtra(e.target.value)} style={{ ...inputStyle, marginTop: "6px" }} />
                )}
              </InputField>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
                <InputField label="Marca" required>
                  <input value={aeMarca} onChange={(e) => setAeMarca(e.target.value)} placeholder="Ej. HP, Dell..." style={inputStyle} />
                </InputField>
                <InputField label="Modelo">
                  <input value={aeModelo} onChange={(e) => setAeModelo(e.target.value)} style={inputStyle} />
                </InputField>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
                <InputField label="Número de serie" required>
                  <input value={aeSerie} onChange={(e) => setAeSerie(e.target.value)} style={inputStyle} />
                </InputField>
                <InputField label="Estado inicial">
                  <select value={aeEstado} onChange={(e) => setAeEstado(e.target.value)} style={inputStyle}>
                    {ESTADOS_EQUIPO.map((es) => <option key={es}>{es}</option>)}
                    <option value="Otro">Otro... (escribe uno nuevo)</option>
                  </select>
                  {aeEstado === "Otro" && (
                    <input placeholder="Nombre del estado" value={aeEstadoOtro} onChange={(e) => setAeEstadoOtro(e.target.value)} style={{ ...inputStyle, marginTop: "6px" }} />
                  )}
                </InputField>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
                <InputField label="Responsable">
                  <input value={aeResponsable} onChange={(e) => setAeResponsable(e.target.value)} placeholder="Nombre completo" style={inputStyle} />
                </InputField>
                <InputField label="Área">
                  <select value={aeArea} onChange={(e) => setAeArea(e.target.value)} style={inputStyle}>
                    <option value="">Selecciona área...</option>
                    {AREAS.map((a) => <option key={a}>{a}</option>)}
                    <option value="Otra">Otra... (escribe una nueva)</option>
                  </select>
                  {aeArea === "Otra" && (
                    <input placeholder="Nombre de la nueva área" value={aeAreaOtra} onChange={(e) => setAeAreaOtra(e.target.value)} style={{ ...inputStyle, marginTop: "6px" }} />
                  )}
                </InputField>
              </div>

              <InputField label="Accesorios incluidos">
                <EditorLista
                  items={aeAccesorios} setItems={setAeAccesorios}
                  sugerencias={["Cargador original", "Maletín", "Mouse inalámbrico", "Base refrigerante", "Cable HDMI"]}
                />
              </InputField>

              <InputField label="Licencias asignadas">
                <EditorLista
                  items={aeLicencias} setItems={setAeLicencias}
                  sugerencias={["Office 365", "Windows 11 Pro", "Windows 10 Pro", "Adobe Acrobat", "AutoCAD", "Antivirus corporativo"]}
                />
              </InputField>

              <InputField label="Observaciones">
                <textarea value={aeObservaciones} onChange={(e) => setAeObservaciones(e.target.value)} rows={2} style={{ ...inputStyle, resize: "vertical", fontFamily: "inherit" }} />
              </InputField>

              <div style={{ display: "flex", gap: "10px", justifyContent: "flex-end", marginTop: "6px" }}>
                <button onClick={cerrarModalAgregar} style={{ padding: "10px 18px", borderRadius: "9px", border: `1px solid ${colors.borde}`, background: "#fff", color: colors.textoSec, fontWeight: "700", fontSize: "12.5px", fontFamily: "inherit", cursor: "pointer" }}>
                  Cancelar
                </button>
                <button onClick={guardarEquipoHistorial} disabled={guardandoAE}
                  style={{ padding: "10px 20px", borderRadius: "9px", border: "none", background: colors.naranja, color: "#fff", fontWeight: "800", fontSize: "12.5px", fontFamily: "inherit", cursor: guardandoAE ? "default" : "pointer" }}>
                  {guardandoAE ? "Guardando..." : "Guardar equipo"}
                </button>
              </div>
            </div>
            )}
          </div>
        </div>
      )}

      {/*MODAL: Historial de asignaciones*/}
      {modalHistorial && equipoSel && (
        <div style={modalOverlay} onClick={() => setModalHistorial(false)}>
          <div style={modalContenido} onClick={(e) => e.stopPropagation()}>
            <div style={{ padding: "18px 22px", borderBottom: `1px solid ${colors.borde}`, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <h3 style={{ margin: 0, fontSize: "16px", fontWeight: "800", color: colors.texto }}>Historial — {equipoSel.folio || equipoSel.numeroSerie}</h3>
              <FaTimes onClick={() => setModalHistorial(false)} style={{ cursor: "pointer", color: colors.textoSec }} />
            </div>
            <div style={{ padding: "16px 22px" }}>
              {asignaciones.length === 0 ? (
                <p style={{ margin: 0, fontSize: "13px", color: colors.textoSec, textAlign: "center", padding: "20px 0" }}>Sin asignaciones registradas.</p>
              ) : asignaciones.map((a, i) => (
                <div key={i} style={{ padding: "12px 0", borderBottom: i < asignaciones.length - 1 ? `1px solid ${colors.borde}` : "none" }}>
                  <div style={{ fontSize: "12.5px", fontWeight: "700", color: colors.texto }}>{a.responsable || a.responsableAnterior} — {a.area || a.areaAnterior}</div>
                  <div style={{ fontSize: "11px", color: colors.textoSec, marginTop: "2px" }}>
                    {a.fechaAsignacion && `Asignado: ${new Date(a.fechaAsignacion).toLocaleDateString("es-HN")}`}
                    {a.fechaDevolucion && ` · Devuelto: ${new Date(a.fechaDevolucion).toLocaleDateString("es-HN")}`}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/*MODAL: Estado Actual (ahora con estado personalizado y botón Guardar)*/}
      {modalEstado && equipoSel && (
        <div style={modalOverlay} onClick={() => setModalEstado(false)}>
          <div style={modalContenido} onClick={(e) => e.stopPropagation()}>
            <div style={{ padding: "18px 22px", borderBottom: `1px solid ${colors.borde}`, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <h3 style={{ margin: 0, fontSize: "16px", fontWeight: "800", color: colors.texto }}>Estado del equipo — {equipoSel.folio || equipoSel.numeroSerie}</h3>
              <FaTimes onClick={() => setModalEstado(false)} style={{ cursor: "pointer", color: colors.textoSec }} />
            </div>
            <div style={{ padding: "20px 22px", display: "flex", flexDirection: "column", gap: "10px" }}>
              <div style={{ fontSize: "13px", color: colors.textoSec }}>
                <b style={{ color: colors.texto }}>{equipoSel.marca} {equipoSel.modelo}</b><br />
                Responsable: {equipoSel.responsable || "Sin asignar"} — {equipoSel.areaEmpresa || "—"}
              </div>
              <div style={{ padding: "12px 14px", background: colorEstado(equipoSel.estadoInicial).bg, color: colorEstado(equipoSel.estadoInicial).color, borderRadius: "10px", fontWeight: "800", fontSize: "13px" }}>
                Estado actual: {equipoSel.estadoInicial || "—"}
              </div>
              {equipoSel.observaciones && (
                <div style={{ padding: "12px 14px", background: colors.fondo, borderRadius: "10px", fontSize: "12.5px", color: colors.textoSec }}>
                  <b style={{ color: colors.texto, display: "block", marginBottom: "4px" }}>Observaciones</b>
                  {equipoSel.observaciones}
                </div>
              )}
              <InputField label="Actualizar estado">
                <select value={estadoNuevo} onChange={(e) => setEstadoNuevo(e.target.value)} style={inputStyle}>
                  {ESTADOS_EQUIPO.map((es) => <option key={es}>{es}</option>)}
                  <option value="Otro">Otro... (escribe uno nuevo)</option>
                </select>
                {estadoNuevo === "Otro" && (
                  <input
                    placeholder="Escribe el estado personalizado"
                    value={estadoNuevoOtro}
                    onChange={(e) => setEstadoNuevoOtro(e.target.value)}
                    style={{ ...inputStyle, marginTop: "6px" }}
                  />
                )}
              </InputField>
              <div style={{ display: "flex", justifyContent: "flex-end", marginTop: "4px" }}>
                <button
                  onClick={guardarEstadoEquipo}
                  disabled={guardandoEstado}
                  style={{ padding: "10px 20px", borderRadius: "9px", border: "none", background: colors.naranja, color: "#fff", fontWeight: "800", fontSize: "12.5px", fontFamily: "inherit", cursor: guardandoEstado ? "default" : "pointer" }}
                >
                  {guardandoEstado ? "Guardando..." : "Guardar estado"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/*MODAL: Licencias Asignadas*/}
      {modalLicencias && equipoSel && (
        <div style={modalOverlay} onClick={() => { setModalLicencias(false); setEstadoGuardadoLicencias(null); }}>
          <div style={modalContenido} onClick={(e) => e.stopPropagation()}>
            <div style={{ padding: "18px 22px", borderBottom: `1px solid ${colors.borde}`, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <h3 style={{ margin: 0, fontSize: "16px", fontWeight: "800", color: colors.texto }}>Licencias — {equipoSel.folio || equipoSel.numeroSerie}</h3>
              <FaTimes onClick={() => { setModalLicencias(false); setEstadoGuardadoLicencias(null); }} style={{ cursor: "pointer", color: colors.textoSec }} />
            </div>
            <div style={{ padding: "20px 22px" }}>
              <BarraGuardado estado={estadoGuardadoLicencias} />
              <EditorLista
                items={parseArray(equipoSel.licencias)}
                setItems={(nuevas) => actualizarCampoLista("licencias", nuevas, setEstadoGuardadoLicencias)}
                placeholder="Ej. Office 365, Windows 11..."
                sugerencias={["Office 365", "Windows 11 Pro", "Windows 10 Pro", "Adobe Acrobat", "AutoCAD", "Antivirus corporativo"]}
              />
            </div>
          </div>
        </div>
      )}

      {/*MODAL: Agregar Accesorios*/}
      {modalAccesorios && equipoSel && (
        <div style={modalOverlay} onClick={() => { setModalAccesorios(false); setEstadoGuardadoAccesorios(null); }}>
          <div style={modalContenido} onClick={(e) => e.stopPropagation()}>
            <div style={{ padding: "18px 22px", borderBottom: `1px solid ${colors.borde}`, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <h3 style={{ margin: 0, fontSize: "16px", fontWeight: "800", color: colors.texto }}>Accesorios — {equipoSel.folio || equipoSel.numeroSerie}</h3>
              <FaTimes onClick={() => { setModalAccesorios(false); setEstadoGuardadoAccesorios(null); }} style={{ cursor: "pointer", color: colors.textoSec }} />
            </div>
            <div style={{ padding: "20px 22px" }}>
              <BarraGuardado estado={estadoGuardadoAccesorios} />
              <EditorLista
                items={parseArray(equipoSel.accesorios)}
                setItems={(nuevos) => actualizarCampoLista("accesorios", nuevos, setEstadoGuardadoAccesorios)}
                placeholder="Ej. Cargador, mouse..."
                sugerencias={["Cargador original", "Maletín", "Mouse inalámbrico", "Base refrigerante", "Cable HDMI"]}
              />
            </div>
          </div>
        </div>
      )}

      {/*MODAL: Mantenimiento*/}
      {modalMantenimiento && (
        <div style={modalOverlay} onClick={() => setModalMantenimiento(false)}>
          <div style={modalContenido} onClick={(e) => e.stopPropagation()}>
            <div style={{ padding: "18px 22px", borderBottom: `1px solid ${colors.borde}`, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <h3 style={{ margin: 0, fontSize: "16px", fontWeight: "800", color: colors.texto, display: "flex", alignItems: "center", gap: "8px" }}>
                <FaWrench style={{ color: colors.azul }} /> Registrar mantenimiento
              </h3>
              <FaTimes onClick={() => setModalMantenimiento(false)} style={{ cursor: "pointer", color: colors.textoSec }} />
            </div>
            <div style={{ padding: "20px 22px", display: "flex", flexDirection: "column", gap: "12px" }}>
              <InputField label="Equipo" required>
                <select value={mtEquipoId} onChange={(e) => setMtEquipoId(e.target.value)} style={inputStyle}>
                  <option value="">Selecciona un equipo...</option>
                  {(categoriaActiva ? equiposDeCategoriaActiva() : equipos).map((eq) => (
                    <option key={eq.id} value={eq.id}>{eq.folio || eq.numeroSerie} — {eq.marca} {eq.modelo}</option>
                  ))}
                </select>
              </InputField>
              <InputField label="Fecha">
                <input type="date" value={mtFecha} onChange={(e) => setMtFecha(e.target.value)} style={inputStyle} />
              </InputField>
              <InputField label="Descripción del mantenimiento" required>
                <textarea value={mtDescripcion} onChange={(e) => setMtDescripcion(e.target.value)} rows={3} placeholder="Preventivo, correctivo, piezas cambiadas, técnico responsable..." style={{ ...inputStyle, resize: "vertical", fontFamily: "inherit" }} />
              </InputField>
              <div style={{ display: "flex", gap: "10px", justifyContent: "flex-end", marginTop: "4px" }}>
                <button onClick={() => setModalMantenimiento(false)} style={{ padding: "10px 18px", borderRadius: "9px", border: `1px solid ${colors.borde}`, background: "#fff", color: colors.textoSec, fontWeight: "700", fontSize: "12.5px", fontFamily: "inherit", cursor: "pointer" }}>
                  Cancelar
                </button>
                <button onClick={() => registrarEvento("Mantenimiento", "Mantenimiento")}
                  style={{ padding: "10px 20px", borderRadius: "9px", border: "none", background: colors.azul, color: "#fff", fontWeight: "800", fontSize: "12.5px", fontFamily: "inherit", cursor: "pointer" }}>
                  Registrar mantenimiento
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {modalDanos && (
        <div style={modalOverlay} onClick={() => setModalDanos(false)}>
          <div style={modalContenido} onClick={(e) => e.stopPropagation()}>
            <div style={{ padding: "18px 22px", borderBottom: `1px solid ${colors.borde}`, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <h3 style={{ margin: 0, fontSize: "16px", fontWeight: "800", color: colors.texto, display: "flex", alignItems: "center", gap: "8px" }}>
                <FaExclamationTriangle style={{ color: colors.rojo }} /> Registrar devolución por daños
              </h3>
              <FaTimes onClick={() => setModalDanos(false)} style={{ cursor: "pointer", color: colors.textoSec }} />
            </div>
            <div style={{ padding: "20px 22px", display: "flex", flexDirection: "column", gap: "12px" }}>
              <InputField label="Equipo" required>
                <select value={mtEquipoId} onChange={(e) => setMtEquipoId(e.target.value)} style={inputStyle}>
                  <option value="">Selecciona un equipo...</option>
                  {(categoriaActiva ? equiposDeCategoriaActiva() : equipos).map((eq) => (
                    <option key={eq.id} value={eq.id}>{eq.folio || eq.numeroSerie} — {eq.marca} {eq.modelo}</option>
                  ))}
                </select>
              </InputField>
              <InputField label="Fecha del daño">
                <input type="date" value={mtFecha} onChange={(e) => setMtFecha(e.target.value)} style={inputStyle} />
              </InputField>
              <InputField label="Descripción del daño" required>
                <textarea value={mtDescripcion} onChange={(e) => setMtDescripcion(e.target.value)} rows={3} placeholder="Qué pasó, quién lo reportó, si se puede reparar..." style={{ ...inputStyle, resize: "vertical", fontFamily: "inherit" }} />
              </InputField>
              <div style={{ display: "flex", gap: "10px", justifyContent: "flex-end", marginTop: "4px" }}>
                <button onClick={() => setModalDanos(false)} style={{ padding: "10px 18px", borderRadius: "9px", border: `1px solid ${colors.borde}`, background: "#fff", color: colors.textoSec, fontWeight: "700", fontSize: "12.5px", fontFamily: "inherit", cursor: "pointer" }}>
                  Cancelar
                </button>
                <button onClick={() => registrarEvento("Devolución por daños", "Devolución por daños")}
                  style={{ padding: "10px 20px", borderRadius: "9px", border: "none", background: colors.rojo, color: "#fff", fontWeight: "800", fontSize: "12.5px", fontFamily: "inherit", cursor: "pointer" }}>
                  Registrar devolución
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {modalUbicacion && equipoSel && (
        <div style={modalOverlay} onClick={() => setModalUbicacion(false)}>
          <div style={modalContenido} onClick={(e) => e.stopPropagation()}>
            <div style={{ padding: "18px 22px", borderBottom: `1px solid ${colors.borde}`, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <h3 style={{ margin: 0, fontSize: "16px", fontWeight: "800", color: colors.texto }}>Ubicación — {equipoSel.folio || equipoSel.numeroSerie}</h3>
              <FaTimes onClick={() => setModalUbicacion(false)} style={{ cursor: "pointer", color: colors.textoSec }} />
            </div>
            <div style={{ padding: "20px 22px", fontSize: "13px", color: colors.textoSec }}>
              Área actual: <b style={{ color: colors.texto }}>{equipoSel.areaEmpresa || "Sin asignar"}</b><br />
              Ubicación específica: <b style={{ color: colors.texto }}>{equipoSel.ubicacion || "No registrada"}</b><br /><br />
              Los cambios de ubicación se registran automáticamente desde la pantalla de <b>Equipo Reasignado</b> cada vez que se traslada un equipo a otra área.
            </div>
          </div>
        </div>
      )}

      {/* NUEVO: MODAL Dar de baja */}
      {modalBaja && equipoSel && (
        <div style={modalOverlay} onClick={() => { setModalBaja(false); setBajaMotivo(""); }}>
          <div style={modalContenido} onClick={(e) => e.stopPropagation()}>
            <div style={{ padding: "18px 22px", borderBottom: `1px solid ${colors.borde}`, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <h3 style={{ margin: 0, fontSize: "16px", fontWeight: "800", color: colors.rojo, display: "flex", alignItems: "center", gap: "8px" }}>
                <FaBan /> Dar de baja — {equipoSel.folio || equipoSel.numeroSerie}
              </h3>
              <FaTimes onClick={() => { setModalBaja(false); setBajaMotivo(""); }} style={{ cursor: "pointer", color: colors.textoSec }} />
            </div>
            <div style={{ padding: "20px 22px", display: "flex", flexDirection: "column", gap: "12px" }}>
              <div style={{ background: colors.rojoClaro, border: `1px solid ${colors.rojo}`, borderRadius: "9px", padding: "12px 14px", color: colors.rojo, fontSize: "12.5px", fontWeight: "600" }}>
                Esta acción marca el equipo como fuera de servicio permanentemente. Queda documentado en el Historial, pero deja de contarse como equipo activo.
              </div>
              <InputField label="Motivo de la baja" required>
                <textarea
                  value={bajaMotivo}
                  onChange={(e) => setBajaMotivo(e.target.value)}
                  rows={3}
                  placeholder="Ej: pantalla dañada irreparable, equipo obsoleto, robo confirmado..."
                  style={{ ...inputStyle, resize: "vertical", fontFamily: "inherit" }}
                />
              </InputField>
              <div style={{ display: "flex", gap: "10px", justifyContent: "flex-end", marginTop: "4px" }}>
                <button onClick={() => { setModalBaja(false); setBajaMotivo(""); }} style={{ padding: "10px 18px", borderRadius: "9px", border: `1px solid ${colors.borde}`, background: "#fff", color: colors.textoSec, fontWeight: "700", fontSize: "12.5px", fontFamily: "inherit", cursor: "pointer" }}>
                  Cancelar
                </button>
                <button onClick={confirmarBaja} disabled={guardandoBaja}
                  style={{ padding: "10px 20px", borderRadius: "9px", border: "none", background: colors.rojo, color: "#fff", fontWeight: "800", fontSize: "12.5px", fontFamily: "inherit", cursor: guardandoBaja ? "default" : "pointer" }}>
                  {guardandoBaja ? "Guardando..." : "Confirmar baja"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}