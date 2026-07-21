import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import baprosaLogo from "../assets/baprosa-logo.png";
import {
  FaRegEnvelope, FaRegBell, FaChevronDown,
  FaShieldAlt, FaUser, FaFileAlt, FaBold, FaItalic, FaUnderline,
  FaAlignLeft, FaAlignCenter, FaAlignRight, FaListUl, FaListOl, FaCloudUploadAlt,
  FaSignOutAlt, FaClock,
} from "react-icons/fa";

const getIniciales = (name) => {
  if (!name) return "U";
  const p = name.trim().split(" ");
  return p.length > 1 ? `${p[0][0]}${p[1][0]}`.toUpperCase() : p[0][0].toUpperCase();
};

const inputCls =
  "w-full px-3.5 py-2.5 rounded-lg border border-gray-200 bg-[#FFF7F2] text-sm text-slate-800 " +
  "outline-none transition-all duration-200 hover:border-[#f58220] hover:bg-[#FFF7F2] focus:border-[#f58220] focus:bg-[#FFF7F2] focus:ring-2 focus:ring-[#f58220]/15 placeholder:text-gray-400";

const labelCls = "block text-xs font-bold text-slate-500 mb-1.5";
const sectionCls = "bg-white rounded-lg shadow-sm border border-gray-100 p-6";

function Dropdown({ value, onChange, options, placeholder, disabled }) {
  const [abierto, setAbierto] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const cerrar = (e) => { if (ref.current && !ref.current.contains(e.target)) setAbierto(false); };
    document.addEventListener("mousedown", cerrar);
    return () => document.removeEventListener("mousedown", cerrar);
  }, []);

  const etiquetaActual = options.find((o) => {
    if (typeof o === "string") return o === value;
    return String(o.value) === String(value);
  });
  const textoMostrado = typeof etiquetaActual === "string" ? etiquetaActual : etiquetaActual?.label;

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        disabled={disabled}
        onClick={() => setAbierto((v) => !v)}
        className={`w-full px-3.5 py-2.5 rounded-lg border text-left text-sm outline-none transition-all duration-200 flex items-center justify-between
          focus:ring-2 focus:ring-[#f58220]/15
          ${disabled ? "bg-gray-100 text-gray-400 cursor-not-allowed border-gray-200" : "bg-[#FFF7F2] border-gray-200 hover:border-[#f58220] hover:bg-[#FFF7F2] cursor-pointer"}
          ${abierto ? "border-[#f58220] bg-[#FFF7F2]" : ""}`}
      >
        <span className={value ? "text-slate-800" : "text-gray-400"}>{textoMostrado || placeholder}</span>
        <FaChevronDown className={`text-[10px] text-gray-400 transition-transform flex-shrink-0 ml-2 ${abierto ? "rotate-180" : ""}`} />
      </button>
      {abierto && !disabled && (
        <div className="absolute top-[calc(100%+4px)] left-0 right-0 bg-white border border-gray-200 rounded-lg shadow-lg z-50 max-h-60 overflow-y-auto py-1">
          {options.length === 0 ? (
            <div className="px-3.5 py-2 text-xs text-gray-400 italic">No hay opciones disponibles</div>
          ) : (
            options.map((o) => {
              const val = typeof o === "string" ? o : o.value;
              const label = typeof o === "string" ? o : o.label;
              const activo = String(val) === String(value);
              return (
                <div
                  key={val}
                  onClick={() => { onChange(val); setAbierto(false); }}
                  className={`px-3.5 py-2 text-sm cursor-pointer transition-colors
                    ${activo ? "bg-[#FFF7F2] text-[#f58220] font-semibold" : "text-slate-700 hover:bg-[#FFF7F2] hover:text-[#f58220]"}`}
                >
                  {label}
                </div>
              );
            })
          )}
        </div>
      )}
    </div>
  );
}

export default function RegisterTicket({ usuario, cerrarSesion }) {
  const navigate = useNavigate();
  const storedUser = localStorage.getItem("user");
  const user = usuario || (storedUser ? JSON.parse(storedUser) : null);
  const token = localStorage.getItem("token");

  const [tipo, setTipo] = useState("");
  const [prioridad, setPrioridad] = useState("");
  const [estado] = useState("Creado");
  const [nombre] = useState(user ? user.name : "");
  const [correo] = useState(user ? user.email : "");
  const [descripcion, setDescripcion] = useState("");
  const [asunto, setAsunto] = useState("");
  const [detallesImpacto, setDetallesImpacto] = useState("");
  const [area, setArea] = useState("");

  const [categorias, setCategorias] = useState([]);
  const [categoriaId, setCategoriaId] = useState("");
  const [subcategoriaId, setSubcategoriaId] = useState("");

  const [asesores, setAsesores] = useState([]);
  const [asesorId, setAsesorId] = useState("");
  const [cargandoAsesores, setCargandoAsesores] = useState(true);

  const [areasIT, setAreasIT] = useState([]);

  const [archivos, setArchivos] = useState([]);
  const [arrastrando, setArrastrando] = useState(false);

  const [bloqueado, setBloqueado] = useState(false);
  const [enviando, setEnviando] = useState(false);

  const editorRef = useRef(null);
  const [notificaciones, setNotificaciones] = useState([]);
  const [totalPendientes, setTotalPendientes] = useState(0);
  const [correosRecientes, setCorreosRecientes] = useState([]);
  const [panelNotifAbierto, setPanelNotifAbierto] = useState(false);
  const [panelCorreoAbierto, setPanelCorreoAbierto] = useState(false);
  const [menuAvatarAbierto, setMenuAvatarAbierto] = useState(false);

  const notifRef = useRef(null);
  const correoRef = useRef(null);
  const avatarRef = useRef(null);

  const authHeaders = () => (token ? { Authorization: `Bearer ${token}` } : {});

  useEffect(() => {
    const fetchAsesores = async () => {
      try {
        const res = await fetch("http://localhost:3000/api/usuarios/asesores", { headers: authHeaders() });
        if (!res.ok) throw new Error("No se pudo cargar la lista de asesores");
        const data = await res.json();
        setAsesores(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error("Error al cargar asesores:", err);
      } finally {
        setCargandoAsesores(false);
      }
    };
    fetchAsesores();
  }, []);

  useEffect(() => {
    const fetchAreasIT = async () => {
      try {
        const res = await fetch("http://localhost:3000/api/areas-it?soloIT=true", { headers: authHeaders() });
        const data = await res.json();
        setAreasIT(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error("Error al cargar áreas de IT:", err);
      }
    };
    fetchAreasIT();
  }, []);

  useEffect(() => {
    const fetchCategorias = async () => {
      try {
        const res = await fetch("http://localhost:3000/api/categorias");
        const data = await res.json();
        setCategorias(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error("Error al cargar categorías:", err);
      }
    };
    fetchCategorias();
  }, []);

  const cargarNotificaciones = () => {
    fetch("http://localhost:3000/api/notificaciones", { headers: authHeaders() })
      .then((r) => r.json())
      .then((data) => {
        setNotificaciones(data.notificaciones || []);
        setTotalPendientes(data.totalPendientes || 0);
      })
      .catch((e) => console.error("Error notificaciones:", e));
  };

  const cargarCorreos = () => {
    fetch("http://localhost:3000/api/notificaciones/correos", { headers: authHeaders() })
      .then((r) => r.json())
      .then((data) => setCorreosRecientes(Array.isArray(data) ? data : []))
      .catch((e) => console.error("Error correos:", e));
  };

  useEffect(() => {
    cargarNotificaciones();
    const intervalo = setInterval(cargarNotificaciones, 60000);
    return () => clearInterval(intervalo);
  }, []);

  useEffect(() => {
    const cerrar = (e) => {
      if (notifRef.current && !notifRef.current.contains(e.target)) setPanelNotifAbierto(false);
      if (correoRef.current && !correoRef.current.contains(e.target)) setPanelCorreoAbierto(false);
      if (avatarRef.current && !avatarRef.current.contains(e.target)) setMenuAvatarAbierto(false);
    };
    document.addEventListener("mousedown", cerrar);
    return () => document.removeEventListener("mousedown", cerrar);
  }, []);

  const colorNotif = (tipoN) => {
    if (tipoN === "riesgo") return { bg: "#fee2e2", color: "#991b1b", label: "En riesgo" };
    if (tipoN === "encuesta") return { bg: "#e9f9ee", color: "#16a34a", label: "Encuesta" };
    if (tipoN === "subtarea") return { bg: "#eff6ff", color: "#1d4ed8", label: "Sub-tarea" };
    return { bg: "#fff1e6", color: "#9a3412", label: "Nuevo" };
  };

  const categoriaSeleccionada = categorias.find((c) => String(c.id) === String(categoriaId));

  const agregarArchivos = (files) => {
    const lista = Array.from(files).map((file) => ({
      file,
      preview: file.type.startsWith("image") ? URL.createObjectURL(file) : null,
    }));
    setArchivos((prev) => [...prev, ...lista]);
  };

  const quitarArchivo = (index) => {
    setArchivos((prev) => prev.filter((_, i) => i !== index));
  };

  const iconoPorTipo = (file) => {
    if (file.type.startsWith("image")) return "🖼️";
    if (file.type.startsWith("audio")) return "🎵";
    if (file.type.includes("pdf")) return "📕";
    if (file.type.includes("word") || file.name.endsWith(".docx") || file.name.endsWith(".doc")) return "📘";
    if (file.type.includes("sheet") || file.name.endsWith(".xlsx") || file.name.endsWith(".xls")) return "📗";
    return "📎";
  };

  const aplicarFormato = (comando) => {
    document.execCommand(comando, false, null);
    editorRef.current?.focus();
  };
  const aplicarAlineacion = (align) => {
    document.execCommand(align, false, null);
    editorRef.current?.focus();
  };
  const aplicarLista = () => {
    document.execCommand("insertUnorderedList", false, null);
    editorRef.current?.focus();
  };
  const aplicarListaNumerada = () => {
    document.execCommand("insertOrderedList", false, null);
    editorRef.current?.focus();
  };

  const restablecer = () => {
    setTipo(""); setPrioridad(""); setDescripcion(""); setAsunto("");
    setDetallesImpacto(""); setArea(""); setCategoriaId(""); setSubcategoriaId("");
    setAsesorId(""); setArchivos([]); setBloqueado(false);
    if (editorRef.current) editorRef.current.innerHTML = "";
  };

  const crearTicket = async () => {
    if (!tipo) { alert("Selecciona el tipo de solicitud"); return; }
    if (!prioridad) { alert("Selecciona la prioridad"); return; }
    if (!asesorId) { alert("Selecciona un asesor para atender tu incidente"); return; }
    if (!asunto.trim()) { alert("Escribe un asunto para el ticket"); return; }

    setEnviando(true);
    try {
      const descripcionHtml = editorRef.current?.innerHTML || descripcion;
      const formData = new FormData();
      formData.append("nombre", nombre);
      formData.append("correo", correo);
      formData.append("tipo", tipo);
      formData.append("prioridad", prioridad);
      formData.append(
        "descripcion",
        `${asunto}${detallesImpacto ? " — " + detallesImpacto : ""}\n\n${descripcionHtml}`
      );
      formData.append("area", area);
      if (categoriaId) formData.append("categoriaId", categoriaId);
      if (subcategoriaId) formData.append("subcategoriaId", subcategoriaId);
      if (user?.id) formData.append("usuarioId", user.id);
      formData.append("adminIds", JSON.stringify([Number(asesorId)]));
      archivos.forEach(({ file }) => formData.append("archivos", file));

      const res = await fetch("http://localhost:3000/api/tickets", {
        method: "POST",
        headers: authHeaders(),
        body: formData,
      });

      const data = await res.json();
      if (!res.ok) {
        alert(data.error || "Error al crear ticket");
        setEnviando(false);
        return;
      }
      navigate(`/chat/${data.ticket.id}`);
    } catch (error) {
      console.error(error);
      alert("Error al crear ticket");
      setEnviando(false);
    }
  };
  const [sesionDesde] = useState(new Date());

  return (
    <div className="flex flex-col min-h-screen font-['Inter',sans-serif] bg-[#FFF7F2]">
      <style>{`
        .editor-descripcion ul { list-style: disc; padding-left: 22px; margin: 6px 0; }
        .editor-descripcion ol { list-style: decimal; padding-left: 22px; margin: 6px 0; }
        .editor-descripcion li { margin: 2px 0; }
        select:focus, select:hover { outline: none !important; border-color: #f58220 !important; box-shadow: 0 0 0 2px rgba(245,130,32,0.15) !important; }
      `}</style>

      <div className="flex flex-1 bg-[#FFF7F2]">
        <Sidebar usuario={user} cerrarSesion={cerrarSesion} />

        <div className="flex-1 flex flex-col overflow-hidden">
          <div className="h-[76px] bg-white border-b border-gray-100 flex items-center justify-between px-7 flex-shrink-0">
            <img src={baprosaLogo} alt="Baprosa" className="h-11 object-contain flex-shrink-0" />

            <div className="flex items-center gap-5 ml-6">
              <div ref={correoRef} className="relative">
                <button
                  onClick={() => { setPanelCorreoAbierto((v) => !v); setPanelNotifAbierto(false); setMenuAvatarAbierto(false); cargarCorreos(); }}
                  className="text-gray-400 hover:text-[#f58220] transition-colors outline-none focus:outline-none"
                >
                  <FaRegEnvelope className="text-xl" />
                </button>
                {panelCorreoAbierto && (
                  <div className="absolute top-10 right-0 w-72 bg-white border border-gray-200 rounded-xl shadow-lg z-50 overflow-hidden">
                    <div className="px-4 py-3 border-b border-gray-100">
                      <span className="font-bold text-xs text-slate-800">Mis tickets recientes</span>
                    </div>
                    <div className="max-h-72 overflow-y-auto">
                      {correosRecientes.length === 0 ? (
                        <div className="p-5 text-center text-xs text-gray-400">Sin tickets recientes</div>
                      ) : correosRecientes.map((t, i) => (
                        <div key={i} className="px-4 py-2.5 border-b border-gray-50 last:border-0 leading-tight">
                          <p className="text-xs font-bold text-slate-800 m-0">#TK-{t.id} — {t.tipo}</p>
                          <p className="text-[10.5px] text-slate-500 m-0 mt-0.5">{t.estado} · {t.area || "—"}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
              <div ref={notifRef} className="relative">
                <button
                  onClick={() => { setPanelNotifAbierto((v) => !v); setPanelCorreoAbierto(false); setMenuAvatarAbierto(false); }}
                  className="relative text-gray-400 hover:text-[#f58220] transition-colors outline-none focus:outline-none"
                >
                  <FaRegBell className="text-xl" />
                  {notificaciones.length > 0 && (
                    <span className="absolute -top-1 -right-1.5 min-w-[16px] h-[16px] rounded-full bg-red-500 text-white text-[10px] font-bold flex items-center justify-center border-2 border-white px-0.5">
                      {notificaciones.length > 9 ? "9+" : notificaciones.length}
                    </span>
                  )}
                </button>
                {panelNotifAbierto && (
                  <div className="absolute top-10 right-0 w-80 bg-white border border-gray-200 rounded-xl shadow-lg z-50 overflow-hidden">
                    <div className="px-4 py-3 border-b border-gray-100 flex justify-between items-center">
                      <span className="font-bold text-xs text-slate-800">Notificaciones</span>
                      {totalPendientes > 0 && <span className="text-[10px] font-bold text-[#f58220] bg-orange-50 px-2 py-0.5 rounded-md">{totalPendientes} pendientes</span>}
                    </div>
                    <div className="max-h-80 overflow-y-auto">
                      {notificaciones.length === 0 ? (
                        <div className="p-5 text-center text-xs text-gray-400">Sin notificaciones nuevas</div>
                      ) : notificaciones.map((n, i) => {
                        const c = colorNotif(n.tipo);
                        return (
                          <div key={i} className="px-4 py-2.5 border-b border-gray-50 last:border-0 flex gap-2.5 items-start hover:bg-gray-50 cursor-pointer"
                            onClick={() => { if (n.ticketId) navigate(`/chat/${n.ticketId}`); }}>
                            <span className="text-[9px] font-bold px-1.5 py-0.5 rounded whitespace-nowrap mt-0.5" style={{ backgroundColor: c.bg, color: c.color }}>{c.label}</span>
                            <div>
                              <p className="text-xs font-bold text-slate-800 m-0">{n.titulo}</p>
                              <p className="text-[10.5px] text-slate-500 m-0 mt-0.5">{n.detalle}</p>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>

              <div className="w-px h-6 bg-gray-200" />

              <div ref={avatarRef} className="relative">
                <div
                  onClick={() => { setMenuAvatarAbierto((v) => !v); setPanelNotifAbierto(false); setPanelCorreoAbierto(false); }}
                  className="flex items-center gap-3 cursor-pointer"
                >
                  <div className="w-9 h-9 rounded-full bg-orange-50 text-[#f58220] flex items-center justify-center font-extrabold text-sm">
                    {getIniciales(user?.name)}
                  </div>
                  <div>
                    <div className="text-sm font-bold text-slate-800 leading-tight">{user?.name}</div>
                    <div className="text-xs text-slate-500 leading-tight">{user?.role}</div>
                  </div>
                  <FaChevronDown className={`text-gray-400 text-[10px] transition-transform ${menuAvatarAbierto ? "rotate-180" : ""}`} />
                </div>
                {menuAvatarAbierto && (
                  <div className="absolute top-12 right-0 w-56 bg-white border border-gray-200 rounded-xl shadow-lg z-50 overflow-hidden">
                    <div className="px-4 py-3 border-b border-gray-100 leading-tight">
                      <p className="text-xs font-bold text-slate-800 m-0">{user?.name}</p>
                      <p className="text-[11px] text-slate-500 m-0 mt-0.5">{user?.email}</p>
                      <p className="text-[10px] font-bold text-[#f58220] m-0 mt-0.5">{user?.role}</p>
                    </div>
                    <div className="px-4 py-2.5 border-b border-gray-100 flex items-center gap-2 text-[10.5px] text-slate-500">
                      <FaClock className="text-gray-400" />
                      <span>
                        Sesión iniciada: {sesionDesde.toLocaleDateString("es-HN")} — {sesionDesde.toLocaleTimeString("es-HN", { hour: "2-digit", minute: "2-digit" })}
                      </span>
                    </div>
                    <div
                      onClick={() => { setMenuAvatarAbierto(false); if (cerrarSesion) cerrarSesion(); navigate("/"); }}
                      className="flex items-center gap-2 px-4 py-2.5 text-xs font-semibold text-red-500 hover:bg-red-50 cursor-pointer"
                    >
                      <FaSignOutAlt className="text-xs" /> Cerrar sesión
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-8 bg-[#FFF7F2]">
            <div className="mb-6">
              <div className="text-xs text-gray-400 mb-1.5">
                Tickets <span className="mx-1">›</span>
                <span className="text-[#f58220] font-semibold">Nuevo incidente</span>
              </div>
              <h2 className="text-2xl font-extrabold text-slate-800 tracking-tight mb-1">
                Registro de Nuevo Incidente
              </h2>
              <p className="text-sm text-slate-500">
                Gestiona el reporte técnico completando todos los campos requeridos para una atención prioritaria.
              </p>
            </div>

            <div className="w-full flex flex-col gap-5">

              <div className={sectionCls}>
                <div className="flex items-center gap-2.5 mb-5 pb-4 border-b border-gray-100">
                  <div className="w-8 h-8 flex-shrink-0 rounded-lg bg-orange-50 text-[#f58220] flex items-center justify-center text-sm">
                    <FaShieldAlt />
                  </div>
                  <h3 className="text-sm font-bold text-slate-800 leading-none m-0 whitespace-nowrap">Información del Incidente</h3>
                </div>

                <fieldset disabled={bloqueado} className={bloqueado ? "opacity-60" : ""}>
                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div>
                      <label className={labelCls}>Tipo de solicitud *</label>
                      <Dropdown
                        value={tipo}
                        onChange={setTipo}
                        placeholder="Selecciona una opción"
                        options={["Incidente", "Problema", "Solicitud de mantenimiento", "Solicitud de información"]}
                      />
                    </div>
                    <div>
                      <label className={labelCls}>Prioridad *</label>
                      <Dropdown
                        value={prioridad}
                        onChange={setPrioridad}
                        placeholder="Selecciona una opción"
                        options={["Urgente", "Alta", "Media", "Baja"]}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div>
                      <label className={labelCls}>Estado</label>
                      <input value={estado} readOnly className={`${inputCls} text-slate-500`} />
                    </div>
                    <div>
                      <label className={labelCls}>Detalles del impacto</label>
                      <input
                        placeholder="Ej. afecta a todo el departamento"
                        value={detallesImpacto}
                        onChange={(e) => setDetallesImpacto(e.target.value)}
                        className={inputCls}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className={labelCls}>Categoría del problema</label>
                      <Dropdown
                        value={categoriaId}
                        onChange={(val) => { setCategoriaId(val); setSubcategoriaId(""); }}
                        placeholder="Selecciona una categoría"
                        options={categorias.map((c) => ({ value: c.id, label: c.nombre }))}
                      />
                    </div>
                    <div>
                      <label className={labelCls}>Subcategoría</label>
                      <Dropdown
                        value={subcategoriaId}
                        onChange={setSubcategoriaId}
                        placeholder={categoriaSeleccionada ? "Selecciona una subcategoría" : "Elige una categoría primero"}
                        disabled={!categoriaSeleccionada}
                        options={categoriaSeleccionada ? categoriaSeleccionada.subcategorias.map((s) => ({ value: s.id, label: s.nombre })) : []}
                      />
                    </div>
                  </div>
                </fieldset>
              </div>

              <div className={sectionCls}>
                <div className="flex items-center gap-2.5 mb-5 pb-4 border-b border-gray-100">
                  <div className="w-8 h-8 flex-shrink-0 rounded-lg bg-orange-50 text-[#f58220] flex items-center justify-center text-sm">
                    <FaUser />
                  </div>
                  <h3 className="text-sm font-bold text-slate-800 leading-none m-0 whitespace-nowrap">Datos del Solicitante</h3>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className={labelCls}>Nombre completo</label>
                    <input value={nombre} readOnly className={`${inputCls} text-slate-500`} />
                  </div>
                  <div>
                    <label className={labelCls}>Correo institucional</label>
                    <input value={correo} readOnly className={`${inputCls} text-slate-500`} />
                  </div>
                </div>
                <p className="text-[11px] text-gray-400 mt-2">
                  Estos datos vienen de tu cuenta y no se pueden editar aquí.
                </p>

                <fieldset disabled={bloqueado} className={`grid grid-cols-2 gap-4 mt-4 ${bloqueado ? "opacity-60" : ""}`}>
                  <div>
                    <label className={labelCls}>Área (informativo)</label>
                    <Dropdown
                      value={area}
                      onChange={setArea}
                      placeholder="Selecciona una opción"
                      options={areasIT.map((a) => ({ value: a.nombre, label: a.nombre }))}
                    />
                  </div>
                  <div>
                    <label className={labelCls}>Asesor Asignado</label>
                    <Dropdown
                      value={asesorId}
                      onChange={setAsesorId}
                      disabled={cargandoAsesores}
                      placeholder={cargandoAsesores ? "Cargando asesores..." : asesores.length === 0 ? "No hay asesores disponibles" : "Selecciona un asesor"}
                      options={asesores.map((a) => ({ value: a.id, label: `${a.name} (${a.area?.nombre || "IT"})` }))}
                    />
                  </div>
                </fieldset>
              </div>

              <div className={sectionCls}>
                <div className="flex items-center gap-2.5 mb-5 pb-4 border-b border-gray-100">
                  <div className="w-8 h-8 flex-shrink-0 rounded-lg bg-orange-50 text-[#f58220] flex items-center justify-center text-sm">
                    <FaFileAlt />
                  </div>
                  <h3 className="text-sm font-bold text-slate-800 leading-none m-0 whitespace-nowrap">Detalles del Problema</h3>
                </div>

                <fieldset disabled={bloqueado} className={bloqueado ? "opacity-60" : ""}>
                  <div className="mb-4">
                    <label className={labelCls}>Asunto / Título del Ticket</label>
                    <input
                      placeholder="Resumen breve del incidente..."
                      value={asunto}
                      onChange={(e) => setAsunto(e.target.value)}
                      className={inputCls}
                    />
                  </div>

                  <div>
                    <label className={labelCls}>Descripción detallada *</label>
                    <div className="border border-gray-200 rounded-lg overflow-hidden bg-[#FFF7F2] hover:border-[#f58220] hover:bg-[#FFF7F2] transition-all duration-200 focus-within:border-[#f58220] focus-within:bg-[#FFF7F2]">
                      <div className="flex items-center gap-0.5 p-1.5 bg-gray-100/80 border-b border-gray-200 flex-wrap">
                        <button type="button" onClick={() => aplicarFormato("bold")} className="p-1.5 rounded hover:bg-gray-200 text-gray-600 transition-colors outline-none focus:outline-none" title="Negrita"><FaBold className="text-xs" /></button>
                        <button type="button" onClick={() => aplicarFormato("italic")} className="p-1.5 rounded hover:bg-gray-200 text-gray-600 transition-colors outline-none focus:outline-none" title="Cursiva"><FaItalic className="text-xs" /></button>
                        <button type="button" onClick={() => aplicarFormato("underline")} className="p-1.5 rounded hover:bg-gray-200 text-gray-600 transition-colors outline-none focus:outline-none" title="Subrayado"><FaUnderline className="text-xs" /></button>
                        <div className="w-px h-4 bg-gray-300 mx-1" />
                        <button type="button" onClick={() => aplicarAlineacion("justifyLeft")} className="p-1.5 rounded hover:bg-gray-200 text-gray-600 transition-colors outline-none focus:outline-none" title="Alinear izquierda"><FaAlignLeft className="text-xs" /></button>
                        <button type="button" onClick={() => aplicarAlineacion("justifyCenter")} className="p-1.5 rounded hover:bg-gray-200 text-gray-600 transition-colors outline-none focus:outline-none" title="Centrar"><FaAlignCenter className="text-xs" /></button>
                        <button type="button" onClick={() => aplicarAlineacion("justifyRight")} className="p-1.5 rounded hover:bg-gray-200 text-gray-600 transition-colors outline-none focus:outline-none" title="Alinear derecha"><FaAlignRight className="text-xs" /></button>
                        <div className="w-px h-4 bg-gray-300 mx-1" />
                        <button type="button" onClick={aplicarLista} className="p-1.5 rounded hover:bg-gray-200 text-gray-600 transition-colors outline-none focus:outline-none" title="Lista viñetas"><FaListUl className="text-xs" /></button>
                        <button type="button" onClick={aplicarListaNumerada} className="p-1.5 rounded hover:bg-gray-200 text-gray-600 transition-colors outline-none focus:outline-none" title="Lista numerada"><FaListOl className="text-xs" /></button>
                      </div>
                      <div
                        ref={editorRef}
                        contentEditable
                        onInput={(e) => setDescripcion(e.currentTarget.innerHTML)}
                        className="p-4 min-h-[140px] outline-none text-sm text-slate-800 bg-transparent editor-descripcion"
                        placeholder="Describe el inconveniente de manera clara..."
                      />
                    </div>
                  </div>
                </fieldset>
              </div>

              <div className={sectionCls}>
                <div className="flex items-center gap-2.5 mb-5 pb-4 border-b border-gray-100">
                  <div className="w-8 h-8 flex-shrink-0 rounded-lg bg-orange-50 text-[#f58220] flex items-center justify-center text-sm">
                    <FaCloudUploadAlt />
                  </div>
                  <h3 className="text-sm font-bold text-slate-800 leading-none m-0 whitespace-nowrap">Archivos Adjuntos</h3>
                </div>

                <div
                  onDragOver={(e) => { e.preventDefault(); setArrastrando(true); }}
                  onDragLeave={() => setArrastrando(false)}
                  onDrop={(e) => { e.preventDefault(); setArrastrando(false); agregarArchivos(e.dataTransfer.files); }}
                  className={`border-2 border-dashed rounded-lg p-8 text-center transition-all duration-200 cursor-pointer
                    ${arrastrando ? "border-[#f58220] bg-orange-50/30" : "border-gray-200 hover:border-[#f58220] hover:bg-[#FFF7F2] bg-[#FFF7F2]"}`}
                  onClick={() => document.getElementById("input-file").click()}
                >
                  <input
                    id="input-file"
                    type="file"
                    multiple
                    className="hidden"
                    onChange={(e) => agregarArchivos(e.target.files)}
                  />
                  <FaCloudUploadAlt className="text-3xl text-gray-400 mx-auto mb-2" />
                  <p className="text-sm font-bold text-slate-700">Arrastra y suelta tus archivos aquí</p>
                  <p className="text-xs text-gray-400 mt-1">Soporta imágenes, PDFs, documentos de Word, Excel y audios</p>
                </div>

                {archivos.length > 0 && (
                  <div className="mt-4 grid grid-cols-4 gap-3">
                    {archivos.map((x, index) => (
                      <div key={index} className="relative border border-gray-200 rounded-lg p-2.5 flex items-center gap-2.5 bg-[#FFF7F2]">
                        {x.preview ? (
                          <img src={x.preview} alt="Vista previa" className="w-9 h-9 rounded object-cover flex-shrink-0" />
                        ) : (
                          <div className="w-9 h-9 rounded bg-gray-200 flex items-center justify-center text-lg flex-shrink-0">
                            {iconoPorTipo(x.file)}
                          </div>
                        )}
                        <div className="min-w-0 flex-1">
                          <p className="text-xs font-bold text-slate-700 truncate m-0 leading-tight">{x.file.name}</p>
                          <p className="text-[10px] text-gray-400 m-0 leading-tight">{(x.file.size / 1024).toFixed(1)} KB</p>
                        </div>
                        <button
                          type="button"
                          onClick={(e) => { e.stopPropagation(); quitarArchivo(index); }}
                          className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-red-500 text-white text-[10px] font-bold flex items-center justify-center shadow-md hover:bg-red-600 outline-none focus:outline-none"
                        >
                          ✕
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="flex justify-end gap-3 mt-2">
                <button
                  type="button"
                  onClick={restablecer}
                  disabled={enviando}
                  className="px-5 py-2.5 border border-gray-200 bg-white hover:bg-gray-50 text-slate-700 font-bold text-sm rounded-lg transition-colors cursor-pointer disabled:opacity-50 outline-none focus:outline-none"
                >
                  Restablecer campos
                </button>
                <button
                  type="button"
                  onClick={crearTicket}
                  disabled={enviando}
                  className="px-6 py-2.5 bg-[#f58220] hover:bg-[#e66a10] text-white font-extrabold text-sm rounded-lg shadow-sm transition-colors cursor-pointer disabled:bg-gray-300 disabled:cursor-not-allowed outline-none focus:outline-none"
                >
                  {enviando ? "Creando incidente..." : "Crear Incidente"}
                </button>
              </div>

            </div>
          </div>
        </div>
      </div>
    </div>
  );
}