import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { FaRegBell, FaRegEnvelope, FaChevronDown, FaSignOutAlt, FaTrashAlt } from "react-icons/fa";
import baprosaLogo from "../assets/baprosa-logo.png";

const colors = {
  naranja: "#ff7f22",
  naranjaClaro: "#fff1e6",
  texto: "#1e293b",
  textoSec: "#64748b",
  textoMuted: "#94a3b8",
  borde: "#eef1f5",
  fondo: "#fdf0e6",
  rojo: "#dc2626",
};

const getIniciales = (name) => {
  if (!name) return "U";
  const p = name.trim().split(" ");
  return p.length > 1 ? `${p[0][0]}${p[1][0]}`.toUpperCase() : p[0][0].toUpperCase();
};

const colorNotif = (tipo) => {
  if (tipo === "riesgo") return { bg: "#fee2e2", color: "#991b1b", label: "En riesgo" };
  if (tipo === "encuesta") return { bg: "#e9f9ee", color: "#16a34a", label: "Encuesta" };
  if (tipo === "subtarea") return { bg: "#eff6ff", color: "#1d4ed8", label: "Sub-tarea" };
  return { bg: "#fff1e6", color: "#9a3412", label: "Nuevo" };
};

export default function Topbar({ usuario, cerrarSesion }) {
  const navigate = useNavigate();
  const authHeaders = () => ({ Authorization: `Bearer ${localStorage.getItem("token")}` });

  const [panelNotif, setPanelNotif] = useState(false);
  const [panelCorreo, setPanelCorreo] = useState(false);
  const [menuAvatar, setMenuAvatar] = useState(false);
  const [notificaciones, setNotificaciones] = useState([]);
  const [totalPendientes, setTotalPendientes] = useState(0);
  const [correos, setCorreos] = useState([]);

  const notifRef = useRef(null);
  const correoRef = useRef(null);
  const avatarRef = useRef(null);

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
      .then((data) => setCorreos(Array.isArray(data) ? data : []))
      .catch((e) => console.error("Error correos:", e));
  };

  const limpiarNotificaciones = () => {
    setNotificaciones([]);
    setTotalPendientes(0);
  };

  useEffect(() => {
    cargarNotificaciones();
    const intervalo = setInterval(cargarNotificaciones, 60000);
    const cerrar = (e) => {
      if (notifRef.current && !notifRef.current.contains(e.target)) setPanelNotif(false);
      if (correoRef.current && !correoRef.current.contains(e.target)) setPanelCorreo(false);
      if (avatarRef.current && !avatarRef.current.contains(e.target)) setMenuAvatar(false);
    };
    document.addEventListener("mousedown", cerrar);
    return () => {
      clearInterval(intervalo);
      document.removeEventListener("mousedown", cerrar);
    };
  }, []);

  const panelStyle = {
    position: "absolute",
    top: "52px",
    right: 0,
    width: "350px",
    backgroundColor: "#fff",
    borderRadius: "12px",
    boxShadow: "0 12px 32px rgba(15,23,42,0.15)",
    border: `1px solid ${colors.borde}`,
    zIndex: 200,
    overflow: "hidden",
  };

  const btnIcono = {
    background: "none",
    border: "none",
    cursor: "pointer",
    position: "relative",
    padding: "8px",
    borderRadius: "10px",
    color: colors.textoSec,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    transition: "background 0.15s",
  };

  return (
    <div
      style={{
        height: "65px",
        width: "100%",
        backgroundColor: "#ffffff",
        borderBottom: `1px solid ${colors.borde}`,
        boxShadow: "0 1px 4px rgba(15,23,42,0.04)",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "0 28px",
        boxSizing: "border-box",
        position: "relative",
        flexShrink: 0,
        fontFamily: "'Segoe UI', sans-serif",
      }}
    >
      <img
        src={baprosaLogo}
        alt="Baprosa"
        onClick={() => {
          if (usuario?.role === "USER") {
            navigate("/crear");
          } else {
            navigate("/admin/dashboard");
          }
        }}
        style={{ height: "46px", width: "auto", objectFit: "contain", cursor: "pointer" }}
      />

      <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
        <div ref={notifRef} style={{ position: "relative" }}>
          <button
            onClick={() => {
              setPanelNotif((v) => !v);
              setPanelCorreo(false);
              setMenuAvatar(false);
              cargarNotificaciones();
            }}
            style={btnIcono}
            onMouseEnter={(e) => (e.currentTarget.style.background = colors.fondo)}
            onMouseLeave={(e) => (e.currentTarget.style.background = "none")}
          >
            <FaRegBell style={{ fontSize: "22px" }} />
            {notificaciones.length > 0 && (
              <span
                style={{
                  position: "absolute",
                  top: "4px",
                  right: "4px",
                  minWidth: "17px",
                  height: "17px",
                  borderRadius: "9px",
                  backgroundColor: colors.rojo,
                  color: "white",
                  fontSize: "10px",
                  fontWeight: "800",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  border: "2px solid white",
                  padding: "0 3px",
                }}
              >
                {notificaciones.length > 9 ? "9+" : notificaciones.length}
              </span>
            )}
          </button>
          {panelNotif && (
            <div style={panelStyle}>
              <div
                style={{
                  padding: "12px 16px",
                  borderBottom: `1px solid ${colors.borde}`,
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                  <span style={{ fontWeight: "700", fontSize: "14px", color: colors.texto }}>
                    Notificaciones
                  </span>
                  {totalPendientes > 0 && (
                    <span
                      style={{
                        fontSize: "11px",
                        backgroundColor: colors.naranjaClaro,
                        color: colors.naranja,
                        padding: "2px 7px",
                        borderRadius: "6px",
                        fontWeight: "700",
                      }}
                    >
                      {totalPendientes} pendientes
                    </span>
                  )}
                </div>

                {notificaciones.length > 0 && (
                  <button
                    onClick={limpiarNotificaciones}
                    style={{
                      background: "none",
                      border: "none",
                      color: colors.textoMuted,
                      cursor: "pointer",
                      fontSize: "12px",
                      display: "flex",
                      alignItems: "center",
                      gap: "4px",
                      fontWeight: "600",
                      padding: "4px 8px",
                      borderRadius: "6px",
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.color = colors.rojo;
                      e.currentTarget.style.backgroundColor = "#fee2e2";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.color = colors.textoMuted;
                      e.currentTarget.style.backgroundColor = "transparent";
                    }}
                    title="Limpiar vista de notificaciones"
                  >
                    <FaTrashAlt style={{ fontSize: "11px" }} /> Limpiar
                  </button>
                )}
              </div>

              <div style={{ maxHeight: "320px", overflowY: "auto" }}>
                {notificaciones.length === 0 ? (
                  <div style={{ padding: "28px", textAlign: "center", color: colors.textoMuted, fontSize: "13px" }}>
                    Sin notificaciones nuevas
                  </div>
                ) : (
                  notificaciones.map((n, i) => {
                    const c = colorNotif(n.tipo);
                    return (
                      <div
                        key={n.id || i}
                        onClick={() => {
                          if (n.ticketId) {
                            setPanelNotif(false);
                            if (usuario?.role === "USER") {
                              navigate("/crear");
                            } else {
                              navigate("/admin/dashboard");
                            }
                          }
                        }}
                        style={{
                          padding: "12px 16px",
                          borderBottom: i < notificaciones.length - 1 ? `1px solid ${colors.borde}` : "none",
                          cursor: n.ticketId ? "pointer" : "default",
                        }}
                        onMouseEnter={(e) => (e.currentTarget.style.background = colors.fondo)}
                        onMouseLeave={(e) => (e.currentTarget.style.background = "white")}
                      >
                        <div style={{ display: "flex", gap: "10px", alignItems: "flex-start" }}>
                          <span
                            style={{
                              fontSize: "10px",
                              fontWeight: "700",
                              padding: "3px 7px",
                              borderRadius: "5px",
                              backgroundColor: c.bg,
                              color: c.color,
                              whiteSpace: "nowrap",
                              marginTop: "2px",
                            }}
                          >
                            {c.label}
                          </span>
                          <div>
                            <p style={{ margin: 0, fontSize: "12.5px", fontWeight: "700", color: colors.texto }}>
                              {n.titulo}
                            </p>
                            <p style={{ margin: "2px 0 0", fontSize: "11.5px", color: colors.textoSec }}>
                              {n.detalle}
                            </p>
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          )}
        </div>

        <div ref={correoRef} style={{ position: "relative" }}>
          <button
            onClick={() => {
              setPanelCorreo((v) => !v);
              setPanelNotif(false);
              setMenuAvatar(false);
              cargarCorreos();
            }}
            style={btnIcono}
            onMouseEnter={(e) => (e.currentTarget.style.background = colors.fondo)}
            onMouseLeave={(e) => (e.currentTarget.style.background = "none")}
          >
            <FaRegEnvelope style={{ fontSize: "22px" }} />
          </button>
          {panelCorreo && (
            <div style={panelStyle}>
              <div style={{ padding: "14px 18px", borderBottom: `1px solid ${colors.borde}` }}>
                <span style={{ fontWeight: "700", fontSize: "14px", color: colors.texto }}>
                  Tickets recientes
                </span>
              </div>
              <div style={{ maxHeight: "320px", overflowY: "auto" }}>
                {correos.length === 0 ? (
                  <div style={{ padding: "28px", textAlign: "center", color: colors.textoMuted, fontSize: "13px" }}>
                    Sin tickets recientes
                  </div>
                ) : (
                  correos.map((t, i) => (
                    <div
                      key={t.id || i}
                      style={{
                        padding: "12px 18px",
                        borderBottom: i < correos.length - 1 ? `1px solid ${colors.borde}` : "none",
                      }}
                    >
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "8px" }}>
                        <div>
                          <p style={{ margin: 0, fontSize: "12.5px", fontWeight: "700", color: colors.texto }}>
                            {t.nombre}
                          </p>
                          <p style={{ margin: "2px 0 0", fontSize: "11px", color: colors.textoSec }}>
                            {t.correo} · {t.area || "—"}
                          </p>
                        </div>
                        <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: "4px", flexShrink: 0 }}>
                          <span style={{ fontSize: "10px", fontWeight: "700", padding: "2px 7px", borderRadius: "5px", backgroundColor: colors.naranjaClaro, color: "#9a3412" }}>
                            {t.tipo}
                          </span>
                          <span style={{ fontSize: "10px", color: colors.textoMuted }}>#TK-{t.id}</span>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        <div style={{ width: "1px", height: "28px", backgroundColor: colors.borde, margin: "0 8px" }} />
        <div ref={avatarRef} style={{ position: "relative" }}>
          <div
            onClick={() => {
              setMenuAvatar((v) => !v);
              setPanelNotif(false);
              setPanelCorreo(false);
            }}
            style={{ display: "flex", alignItems: "center", gap: "10px", cursor: "pointer", padding: "6px 10px", borderRadius: "10px", transition: "background 0.15s" }}
            onMouseEnter={(e) => (e.currentTarget.style.background = colors.fondo)}
            onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
          >
            <div style={{ width: "38px", height: "38px", borderRadius: "50%", backgroundColor: colors.naranjaClaro, color: colors.naranja, display: "flex", alignItems: "center", justifyContent: "center", fontWeight: "800", fontSize: "13px", flexShrink: 0 }}>
              {getIniciales(usuario?.name)}
            </div>
            <div style={{ display: "flex", flexDirection: "column" }}>
              <span style={{ fontSize: "13px", fontWeight: "700", color: colors.texto, lineHeight: "1.2" }}>
                {usuario?.name || "Usuario"}
              </span>
              <span style={{ fontSize: "11px", color: colors.textoSec, marginTop: "1px" }}>
                {usuario?.areaNombre || usuario?.areaEmpresa || usuario?.role}
              </span>
            </div>
            <FaChevronDown style={{ color: colors.textoMuted, fontSize: "10px", transform: menuAvatar ? "rotate(180deg)" : "rotate(0deg)", transition: "transform 0.15s ease" }} />
          </div>

          {menuAvatar && (
            <div style={{ position: "absolute", top: "56px", right: 0, backgroundColor: "#fff", border: `1px solid ${colors.borde}`, borderRadius: "10px", boxShadow: "0 8px 24px rgba(15,23,42,0.12)", minWidth: "210px", overflow: "hidden", zIndex: 200 }}>
              <div style={{ padding: "14px 16px", borderBottom: `1px solid ${colors.borde}` }}>
                <p style={{ margin: 0, fontSize: "13px", fontWeight: "700", color: colors.texto }}>{usuario?.name}</p>
                <p style={{ margin: "3px 0 0", fontSize: "11.5px", color: colors.textoSec }}>{usuario?.email}</p>
                <p style={{ margin: "3px 0 0", fontSize: "11px", color: colors.naranja, fontWeight: "700" }}>
                  {usuario?.areaNombre || usuario?.areaEmpresa || usuario?.role}
                </p>
              </div>
              <div
                onClick={() => {
                  setMenuAvatar(false);
                  if (cerrarSesion) cerrarSesion();
                  navigate("/");
                }}
                style={{ display: "flex", alignItems: "center", gap: "10px", padding: "11px 16px", fontSize: "13px", fontWeight: "600", color: colors.rojo, cursor: "pointer" }}
                onMouseEnter={(e) => (e.currentTarget.style.background = "#fff0f0")}
                onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
              >
                <FaSignOutAlt style={{ fontSize: "13px" }} />
                Cerrar sesión
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}