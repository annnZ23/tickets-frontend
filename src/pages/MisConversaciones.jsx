import { useState, useEffect, useRef, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import Topbar from "../components/Topbar";
import { socket, useNotificaciones, ToastContainer } from "../hooks/useNotificaciones";
import {
  FaComments, FaPaperPlane, FaSearch, FaCheck, FaFlag, FaStar,
  FaSpinner, FaPause, FaUserCheck, FaPaperclip, FaMicrophone,
  FaStop, FaFileAlt, FaTag, FaUser, FaClock, FaChartLine,
  FaImage, FaFilePdf, FaFileWord, FaFileExcel, FaFilePowerpoint,
  FaLock,
} from "react-icons/fa";

const archivoInfo = (fileType, fileUrl) => {
  const nombre = decodeURIComponent((fileUrl || "").split("/").pop() || "archivo");
  const t = fileType || "";
  if (t.includes("pdf") || /\.pdf$/i.test(nombre)) return { icono: <FaFilePdf />, color: "#dc2626", label: "Documento PDF", nombre };
  if (t.includes("word") || /\.(docx?|odt)$/i.test(nombre)) return { icono: <FaFileWord />, color: "#2563eb", label: "Documento Word", nombre };
  if (t.includes("sheet") || t.includes("excel") || /\.(xlsx?|csv)$/i.test(nombre)) return { icono: <FaFileExcel />, color: "#16a34a", label: "Hoja de Excel", nombre };
  if (t.includes("presentation") || /\.pptx?$/i.test(nombre)) return { icono: <FaFilePowerpoint />, color: "#ea580c", label: "Presentación", nombre };
  return { icono: <FaFileAlt />, color: "#64748b", label: "Archivo adjunto", nombre };
};

const API = "https://sistema-tickets-it.onrender.com";
const URL_LISTA_TICKETS = `${API}/api/tickets`;

const PASOS = ["Creado", "Asignado", "En Proceso", "Resuelto", "Encuesta"];

const colorEstado = (estado) => {
  const e = (estado || "").toLowerCase();
  if (e.includes("resuelto")) return "bg-green-50 text-green-600";
  if (e.includes("proceso")) return "bg-orange-50 text-[#f58220]";
  return "bg-slate-100 text-slate-500";
};

const quitarHtml = (html) => (html || "").replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();
const agruparPorMes = (lista) => {
  const grupos = {};
  lista.forEach((t) => {
    const d = t.creadoAt ? new Date(t.creadoAt) : null;
    const key = d ? `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}` : "0000-00";
    const label = d
      ? d.toLocaleDateString("es-HN", { month: "long", year: "numeric" }).replace(/^\w/, (c) => c.toUpperCase())
      : "Sin fecha";
    if (!grupos[key]) grupos[key] = { label, items: [] };
    grupos[key].items.push(t);
  });
  return Object.entries(grupos)
    .sort((a, b) => b[0].localeCompare(a[0]))
    .map(([, g]) => g);
};

function StepperEstado({ ticket }) {
  const e = (ticket?.estado || "").toLowerCase();
  let actual = 0;
  if (e.includes("resuelto")) actual = 3;
  else if (e.includes("proceso")) actual = 2;
  else if (ticket?.asignados?.length > 0 || e.includes("asignado")) actual = 1;
  else actual = 0;

  const respondida = ticket?.encuesta?.estado === "Respondida";
  const iconos = [<FaCheck />, <FaUserCheck />, <FaSpinner />, <FaFlag />, <FaStar />];

  return (
    <div className="bg-white rounded-2xl border border-[#eef1f5] shadow-sm px-6 py-4">
      <h4 className="m-0 mb-3.5 text-[13px] font-extrabold text-slate-800 flex items-center gap-2">
        <FaChartLine className="text-[#f58220]" /> Estado del Ticket #TK-{ticket.id}
      </h4>
      <div className="flex items-center">
        {PASOS.map((paso, i) => {
          const esEncuesta = i === 4;
          const completado = !esEncuesta && i < actual;
          const activo = !esEncuesta && i === actual;

          let circuloClase;
          let mostrarCheck = false;
          if (esEncuesta) {
            circuloClase = respondida
              ? "bg-yellow-400 text-white"
              : actual >= 3
              ? "bg-yellow-50 text-yellow-500 border-2 border-yellow-300"
              : "bg-gray-200 text-gray-400";
          } else if (completado) {
            circuloClase = "bg-green-500 text-white";
            mostrarCheck = true;
          } else if (activo) {
            circuloClase = "bg-[#f58220] text-white animate-pulse";
          } else {
            circuloClase = "bg-gray-200 text-gray-400";
          }

          return (
            <div key={paso} className="flex items-center flex-1 last:flex-none">
              <div className="flex flex-col items-center min-w-[56px]">
                <div className={`w-9 h-9 rounded-full flex items-center justify-center text-[13px] transition-colors ${circuloClase}`}>
                  {mostrarCheck ? <FaCheck /> : iconos[i]}
                </div>
                <span
                  className={`mt-1 text-[10.5px] text-center leading-tight ${
                    esEncuesta
                      ? respondida
                        ? "font-extrabold text-yellow-500"
                        : "text-gray-400"
                      : activo
                      ? "font-extrabold text-[#f58220]"
                      : completado
                      ? "font-semibold text-slate-700"
                      : "text-gray-400"
                  }`}
                >
                  {paso}
                </span>
              </div>
              {i < PASOS.length - 1 && (
                <div
                  className={`h-1 flex-1 rounded-full mx-1 mb-4 ${
                    i === 3
                      ? respondida
                        ? "bg-yellow-400"
                        : actual >= 3
                        ? "bg-green-500"
                        : "bg-gray-200"
                      : i < actual
                      ? "bg-green-500"
                      : "bg-gray-200"
                  }`}
                />
              )}
            </div>
          );
        })}
      </div>
      {ticket.pausado && (
        <div className="mt-3 flex items-center gap-2 text-xs font-bold text-amber-700 bg-amber-50 rounded-lg px-3 py-2">
          <FaPause /> Ticket en pausa{ticket.motivoPausa ? `: ${ticket.motivoPausa}` : ""}
        </div>
      )}
      {actual >= 3 && !respondida && (
        <div className="mt-3 flex items-center gap-2 text-xs font-bold text-amber-700 bg-amber-50 rounded-lg px-3 py-2">
          <FaStar /> Tu ticket ya fue resuelto — responde la encuesta de satisfacción cuando te llegue por correo para completar el proceso.
        </div>
      )}
    </div>
  );
}

export default function MisConversaciones({ usuario, cerrarSesion }) {
  const { id } = useParams(); 
  const navigate = useNavigate();
  const token = localStorage.getItem("token");
  const user = usuario || JSON.parse(localStorage.getItem("user") || "null");
  const authHeaders = () => ({ Authorization: `Bearer ${token}` });
  const [tickets, setTickets] = useState([]);
  const [cargandoLista, setCargandoLista] = useState(true);
  const [busqueda, setBusqueda] = useState("");
  const { toasts } = useNotificaciones(user);

  useEffect(() => {
    if (!user?.id) return;
    const onTicketNotif = () => cargarListaTickets();
    socket.on("ticket_actualizado", onTicketNotif);
    return () => socket.off("ticket_actualizado", onTicketNotif);
  }, [user?.id]);

  const cargarListaTickets = useCallback(() => {
    fetch(URL_LISTA_TICKETS, { headers: authHeaders() })
      .then((r) => r.json())
      .then((data) => {
        let lista = Array.isArray(data) ? data : data.tickets || [];
        if (user?.role === "USER") {
          const miCorreo = (user.email || "").toLowerCase();
          lista = lista.filter(
            (t) => t.usuarioId === user.id || (t.correo && t.correo.toLowerCase() === miCorreo)
          );
        }
        lista.sort((a, b) => new Date(b.creadoAt || 0) - new Date(a.creadoAt || 0));
        setTickets(lista);
      })
      .catch(console.error)
      .finally(() => setCargandoLista(false));
  }, [user?.id, user?.role]);

  useEffect(() => {
    cargarListaTickets();
  }, [cargarListaTickets]);

  useEffect(() => {
    socket.on("ticket_creado", () => {
      cargarListaTickets();
    });
    return () => {
      socket.off("ticket_creado");
    };
  }, [cargarListaTickets]);

  const ticketsFiltrados = tickets.filter((t) => {
    const q = busqueda.toLowerCase().trim();
    if (!q) return true;
    return (
      String(t.id).includes(q) ||
      (t.tipo || "").toLowerCase().includes(q) ||
      (t.estado || "").toLowerCase().includes(q) ||
      quitarHtml(t.descripcion).toLowerCase().includes(q)
    );
  });

  const gruposPorMes = agruparPorMes(ticketsFiltrados);

  const [ticket, setTicket] = useState(null);
  const [mensajes, setMensajes] = useState([]);
  const [cargando, setCargando] = useState(false);
  const [nuevoMensaje, setNuevoMensaje] = useState("");
  const [enviando, setEnviando] = useState(false);
  const [grabando, setGrabando] = useState(false);

  const chatEndRef = useRef(null);
  const inputImagenRef = useRef(null);
  const inputArchivoRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const chunksAudioRef = useRef([]);

  const cargarTicket = useCallback(async () => {
    if (!id) { setTicket(null); setMensajes([]); return; }
    setCargando(true);
    try {
      const res = await fetch(`${API}/api/tickets/${id}`, { headers: authHeaders() });
      if (!res.ok) throw new Error("No se pudo cargar el ticket");
      const data = await res.json();
      setTicket(data);
      setMensajes(data.mensajes || []);
    } catch (err) {
      console.error(err);
      setTicket(null);
      setMensajes([]);
    } finally {
      setCargando(false);
    }
  }, [id]);

  useEffect(() => { cargarTicket(); }, [cargarTicket]);
  useEffect(() => {
    if (!id) return;
    const room = `ticket_${id}`;
    socket.emit("join_room", room);

    const onReceive = (data) => {
      setMensajes((prev) => {
        if (data.idTemporal && prev.some((m) => m.idTemporal === data.idTemporal)) return prev;
        return [...prev, data];
      });
    };

    socket.on("receive_message", onReceive);
    return () => {
      socket.off("receive_message", onReceive);
      socket.emit("leave_room", room);
    };
  }, [id]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [mensajes]);

  const enviarTexto = async (e) => {
    e.preventDefault();
    if (!nuevoMensaje.trim() || enviando) return;
    await enviarMensaje({ contenido: nuevoMensaje.trim() });
    setNuevoMensaje("");
  };

  const enviarArchivo = async (file) => {
    if (!file) return;
    await enviarMensaje({ archivo: file });
  };

  const enviarMensaje = async ({ contenido, archivo }) => {
    setEnviando(true);
    const idTemporal = `${Date.now()}-${Math.random()}`;
    const nombreRemitente = user?.name || ticket?.nombre || "Usuario";
    const mensajeLocal = {
      idTemporal,
      contenido: contenido || null,
      enviadoPor: nombreRemitente,
      fileUrl: archivo ? URL.createObjectURL(archivo) : null,
      fileType: archivo ? archivo.type : null,
      creadoAt: new Date().toISOString(),
      _local: true,
    };
    setMensajes((prev) => [...prev, mensajeLocal]);

    try {
      const formData = new FormData();
      if (contenido) formData.append("contenido", contenido);
      formData.append("enviadoPor", nombreRemitente);
      if (archivo) formData.append("archivo", archivo);

      const res = await fetch(`${API}/api/tickets/${id}/mensajes`, {
        method: "POST",
        headers: authHeaders(),
        body: formData,
      });
      const guardado = await res.json();

      setMensajes((prev) => prev.map((m) => (m.idTemporal === idTemporal ? { ...guardado, idTemporal } : m)));

      socket.emit("send_message", {
        room: `ticket_${id}`,
        idTemporal,
        ...guardado,
      });
    } catch (err) {
      console.error("Error al enviar mensaje:", err);
    } finally {
      setEnviando(false);
    }
  };

  const iniciarGrabacion = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      chunksAudioRef.current = [];
      recorder.ondataavailable = (e) => chunksAudioRef.current.push(e.data);
      recorder.onstop = async () => {
        const blob = new Blob(chunksAudioRef.current, { type: "audio/webm" });
        const archivo = new File([blob], `audio-${Date.now()}.webm`, { type: "audio/webm" });
        await enviarArchivo(archivo);
        stream.getTracks().forEach((t) => t.stop());
      };
      recorder.start();
      mediaRecorderRef.current = recorder;
      setGrabando(true);
    } catch {
      alert("No se pudo acceder al micrófono. Revisa los permisos del navegador.");
    }
  };

  const detenerGrabacion = () => {
    mediaRecorderRef.current?.stop();
    setGrabando(false);
  };

  const urlArchivo = (fileUrl) => (fileUrl?.startsWith("blob:") ? fileUrl : `${API}${fileUrl}`);

  return (
    <div className="flex min-h-screen w-screen overflow-x-hidden bg-[#fdf0e6] font-['Segoe_UI',sans-serif]">
      <Sidebar usuario={user} cerrarSesion={cerrarSesion} />

      <div className="flex-1 flex flex-col h-screen overflow-hidden">
        <Topbar usuario={user} cerrarSesion={cerrarSesion} />

        <div className="flex-1 flex p-5 gap-5 box-border overflow-hidden">
          <div className="w-[320px] flex-shrink-0 bg-white rounded-2xl border border-[#eef1f5] shadow-sm flex flex-col overflow-hidden">
            <div className="px-5 pt-5 pb-3">
              <h3 className="m-0 text-base font-extrabold text-slate-800 flex items-center gap-2">
                <FaComments className="text-[#f58220]" /> Mis conversaciones
              </h3>
              <p className="m-0 mt-0.5 text-[11.5px] text-slate-400">Tus tickets con el equipo de IT</p>
            </div>

            <div className="px-4 pb-3">
              <div className="relative">
                <FaSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-300 text-xs pointer-events-none" />
                <input
                  value={busqueda}
                  onChange={(e) => setBusqueda(e.target.value)}
                  placeholder="Buscar por ID, tipo, estado..."
                  className="w-full pl-10 pr-3 py-2.5 rounded-xl border border-gray-200 bg-gray-50 text-[13px] outline-none focus:border-[#f58220] focus:bg-white transition-colors"
                />
              </div>
            </div>

            <div className="flex-1 overflow-y-auto px-3 pb-3 flex flex-col gap-1.5">
              {cargandoLista ? (
                <p className="text-[13px] text-slate-400 px-2">Cargando tickets...</p>
              ) : ticketsFiltrados.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-10 text-gray-300">
                  <FaComments className="text-3xl mb-2" />
                  <p className="text-[13px] m-0 text-gray-400 text-center px-3">
                    {busqueda ? "Sin resultados para tu búsqueda." : "Aún no tienes tickets registrados."}
                  </p>
                </div>
              ) : (
                gruposPorMes.map((grupo) => (
                  <div key={grupo.label}>
                    <div className="px-2.5 py-1.5 sticky top-0 bg-white z-10">
                      <span className="text-[10px] font-extrabold text-gray-400 uppercase tracking-wide">{grupo.label}</span>
                    </div>
                    <div className="flex flex-col gap-1.5">
                      {grupo.items.map((t) => {
                        const activo = String(t.id) === String(id);
                        return (
                          <button
                            key={t.id}
                            onClick={() => navigate(`/chat/${t.id}`)}
                            className={`text-left rounded-xl px-3.5 py-3 transition-colors border ${
                              activo ? "bg-orange-50 border-[#f58220]" : "bg-white border-transparent hover:bg-gray-50"
                            }`}
                          >
                            <div className="flex items-center justify-between gap-2">
                              <span className={`text-[13px] font-extrabold truncate ${activo ? "text-[#f58220]" : "text-slate-800"}`}>
                                #TK-{t.id} — {t.tipo || "Solicitud"}
                              </span>
                              {t.pausado && <FaPause className="text-amber-500 text-[10px] flex-shrink-0" title="Pausado" />}
                            </div>

                            {t.creadoPorIA && (
                              <div className="mt-1 flex items-center">
                                <span className="text-[9.5px] font-extrabold bg-amber-100 text-amber-800 px-2 py-0.5 rounded-md border border-amber-200 flex items-center gap-1">
                                  🤖 Ticket generado por la IA por {t.nombre || "el usuario"}
                                </span>
                              </div>
                            )}

                            <p className="m-0 mt-1.5 text-[12px] text-slate-400 truncate">
                              {quitarHtml(t.descripcion) || "Sin descripción"}
                            </p>
                            <div className="mt-1.5 flex items-center gap-2">
                              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${colorEstado(t.estado)}`}>
                                {t.estado}
                              </span>
                              {t.encuesta?.estado === "Respondida" && (
                                <FaStar className="text-yellow-400 text-[10px]" title="Encuesta respondida" />
                              )}
                              {t.creadoAt && (
                                <span className="text-[10px] text-gray-300">
                                  {new Date(t.creadoAt).toLocaleDateString("es-HN", { day: "2-digit", month: "short" })}
                                </span>
                              )}
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="flex-1 flex flex-col gap-4 min-w-0">
            {!id ? (
              <div className="flex-1 bg-white rounded-2xl border border-[#eef1f5] shadow-sm flex flex-col items-center justify-center text-gray-300">
                <FaComments className="text-6xl mb-4" />
                <p className="text-[15px] text-gray-400 m-0 font-semibold">Selecciona un ticket para ver la conversación</p>
                <p className="text-[12.5px] text-gray-300 m-0 mt-1">Aquí verás el estado y los mensajes con tu asesor</p>
              </div>
            ) : cargando ? (
              <div className="flex-1 bg-white rounded-2xl border border-[#eef1f5] shadow-sm flex items-center justify-center text-slate-400 text-sm">
                Cargando conversación...
              </div>
            ) : !ticket ? (
              <div className="flex-1 bg-white rounded-2xl border border-[#eef1f5] shadow-sm flex items-center justify-center text-slate-400 text-sm">
                No se encontró este ticket, o no tienes acceso a él.
              </div>
            ) : (
              <>
                <StepperEstado ticket={ticket} />

                <div className="flex-1 flex gap-4 min-h-0">
                  <div className="flex-[2] bg-white rounded-2xl border border-[#eef1f5] shadow-sm flex flex-col overflow-hidden min-w-0">
                    <div className="px-5 py-3 border-b border-gray-100 flex items-center justify-between flex-shrink-0">
                      <span className="text-[13.5px] font-extrabold text-slate-800 truncate">
                        #TK-{ticket.id} — {ticket.tipo}
                      </span>
                      <div className="flex items-center gap-2 flex-shrink-0">
                        {ticket.pausado && (
                          <span className="text-[11px] font-bold px-2.5 py-1 rounded-full bg-amber-50 text-amber-700 flex items-center gap-1.5">
                            <FaPause className="text-[9px]" /> Pausado
                          </span>
                        )}
                        <span className={`text-[11px] font-bold px-2.5 py-1 rounded-full ${colorEstado(ticket.estado)}`}>
                          {ticket.estado}
                        </span>
                      </div>
                    </div>

                    <div className="flex-1 overflow-y-auto p-5 flex flex-col gap-3 bg-[#fdf0e6]/50">
                      <div className="bg-white border border-gray-100 rounded-xl px-4 py-3.5 text-[13px] text-slate-500">
                        <strong className="block mb-1 text-slate-800 flex items-center gap-1.5">
                          {ticket.creadoPorIA && <span className="text-amber-600">🤖 [Generado por la IA]</span>} Descripción original del incidente
                        </strong>
                        <div className="leading-relaxed" dangerouslySetInnerHTML={{ __html: ticket.descripcion || "Sin descripción adicional." }} />
                      </div>

                      {mensajes.map((m, i) => {
                        const esMio = m.enviadoPor === (user?.name || ticket.nombre);
                        return (
                          <div key={m.id || m.idTemporal || i} className={`flex flex-col max-w-[72%] ${esMio ? "self-end" : "self-start"}`}>
                            <span className={`text-[10.5px] text-gray-400 mb-0.5 ${esMio ? "self-end" : "self-start"}`}>
                              {esMio ? "Tú" : m.enviadoPor}
                            </span>
                            <div
                              className={`px-3.5 py-2.5 text-[13.5px] ${
                                esMio
                                  ? "bg-[#ff7f22] text-white rounded-2xl rounded-br-sm"
                                  : "bg-white text-slate-800 rounded-2xl rounded-bl-sm shadow-sm"
                              }`}
                            >
                              {m.contenido && <div dangerouslySetInnerHTML={{ __html: m.contenido }} />}
                              {m.fileUrl && m.fileType?.startsWith("audio") && (
                                <audio controls src={urlArchivo(m.fileUrl)} className={`max-w-[220px] ${m.contenido ? "mt-2" : ""}`} />
                              )}
                              {m.fileUrl && m.fileType?.startsWith("image") && (
                                <a href={urlArchivo(m.fileUrl)} target="_blank" rel="noreferrer" className={`block ${m.contenido ? "mt-2" : ""}`}>
                                  <img src={urlArchivo(m.fileUrl)} alt="Imagen adjunta" className="max-w-[240px] max-h-[240px] rounded-lg block object-cover" />
                                </a>
                              )}
                              {m.fileUrl && !m.fileType?.startsWith("audio") && !m.fileType?.startsWith("image") && (() => {
                                const info = archivoInfo(m.fileType, m.fileUrl);
                                return (
                                  <a
                                    href={urlArchivo(m.fileUrl)}
                                    target="_blank"
                                    rel="noreferrer"
                                    className={`flex items-center gap-2.5 no-underline rounded-lg px-3 py-2.5 min-w-[200px] max-w-[260px] ${m.contenido ? "mt-2" : ""} ${
                                      esMio ? "bg-white/20 hover:bg-white/30" : "bg-slate-50 hover:bg-slate-100 border border-slate-200"
                                    } transition-colors`}
                                  >
                                    <span className="text-[24px] flex-shrink-0" style={{ color: esMio ? "#fff" : info.color }}>{info.icono}</span>
                                    <span className="min-w-0">
                                      <span className={`block text-[12px] font-bold truncate ${esMio ? "text-white" : "text-slate-800"}`}>{info.label}</span>
                                      <span className={`block text-[10.5px] truncate ${esMio ? "text-white/85" : "text-slate-500"}`}>{info.nombre}</span>
                                    </span>
                                  </a>
                                );
                              })()}
                              <div className="text-[9.5px] text-right mt-1 opacity-75">
                                {new Date(m.creadoAt).toLocaleTimeString("es-HN", { hour: "2-digit", minute: "2-digit" })}
                              </div>
                            </div>
                          </div>
                        );
                      })}
                      <div ref={chatEndRef} />
                    </div>

                    {ticket.estado === "Resuelto" ? (
                      <div className="flex items-center justify-center gap-2 px-4 py-3.5 border-t border-gray-100 bg-gray-50 flex-shrink-0 text-[12.5px] text-slate-400 font-semibold">
                        <FaLock className="text-[11px]" /> Este ticket ya está resuelto — solo puedes consultarlo, no se puede escribir.
                      </div>
                    ) : (
                      <form onSubmit={enviarTexto} className="flex items-center gap-2.5 px-4 py-3 border-t border-gray-100 bg-white flex-shrink-0">
                        <input
                          ref={inputArchivoRef}
                          type="file"
                          className="hidden"
                          onChange={(e) => { enviarArchivo(e.target.files[0]); e.target.value = ""; }}
                        />
                        <input
                          ref={inputImagenRef}
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={(e) => { enviarArchivo(e.target.files[0]); e.target.value = ""; }}
                        />
                        <button type="button" onClick={() => inputArchivoRef.current.click()} title="Adjuntar archivo" className="text-slate-400 hover:text-[#f58220] text-base">
                          <FaPaperclip />
                        </button>
                        <button type="button" onClick={() => inputImagenRef.current.click()} title="Enviar imagen" className="text-slate-400 hover:text-[#f58220] text-base">
                          <FaImage />
                        </button>
                        <button
                          type="button"
                          onClick={grabando ? detenerGrabacion : iniciarGrabacion}
                          className={`text-base ${grabando ? "text-red-600" : "text-slate-400 hover:text-[#f58220]"}`}
                          title={grabando ? "Detener grabación" : "Grabar audio"}
                        >
                          {grabando ? <FaStop /> : <FaMicrophone />}
                        </button>
                        <input
                          type="text"
                          value={nuevoMensaje}
                          onChange={(e) => setNuevoMensaje(e.target.value)}
                          placeholder={grabando ? "Grabando audio..." : "Escribe una respuesta..."}
                          disabled={grabando}
                          className="flex-1 px-4 py-2.5 rounded-full border border-gray-200 text-[13px] outline-none focus:border-[#f58220] transition-colors"
                        />
                        <button
                          type="submit"
                          disabled={enviando}
                          className="w-10 h-10 rounded-full bg-[#ff7f22] text-white flex items-center justify-center flex-shrink-0 hover:bg-[#e66a10] transition-colors"
                        >
                          <FaPaperPlane className="text-[13px]" />
                        </button>
                      </form>
                    )}
                  </div>

                  <div className="flex-1 flex flex-col gap-4 min-w-[220px] max-w-[300px] overflow-y-auto">
                    <div className="bg-white rounded-2xl border border-[#eef1f5] shadow-sm p-4.5 px-5 py-4">
                      <h4 className="m-0 mb-3.5 text-[13px] font-bold text-slate-800">Detalles del ticket</h4>
                      <div className="flex flex-col gap-2.5 text-[12.5px]">
                        <div className="flex justify-between gap-2">
                          <span className="text-slate-500 flex items-center gap-1.5"><FaTag className="text-[10px]" /> Prioridad</span>
                          <span className="font-bold text-[#f58220]">{ticket.prioridad}</span>
                        </div>
                        <div className="flex justify-between gap-2">
                          <span className="text-slate-500">Categoría</span>
                          <span className="font-bold text-slate-800 text-right">{ticket.categoria?.nombre || "—"}</span>
                        </div>
                        <div className="flex justify-between gap-2">
                          <span className="text-slate-500">Área</span>
                          <span className="font-bold text-slate-800 text-right">{ticket.area || "—"}</span>
                        </div>
                        {ticket.fechaLimiteAsesor && (
                          <div className="flex justify-between gap-2">
                            <span className="text-slate-500 flex items-center gap-1.5"><FaClock className="text-[10px]" /> Se resuelve antes de</span>
                            <span className="font-bold text-slate-800 text-right">
                              {new Date(ticket.fechaLimiteAsesor).toLocaleString("es-HN")}
                            </span>
                          </div>
                        )}
                        {ticket.encuesta?.estado === "Respondida" && (
                          <div className="flex justify-between gap-2 items-center">
                            <span className="text-slate-500 flex items-center gap-1.5"><FaStar className="text-[10px] text-yellow-400" /> Tu calificación</span>
                            <span className="font-bold text-yellow-500">{ticket.encuesta.calificacion} / 5</span>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="bg-white rounded-2xl border border-[#eef1f5] shadow-sm px-5 py-4">
                      <h4 className="m-0 mb-3 text-[13px] font-bold text-slate-800 flex items-center gap-2">
                        <FaUser className="text-[#f58220] text-xs" /> Asesor asignado
                      </h4>
                      {ticket.asignados?.length > 0 ? (
                        ticket.asignados.map((a) => (
                          <div key={a.adminId} className="text-[12.5px] text-slate-800 font-semibold mb-1">
                            {a.admin?.name}
                          </div>
                        ))
                      ) : (
                        <p className="text-xs text-gray-400 m-0">Aún no se ha asignado un asesor.</p>
                      )}
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
      <ToastContainer toasts={toasts} />
    </div>
  );
}
