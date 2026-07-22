import { useState, useEffect, useCallback, useRef, Fragment as FragmentoFila } from "react";
import Sidebar from "../components/Sidebar";
import baprosaLogo from "../assets/baprosa-logo.png";
import Topbar from "../components/Topbar";
import {
  FaListUl, FaTools, FaCode, FaRoute, FaTimes,
  FaPlus, FaClipboardList, FaCheckCircle, FaClock,
  FaTrash, FaPaperclip, FaFileAlt, FaReply, FaSmile, FaPen,
  FaFilePdf, FaFileWord, FaFileExcel, FaFilePowerpoint, FaFileImage,
} from "react-icons/fa";

const archivoInfo = (nombreArchivo) => {
  const n = (nombreArchivo || "").toLowerCase();
  if (/\.pdf$/.test(n)) return { icono: <FaFilePdf />, color: "#dc2626" };
  if (/\.(docx?|odt)$/.test(n)) return { icono: <FaFileWord />, color: "#2563eb" };
  if (/\.(xlsx?|csv)$/.test(n)) return { icono: <FaFileExcel />, color: "#16a34a" };
  if (/\.pptx?$/.test(n)) return { icono: <FaFilePowerpoint />, color: "#ea580c" };
  if (/\.(png|jpe?g|gif|webp)$/.test(n)) return { icono: <FaFileImage />, color: "#7c3aed" };
  return { icono: <FaFileAlt />, color: "#64748b" };
};

const EMOJIS = ["😊","👍","✅","⚠️","🔥","💡","📌","🚀","❌","🙏","💪","📎","🎯","⏰","✔️"];

const inputCls =
  "w-full px-3.5 py-2.5 rounded-lg border border-gray-200 bg-gray-50 text-sm text-slate-800 " +
  "outline-none transition-colors focus:border-[#f58220] focus:bg-white placeholder:text-gray-400";

const labelCls = "block text-xs font-bold text-slate-500 mb-1.5";

const getIniciales = (email) => (email ? email.charAt(0).toUpperCase() : "U");

export default function AsignacionTareas() {
  const [user] = useState(() => {
    const savedUser = localStorage.getItem("user");
    return savedUser ? JSON.parse(savedUser) : null;
  });
  const token = localStorage.getItem("token");
  const authHeaders = () => (token ? { Authorization: `Bearer ${token}` } : {});
  const esSuperAdmin = user?.role === "SUPERADMIN";
  const esAdmin = user?.role === "ADMIN";
  const puedeAsignarTarea = esSuperAdmin;               
  const puedeCrearSubtarea = esAdmin || esSuperAdmin;   
  const [tabActiva, setTabActiva] = useState("tareas"); 
  const [tasks, setTasks] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    title: "", assignedTo: "", email: "",
    area: "Soporte Técnico", priority: "Media", deadline: "",
  });

  const [asesores, setAsesores] = useState([]);
  const [asesorId, setAsesorId] = useState("");
  const [cargandoAsesores, setCargandoAsesores] = useState(true);

  useEffect(() => {
    const fetchAsesores = async () => {
      try {
        const res = await fetch("http://localhost:3000/api/usuarios/asesores", {
          headers: authHeaders(),
        });
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

  const seleccionarAsesor = (id) => {
    setAsesorId(id);
    const asesor = asesores.find((a) => a.id === Number(id));
    if (asesor) {
      setFormData((prev) => ({ ...prev, assignedTo: asesor.name, email: asesor.email }));
    }
  };

  const loadTasks = useCallback(async () => {
    if (!user?.email) return;
    try {
      const response = await fetch(
        `http://localhost:3000/api/tasks?email=${user.email}&role=${user.role}&_=${Date.now()}`,
        {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
          cache: "no-store",
        }
      );
      if (response.ok) setTasks(await response.json());
    } catch (error) {
      console.error("Error al traer tareas:", error);
    }
  }, [user, token]);

  useEffect(() => { loadTasks(); }, [loadTasks]);

  const cerrarSesionLocal = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
  };

  const aInputLocal = (iso) => {
    if (!iso) return "";
    const d = new Date(iso);
    if (isNaN(d)) return "";
    const pad = (n) => String(n).padStart(2, "0");
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
  };

  const [editandoId, setEditandoId] = useState(null);

  const abrirEditar = (t) => {
    setEditandoId(t.id);
    setAsesorId(String(t.encargadoId || t.encargado?.id || ""));
    setFormData({
      title: t.titulo || t.title || "",
      assignedTo: t.encargado?.name || "",
      email: t.encargado?.email || "",
      area: t.area?.nombre || t.area || "Soporte Técnico",
      priority: t.prioridad || t.priority || "Media",
      deadline: aInputLocal(t.vence || t.deadline),
    });
    setShowModal(true);
  };

  const eliminarTarea = async (id) => {
    if (!window.confirm("¿Eliminar esta tarea? Esta acción no se puede deshacer.")) return;
    try {
      const res = await fetch(`http://localhost:3000/api/tasks/${id}`, {
        method: "DELETE",
        headers: authHeaders(),
      });
      if (res.ok) {
        setTasks((prev) => prev.filter((t) => t.id !== id));
      } else {
        const data = await res.json().catch(() => ({}));
        alert(data.message || data.error || `No se pudo eliminar (código ${res.status}). Puede que falte el endpoint DELETE /api/tasks/:id en el backend.`);
      }
    } catch (e) {
      console.error(e);
      alert("Error de conexión al eliminar la tarea");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.deadline) { alert("Selecciona la fecha de vencimiento"); return; }
    if (!asesorId) { alert("Selecciona el asesor encargado"); return; }
    const areaSeleccionada = areasDefinidas.find((a) => a.nombre === formData.area);
    if (!areaSeleccionada) { alert("Selecciona un área IT válida"); return; }

    try {
      const payload = {
        titulo: formData.title,
        encargadoId: Number(asesorId),
        areaId: areaSeleccionada.id,
        prioridad: formData.priority,
        vence: new Date(formData.deadline).toISOString(),
      };
      const url = editandoId
        ? `http://localhost:3000/api/tasks/${editandoId}`
        : "http://localhost:3000/api/tasks";
      const response = await fetch(url, {
        method: editandoId ? "PUT" : "POST",
        headers: { "Content-Type": "application/json", ...authHeaders() },
        body: JSON.stringify(payload),
      });
      const data = await response.json().catch(() => ({}));
      if (response.ok) {
        setShowModal(false);
        setEditandoId(null);
        setFormData({ title: "", assignedTo: "", email: "", area: "Soporte Técnico", priority: "Media", deadline: "" });
        setAsesorId("");
        loadTasks();
      } else {
        console.error("Respuesta del backend al guardar tarea:", data);
        alert(data.message || data.error || `Error al guardar la tarea (código ${response.status}). Revisa la consola del backend.`);
      }
    } catch (error) {
      console.error("Error:", error);
      alert("No se pudo conectar con el servidor");
    }
  };

  const actualizarEstadoTarea = (taskId, nuevoEstado) => {
    fetch(`http://localhost:3000/api/tasks/${taskId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json", ...authHeaders() },
      body: JSON.stringify({ estado: nuevoEstado }),
    })
      .then((r) => r.json())
      .then((actualizada) => {
        setTasks((prev) => prev.map((t) => (t.id === taskId ? { ...t, ...actualizada } : t)));
      })
      .catch((err) => console.error("Error al actualizar tarea:", err));
  };

  const [completandoInfo, setCompletandoInfo] = useState(null);
  const [comentarioCompletar, setComentarioCompletar] = useState("");
  const [guardandoCompletar, setGuardandoCompletar] = useState(false);

  const abrirCompletar = (tipo, id) => {
    setCompletandoInfo({ tipo, id });
    setComentarioCompletar("");
  };

  const cerrarCompletar = () => {
    setCompletandoInfo(null);
    setComentarioCompletar("");
  };

  const confirmarCompletar = async (e) => {
    e.preventDefault();
    if (!comentarioCompletar.trim()) {
      alert("Escribe un comentario contando qué se hizo antes de completar.");
      return;
    }
    setGuardandoCompletar(true);
    const { tipo, id } = completandoInfo;
    const url =
      tipo === "tarea"
        ? `http://localhost:3000/api/tasks/${id}`
        : `http://localhost:3000/api/subtareas/${id}`;
    try {
      const res = await fetch(url, {
        method: "PUT",
        headers: { "Content-Type": "application/json", ...authHeaders() },
        body: JSON.stringify({ estado: "Completada", comentario: comentarioCompletar.trim() }),
      });
      const data = await res.json().catch(() => ({}));
      if (res.ok) {
        if (tipo === "tarea") {
          setTasks((prev) => prev.map((t) => (t.id === id ? { ...t, ...data } : t)));
        } else {
          setSubTareas((prev) => prev.map((st) => (st.id === id ? { ...st, ...data } : st)));
        }
        cerrarCompletar();
      } else {
        alert(data.message || data.error || `No se pudo completar (código ${res.status})`);
      }
    } catch (err) {
      console.error(err);
      alert("Error de conexión al completar");
    } finally {
      setGuardandoCompletar(false);
    }
  };

  const [areasDefinidas, setAreasDefinidas] = useState([]);
  const [cargandoAreas, setCargandoAreas] = useState(true);

  const iconoPorArea = (nombre) => {
    const n = nombre.toLowerCase();
    if (n.includes("soporte")) return <FaTools />;
    if (n.includes("desarrollo") || n.includes("web")) return <FaCode />;
    if (n.includes("ruta")) return <FaRoute />;
    return <FaTools />;
  };

  useEffect(() => {
    const cargarAreasIT = async () => {
      setCargandoAreas(true);
      try {
        const res = await fetch("http://localhost:3000/api/areas-it?soloIT=true", {
          headers: authHeaders(),
        });
        const data = await res.json();
        const lista = Array.isArray(data) ? data : [];
        setAreasDefinidas(lista.map((a) => ({ id: a.id, nombre: a.nombre, icono: iconoPorArea(a.nombre) })));
      } catch (err) {
        console.error("Error al cargar áreas de IT:", err);
      } finally {
        setCargandoAreas(false);
      }
    };
    cargarAreasIT();
  }, [token]);

  const [areaSTId, setAreaSTId] = useState(null); 
  const [subTareas, setSubTareas] = useState([]);
  const [cargandoST, setCargandoST] = useState(false);
  const [mostrarFormST, setMostrarFormST] = useState(false);
  const [stTitulo, setStTitulo] = useState("");
  const [stDescripcion, setStDescripcion] = useState("");
  const [stReceptorId, setStReceptorId] = useState("");
  const [stFechaLimite, setStFechaLimite] = useState("");
  const [stArchivo, setStArchivo] = useState(null);
  const [stArchivoNombre, setStArchivoNombre] = useState("");
  const [mostrarEmojisForm, setMostrarEmojisForm] = useState(false);
  const [enviandoST, setEnviandoST] = useState(false);
  const archivoRef = useRef(null);
  const [respondiendo, setRespondiendo] = useState(null);
  const [archivoRespuesta, setArchivoRespuesta] = useState(null);
  const [comentarioRespuesta, setComentarioRespuesta] = useState("");
  const [respondiendoTarea, setRespondiendoTarea] = useState(null);
  const [archivoRespuestaTarea, setArchivoRespuestaTarea] = useState(null);
  const [comentarioRespuestaTarea, setComentarioRespuestaTarea] = useState("");
  const [enviandoRespuestaTarea, setEnviandoRespuestaTarea] = useState(false);
  const archivoRespuestaTareaRef = useRef(null);
  const [enviandoRespuesta, setEnviandoRespuesta] = useState(false);
  const archivoRespuestaRef = useRef(null);
  const [editandoST, setEditandoST] = useState(null); 
  const [guardandoEdicionST, setGuardandoEdicionST] = useState(false);
  const [stEditData, setStEditData] = useState({
    titulo: "", descripcion: "", receptorId: "", areaId: "", fechaLimite: "",
  });

  useEffect(() => {
    if (!areaSTId && areasDefinidas.length > 0) setAreaSTId(areasDefinidas[0].id);
  }, [areasDefinidas, areaSTId]);

  const cargarSubTareas = useCallback(() => {
    if (!areaSTId) return;
    setCargandoST(true);
    fetch(`http://localhost:3000/api/subtareas?areaId=${areaSTId}&_=${Date.now()}`, {
      headers: authHeaders(),
      cache: "no-store",
    })
      .then((r) => r.json())
      .then((data) => setSubTareas(Array.isArray(data) ? data : []))
      .catch(console.error)
      .finally(() => setCargandoST(false));
  }, [areaSTId]);

  useEffect(() => {
    if (tabActiva === "subtareas") cargarSubTareas();
  }, [tabActiva, cargarSubTareas]);

  const crearSubTarea = async (e) => {
    e.preventDefault();
    if (!stTitulo.trim() || !stReceptorId) return;
    setEnviandoST(true);

    const fd = new FormData();
    fd.append("titulo", stTitulo);
    fd.append("descripcion", stDescripcion);
    fd.append("receptorId", stReceptorId);
    if (areaSTId) fd.append("areaId", areaSTId);
    if (stFechaLimite) fd.append("fechaLimite", stFechaLimite);
    if (stArchivo) fd.append("archivo", stArchivo);

    try {
      const res = await fetch("http://localhost:3000/api/subtareas", {
        method: "POST",
        headers: authHeaders(),
        body: fd,
      });
      if (res.ok) {
        setStTitulo(""); setStDescripcion(""); setStReceptorId("");
        setStFechaLimite(""); setStArchivo(null); setStArchivoNombre("");
        setMostrarFormST(false);
        cargarSubTareas();
      } else {
        const err = await res.json();
        alert(err.message || "Error al crear sub-tarea");
      }
    } catch (err) {
      console.error(err);
      alert("Error al crear sub-tarea");
    } finally {
      setEnviandoST(false);
    }
  };

  const cambiarEstadoST = (id, estado) => {
    fetch(`http://localhost:3000/api/subtareas/${id}`, {
      method: "PUT",
      headers: { ...authHeaders(), "Content-Type": "application/json" },
      body: JSON.stringify({ estado }),
    })
      .then((r) => r.json())
      .then((actualizada) => {
        setSubTareas((prev) => prev.map((st) => (st.id === id ? { ...st, ...actualizada } : st)));
      })
      .catch(console.error);
  };

  const eliminarST = (id) => {
    if (!window.confirm("¿Eliminar esta sub-tarea?")) return;
    fetch(`http://localhost:3000/api/subtareas/${id}`, {
      method: "DELETE",
      headers: authHeaders(),
    })
      .then(() => setSubTareas((prev) => prev.filter((st) => st.id !== id)))
      .catch(console.error);
  };

  const abrirEditarST = (st) => {
    setEditandoST(st.id);
    setStEditData({
      titulo: st.titulo || "",
      descripcion: st.descripcion || "",
      receptorId: String(st.receptorId || st.receptor?.id || ""),
      areaId: String(st.areaId || st.area?.id || areaSTId || ""),
      fechaLimite: aInputLocal(st.fechaLimite),
    });
  };

  const cerrarEditarST = () => {
    setEditandoST(null);
    setStEditData({ titulo: "", descripcion: "", receptorId: "", areaId: "", fechaLimite: "" });
  };

  const guardarEdicionST = async (e) => {
    e.preventDefault();
    if (!stEditData.titulo.trim() || !stEditData.receptorId) {
      alert("Título y asesor asignado son obligatorios");
      return;
    }
    setGuardandoEdicionST(true);
    try {
      const res = await fetch(`http://localhost:3000/api/subtareas/${editandoST}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", ...authHeaders() },
        body: JSON.stringify({
          titulo: stEditData.titulo,
          descripcion: stEditData.descripcion,
          receptorId: Number(stEditData.receptorId),
          areaId: stEditData.areaId ? Number(stEditData.areaId) : null,
          fechaLimite: stEditData.fechaLimite ? new Date(stEditData.fechaLimite).toISOString() : null,
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (res.ok) {
        setSubTareas((prev) => prev.map((st) => (st.id === editandoST ? { ...st, ...data } : st)));
        cerrarEditarST();
        cargarSubTareas();
      } else {
        alert(data.message || `No se pudo guardar (código ${res.status})`);
      }
    } catch (err) {
      console.error(err);
      alert("Error de conexión al guardar la sub-tarea");
    } finally {
      setGuardandoEdicionST(false);
    }
  };

  const enviarRespuesta = async (subTareaId) => {
    if (!archivoRespuesta) return;
    setEnviandoRespuesta(true);
    const fd = new FormData();
    fd.append("archivo", archivoRespuesta);
    if (comentarioRespuesta) fd.append("comentario", comentarioRespuesta);

    try {
      const res = await fetch(`http://localhost:3000/api/subtareas/${subTareaId}/respuesta`, {
        method: "POST",
        headers: authHeaders(),
        body: fd,
      });
      if (res.ok) {
        alert("Respuesta enviada correctamente. El asignador recibirá un correo con el archivo.");
        setRespondiendo(null);
        setArchivoRespuesta(null);
        setComentarioRespuesta("");
        cargarSubTareas();
      } else {
        const err = await res.json();
        alert(err.message || "Error al enviar respuesta");
      }
    } catch (err) {
      console.error(err);
      alert("Error al enviar respuesta");
    } finally {
      setEnviandoRespuesta(false);
    }
  };

  const enviarRespuestaTarea = async (tareaId) => {
    if (!archivoRespuestaTarea && !comentarioRespuestaTarea.trim()) {
      alert("Escribe un comentario o adjunta un archivo para responder.");
      return;
    }
    setEnviandoRespuestaTarea(true);
    const fd = new FormData();
    if (archivoRespuestaTarea) fd.append("archivo", archivoRespuestaTarea);
    if (comentarioRespuestaTarea) fd.append("comentario", comentarioRespuestaTarea);

    try {
      const res = await fetch(`http://localhost:3000/api/tasks/${tareaId}/respuesta`, {
        method: "POST",
        headers: authHeaders(),
        body: fd,
      });
      if (res.ok) {
        alert("Respuesta enviada correctamente. El SUPERADMIN que la creó recibirá un aviso.");
        setRespondiendoTarea(null);
        setArchivoRespuestaTarea(null);
        setComentarioRespuestaTarea("");
      } else {
        const err = await res.json();
        alert(err.error || err.message || "Error al enviar respuesta");
      }
    } catch (err) {
      console.error(err);
      alert("Error al enviar respuesta");
    } finally {
      setEnviandoRespuestaTarea(false);
    }
  };

  const agregarEmojiForm = (emoji) => {
    setStDescripcion((prev) => prev + emoji);
    setMostrarEmojisForm(false);
  };

  const badgeEstado = (estado) => {
    if (estado === "Completada") return "bg-green-50 text-green-600";
    if (estado === "EnProceso") return "bg-orange-50 text-[#f58220]";
    return "bg-slate-100 text-slate-500";
  };

  const labelEstado = (e) => (e === "EnProceso" ? "En Proceso" : e);

  const esVencida = (fechaLimite, estado) =>
    fechaLimite && estado !== "Completada" && new Date(fechaLimite) < new Date();

  const pendientesST = subTareas.filter((s) => s.estado !== "Completada").length;
  const POR_PAGINA_T = 10;
  const [paginaT, setPaginaT] = useState(1);
  const [mostrarCompletadasT, setMostrarCompletadasT] = useState(false);
  const tasksVisibles = mostrarCompletadasT
    ? tasks
    : tasks.filter((t) => (t.estado || t.status) !== "Completada");
  const totalPaginasT = Math.max(1, Math.ceil(tasksVisibles.length / POR_PAGINA_T));
  const inicioT = (paginaT - 1) * POR_PAGINA_T;
  const tareasPagina = tasksVisibles.slice(inicioT, inicioT + POR_PAGINA_T);

  useEffect(() => {
    if (paginaT > totalPaginasT) setPaginaT(1);
  }, [tasksVisibles.length, totalPaginasT, paginaT]);
  const [mostrarCompletadasST, setMostrarCompletadasST] = useState(false);
  const subTareasVisibles = mostrarCompletadasST
    ? subTareas
    : subTareas.filter((s) => s.estado !== "Completada");

  const POR_PAGINA_ST = 10;
  const [paginaST, setPaginaST] = useState(1);
  const totalPaginasST = Math.max(1, Math.ceil(subTareasVisibles.length / POR_PAGINA_ST));
  const inicioST = (paginaST - 1) * POR_PAGINA_ST;
  const subTareasPagina = subTareasVisibles.slice(inicioST, inicioST + POR_PAGINA_ST);

  useEffect(() => {
    if (paginaST > totalPaginasST) setPaginaST(1);
  }, [subTareasVisibles.length, totalPaginasST, paginaST]);

  return (
    <div className="flex min-h-screen font-['Inter',sans-serif]" style={{ backgroundColor: "#FFF7F2" }}>
      <Sidebar usuario={user} />

      <div className="flex-1 flex flex-col overflow-hidden">
        <Topbar usuario={user} cerrarSesion={cerrarSesionLocal} />

        <div className="flex-1 overflow-y-auto p-7">

          <div className="flex justify-between items-center mb-5">
            <div>
              <h1 className="text-xl font-extrabold text-slate-800 flex items-center gap-2">
                <FaListUl className="text-[#f58220]" /> Asignación Tareas IT
              </h1>
              <p className="text-xs text-slate-500 mt-0.5">
                Distribuye y da seguimiento a las tareas y sub-tareas del equipo de IT
              </p>
            </div>
            <div className="flex gap-2.5">
              {puedeCrearSubtarea && tabActiva === "subtareas" && (
                <button
                  onClick={() => setMostrarFormST((v) => !v)}
                  className={`flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-bold transition-colors ${
                    mostrarFormST
                      ? "bg-slate-100 text-slate-500"
                      : "bg-[#f58220] text-white hover:bg-orange-600"
                  }`}
                >
                  {mostrarFormST ? <><FaTimes className="text-[11px]" /> Cancelar</> : <><FaPlus className="text-[11px]" /> Agregar sub-tarea</>}
                </button>
              )}
              {puedeAsignarTarea && tabActiva === "tareas" && (
                <button
                  onClick={() => setShowModal(true)}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-lg bg-[#f58220] text-white text-sm font-bold hover:bg-orange-600 transition-colors"
                >
                  <FaPlus className="text-[11px]" /> Asignar tarea
                </button>
              )}
            </div>
          </div>

          <div className="flex gap-1 bg-white rounded-xl p-1.5 w-fit mb-5 shadow-sm border border-gray-100">
            <button
              onClick={() => setTabActiva("tareas")}
              className={`flex items-center gap-2 px-5 py-2 rounded-lg text-sm font-bold transition-colors ${
                tabActiva === "tareas" ? "bg-[#f58220] text-white" : "text-slate-500 hover:text-slate-700"
              }`}
            >
              <FaListUl className="text-[12px]" /> Tareas
            </button>
            {puedeCrearSubtarea && (
              <button
                onClick={() => setTabActiva("subtareas")}
                className={`flex items-center gap-2 px-5 py-2 rounded-lg text-sm font-bold transition-colors ${
                  tabActiva === "subtareas" ? "bg-[#f58220] text-white" : "text-slate-500 hover:text-slate-700"
                }`}
              >
                <FaClipboardList className="text-[12px]" /> Sub-tareas
                {pendientesST > 0 && (
                  <span className={`text-[10px] font-extrabold px-1.5 py-0.5 rounded-full ${
                    tabActiva === "subtareas" ? "bg-white text-[#f58220]" : "bg-[#f58220] text-white"
                  }`}>
                    {pendientesST}
                  </span>
                )}
              </button>
            )}
          </div>

          {tabActiva === "tareas" && (
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
              <div className="flex justify-end px-5 py-3 border-b border-gray-100 bg-gray-50/60">
                <button
                  onClick={() => setMostrarCompletadasT((v) => !v)}
                  className={`text-xs font-bold px-3 py-1.5 rounded-lg border transition-colors ${
                    mostrarCompletadasT ? "bg-slate-100 text-slate-600 border-slate-200" : "bg-white text-slate-400 border-gray-200 hover:border-[#f58220]"
                  }`}
                >
                  {mostrarCompletadasT ? "Ocultar completadas" : "Ver completadas"}
                </button>
              </div>
              {tasksVisibles.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-14 text-gray-400">
                  <FaListUl className="text-4xl mb-2.5 text-gray-300" />
                  <p className="text-sm m-0">
                    {tasks.length === 0
                      ? "No hay tareas asignadas todavía."
                      : "No hay tareas pendientes. (Usa \"Ver completadas\" para revisar el historial.)"}
                  </p>
                </div>
              ) : (
                <>
                  <div className="overflow-x-auto">
                    <table className="w-full border-collapse text-[12.5px]">
                      <thead>
                        <tr className="bg-orange-50">
                          {["Tarea", "Área", "Asesor", "Prioridad", "Vence", "Estado", "Acciones"].map((h) => (
                            <th key={h} className={`px-3 py-3 text-[11px] font-bold text-slate-800 uppercase tracking-wide whitespace-nowrap ${h === "Acciones" ? "text-right" : "text-left"}`}>
                              {h}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {tareasPagina.map((t) => {
                          const titulo = t.titulo || t.title || "Sin título";
                          const vence = t.vence || t.deadline;
                          const estado = t.estado || t.status || "Pendiente";
                          const venceDate = vence ? new Date(vence) : null;
                          const vencidaT = venceDate && !isNaN(venceDate) && estado !== "Completada" && venceDate < new Date();
                          const bordeColor = estado === "Completada" ? "#16a34a" : vencidaT ? "#dc2626" : "#f58220";
                          const bp = (t.priority || t.prioridad || "").toLowerCase();
                          const prioridadCls = bp.includes("alta") ? "bg-red-50 text-red-600" : bp.includes("media") ? "bg-amber-50 text-amber-700" : "bg-green-50 text-green-600";
                          return (
                            <FragmentoFila key={t.id}>
                            <tr className="border-b border-orange-50 hover:bg-gray-50 transition-colors" style={{ borderLeft: `4px solid ${bordeColor}` }}>
                              <td className="px-3 py-3 max-w-[280px]">
                                <span className={`block font-bold truncate ${estado === "Completada" ? "text-gray-400 line-through" : "text-slate-800"}`}>{titulo}</span>
                              </td>
                              <td className="px-3 py-3 whitespace-nowrap text-slate-600">{t.area?.nombre || t.area || "—"}</td>
                              <td className="px-3 py-3 whitespace-nowrap font-semibold text-[#f58220]">{t.encargado?.name || t.assignedTo || t.asesor?.name || t.email || "—"}</td>
                              <td className="px-3 py-3 whitespace-nowrap">
                                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${prioridadCls}`}>{t.priority || t.prioridad || "—"}</span>
                              </td>
                              <td className={`px-3 py-3 whitespace-nowrap ${vencidaT ? "text-red-600 font-semibold" : "text-slate-500"}`}>
                                {venceDate && !isNaN(venceDate)
                                  ? venceDate.toLocaleString("es-HN", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" })
                                  : vence || "—"}
                                {vencidaT && <span className="ml-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-red-50 text-red-600">Vencida</span>}
                              </td>
                              <td className="px-3 py-3 whitespace-nowrap">
                                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${badgeEstado(estado)}`}>{labelEstado(estado)}</span>
                              </td>
                              <td className="px-3 py-3 whitespace-nowrap text-right">
                                <div className="inline-flex gap-1.5">
                                  {(t.encargadoId === user?.id || t.encargado?.id === user?.id) && estado !== "Completada" && (
                                    <>
                                      {estado === "Pendiente" && (
                                        <button onClick={() => actualizarEstadoTarea(t.id, "En Proceso")} className="text-[11px] px-2.5 py-1 rounded-md border border-gray-200 bg-white font-semibold text-slate-500 hover:border-[#f58220]">
                                          Iniciar
                                        </button>
                                      )}
                                      <button onClick={() => { setRespondiendoTarea(respondiendoTarea === t.id ? null : t.id); setArchivoRespuestaTarea(null); setComentarioRespuestaTarea(""); }} className={`text-[11px] px-2.5 py-1 rounded-md border border-blue-500 font-bold text-blue-600 inline-flex items-center gap-1 ${respondiendoTarea === t.id ? "bg-blue-50" : "bg-white"}`}>
                                        <FaReply className="text-[10px]" /> Responder
                                      </button>
                                      <button onClick={() => abrirCompletar("tarea", t.id)} className="text-[11px] px-2.5 py-1 rounded-md bg-green-600 text-white font-bold hover:bg-green-700 inline-flex items-center gap-1">
                                        <FaCheckCircle className="text-[10px]" /> Completar
                                      </button>
                                    </>
                                  )}

                                  {esSuperAdmin && estado !== "Completada" && (
                                    <>
                                      <button onClick={() => abrirEditar(t)} className="text-[11px] px-2.5 py-1 rounded-md border border-blue-500 bg-white font-bold text-blue-600 hover:bg-blue-50 inline-flex items-center gap-1">
                                        <FaPen className="text-[10px]" /> Editar
                                      </button>
                                      <button onClick={() => eliminarTarea(t.id)} className="text-[11px] px-2.5 py-1 rounded-md bg-red-50 text-red-600 font-bold hover:bg-red-100 inline-flex items-center gap-1">
                                        <FaTrash className="text-[10px]" /> Eliminar
                                      </button>
                                    </>
                                  )}
                                  {esSuperAdmin && estado === "Completada" && (
                                    <span className="text-[11px] text-gray-400 italic">Registro cerrado</span>
                                  )}
                                  {!esSuperAdmin && t.encargadoId !== user?.id && t.encargado?.id !== user?.id && (
                                    <span className="text-gray-300 text-[11px]">—</span>
                                  )}
                                </div>
                              </td>
                            </tr>

                            {respondiendoTarea === t.id && (
                              <tr>
                                <td colSpan={7} className="px-3 pb-3 pt-0 bg-gray-50/60">
                                  <div className="p-3 bg-blue-50 rounded-lg border border-blue-200 flex flex-col gap-2">
                                    <p className="m-0 text-xs font-bold text-blue-700">Responder tarea (archivo y/o comentario)</p>
                                    <input ref={archivoRespuestaTareaRef} type="file" accept="*/*" onChange={(e) => setArchivoRespuestaTarea(e.target.files[0])} className="hidden" />
                                    <button type="button" onClick={() => archivoRespuestaTareaRef.current.click()} className={`px-3 py-2 rounded-md border border-dashed border-blue-300 bg-white text-xs text-left flex items-center gap-1.5 ${archivoRespuestaTarea ? "text-blue-700 font-semibold" : "text-gray-400"}`}>
                                      <FaPaperclip />
                                      {archivoRespuestaTarea ? archivoRespuestaTarea.name : "Adjuntar archivo (opcional)..."}
                                    </button>
                                    <input placeholder="Comentario (opcional si adjuntas archivo)..." value={comentarioRespuestaTarea} onChange={(e) => setComentarioRespuestaTarea(e.target.value)} className="px-2.5 py-2 rounded-md border border-blue-200 text-xs outline-none" />
                                    <div className="flex gap-2">
                                      <button onClick={() => enviarRespuestaTarea(t.id)} disabled={enviandoRespuestaTarea} className="px-4 py-1.5 rounded-md bg-blue-600 text-white text-xs font-bold cursor-pointer disabled:opacity-50">
                                        {enviandoRespuestaTarea ? "Enviando..." : "Enviar respuesta"}
                                      </button>
                                      <button onClick={() => { setRespondiendoTarea(null); setArchivoRespuestaTarea(null); setComentarioRespuestaTarea(""); }} className="px-3 py-1.5 rounded-md border border-gray-200 bg-white text-xs text-slate-500">
                                        Cancelar
                                      </button>
                                    </div>
                                  </div>
                                </td>
                              </tr>
                            )}
                            </FragmentoFila>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>

                  <div className="flex justify-between items-center px-4 py-3 border-t border-gray-100 flex-wrap gap-2">
                    <span className="text-[12px] text-slate-500">
                      Mostrando <b>{inicioT + 1}–{Math.min(inicioT + POR_PAGINA_T, tasksVisibles.length)}</b> de <b>{tasksVisibles.length}</b> tareas
                    </span>
                    <div className="flex gap-1.5 items-center">
                      <button
                        disabled={paginaT === 1}
                        onClick={() => setPaginaT((p) => Math.max(1, p - 1))}
                        className={`w-8 h-8 rounded-lg border border-gray-200 bg-white text-slate-500 text-xs font-bold ${paginaT === 1 ? "opacity-40" : "hover:border-[#f58220]"}`}
                      >‹</button>
                      {Array.from({ length: totalPaginasT }, (_, i) => i + 1).slice(Math.max(0, paginaT - 3), Math.max(0, paginaT - 3) + 5).map((n) => (
                        <button
                          key={n}
                          onClick={() => setPaginaT(n)}
                          className={`min-w-8 h-8 px-2 rounded-lg text-xs font-bold border ${n === paginaT ? "bg-[#f58220] border-[#f58220] text-white" : "bg-white border-gray-200 text-slate-500 hover:border-[#f58220]"}`}
                        >{n}</button>
                      ))}
                      <button
                        disabled={paginaT === totalPaginasT}
                        onClick={() => setPaginaT((p) => Math.min(totalPaginasT, p + 1))}
                        className={`w-8 h-8 rounded-lg border border-gray-200 bg-white text-slate-500 text-xs font-bold ${paginaT === totalPaginasT ? "opacity-40" : "hover:border-[#f58220]"}`}
                      >›</button>
                    </div>
                  </div>
                </>
              )}
            </div>
          )}

          {tabActiva === "subtareas" && puedeCrearSubtarea && (
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">

              <div className="flex items-center justify-between gap-2 px-5 py-3.5 border-b border-gray-100 bg-gray-50/60 flex-wrap">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-xs font-bold text-slate-500 mr-1">Área:</span>
                  {cargandoAreas ? (
                    <span className="text-xs text-slate-400">Cargando áreas...</span>
                  ) : areasDefinidas.map((a) => (
                    <button
                      key={a.id}
                      onClick={() => setAreaSTId(a.id)}
                      className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-bold transition-colors ${
                        areaSTId === a.id ? "bg-[#f58220] text-white" : "bg-white text-slate-500 border border-gray-200 hover:border-[#f58220]"
                      }`}
                    >
                      {a.icono} {a.nombre}
                    </button>
                  ))}
                </div>
                <button
                  onClick={() => setMostrarCompletadasST((v) => !v)}
                  className={`text-xs font-bold px-3 py-1.5 rounded-lg border transition-colors ${
                    mostrarCompletadasST ? "bg-slate-100 text-slate-600 border-slate-200" : "bg-white text-slate-400 border-gray-200 hover:border-[#f58220]"
                  }`}
                >
                  {mostrarCompletadasST ? "Ocultar completadas" : "Ver completadas"}
                </button>
              </div>

              {mostrarFormST && (
                <form onSubmit={crearSubTarea} className="px-5 py-4 border-b border-gray-100 bg-gray-50/60 flex flex-col gap-3.5">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className={labelCls}>Título *</label>
                      <input value={stTitulo} onChange={(e) => setStTitulo(e.target.value)} placeholder="¿Qué hay que hacer?" required className={inputCls} />
                    </div>
                    <div>
                      <label className={labelCls}>Asignar a *</label>
                      <select value={stReceptorId} onChange={(e) => setStReceptorId(e.target.value)} required className={`${inputCls} cursor-pointer`}>
                        <option value="">Selecciona un asesor</option>
                        {asesores.filter((a) => a.id !== user?.id).map((a) => (
                          <option key={a.id} value={a.id}>{a.name} ({a.area?.nombre || "IT"})</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="relative">
                    <label className={labelCls}>Descripción</label>
                    <textarea value={stDescripcion} onChange={(e) => setStDescripcion(e.target.value)} placeholder="Detalla lo que necesitas..." rows={2} className={`${inputCls} resize-y font-[inherit]`} />
                    <button type="button" onClick={() => setMostrarEmojisForm((v) => !v)} className="text-gray-400 hover:text-[#f58220] mt-1">
                      <FaSmile />
                    </button>
                    {mostrarEmojisForm && (
                      <div className="absolute z-20 bg-white border border-gray-200 rounded-xl p-2 flex flex-wrap gap-1 w-56 shadow-xl">
                        {EMOJIS.map((e) => (
                          <button key={e} type="button" onClick={() => agregarEmojiForm(e)} className="text-lg rounded hover:bg-orange-50 px-1">{e}</button>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className={labelCls}>Fecha límite</label>
                      <input type="datetime-local" value={stFechaLimite} onChange={(e) => setStFechaLimite(e.target.value)} className={inputCls} />
                    </div>
                    <div>
                      <label className={labelCls}>Adjunto</label>
                      <input ref={archivoRef} type="file" accept="*/*" onChange={(e) => { setStArchivo(e.target.files[0]); setStArchivoNombre(e.target.files[0]?.name || ""); }} className="hidden" />
                      <button type="button" onClick={() => archivoRef.current.click()} className={`w-full px-3.5 py-2.5 rounded-lg border border-dashed border-gray-300 bg-white text-sm text-left flex items-center gap-2 ${stArchivoNombre ? "text-[#f58220] font-semibold" : "text-gray-400"}`}>
                        <FaPaperclip className="flex-shrink-0" />
                        <span className="truncate">{stArchivoNombre || "Adjuntar archivo..."}</span>
                      </button>
                    </div>
                  </div>

                  <button type="submit" disabled={enviandoST} className={`self-end px-6 py-2.5 rounded-lg bg-[#f58220] text-white text-sm font-bold hover:bg-orange-600 transition-colors ${enviandoST ? "opacity-70 cursor-default" : ""}`}>
                    {enviandoST ? "Creando..." : "Crear sub-tarea"}
                  </button>
                </form>
              )}

              <div className="p-5">
                {cargandoST ? (
                  <p className="text-sm text-slate-500">Cargando sub-tareas...</p>
                ) : subTareasVisibles.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-12 text-gray-400">
                    <FaClipboardList className="text-4xl mb-2.5 text-gray-300" />
                    <p className="text-sm m-0">
                      {subTareas.length === 0
                        ? "No hay sub-tareas en esta área todavía."
                        : "No hay sub-tareas pendientes en esta área. (Usa \"Ver completadas\" para revisar el historial.)"}
                    </p>
                  </div>
                ) : (
                  <div className="border border-gray-100 rounded-xl overflow-hidden">
                    <div className="overflow-x-auto">
                      <table className="w-full border-collapse text-[12.5px]">
                        <thead>
                          <tr className="bg-orange-50">
                            {["Sub-tarea", "Estado", "De", "Para", "Vence", "Adjunto", "Acciones"].map((h) => (
                              <th key={h} className={`px-3 py-3 text-[11px] font-bold text-slate-800 uppercase tracking-wide whitespace-nowrap ${h === "Acciones" ? "text-right" : "text-left"}`}>
                                {h}
                              </th>
                            ))}
                          </tr>
                        </thead>
                        <tbody>
                          {subTareasPagina.map((st) => {
                            const vencida = esVencida(st.fechaLimite, st.estado);
                            const bordeColor = st.estado === "Completada" ? "#16a34a" : vencida ? "#dc2626" : "#f58220";
                            const puedeEditarST = st.asignadorId === user?.id || esSuperAdmin;
                            return (
                              <FragmentoFila key={st.id}>
                                <tr className="border-b border-orange-50 hover:bg-gray-50 transition-colors" style={{ borderLeft: `4px solid ${bordeColor}` }}>
                                  <td className="px-3 py-3 max-w-[260px]">
                                    <span className={`block font-bold truncate ${st.estado === "Completada" ? "text-gray-400 line-through" : "text-slate-800"}`}>{st.titulo}</span>
                                    {st.descripcion && <span className="block text-[11px] text-slate-400 truncate">{st.descripcion}</span>}
                                  </td>
                                  <td className="px-3 py-3 whitespace-nowrap">
                                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${badgeEstado(st.estado)}`}>{labelEstado(st.estado)}</span>
                                    {vencida && <span className="ml-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-red-50 text-red-600">Vencida</span>}
                                  </td>
                                  <td className="px-3 py-3 whitespace-nowrap text-slate-600">{st.asignador?.name}</td>
                                  <td className="px-3 py-3 whitespace-nowrap font-semibold text-[#f58220]">{st.receptor?.name}</td>
                                  <td className={`px-3 py-3 whitespace-nowrap ${vencida ? "text-red-600 font-semibold" : "text-slate-500"}`}>
                                    {st.fechaLimite
                                      ? new Date(st.fechaLimite).toLocaleString("es-HN", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" })
                                      : "—"}
                                  </td>
                                  <td className="px-3 py-3 whitespace-nowrap max-w-[160px]">
                                    {st.archivoUrl ? (() => {
                                      const info = archivoInfo(st.archivoNombre || st.archivoUrl);
                                      return (
                                        <a href={`http://localhost:3000${st.archivoUrl}`} target="_blank" rel="noreferrer" className="flex items-center gap-1.5 font-semibold no-underline hover:underline truncate" style={{ color: info.color }}>
                                          <span className="text-[13px] flex flex-shrink-0">{info.icono}</span>
                                          <span className="truncate">{st.archivoNombre || "Ver adjunto"}</span>
                                        </a>
                                      );
                                    })() : <span className="text-gray-300">—</span>}
                                  </td>
                                  <td className="px-3 py-3 whitespace-nowrap text-right">
                                    <div className="inline-flex gap-1.5">
                                      {st.receptorId === user?.id && st.estado === "Pendiente" && (
                                        <button onClick={() => cambiarEstadoST(st.id, "EnProceso")} className="text-[11px] px-2.5 py-1 rounded-md border border-gray-200 bg-white font-semibold text-slate-500 hover:border-[#f58220]">
                                          Iniciar
                                        </button>
                                      )}
                                      {st.receptorId === user?.id && st.estado !== "Completada" && (
                                        <button onClick={() => abrirCompletar("subtarea", st.id)} className="text-[11px] px-2.5 py-1 rounded-md bg-green-600 text-white font-bold hover:bg-green-700 inline-flex items-center gap-1">
                                          <FaCheckCircle className="text-[10px]" /> Completar
                                        </button>
                                      )}
                                      {st.receptorId === user?.id && st.estado !== "Completada" && (
                                        <button onClick={() => { setRespondiendo(respondiendo === st.id ? null : st.id); setArchivoRespuesta(null); setComentarioRespuesta(""); }} className={`text-[11px] px-2.5 py-1 rounded-md border border-blue-500 font-bold text-blue-600 inline-flex items-center gap-1 ${respondiendo === st.id ? "bg-blue-50" : "bg-white"}`}>
                                          <FaReply className="text-[10px]" /> Responder
                                        </button>
                                      )}
                                     
                                      {puedeEditarST && st.estado !== "Completada" && (
                                        <button onClick={() => abrirEditarST(st)} className="text-[11px] px-2.5 py-1 rounded-md border border-blue-500 bg-white font-bold text-blue-600 hover:bg-blue-50 inline-flex items-center gap-1">
                                          <FaPen className="text-[10px]" /> Editar
                                        </button>
                                      )}
                                      {(st.asignadorId === user?.id || esSuperAdmin) && st.estado !== "Completada" && (
                                        <button onClick={() => eliminarST(st.id)} className="text-[11px] px-2.5 py-1 rounded-md bg-red-50 text-red-600 font-bold hover:bg-red-100 inline-flex items-center gap-1">
                                          <FaTrash className="text-[10px]" /> Eliminar
                                        </button>
                                      )}
                                      {st.estado === "Completada" && (
                                        <span className="text-[11px] text-gray-400 italic">Registro cerrado</span>
                                      )}
                                    </div>
                                  </td>
                                </tr>

                                {respondiendo === st.id && (
                                  <tr>
                                    <td colSpan={7} className="px-3 pb-3 pt-0 bg-gray-50/60">
                                      <div className="p-3 bg-blue-50 rounded-lg border border-blue-200 flex flex-col gap-2">
                                        <p className="m-0 text-xs font-bold text-blue-700">Adjuntar archivo de respuesta</p>
                                        <input ref={archivoRespuestaRef} type="file" accept="*/*" onChange={(e) => setArchivoRespuesta(e.target.files[0])} className="hidden" />
                                        <button type="button" onClick={() => archivoRespuestaRef.current.click()} className={`px-3 py-2 rounded-md border border-dashed border-blue-300 bg-white text-xs text-left flex items-center gap-1.5 ${archivoRespuesta ? "text-blue-700 font-semibold" : "text-gray-400"}`}>
                                          <FaPaperclip />
                                          {archivoRespuesta ? archivoRespuesta.name : "Seleccionar archivo..."}
                                        </button>
                                        <input placeholder="Comentario opcional..." value={comentarioRespuesta} onChange={(e) => setComentarioRespuesta(e.target.value)} className="px-2.5 py-2 rounded-md border border-blue-200 text-xs outline-none" />
                                        <div className="flex gap-2">
                                          <button onClick={() => enviarRespuesta(st.id)} disabled={!archivoRespuesta || enviandoRespuesta} className={`px-4 py-1.5 rounded-md bg-blue-600 text-white text-xs font-bold ${archivoRespuesta ? "cursor-pointer" : "cursor-not-allowed opacity-50"}`}>
                                            {enviandoRespuesta ? "Enviando..." : "Enviar respuesta"}
                                          </button>
                                          <button onClick={() => { setRespondiendo(null); setArchivoRespuesta(null); }} className="px-3 py-1.5 rounded-md border border-gray-200 bg-white text-xs text-slate-500">
                                            Cancelar
                                          </button>
                                        </div>
                                      </div>
                                    </td>
                                  </tr>
                                )}
                              </FragmentoFila>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>

                    <div className="flex justify-between items-center px-4 py-3 border-t border-gray-100 flex-wrap gap-2">
                      <span className="text-[12px] text-slate-500">
                        Mostrando <b>{inicioST + 1}–{Math.min(inicioST + POR_PAGINA_ST, subTareasVisibles.length)}</b> de <b>{subTareasVisibles.length}</b> sub-tareas
                      </span>
                      <div className="flex gap-1.5 items-center">
                        <button
                          disabled={paginaST === 1}
                          onClick={() => setPaginaST((p) => Math.max(1, p - 1))}
                          className={`w-8 h-8 rounded-lg border border-gray-200 bg-white text-slate-500 text-xs font-bold ${paginaST === 1 ? "opacity-40" : "hover:border-[#f58220]"}`}
                        >‹</button>
                        {Array.from({ length: totalPaginasST }, (_, i) => i + 1).slice(Math.max(0, paginaST - 3), Math.max(0, paginaST - 3) + 5).map((n) => (
                          <button
                            key={n}
                            onClick={() => setPaginaST(n)}
                            className={`min-w-8 h-8 px-2 rounded-lg text-xs font-bold border ${n === paginaST ? "bg-[#f58220] border-[#f58220] text-white" : "bg-white border-gray-200 text-slate-500 hover:border-[#f58220]"}`}
                          >{n}</button>
                        ))}
                        <button
                          disabled={paginaST === totalPaginasST}
                          onClick={() => setPaginaST((p) => Math.min(totalPaginasST, p + 1))}
                          className={`w-8 h-8 rounded-lg border border-gray-200 bg-white text-slate-500 text-xs font-bold ${paginaST === totalPaginasST ? "opacity-40" : "hover:border-[#f58220]"}`}
                        >›</button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-slate-900/50 flex items-center justify-center z-[1000]">
          <div className="bg-white rounded-2xl p-7 w-[440px] shadow-2xl">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-base font-extrabold text-slate-800">{editandoId ? "Editar Tarea IT" : "Asignar Nueva Tarea IT"}</h3>
              <FaTimes className="cursor-pointer text-slate-500" onClick={() => { setShowModal(false); setEditandoId(null); }} />
            </div>

            <form onSubmit={handleSubmit} className="flex flex-col gap-3.5">
              <div>
                <label className={labelCls}>Título de la tarea</label>
                <input type="text" required className={inputCls} value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })} />
              </div>

              <div>
                <label className={labelCls}>Asesor encargado</label>
                <select
                  required
                  value={asesorId}
                  onChange={(e) => seleccionarAsesor(e.target.value)}
                  disabled={cargandoAsesores}
                  className={`${inputCls} ${cargandoAsesores ? "cursor-wait" : "cursor-pointer"}`}
                >
                  <option value="">
                    {cargandoAsesores ? "Cargando asesores..." : asesores.length === 0 ? "No hay asesores disponibles" : "Selecciona un asesor"}
                  </option>
                  {asesores.map((a) => (
                    <option key={a.id} value={a.id}>{a.name} ({a.area?.nombre || "IT"})</option>
                  ))}
                </select>
                {formData.email && (
                  <p className="text-[11px] text-gray-400 mt-1.5">Se notificará a: {formData.email}</p>
                )}
              </div>

              <div className="flex gap-3">
                <div className="flex-1">
                  <label className={labelCls}>Área IT</label>
                  <select className={inputCls} value={formData.area} onChange={(e) => setFormData({ ...formData, area: e.target.value })}>
                    {areasDefinidas.map((a) => (
                      <option key={a.nombre} value={a.nombre}>{a.nombre}</option>
                    ))}
                  </select>
                </div>
                <div className="flex-1">
                  <label className={labelCls}>Prioridad</label>
                  <select className={inputCls} value={formData.priority} onChange={(e) => setFormData({ ...formData, priority: e.target.value })}>
                    <option value="Alta">Alta</option>
                    <option value="Media">Media</option>
                    <option value="Baja">Baja</option>
                  </select>
                </div>
              </div>

              <div>
                <label className={labelCls}>Fecha de vencimiento</label>
                <input type="datetime-local" required className={inputCls} value={formData.deadline}
                  onChange={(e) => setFormData({ ...formData, deadline: e.target.value })} />
              </div>

              <button
                type="submit"
                className="bg-[#f58220] text-white py-3 rounded-lg font-bold text-sm hover:bg-orange-600 transition-colors mt-1.5"
              >
                {editandoId ? "Guardar cambios" : "Guardar tarea"}
              </button>
            </form>
          </div>
        </div>
      )}

      {editandoST !== null && (
        <div className="fixed inset-0 bg-slate-900/50 flex items-center justify-center z-[1000]">
          <div className="bg-white rounded-2xl p-7 w-[440px] shadow-2xl">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-base font-extrabold text-slate-800">Editar Sub-tarea</h3>
              <FaTimes className="cursor-pointer text-slate-500" onClick={cerrarEditarST} />
            </div>

            <form onSubmit={guardarEdicionST} className="flex flex-col gap-3.5">
              <div>
                <label className={labelCls}>Título *</label>
                <input
                  type="text"
                  required
                  className={inputCls}
                  value={stEditData.titulo}
                  onChange={(e) => setStEditData({ ...stEditData, titulo: e.target.value })}
                />
              </div>

              <div>
                <label className={labelCls}>Descripción</label>
                <textarea
                  rows={2}
                  className={`${inputCls} resize-y font-[inherit]`}
                  value={stEditData.descripcion}
                  onChange={(e) => setStEditData({ ...stEditData, descripcion: e.target.value })}
                />
              </div>

              <div>
                <label className={labelCls}>Asignar a *</label>
                <select
                  required
                  value={stEditData.receptorId}
                  onChange={(e) => setStEditData({ ...stEditData, receptorId: e.target.value })}
                  className={`${inputCls} cursor-pointer`}
                >
                  <option value="">Selecciona un asesor</option>
                  {asesores.map((a) => (
                    <option key={a.id} value={a.id}>{a.name} ({a.area?.nombre || "IT"})</option>
                  ))}
                </select>
              </div>

              <div className="flex gap-3">
                <div className="flex-1">
                  <label className={labelCls}>Área</label>
                  <select
                    className={inputCls}
                    value={stEditData.areaId}
                    onChange={(e) => setStEditData({ ...stEditData, areaId: e.target.value })}
                  >
                    {areasDefinidas.map((a) => (
                      <option key={a.id} value={a.id}>{a.nombre}</option>
                    ))}
                  </select>
                </div>
                <div className="flex-1">
                  <label className={labelCls}>Fecha límite</label>
                  <input
                    type="datetime-local"
                    className={inputCls}
                    value={stEditData.fechaLimite}
                    onChange={(e) => setStEditData({ ...stEditData, fechaLimite: e.target.value })}
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={guardandoEdicionST}
                className={`bg-[#f58220] text-white py-3 rounded-lg font-bold text-sm hover:bg-orange-600 transition-colors mt-1.5 ${guardandoEdicionST ? "opacity-70" : ""}`}
              >
                {guardandoEdicionST ? "Guardando..." : "Guardar cambios"}
              </button>
            </form>
          </div>
        </div>
      )}

      {completandoInfo !== null && (
        <div className="fixed inset-0 bg-slate-900/50 flex items-center justify-center z-[1000]">
          <div className="bg-white rounded-2xl p-7 w-[420px] shadow-2xl">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-base font-extrabold text-slate-800 flex items-center gap-2">
                <FaCheckCircle className="text-green-600" />
                Completar {completandoInfo.tipo === "tarea" ? "tarea" : "sub-tarea"}
              </h3>
              <FaTimes className="cursor-pointer text-slate-500" onClick={cerrarCompletar} />
            </div>

            <form onSubmit={confirmarCompletar} className="flex flex-col gap-3.5">
              <div>
                <label className={labelCls}>¿Qué se hizo? *</label>
                <textarea
                  autoFocus
                  required
                  rows={3}
                  placeholder="Cuenta brevemente qué se resolvió o entregó..."
                  className={`${inputCls} resize-y font-[inherit]`}
                  value={comentarioCompletar}
                  onChange={(e) => setComentarioCompletar(e.target.value)}
                />
                <p className="text-[11px] text-gray-400 mt-1.5">
                  Este comentario queda guardado en la Bitácora del Sistema.
                </p>
              </div>

              <button
                type="submit"
                disabled={guardandoCompletar || !comentarioCompletar.trim()}
                className={`bg-green-600 text-white py-3 rounded-lg font-bold text-sm hover:bg-green-700 transition-colors mt-1.5 inline-flex items-center justify-center gap-2 ${
                  guardandoCompletar || !comentarioCompletar.trim() ? "opacity-50 cursor-not-allowed" : ""
                }`}
              >
                <FaCheckCircle className="text-[13px]" />
                {guardandoCompletar ? "Completando..." : "Marcar como completada"}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}