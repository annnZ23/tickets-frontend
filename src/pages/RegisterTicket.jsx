import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import {
  FaSearch, FaRegEnvelope, FaRegBell, FaChevronDown,
  FaShieldAlt, FaUser, FaFileAlt, FaBold, FaItalic, FaUnderline,
  FaAlignLeft, FaAlignCenter, FaAlignRight, FaListUl, FaCloudUploadAlt,
} from "react-icons/fa";

const getIniciales = (name) => {
  if (!name) return "U";
  const p = name.trim().split(" ");
  return p.length > 1 ? `${p[0][0]}${p[1][0]}`.toUpperCase() : p[0][0].toUpperCase();
};

// Clases reutilizables — foco naranja corporativo en todos los inputs/selects
const inputCls =
  "w-full px-3.5 py-2.5 rounded-lg border border-gray-200 bg-gray-50 text-sm text-slate-800 " +
  "outline-none transition-colors focus:border-[#f58220] focus:bg-white placeholder:text-gray-400";

const labelCls = "block text-xs font-bold text-slate-500 mb-1.5";

const sectionCls = "bg-white rounded-lg shadow-sm border border-gray-100 p-6";

export default function RegisterTicket({ usuario, cerrarSesion }) {
  const navigate = useNavigate();
  const storedUser = localStorage.getItem("user");
  const user = usuario || (storedUser ? JSON.parse(storedUser) : null);
  const token = localStorage.getItem("token");

  const [tipo, setTipo] = useState("");
  const [impacto, setImpacto] = useState("");
  const [estado] = useState("Creado");
  const [prioridad, setPrioridad] = useState("");
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
  const [enviando, setEnviando] = useState(false);

  const [archivos, setArchivos] = useState([]);
  const [arrastrando, setArrastrando] = useState(false);

  const [bloqueado, setBloqueado] = useState(false);

  useEffect(() => {
    const fetchAsesores = async () => {
      try {
        const res = await fetch("http://localhost:3000/api/usuarios/asesores", {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        });
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
  }, [token]);

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

  const categoriaSeleccionada = categorias.find((c) => c.id === Number(categoriaId));

  const calcularPrioridad = (nuevoTipo, nuevoImpacto) => {
    const t = nuevoTipo ?? tipo;
    const i = nuevoImpacto ?? impacto;
    if (t === "Incidente" && i === "Alto") return "Alta";
    if (t === "Problema") return "Media";
    if (t === "Solicitud de información") return "Baja";
    if (i === "Alto") return "Alta";
    if (i === "Bajo") return "Baja";
    return "Media";
  };

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

  const restablecer = () => {
    setTipo(""); setImpacto(""); setPrioridad(""); setDescripcion(""); setAsunto("");
    setDetallesImpacto(""); setArea(""); setCategoriaId(""); setSubcategoriaId("");
    setAsesorId(""); setArchivos([]); setBloqueado(false);
  };

  const crearTicket = async () => {
    if (!tipo) { alert("Selecciona el tipo de solicitud"); return; }
    if (!asesorId) { alert("Selecciona un asesor para atender tu incidente"); return; }
    if (!asunto.trim()) { alert("Escribe un asunto para el ticket"); return; }

    setEnviando(true);
    try {
      const formData = new FormData();
      formData.append("nombre", nombre);
      formData.append("correo", correo);
      formData.append("tipo", tipo);
      formData.append("prioridad", prioridad);
      formData.append(
        "descripcion",
        `${asunto}${detallesImpacto ? " — " + detallesImpacto : ""}\n\n${descripcion}`
      );
      formData.append("area", area);
      if (categoriaId) formData.append("categoriaId", categoriaId);
      if (subcategoriaId) formData.append("subcategoriaId", subcategoriaId);
      if (user?.id) formData.append("usuarioId", user.id);
      formData.append("adminIds", JSON.stringify([Number(asesorId)]));
      archivos.forEach(({ file }) => formData.append("archivos", file));

      const res = await fetch("http://localhost:3000/api/tickets", {
        method: "POST",
        headers: { ...(token ? { Authorization: `Bearer ${token}` } : {}) },
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

  return (
    <div className="flex flex-col min-h-screen font-['Inter',sans-serif]">
      <div className="h-1 w-full bg-[#f58220] flex-shrink-0" />

      <div className="flex flex-1 bg-gray-50">
        <Sidebar usuario={user} cerrarSesion={cerrarSesion} />

        <div className="flex-1 flex flex-col overflow-hidden">
          <div className="h-16 bg-white border-b border-gray-100 flex items-center justify-between px-7 flex-shrink-0">
            <div className="relative w-[340px]">
              <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-xs" />
              <input
                placeholder="Buscar incidentes o usuarios..."
                className="w-full pl-9 pr-3 py-2.5 rounded-lg bg-gray-50 border border-gray-200 text-sm outline-none focus:border-[#f58220] focus:bg-white transition-colors"
              />
            </div>

            <div className="flex items-center gap-4">
              <FaRegEnvelope className="text-gray-400 text-lg cursor-pointer hover:text-[#f58220] transition-colors" />
              <FaRegBell className="text-gray-400 text-lg cursor-pointer hover:text-[#f58220] transition-colors" />
              <div className="w-px h-5 bg-gray-200" />
              <div className="flex items-center gap-2.5 cursor-pointer">
                <div className="w-8 h-8 rounded-full bg-orange-50 text-[#f58220] flex items-center justify-center font-extrabold text-xs">
                  {getIniciales(user?.name)}
                </div>
                <div>
                  <div className="text-xs font-bold text-slate-800 leading-tight">{user?.name}</div>
                  <div className="text-[10.5px] text-slate-500 leading-tight">{user?.role}</div>
                </div>
                <FaChevronDown className="text-gray-400 text-[9px]" />
              </div>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-8">
            <div className="text-xs text-gray-400 mb-1.5">
              Tickets <span className="mx-1">›</span>
              <span className="text-[#f58220] font-semibold">Nuevo incidente</span>
            </div>
            <h2 className="text-2xl font-extrabold text-slate-800 tracking-tight mb-1">
              Registro de Nuevo Incidente
            </h2>
            <p className="text-sm text-slate-500 mb-6">
              Gestiona el reporte técnico completando todos los campos requeridos para una atención prioritaria.
            </p>

            <div className="w-full flex flex-col gap-5">

              <div className={sectionCls}>
                <div className="flex items-center gap-2.5 mb-5 pb-4 border-b border-gray-100">
                  <div className="w-8 h-8 rounded-lg bg-orange-50 text-[#f58220] flex items-center justify-center text-sm">
                    <FaShieldAlt />
                  </div>
                  <h3 className="text-sm font-bold text-slate-800">Información del Incidente</h3>
                </div>

                <fieldset disabled={bloqueado} className={bloqueado ? "opacity-60" : ""}>
                  <div className="grid grid-cols-3 gap-4 mb-4">
                    <div>
                      <label className={labelCls}>Tipo de solicitud *</label>
                      <select
                        value={tipo}
                        onChange={(e) => { setTipo(e.target.value); setPrioridad(calcularPrioridad(e.target.value, null)); }}
                        className={inputCls}
                      >
                        <option value="">Selecciona una opción</option>
                        <option>Incidente</option>
                        <option>Problema</option>
                        <option>Solicitud de mantenimiento</option>
                        <option>Solicitud de información</option>
                      </select>
                    </div>
                    <div>
                      <label className={labelCls}>Impacto</label>
                      <select
                        value={impacto}
                        onChange={(e) => { setImpacto(e.target.value); setPrioridad(calcularPrioridad(null, e.target.value)); }}
                        className={inputCls}
                      >
                        <option value="">Selecciona una opción</option>
                        <option>Alto</option>
                        <option>Medio</option>
                        <option>Bajo</option>
                      </select>
                    </div>
                    <div>
                      <label className={labelCls}>Prioridad</label>
                      <input
                        value={prioridad}
                        placeholder="Automática"
                        readOnly
                        className={`${inputCls} font-bold cursor-default ${prioridad === "Alta" ? "text-red-600" : "text-[#f58220]"}`}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div>
                      <label className={labelCls}>Estado</label>
                      <input value={estado} readOnly className={`${inputCls} text-slate-500 cursor-default`} />
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
                      <select
                        value={categoriaId}
                        onChange={(e) => { setCategoriaId(e.target.value); setSubcategoriaId(""); }}
                        className={inputCls}
                      >
                        <option value="">Selecciona una categoría</option>
                        {categorias.map((c) => (
                          <option key={c.id} value={c.id}>{c.nombre}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className={labelCls}>Subcategoría</label>
                      <select
                        value={subcategoriaId}
                        onChange={(e) => setSubcategoriaId(e.target.value)}
                        disabled={!categoriaSeleccionada}
                        className={`${inputCls} ${!categoriaSeleccionada ? "cursor-not-allowed" : ""}`}
                      >
                        <option value="">
                          {categoriaSeleccionada ? "Selecciona una subcategoría" : "Elige una categoría primero"}
                        </option>
                        {categoriaSeleccionada?.subcategorias.map((s) => (
                          <option key={s.id} value={s.id}>{s.nombre}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                </fieldset>
              </div>

              <div className={sectionCls}>
                <div className="flex items-center gap-2.5 mb-5 pb-4 border-b border-gray-100">
                  <div className="w-8 h-8 rounded-lg bg-orange-50 text-[#f58220] flex items-center justify-center text-sm">
                    <FaUser />
                  </div>
                  <h3 className="text-sm font-bold text-slate-800">Datos del Solicitante</h3>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className={labelCls}>Nombre completo</label>
                    <input value={nombre} readOnly className={`${inputCls} text-slate-500 cursor-default`} />
                  </div>
                  <div>
                    <label className={labelCls}>Correo institucional</label>
                    <input value={correo} readOnly className={`${inputCls} text-slate-500 cursor-default`} />
                  </div>
                </div>
                <p className="text-[11px] text-gray-400 mt-2">
                  Estos datos vienen de tu cuenta y no se pueden editar aquí.
                </p>

                <fieldset disabled={bloqueado} className={`grid grid-cols-2 gap-4 mt-4 ${bloqueado ? "opacity-60" : ""}`}>
                  <div>
                    <label className={labelCls}>Área (informativo)</label>
                    <select value={area} onChange={(e) => setArea(e.target.value)} className={inputCls}>
                      <option value="">Selecciona una opción</option>
                      <option>Soporte Técnico</option>
                      <option>Desarrollo Web</option>
                      <option>Analista de Rutas</option>
                    </select>
                  </div>
                  <div>
                    <label className={labelCls}>Asesor Asignado</label>
                    <select
                      value={asesorId}
                      onChange={(e) => setAsesorId(e.target.value)}
                      disabled={cargandoAsesores}
                      className={`${inputCls} ${cargandoAsesores ? "cursor-wait" : ""}`}
                    >
                      <option value="">
                        {cargandoAsesores ? "Cargando asesores..." : asesores.length === 0 ? "No hay asesores disponibles" : "Selecciona un asesor"}
                      </option>
                      {asesores.map((a) => (
                        <option key={a.id} value={a.id}>{a.name} ({a.area?.nombre || "IT"})</option>
                      ))}
                    </select>
                  </div>
                </fieldset>
              </div>

              <div className={sectionCls}>
                <div className="flex items-center gap-2.5 mb-5 pb-4 border-b border-gray-100">
                  <div className="w-8 h-8 rounded-lg bg-orange-50 text-[#f58220] flex items-center justify-center text-sm">
                    <FaFileAlt />
                  </div>
                  <h3 className="text-sm font-bold text-slate-800">Detalles del Problema</h3>
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
                    <label className={labelCls}>Descripción detallada</label>
                    <div className="rounded-lg border border-gray-200 overflow-hidden focus-within:border-[#f58220] transition-colors">
                      <div className="flex items-center gap-1 px-3 py-2 border-b border-gray-200 bg-gray-50">
                        <button type="button" className="w-7 h-7 flex items-center justify-center rounded hover:bg-gray-200 text-slate-500 text-xs"><FaBold /></button>
                        <button type="button" className="w-7 h-7 flex items-center justify-center rounded hover:bg-gray-200 text-slate-500 text-xs"><FaItalic /></button>
                        <button type="button" className="w-7 h-7 flex items-center justify-center rounded hover:bg-gray-200 text-slate-500 text-xs"><FaUnderline /></button>
                        <div className="w-px h-4 bg-gray-300 mx-1" />
                        <button type="button" className="w-7 h-7 flex items-center justify-center rounded hover:bg-gray-200 text-slate-500 text-xs"><FaAlignLeft /></button>
                        <button type="button" className="w-7 h-7 flex items-center justify-center rounded hover:bg-gray-200 text-slate-500 text-xs"><FaAlignCenter /></button>
                        <button type="button" className="w-7 h-7 flex items-center justify-center rounded hover:bg-gray-200 text-slate-500 text-xs"><FaAlignRight /></button>
                        <div className="w-px h-4 bg-gray-300 mx-1" />
                        <button type="button" className="w-7 h-7 flex items-center justify-center rounded hover:bg-gray-200 text-slate-500 text-xs"><FaListUl /></button>
                      </div>
                      <textarea
                        placeholder="Proporcione todos los detalles técnicos posibles..."
                        value={descripcion}
                        onChange={(e) => setDescripcion(e.target.value)}
                        rows={5}
                        className="w-full px-4 py-3 text-sm text-slate-800 outline-none resize-vertical bg-gray-50 focus:bg-white transition-colors"
                      />
                    </div>
                  </div>
                </fieldset>

                <div className="mt-5">
                  <label className={labelCls}>Archivos Adjuntos (Evidencias)</label>
                  <div
                    onDragOver={(e) => { e.preventDefault(); setArrastrando(true); }}
                    onDragLeave={() => setArrastrando(false)}
                    onDrop={(e) => { e.preventDefault(); setArrastrando(false); agregarArchivos(e.dataTransfer.files); }}
                    onClick={() => !bloqueado && document.getElementById("input-archivos-ticket").click()}
                    className={`border-2 border-dashed rounded-xl py-10 text-center transition-colors
                      ${bloqueado ? "cursor-not-allowed opacity-60" : "cursor-pointer"}
                      ${arrastrando ? "border-[#f58220] bg-orange-50" : "border-gray-200 bg-gray-50"}`}
                  >
                    <FaCloudUploadAlt className="mx-auto text-3xl text-gray-300 mb-3" />
                    <p className="text-sm font-medium text-slate-600">Arrastra archivos aquí o haz clic para subir</p>
                    <p className="text-xs text-gray-400 mt-1">Imágenes, audio, PDF, Word, Excel — cualquier tipo</p>
                    <input
                      id="input-archivos-ticket"
                      type="file"
                      multiple
                      disabled={bloqueado}
                      className="hidden"
                      onChange={(e) => agregarArchivos(e.target.files)}
                    />
                  </div>

                  {archivos.length > 0 && (
                    <div className="flex flex-wrap gap-2.5 mt-3">
                      {archivos.map((a, i) => (
                        <div key={i} className="relative w-20 border border-gray-200 rounded-lg p-1.5 text-center bg-white">
                          {!bloqueado && (
                            <button
                              onClick={() => quitarArchivo(i)}
                              className="absolute -top-1.5 -right-1.5 w-[18px] h-[18px] rounded-full bg-red-500 text-white text-[11px] leading-[18px]"
                            >
                              ×
                            </button>
                          )}
                          {a.preview ? (
                            <img src={a.preview} alt="" className="w-full h-12 object-cover rounded" />
                          ) : (
                            <div className="text-2xl">{iconoPorTipo(a.file)}</div>
                          )}
                          <div className="text-[9.5px] text-slate-500 mt-1 truncate">{a.file.name}</div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              <div className="flex items-center justify-between pt-2">
                <button
                  onClick={() => navigate(-1)}
                  className="px-6 py-2.5 text-sm font-semibold text-slate-400 hover:text-slate-600 transition-colors"
                >
                  Descartar
                </button>

                <div className="flex items-center gap-3">
                  <button
                    onClick={restablecer}
                    className="px-5 py-2.5 rounded-lg border border-gray-300 text-sm font-semibold text-slate-600 hover:bg-gray-50 transition-colors"
                  >
                    Restablecer
                  </button>

                  <button
                    onClick={() => setBloqueado((b) => !b)}
                    className="px-5 py-2.5 rounded-lg bg-gray-100 text-sm font-semibold text-slate-600 hover:bg-gray-200 transition-colors"
                  >
                    {bloqueado ? "Desbloquear" : "Editar"}
                  </button>

                  <button
                    onClick={crearTicket}
                    disabled={enviando}
                    className="px-6 py-2.5 rounded-lg bg-[#f58220] text-white text-sm font-bold hover:bg-orange-600 transition-colors disabled:opacity-60"
                  >
                    {enviando ? "Generando..." : "Generar Ticket y Enviar →"}
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