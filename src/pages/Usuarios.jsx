import { useState, useEffect } from "react";
import Sidebar from "../components/Sidebar";
import Topbar from "../components/Topbar";
import {
  FaBuilding, FaUserPlus, FaPlus, FaTrash, FaPlaneDeparture, FaTimes,
} from "react-icons/fa";

const colors = {
  naranja: "#ff7f22", naranjaOscuro: "#e66a10", naranjaClaro: "#fff1e6",
  texto: "#1e293b", textoSec: "#64748b", textoMuted: "#94a3b8",
  borde: "#eef1f5", fondo: "#FFF7F2", verde: "#16a34a", verdeClaro: "#e9f9ee",
  rojo: "#dc2626", rojoClaro: "#fee2e2", azul: "#2563eb", azulClaro: "#eff6ff",
  amarillo: "#d97706", amarilloClaro: "#fef3e2", morado: "#7c3aed", moradoClaro: "#f3e8ff",
};

const inputStyle = {
  padding: "10px 12px", borderRadius: "8px", border: `1px solid ${colors.borde}`,
  fontSize: "13px", color: colors.texto, outline: "none", background: "#fafbfc",
  fontFamily: "inherit", width: "100%", boxSizing: "border-box",
};

const generarUsername = (nombre, areaNombre) => {
  const normalizar = (t) =>
    t.normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-zA-Z0-9]/g, "").toLowerCase();
  return `${normalizar(nombre)}.${normalizar(areaNombre || "it")}`;
};

const badgeRol = (role) => {
  if (role === "SUPERADMIN") return { bg: colors.rojoClaro, color: colors.rojo };
  if (role === "ADMIN") return { bg: colors.azulClaro, color: colors.azul };
  return { bg: "#f1f5f9", color: colors.textoSec };
};

const estadoAusencia = (u) => {
  if (!u.ausenteHasta) return null;
  const ahora = new Date();
  const hasta = new Date(u.ausenteHasta);
  const desde = u.ausenteDesde ? new Date(u.ausenteDesde) : null;

  if (hasta < ahora) return null;
  if (desde && desde > ahora) return "programada"; 
  return "activa";
};

export default function Usuarios({ usuario, cerrarSesion }) {
  const token = localStorage.getItem("token");
  const authHeaders = () => ({ "Content-Type": "application/json", Authorization: `Bearer ${token}` });

  const [usuarios, setUsuarios] = useState([]);
  const [areas, setAreas] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [guardandoUsuario, setGuardandoUsuario] = useState(false);
  const [guardandoArea, setGuardandoArea] = useState(false);

  const [nuevaArea, setNuevaArea] = useState("");
  const [nuevaAreaEsIT, setNuevaAreaEsIT] = useState(false);
  const [nuevoUsuario, setNuevoUsuario] = useState({
    name: "", email: "", password: "", areaId: "", role: "ADMIN",
  });

  const [editandoAusenciaId, setEditandoAusenciaId] = useState(null);
  const [fechaDesde, setFechaDesde] = useState("");
  const [fechaHasta, setFechaHasta] = useState("");
  const [guardandoAusencia, setGuardandoAusencia] = useState(false);

  const cargarDatos = async () => {
    setCargando(true);
    try {
      const [resUsers, resAreas] = await Promise.all([
        fetch("http://localhost:3000/api/usuarios", { headers: authHeaders() }),
        fetch("http://localhost:3000/api/areas-it"),
      ]);
      const dataUsers = await resUsers.json();
      const dataAreas = await resAreas.json();
      setUsuarios(Array.isArray(dataUsers) ? dataUsers : []);
      setAreas(Array.isArray(dataAreas) ? dataAreas : []);
    } catch (error) {
      console.error("Error al cargar datos:", error);
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => { cargarDatos(); }, []);

  const handleCrearArea = async (e) => {
    e.preventDefault();
    if (!nuevaArea.trim()) return;
    setGuardandoArea(true);
    try {
      const res = await fetch("http://localhost:3000/api/areas-it", {
        method: "POST",
        headers: authHeaders(),
        body: JSON.stringify({ nombre: nuevaArea.trim(), esAreaIT: nuevaAreaEsIT }),
      });
      const data = await res.json();
      if (!res.ok) {
        alert(data.message || "No se pudo crear el área");
        return;
      }
      setNuevaArea("");
      setNuevaAreaEsIT(false);
      cargarDatos();
    } catch (error) {
      console.error(error);
      alert("Error al crear el área");
    } finally {
      setGuardandoArea(false);
    }
  };

  const handleEliminarArea = async (id, nombre) => {
    if (!window.confirm(`¿Eliminar el área "${nombre}"? Esto no elimina a los usuarios que pertenecen a ella.`)) return;
    try {
      await fetch(`http://localhost:3000/api/areas-it/${id}`, { method: "DELETE", headers: authHeaders() });
      cargarDatos();
    } catch (error) {
      console.error(error);
      alert("No se pudo eliminar el área");
    }
  };

  const handleCrearUsuario = async (e) => {
    e.preventDefault();
    if (!nuevoUsuario.name.trim() || !nuevoUsuario.email.trim() || !nuevoUsuario.password.trim()) {
      alert("Completa nombre, correo y contraseña");
      return;
    }
    if (nuevoUsuario.role !== "USER" && !nuevoUsuario.areaId) {
      alert("Selecciona un área para ADMIN/SUPERADMIN");
      return;
    }

    setGuardandoUsuario(true);
    const areaSeleccionada = areas.find((a) => a.id === Number(nuevoUsuario.areaId));
    const username = generarUsername(nuevoUsuario.name, areaSeleccionada?.nombre);

    const payload = {
      username,
      name: nuevoUsuario.name.trim(),
      email: nuevoUsuario.email.trim().toLowerCase(),
      password: nuevoUsuario.password,
      role: nuevoUsuario.role,
      ...(nuevoUsuario.role === "USER"
        ? { areaEmpresa: areaSeleccionada?.nombre || null }
        : { areaId: Number(nuevoUsuario.areaId) }),
    };

    try {
      const res = await fetch("http://localhost:3000/api/usuarios", {
        method: "POST",
        headers: authHeaders(),
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) {
        alert(data.message || "No se pudo crear el usuario");
        return;
      }
      alert(
        data.correoEnviado
          ? `Colaborador creado. Usuario: ${username}\nSe le envió su contraseña temporal por correo.`
          : `Colaborador creado. Usuario: ${username}\nNo se pudo enviar el correo — comunícale la contraseña temporal manualmente.`
      );
      setNuevoUsuario({ name: "", email: "", password: "", areaId: "", role: "ADMIN" });
      cargarDatos();
    } catch (error) {
      console.error(error);
      alert("Error al crear el usuario");
    } finally {
      setGuardandoUsuario(false);
    }
  };

  const handleCambiarRol = async (id, nuevoRol) => {
    try {
      const res = await fetch(`http://localhost:3000/api/usuarios/${id}`, {
        method: "PUT",
        headers: authHeaders(),
        body: JSON.stringify({ role: nuevoRol }),
      });
      if (!res.ok) {
        const data = await res.json();
        alert(data.message || "No se pudo cambiar el rol");
        return;
      }
      cargarDatos();
    } catch (error) {
      console.error(error);
      alert("Error al cambiar el rol");
    }
  };

  const handleEliminarUsuario = async (id, nombre) => {
    if (!window.confirm(`¿Dar de baja a "${nombre}"? Esta acción no se puede deshacer.`)) return;
    try {
      const res = await fetch(`http://localhost:3000/api/usuarios/${id}`, {
        method: "DELETE",
        headers: authHeaders(),
      });
      const data = await res.json();
      if (!res.ok) {
        alert(data.message || "No se pudo eliminar el usuario");
        return;
      }
      cargarDatos();
    } catch (error) {
      console.error(error);
      alert("Error al eliminar el usuario");
    }
  };

  const abrirEditorAusencia = (u) => {
    setEditandoAusenciaId(u.id);
    setFechaDesde(u.ausenteDesde ? new Date(u.ausenteDesde).toISOString().slice(0, 10) : "");
    setFechaHasta(u.ausenteHasta ? new Date(u.ausenteHasta).toISOString().slice(0, 10) : "");
  };

  const guardarAusencia = async (id) => {
    if (!fechaDesde || !fechaHasta) {
      alert("Selecciona la fecha de inicio y la fecha de fin de la ausencia");
      return;
    }
    if (fechaHasta < fechaDesde) {
      alert("La fecha de fin no puede ser anterior a la fecha de inicio");
      return;
    }
    setGuardandoAusencia(true);
    try {
      const res = await fetch(`http://localhost:3000/api/usuarios/${id}/ausencia`, {
        method: "PUT",
        headers: authHeaders(),
        body: JSON.stringify({ desde: fechaDesde, hasta: fechaHasta }),
      });
      const data = await res.json();
      if (!res.ok) { alert(data.message || "No se pudo guardar"); return; }
      setEditandoAusenciaId(null);
      setFechaDesde("");
      setFechaHasta("");
      cargarDatos();
    } catch (error) {
      console.error(error);
      alert("Error al guardar la ausencia");
    } finally {
      setGuardandoAusencia(false);
    }
  };

  const cancelarAusencia = async (id) => {
    try {
      const res = await fetch(`http://localhost:3000/api/usuarios/${id}/ausencia`, {
        method: "PUT",
        headers: authHeaders(),
        body: JSON.stringify({ desde: null, hasta: null }),
      });
      if (!res.ok) {
        const data = await res.json();
        alert(data.message || "No se pudo cancelar la ausencia");
        return;
      }
      cargarDatos();
    } catch (error) {
      console.error(error);
      alert("Error al cancelar la ausencia");
    }
  };

  return (
    <div style={{ display: "flex", minHeight: "100vh", backgroundColor: colors.fondo, fontFamily: "'Segoe UI', sans-serif" }}>
      <link href="https://fonts.googleapis.com/css2?family=Manrope:wght@500;700;800&display=swap" rel="stylesheet" />
      <Sidebar usuario={usuario} cerrarSesion={cerrarSesion} />

      <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>
        <Topbar usuario={usuario} cerrarSesion={cerrarSesion} />

        <div style={{ flex: 1, overflowY: "auto", padding: "24px 28px" }}>
          <h1 style={{ margin: "0 0 4px", fontSize: "20px", fontWeight: "800", color: colors.texto, fontFamily: "'Manrope', sans-serif" }}>
            Panel de Control Estructural — IT
          </h1>
          <p style={{ margin: "0 0 20px", fontSize: "12px", color: colors.textoSec }}>
            Gestiona las áreas de la empresa y quién tiene acceso al sistema
          </p>

          <div style={{ background: "#fff", borderRadius: "12px", border: `1px solid ${colors.borde}`, padding: "20px", marginBottom: "18px" }}>
            <h3 style={{ margin: "0 0 14px", fontSize: "13.5px", fontWeight: "700", color: colors.texto, display: "flex", alignItems: "center", gap: "8px" }}>
              <FaBuilding style={{ color: colors.naranja }} /> Áreas de la Empresa
            </h3>
            <form onSubmit={handleCrearArea} style={{ display: "flex", gap: "10px", marginBottom: "16px", alignItems: "center" }}>
              <input
                type="text"
                placeholder="Ej. Soporte Técnico, Desarrollo Web, Infraestructura..."
                value={nuevaArea}
                onChange={(e) => setNuevaArea(e.target.value)}
                style={inputStyle}
                onFocus={(e) => (e.target.style.borderColor = colors.naranja)}
                onBlur={(e) => (e.target.style.borderColor = colors.borde)}
              />
              <label style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "12px", color: colors.textoSec, whiteSpace: "nowrap", cursor: "pointer" }}>
                <input type="checkbox" checked={nuevaAreaEsIT} onChange={(e) => setNuevaAreaEsIT(e.target.checked)} />
                ¿Es área de IT?
              </label>
              <button type="submit" disabled={guardandoArea}
                style={{ display: "flex", alignItems: "center", gap: "7px", padding: "0 18px", borderRadius: "9px", border: "none", background: colors.texto, color: "white", fontSize: "13px", fontWeight: "700", cursor: "pointer", whiteSpace: "nowrap", fontFamily: "inherit" }}>
                <FaPlus style={{ fontSize: "11px" }} /> {guardandoArea ? "Guardando..." : "Registrar Área"}
              </button>
            </form>
            <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
              {areas.map((a) => (
                <span key={a.id} style={{ display: "inline-flex", alignItems: "center", gap: "8px", padding: "6px 14px", borderRadius: "20px", background: colors.fondo, border: `1px solid ${colors.borde}`, fontSize: "12.5px" }}>
                  <strong style={{ color: colors.texto }}>{a.nombre}</strong>
                  {a.esAreaIT && (
                    <span style={{ fontSize: "9.5px", fontWeight: "800", color: colors.naranja, background: colors.naranjaClaro, padding: "1px 6px", borderRadius: "8px" }}>IT</span>
                  )}
                  <FaTrash
                    onClick={() => handleEliminarArea(a.id, a.nombre)}
                    style={{ fontSize: "10px", color: colors.rojo, cursor: "pointer" }}
                  />
                </span>
              ))}
              {areas.length === 0 && !cargando && (
                <span style={{ fontSize: "12.5px", color: colors.textoMuted }}>Todavía no hay áreas registradas.</span>
              )}
            </div>
          </div>

          <div style={{ background: "#fff", borderRadius: "12px", border: `1px solid ${colors.borde}`, padding: "20px", marginBottom: "18px" }}>
            <h3 style={{ margin: "0 0 14px", fontSize: "13.5px", fontWeight: "700", color: colors.texto, display: "flex", alignItems: "center", gap: "8px" }}>
              <FaUserPlus style={{ color: colors.naranja }} /> Registrar Asesores y Personal
            </h3>
            <form onSubmit={handleCrearUsuario} style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: "12px" }}>
              <input
                type="text" placeholder="Nombre completo" required
                value={nuevoUsuario.name}
                onChange={(e) => setNuevoUsuario({ ...nuevoUsuario, name: e.target.value })}
                style={inputStyle}
                onFocus={(e) => (e.target.style.borderColor = colors.naranja)}
                onBlur={(e) => (e.target.style.borderColor = colors.borde)}
              />
              <input
                type="email" placeholder="correo@baprosa.com" required
                value={nuevoUsuario.email}
                onChange={(e) => setNuevoUsuario({ ...nuevoUsuario, email: e.target.value })}
                style={inputStyle}
                onFocus={(e) => (e.target.style.borderColor = colors.naranja)}
                onBlur={(e) => (e.target.style.borderColor = colors.borde)}
              />
              <input
                type="password" placeholder="Contraseña temporal inicial" required
                value={nuevoUsuario.password}
                onChange={(e) => setNuevoUsuario({ ...nuevoUsuario, password: e.target.value })}
                style={inputStyle}
                onFocus={(e) => (e.target.style.borderColor = colors.naranja)}
                onBlur={(e) => (e.target.style.borderColor = colors.borde)}
              />
              <select
                value={nuevoUsuario.areaId}
                onChange={(e) => setNuevoUsuario({ ...nuevoUsuario, areaId: e.target.value })}
                style={inputStyle}
              >
                <option value="">Asignar área...</option>
                {areas.map((a) => (
                  <option key={a.id} value={a.id}>{a.nombre}</option>
                ))}
              </select>
              <select
                value={nuevoUsuario.role}
                onChange={(e) => setNuevoUsuario({ ...nuevoUsuario, role: e.target.value })}
                style={inputStyle}
              >
                <option value="ADMIN">ADMIN (Asesor Técnico)</option>
                <option value="SUPERADMIN">SUPERADMIN</option>
                <option value="USER">USER (Empleado General)</option>
              </select>
              <button type="submit" disabled={guardandoUsuario}
                style={{ padding: "10px", background: colors.naranja, color: "white", border: "none", borderRadius: "8px", cursor: "pointer", fontWeight: "700", fontSize: "13px", fontFamily: "inherit" }}
                onMouseEnter={(e) => (e.currentTarget.style.background = colors.naranjaOscuro)}
                onMouseLeave={(e) => (e.currentTarget.style.background = colors.naranja)}>
                {guardandoUsuario ? "Guardando..." : "Guardar Colaborador"}
              </button>
            </form>
            <p style={{ margin: "10px 0 0", fontSize: "11.5px", color: colors.textoMuted }}>
              Se le enviará esta contraseña por correo, marcada como temporal — el sistema le pedirá cambiarla al iniciar sesión.
            </p>
          </div>

          <div style={{ background: "#fff", borderRadius: "12px", border: `1px solid ${colors.borde}`, overflow: "hidden" }}>
            {cargando ? (
              <p style={{ padding: "30px", textAlign: "center", color: colors.textoSec, fontSize: "13px" }}>Cargando usuarios...</p>
            ) : usuarios.length === 0 ? (
              <p style={{ padding: "30px", textAlign: "center", color: colors.textoMuted, fontSize: "13px" }}>No hay usuarios registrados todavía.</p>
            ) : (
              <table style={{ width: "100%", borderCollapse: "collapse" }}>
                <thead>
                  <tr style={{ background: "#1e293b" }}>
                    {["Nombre Completo", "Cuenta / Área", "Permisos del Sistema", "Ausencia", "Gestión Operativa"].map((h) => (
                      <th key={h} style={{ padding: "13px 16px", fontSize: "12.5px", color: "white", textAlign: "left", fontWeight: "700" }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {usuarios.map((u) => {
                    const badge = badgeRol(u.role);
                    const estado = estadoAusencia(u); // "activa" | "programada" | null
                    const editandoEsta = editandoAusenciaId === u.id;
                    return (
                      <tr key={u.id} style={{ borderBottom: `1px solid ${colors.fondo}` }}>
                        <td style={{ padding: "13px 16px", fontSize: "13px", color: colors.texto, fontWeight: "600" }}>{u.name}</td>
                        <td style={{ padding: "13px 16px", fontSize: "12.5px", color: colors.textoSec }}>
                          {u.email}
                          <div style={{ fontSize: "11px", color: colors.textoMuted }}>{u.area?.nombre || u.areaEmpresa || "—"}</div>
                        </td>
                        <td style={{ padding: "13px 16px" }}>
                          <select
                            value={u.role}
                            onChange={(e) => handleCambiarRol(u.id, e.target.value)}
                            disabled={u.id === usuario?.id}
                            style={{
                              padding: "5px 10px", borderRadius: "7px", border: "none", fontSize: "12px", fontWeight: "700",
                              background: badge.bg, color: badge.color, cursor: u.id === usuario?.id ? "not-allowed" : "pointer",
                            }}
                          >
                            <option value="USER">USER</option>
                            <option value="ADMIN">ADMIN</option>
                            <option value="SUPERADMIN">SUPERADMIN</option>
                          </select>
                        </td>
                        <td style={{ padding: "13px 16px", minWidth: "220px" }}>
                          {u.role === "USER" ? (
                            <span style={{ fontSize: "11.5px", color: colors.textoMuted }}>No aplica</span>
                          ) : editandoEsta ? (
                            <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                              <div style={{ display: "flex", gap: "6px", alignItems: "center" }}>
                                <span style={{ fontSize: "10.5px", color: colors.textoMuted, width: "34px" }}>Desde</span>
                                <input
                                  type="date"
                                  value={fechaDesde}
                                  onChange={(e) => setFechaDesde(e.target.value)}
                                  style={{ ...inputStyle, padding: "6px 8px", fontSize: "12px", width: "130px" }}
                                />
                              </div>
                              <div style={{ display: "flex", gap: "6px", alignItems: "center" }}>
                                <span style={{ fontSize: "10.5px", color: colors.textoMuted, width: "34px" }}>Hasta</span>
                                <input
                                  type="date"
                                  value={fechaHasta}
                                  min={fechaDesde || undefined}
                                  onChange={(e) => setFechaHasta(e.target.value)}
                                  style={{ ...inputStyle, padding: "6px 8px", fontSize: "12px", width: "130px" }}
                                />
                                <button
                                  onClick={() => guardarAusencia(u.id)}
                                  disabled={guardandoAusencia}
                                  title="Guardar"
                                  style={{ background: colors.verde, color: "#fff", border: "none", borderRadius: "6px", padding: "6px 9px", cursor: "pointer", fontSize: "11px", fontWeight: "700" }}
                                >
                                  ✓
                                </button>
                                <FaTimes
                                  onClick={() => { setEditandoAusenciaId(null); setFechaDesde(""); setFechaHasta(""); }}
                                  style={{ cursor: "pointer", color: colors.textoMuted, fontSize: "13px" }}
                                />
                              </div>
                            </div>
                          ) : estado === "activa" ? (
                            <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
                              <span style={{ display: "flex", alignItems: "center", gap: "5px", fontSize: "11px", fontWeight: "700", color: colors.amarillo, background: colors.amarilloClaro, padding: "4px 10px", borderRadius: "20px" }}>
                                <FaPlaneDeparture style={{ fontSize: "10px" }} />
                                Ausente hasta {new Date(u.ausenteHasta).toLocaleDateString("es-HN")}
                              </span>
                              <button
                                onClick={() => cancelarAusencia(u.id)}
                                style={{ fontSize: "11px", color: colors.textoSec, background: "none", border: `1px solid ${colors.borde}`, borderRadius: "6px", padding: "3px 8px", cursor: "pointer" }}
                              >
                                Cancelar
                              </button>
                            </div>
                          ) : estado === "programada" ? (
                            <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
                              <span style={{ display: "flex", alignItems: "center", gap: "5px", fontSize: "11px", fontWeight: "700", color: colors.morado, background: colors.moradoClaro, padding: "4px 10px", borderRadius: "20px" }}>
                                <FaPlaneDeparture style={{ fontSize: "10px" }} />
                                Del {new Date(u.ausenteDesde).toLocaleDateString("es-HN")} al {new Date(u.ausenteHasta).toLocaleDateString("es-HN")}
                              </span>
                              <button
                                onClick={() => cancelarAusencia(u.id)}
                                style={{ fontSize: "11px", color: colors.textoSec, background: "none", border: `1px solid ${colors.borde}`, borderRadius: "6px", padding: "3px 8px", cursor: "pointer" }}
                              >
                                Cancelar
                              </button>
                            </div>
                          ) : (
                            <button
                              onClick={() => abrirEditorAusencia(u)}
                              style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "11.5px", color: colors.textoSec, background: "#f8fafc", border: `1px solid ${colors.borde}`, borderRadius: "7px", padding: "5px 10px", cursor: "pointer", fontWeight: "600" }}
                            >
                              <FaPlaneDeparture style={{ fontSize: "10px" }} /> Marcar ausencia
                            </button>
                          )}
                        </td>
                        <td style={{ padding: "13px 16px" }}>
                          <button
                            onClick={() => handleEliminarUsuario(u.id, u.name)}
                            disabled={u.id === usuario?.id}
                            style={{
                              padding: "6px 14px", background: u.id === usuario?.id ? "#f1f5f9" : colors.rojoClaro,
                              color: u.id === usuario?.id ? colors.textoMuted : colors.rojo, border: "none", borderRadius: "7px",
                              cursor: u.id === usuario?.id ? "not-allowed" : "pointer", fontSize: "12px", fontWeight: "700",
                            }}
                          >
                            Dar de baja
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}