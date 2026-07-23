import { FaEye, FaCheckCircle } from "react-icons/fa";
export const prioridadColors = (colors) => ({
  urgente: { bg: "#f3e8ff", color: "#7c3aed", label: "Urgente" },
  alta: { bg: colors.rojoClaro, color: colors.rojo, label: "Alta" },
  media: { bg: colors.naranjaClaro, color: colors.naranja, label: "Media" },
  baja: { bg: colors.verdeClaro, color: colors.verde, label: "Baja" },
});

export const badgePrioridad = (colors, prioridad) => {
  const key = (prioridad || "media").toLowerCase();
  const mapa = prioridadColors(colors);
  return mapa[key] || mapa.media;
};

const formatearFecha = (fecha) => {
  if (!fecha) return "—";
  const d = new Date(fecha);
  return d.toLocaleDateString("es-HN", { day: "2-digit", month: "short", year: "numeric" }) +
    " " + d.toLocaleTimeString("es-HN", { hour: "2-digit", minute: "2-digit" });
};

const formatearDuracion = (ms) => {
  if (ms == null || ms < 0) return "—";
  const horas = Math.floor(ms / 3600000);
  const minutos = Math.floor((ms % 3600000) / 60000);
  if (horas === 0) return `${minutos} min`;
  return `${horas}h ${minutos}min`;
};

const tiempoResolucion = (ticket) => {
  if (!ticket.resueltoAt || !ticket.creadoAt) return null;
  const inicio = new Date(ticket.creadoAt).getTime();
  const fin = new Date(ticket.resueltoAt).getTime();
  const pausado = ticket.tiempoPausadoTotalMs || 0;
  return fin - inicio - pausado;
};

export default function TablaTickets({
  tickets,
  usuario,
  colors,
  cargando,
  error,
  modoHistorial = false,
  onAbrirTicket,
  onCambiarEstado,
}) {
  const columnas = modoHistorial
    ? ["ID", "Prioridad", "Tipo", "Solicitante", "Área", "Resuelto por", "Creado", "Finalizado", "Tiempo de resolución"]
    : ["ID", "Prioridad", "Tipo", "Solicitante", "Área", "Estado", "Asignado", "Creado", "Acciones"];

  return (
    <div style={{ background: "#fff", borderRadius: "12px", border: `1px solid ${colors.borde}`, overflow: "hidden" }}>
      <div style={{ overflowX: "auto" }}>
        <table style={{ width: "100%", borderCollapse: "collapse", fontFamily: "inherit" }}>
          <thead>
            <tr style={{ background: colors.fondo, color: colors.textoSec, fontSize: "12px" }}>
              {columnas.map((h) => (
                <th key={h} style={{ padding: "12px 16px", textAlign: "left", fontWeight: "700", whiteSpace: "nowrap" }}>
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {cargando ? (
              <tr>
                <td colSpan={columnas.length} style={{ padding: "40px", textAlign: "center", color: colors.textoMuted, fontSize: "13px" }}>
                  Cargando tickets...
                </td>
              </tr>
            ) : error ? (
              <tr>
                <td colSpan={columnas.length} style={{ padding: "40px", textAlign: "center", color: colors.rojo, fontSize: "13px" }}>
                  {error}
                </td>
              </tr>
            ) : tickets.length === 0 ? (
              <tr>
                <td colSpan={columnas.length} style={{ padding: "40px", textAlign: "center", color: colors.textoMuted, fontSize: "13px" }}>
                  {modoHistorial ? "Aún no tienes tickets finalizados." : "No hay incidentes en esta categoría."}
                </td>
              </tr>
            ) : (
              tickets.map((t) => {
                const badge = badgePrioridad(colors, t.prioridad);
                const asignadoAMi = t.asignados?.some((a) => a.adminId === usuario?.id);
                const enRiesgo = t.enRiesgo && t.estado !== "Resuelto";
                const nombreAsignado = t.asignados?.[0]?.admin?.name || t.asignados?.[0]?.admin?.email || "Sin asignar";
                const duracion = tiempoResolucion(t);

                return (
                  <tr
                    key={t.id}
                    onClick={() => onAbrirTicket?.(t)}
                    style={{
                      borderBottom: `1px solid ${colors.fondo}`,
                      borderLeft: `3px solid ${enRiesgo ? colors.rojo : "transparent"}`,
                      cursor: onAbrirTicket ? "pointer" : "default",
                      transition: "background-color 0.12s ease",
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = colors.fondo)}
                    onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "transparent")}
                  >
                    <td style={{ padding: "12px 16px", fontWeight: "700", color: colors.naranja, fontSize: "13px" }}>
                      #TK-{t.id}
                    </td>
                    <td style={{ padding: "12px 16px" }}>
                      <span style={{ padding: "3px 10px", borderRadius: "20px", fontSize: "11px", fontWeight: "700", background: badge.bg, color: badge.color }}>
                        {badge.label}
                      </span>
                    </td>
                    <td style={{ padding: "12px 16px", fontSize: "13px", color: colors.texto, fontWeight: "600" }}>{t.tipo}</td>
                    <td style={{ padding: "12px 16px", fontSize: "12.5px", color: colors.textoSec }}>{t.nombre}</td>
                    <td style={{ padding: "12px 16px", fontSize: "12.5px", color: colors.textoSec }}>{t.area || "—"}</td>

                    {modoHistorial ? (
                      <>
                        <td style={{ padding: "12px 16px", fontSize: "12.5px", color: colors.textoSec }}>{nombreAsignado}</td>
                        <td style={{ padding: "12px 16px", fontSize: "12px", color: colors.textoMuted, whiteSpace: "nowrap" }}>{formatearFecha(t.creadoAt)}</td>
                        <td style={{ padding: "12px 16px", fontSize: "12px", color: colors.textoMuted, whiteSpace: "nowrap" }}>{formatearFecha(t.resueltoAt)}</td>
                        <td style={{ padding: "12px 16px", fontSize: "12.5px", fontWeight: "700", color: colors.verde }}>{formatearDuracion(duracion)}</td>
                      </>
                    ) : (
                      <>
                        <td style={{ padding: "12px 16px" }}>
                          <span style={{ padding: "3px 10px", borderRadius: "20px", fontSize: "11px", fontWeight: "700", background: colors.naranjaClaro, color: colors.naranja }}>
                            {t.estado}
                          </span>
                          {enRiesgo && (
                            <span style={{ marginLeft: "6px", padding: "3px 8px", borderRadius: "20px", fontSize: "10px", fontWeight: "700", background: colors.rojoClaro, color: "#991b1b" }}>
                              En riesgo
                            </span>
                          )}
                        </td>
                        <td style={{ padding: "12px 16px", fontSize: "12.5px", color: colors.textoSec }}>
                          {asignadoAMi ? <b style={{ color: colors.verde }}>Tú</b> : nombreAsignado}
                        </td>
                        <td style={{ padding: "12px 16px", fontSize: "12px", color: colors.textoMuted, whiteSpace: "nowrap" }}>{formatearFecha(t.creadoAt)}</td>
                        <td style={{ padding: "12px 16px" }} onClick={(e) => e.stopPropagation()}>
                          <div style={{ display: "flex", gap: "8px" }}>
                            <button
                              onClick={() => onAbrirTicket?.(t)}
                              title="Abrir"
                              style={{ display: "flex", alignItems: "center", gap: "6px", background: colors.naranja, color: "#fff", border: "none", padding: "6px 12px", borderRadius: "7px", fontSize: "12px", fontWeight: "700", cursor: "pointer" }}
                            >
                              <FaEye /> Abrir
                            </button>
                            {asignadoAMi && t.estado !== "Resuelto" && (
                              <button
                                onClick={() => onCambiarEstado?.(t.id, "Resuelto")}
                                title="Marcar como resuelto"
                                style={{ display: "flex", alignItems: "center", gap: "6px", background: colors.verde, color: "#fff", border: "none", padding: "6px 12px", borderRadius: "7px", fontSize: "12px", fontWeight: "700", cursor: "pointer" }}
                              >
                                <FaCheckCircle /> Resolver
                              </button>
                            )}
                          </div>
                        </td>
                      </>
                    )}
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
