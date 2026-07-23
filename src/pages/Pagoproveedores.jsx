import { useState, useEffect } from "react";
import Sidebar from "../components/Sidebar";
import Topbar from "../components/Topbar";
import { FaPlus, FaEnvelope, FaFileInvoiceDollar, FaCalendarAlt, FaPaperclip, FaFileAlt } from "react-icons/fa";

const colors = {
  naranja: "#ff7f22", naranjaOscuro: "#e66a10", naranjaClaro: "#fff1e6",
  texto: "#1e293b", textoSec: "#64748b", textoMuted: "#94a3b8",
  borde: "#eef1f5", fondo: "#FFF7F2", verde: "#16a34a", verdeClaro: "#e9f9ee",
};

const inputStyle = {
  padding: "10px 12px", borderRadius: "8px", border: `1px solid ${colors.borde}`,
  fontSize: "13px", color: colors.texto, outline: "none", background: "#fafbfc",
  fontFamily: "inherit", width: "100%", boxSizing: "border-box",
};

const labelStyle = {
  display: "block", fontSize: "11px", fontWeight: "700", color: colors.textoSec,
  marginBottom: "6px", textTransform: "uppercase", letterSpacing: "0.3px",
};

const formatoLempiras = (valor) =>
  `L. ${Number(valor || 0).toLocaleString("es-HN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

const fechaHoraActual = () => {
  const ahora = new Date();
  const fecha = ahora.toLocaleDateString("es-HN", { weekday: "long", day: "2-digit", month: "long", year: "numeric" });
  const hora = ahora.toLocaleTimeString("es-HN", { hour: "2-digit", minute: "2-digit" });
  return `${fecha} · ${hora}`;
};

export default function PagoProveedores({ usuario, cerrarSesion }) {
  const token = localStorage.getItem("token");
  // NUEVO: authHeaders ya NO fuerza Content-Type — cuando mandamos
  // FormData (con archivo), el navegador tiene que poner el
  // "multipart/form-data; boundary=..." él mismo. Si lo forzamos a
  // "application/json" aquí, el archivo llega corrupto/vacío al backend.
  const authHeaders = () => ({ Authorization: `Bearer ${token}` });

  const [pagos, setPagos] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [guardando, setGuardando] = useState(false);
  const [enviandoCorreoId, setEnviandoCorreoId] = useState(null);
  const [ahoraTexto, setAhoraTexto] = useState(fechaHoraActual());

  const [form, setForm] = useState({
    proveedor: "", fechaEntrega: "", valor: "", factura: "",
    descripcion: "", mesAPagar: "", recibidoPor: "",
  });
  const [archivo, setArchivo] = useState(null); // NUEVO: archivo de evidencia

  // Reloj vivo en el header — se actualiza cada minuto.
  useEffect(() => {
    const intervalo = setInterval(() => setAhoraTexto(fechaHoraActual()), 60000);
    return () => clearInterval(intervalo);
  }, []);

  const cargarPagos = async () => {
    setCargando(true);
    try {
      const res = await fetch("https://sistema-tickets-it.onrender.com/api/pagos-proveedores", { headers: authHeaders() });
      const data = await res.json();
      setPagos(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Error al cargar pagos:", error);
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => { cargarPagos(); }, []);

  // CAMBIO: ahora arma un FormData en vez de JSON.stringify, para poder
  // ir el archivo de evidencia en la misma petición.
  const guardarRegistro = async (e) => {
    e.preventDefault();
    if (!form.proveedor || !form.fechaEntrega || !form.valor || !form.factura || !form.mesAPagar || !form.recibidoPor) {
      alert("Completa todos los campos requeridos");
      return;
    }
    setGuardando(true);
    try {
      const datosForm = new FormData();
      Object.entries(form).forEach(([key, value]) => datosForm.append(key, value));
      if (archivo) {
        datosForm.append("archivo", archivo);
      }

      const res = await fetch("https://sistema-tickets-it.onrender.com/api/pagos-proveedores", {
        method: "POST",
        headers: authHeaders(),
        body: datosForm,
      });
      const data = await res.json();
      if (!res.ok) {
        alert(data.message || "No se pudo guardar el registro");
        return;
      }
      setForm({ proveedor: "", fechaEntrega: "", valor: "", factura: "", descripcion: "", mesAPagar: "", recibidoPor: "" });
      setArchivo(null);
      cargarPagos();
    } catch (error) {
      console.error(error);
      alert("Error al guardar el registro");
    } finally {
      setGuardando(false);
    }
  };

  // El backend ahora puede adjuntar el archivo guardado en este pago
  // (si existe) al correo — no hace falta cambiar nada aquí, solo que
  // el controller lo agregue como attachment.
  const enviarCorreo = async (pago) => {
    const correo = window.prompt(`¿A qué correo se le notifica la entrega de la factura ${pago.factura} (${pago.proveedor})?`);
    if (!correo || !correo.trim()) return;

    setEnviandoCorreoId(pago.id);
    try {
      const res = await fetch(`https://sistema-tickets-it.onrender.com/api/pagos-proveedores/${pago.id}/enviar-correo`, {
        method: "POST",
        headers: { ...authHeaders(), "Content-Type": "application/json" },
        body: JSON.stringify({ correoDestino: correo.trim() }),
      });
      const data = await res.json();
      if (!res.ok) {
        alert(data.message || "No se pudo enviar el correo");
        return;
      }
      alert(
        pago.archivoUrl
          ? `Correo enviado a ${correo.trim()} con la evidencia adjunta.`
          : `Correo enviado a ${correo.trim()}. (Este registro no tiene archivo adjunto.)`
      );
    } catch (error) {
      console.error(error);
      alert("Error al enviar el correo");
    } finally {
      setEnviandoCorreoId(null);
    }
  };

  const totalPagado = pagos.reduce((acc, p) => acc + Number(p.valor || 0), 0);
  const mesActualTexto = new Date().toLocaleDateString("es-HN", { month: "long", year: "numeric" });

  return (
    <div style={{ display: "flex", minHeight: "100vh", backgroundColor: colors.fondo, fontFamily: "'Segoe UI', sans-serif" }}>
      <link href="https://fonts.googleapis.com/css2?family=Manrope:wght@500;700;800&display=swap" rel="stylesheet" />
      <Sidebar usuario={usuario} cerrarSesion={cerrarSesion} />

      <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>
        <Topbar usuario={usuario} cerrarSesion={cerrarSesion} />

        <div style={{ flex: 1, overflowY: "auto", padding: "24px 28px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "18px", flexWrap: "wrap", gap: "8px" }}>
            <div>
              <h1 style={{ margin: "0 0 4px", fontSize: "20px", fontWeight: "800", color: colors.texto, fontFamily: "'Manrope', sans-serif" }}>
                Pago de Proveedores
              </h1>
              <p style={{ margin: 0, fontSize: "12px", color: colors.textoSec }}>
                Gestión y registro de pagos a proveedores
              </p>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: "7px", fontSize: "12px", color: colors.textoSec, background: "#fff", border: `1px solid ${colors.borde}`, borderRadius: "20px", padding: "7px 14px" }}>
              <FaCalendarAlt style={{ color: colors.naranja, fontSize: "12px" }} />
              <span style={{ textTransform: "capitalize" }}>{ahoraTexto}</span>
            </div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: "16px", marginBottom: "20px" }}>
            <div style={{ background: "#fff", borderRadius: "12px", border: `1px solid ${colors.borde}`, borderTop: `3px solid ${colors.naranja}`, padding: "16px 18px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                <div style={{ width: "34px", height: "34px", borderRadius: "9px", background: colors.naranjaClaro, color: colors.naranja, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "14px" }}>
                  <FaFileInvoiceDollar />
                </div>
                <div>
                  <div style={{ fontSize: "18px", fontWeight: "800", color: colors.texto, fontFamily: "'Manrope', sans-serif" }}>{pagos.length}</div>
                  <div style={{ fontSize: "11.5px", color: colors.textoSec }}>Pagos registrados</div>
                </div>
              </div>
            </div>
            <div style={{ background: "#fff", borderRadius: "12px", border: `1px solid ${colors.borde}`, borderTop: `3px solid #2563eb`, padding: "16px 18px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                <div style={{ width: "34px", height: "34px", borderRadius: "9px", background: "#eff6ff", color: "#2563eb", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "14px" }}>
                  <FaCalendarAlt />
                </div>
                <div>
                  <div style={{ fontSize: "14px", fontWeight: "800", color: colors.texto, fontFamily: "'Manrope', sans-serif", textTransform: "capitalize" }}>{mesActualTexto}</div>
                  <div style={{ fontSize: "11.5px", color: colors.textoSec }}>Periodo actual</div>
                </div>
              </div>
            </div>
          </div>

          <div style={{ background: "#fff", borderRadius: "12px", border: `1px solid ${colors.borde}`, padding: "24px", marginBottom: "20px" }}>
            <h3 style={{ margin: "0 0 18px", fontSize: "14px", fontWeight: "700", color: colors.texto, display: "flex", alignItems: "center", gap: "8px" }}>
              <FaPlus style={{ color: colors.naranja, fontSize: "12px" }} /> Nuevo Registro de Pago
            </h3>
            <form onSubmit={guardarRegistro}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px", marginBottom: "16px" }}>
                <div>
                  <label style={labelStyle}>Proveedor</label>
                  <input placeholder="Nombre del proveedor" value={form.proveedor}
                    onChange={(e) => setForm({ ...form, proveedor: e.target.value })} style={inputStyle}
                    onFocus={(e) => (e.target.style.borderColor = colors.naranja)}
                    onBlur={(e) => (e.target.style.borderColor = colors.borde)} />
                </div>
                <div>
                  <label style={labelStyle}>Fecha de Entrega</label>
                  <input type="date" value={form.fechaEntrega}
                    onChange={(e) => setForm({ ...form, fechaEntrega: e.target.value })} style={inputStyle}
                    onFocus={(e) => (e.target.style.borderColor = colors.naranja)}
                    onBlur={(e) => (e.target.style.borderColor = colors.borde)} />
                </div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px", marginBottom: "16px" }}>
                <div>
                  <label style={labelStyle}>Valor (L.)</label>
                  <div style={{ position: "relative" }}>
                    <span style={{ position: "absolute", left: "10px", top: "50%", transform: "translateY(-50%)", color: colors.textoMuted, fontSize: "13px", fontWeight: "700" }}>L.</span>
                    <input type="number" step="0.01" placeholder="0.00" value={form.valor}
                      onChange={(e) => setForm({ ...form, valor: e.target.value })} style={{ ...inputStyle, paddingLeft: "28px" }}
                      onFocus={(e) => (e.target.style.borderColor = colors.naranja)}
                      onBlur={(e) => (e.target.style.borderColor = colors.borde)} />
                  </div>
                </div>
                <div>
                  <label style={labelStyle}>Factura</label>
                  <input placeholder="Nro. de factura" value={form.factura}
                    onChange={(e) => setForm({ ...form, factura: e.target.value })} style={inputStyle}
                    onFocus={(e) => (e.target.style.borderColor = colors.naranja)}
                    onBlur={(e) => (e.target.style.borderColor = colors.borde)} />
                </div>
              </div>

              <div style={{ marginBottom: "16px" }}>
                <label style={labelStyle}>Descripción</label>
                <input placeholder="Detalle del pago" value={form.descripcion}
                  onChange={(e) => setForm({ ...form, descripcion: e.target.value })} style={inputStyle}
                  onFocus={(e) => (e.target.style.borderColor = colors.naranja)}
                  onBlur={(e) => (e.target.style.borderColor = colors.borde)} />
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px", marginBottom: "16px" }}>
                <div>
                  <label style={labelStyle}>Mes a Pagar</label>
                  <input placeholder="Ej: Enero 2026" value={form.mesAPagar}
                    onChange={(e) => setForm({ ...form, mesAPagar: e.target.value })} style={inputStyle}
                    onFocus={(e) => (e.target.style.borderColor = colors.naranja)}
                    onBlur={(e) => (e.target.style.borderColor = colors.borde)} />
                </div>
                <div>
                  <label style={labelStyle}>Recibido Por</label>
                  <input placeholder="Nombre de quien recibe" value={form.recibidoPor}
                    onChange={(e) => setForm({ ...form, recibidoPor: e.target.value })} style={inputStyle}
                    onFocus={(e) => (e.target.style.borderColor = colors.naranja)}
                    onBlur={(e) => (e.target.style.borderColor = colors.borde)} />
                </div>
              </div>

              {/* NUEVO: adjuntar evidencia de la factura (foto/PDF/scan) */}
              <div style={{ marginBottom: "20px" }}>
                <label style={labelStyle}>Evidencia de Factura (foto o PDF)</label>
                <label
                  htmlFor="archivo-evidencia"
                  style={{
                    display: "flex", alignItems: "center", gap: "10px", padding: "12px 14px",
                    borderRadius: "8px", border: `1.5px dashed ${colors.borde}`, background: "#fafbfc",
                    cursor: "pointer", fontSize: "13px", color: archivo ? colors.texto : colors.textoMuted,
                  }}
                >
                  <FaPaperclip style={{ color: colors.naranja }} />
                  {archivo ? archivo.name : "Selecciona una imagen o PDF de la factura entregada..."}
                </label>
                <input
                  id="archivo-evidencia"
                  type="file"
                  accept="image/*,.pdf"
                  onChange={(e) => setArchivo(e.target.files?.[0] || null)}
                  style={{ display: "none" }}
                />
                <p style={{ margin: "6px 0 0", fontSize: "11px", color: colors.textoMuted }}>
                  Este archivo queda guardado como evidencia y se puede adjuntar al enviar el correo de notificación.
                </p>
              </div>

              <button type="submit" disabled={guardando}
                style={{ padding: "11px 24px", background: colors.naranja, color: "white", border: "none", borderRadius: "9px", fontWeight: "700", fontSize: "13px", cursor: "pointer", fontFamily: "inherit" }}
                onMouseEnter={(e) => (e.currentTarget.style.background = colors.naranjaOscuro)}
                onMouseLeave={(e) => (e.currentTarget.style.background = colors.naranja)}>
                {guardando ? "Guardando..." : "Guardar Registro"}
              </button>
            </form>
          </div>

          <div style={{ background: "#fff", borderRadius: "12px", border: `1px solid ${colors.borde}`, overflow: "hidden" }}>
            <div style={{ padding: "16px 20px", borderBottom: `1px solid ${colors.borde}` }}>
              <h3 style={{ margin: 0, fontSize: "14px", fontWeight: "700", color: colors.texto, display: "flex", alignItems: "center", gap: "8px" }}>
                <span style={{ width: "4px", height: "16px", background: colors.naranja, borderRadius: "2px", display: "inline-block" }} />
                Registro de Pagos
              </h3>
            </div>

            <div style={{ overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse" }}>
                <thead>
                  <tr style={{ background: colors.fondo, color: colors.textoSec, fontSize: "11px" }}>
                    {["Proveedor", "Fecha de Entrega", "Valor", "Descripción", "Factura", "Mes a Pagar", "Recibido", "Evidencia", ""].map((h) => (
                      <th key={h} style={{ padding: "12px 16px", textAlign: "left", fontWeight: "700", textTransform: "uppercase", letterSpacing: "0.3px" }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {cargando ? (
                    <tr><td colSpan="9" style={{ padding: "30px", textAlign: "center", color: colors.textoMuted, fontSize: "13px" }}>Cargando registros...</td></tr>
                  ) : pagos.length === 0 ? (
                    <tr><td colSpan="9" style={{ padding: "30px", textAlign: "center", color: colors.textoMuted, fontSize: "13px" }}>No hay pagos registrados todavía.</td></tr>
                  ) : (
                    pagos.map((p) => (
                      <tr
                        key={p.id}
                        style={{ borderBottom: `1px solid ${colors.fondo}`, transition: "background-color 0.12s ease" }}
                        onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = colors.fondo)}
                        onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "transparent")}
                      >
                        <td style={{ padding: "13px 16px", fontSize: "13px", color: colors.texto, fontWeight: "700" }}>{p.proveedor}</td>
                        <td style={{ padding: "13px 16px", fontSize: "12.5px", color: colors.textoSec }}>
                          {new Date(p.fechaEntrega).toLocaleDateString("es-HN")}
                        </td>
                        <td style={{ padding: "13px 16px", fontSize: "13px", color: colors.verde, fontWeight: "700" }}>
                          {formatoLempiras(p.valor)}
                        </td>
                        <td style={{ padding: "13px 16px", fontSize: "12.5px", color: colors.textoSec }}>{p.descripcion || "—"}</td>
                        <td style={{ padding: "13px 16px", fontSize: "12.5px", color: colors.textoSec }}>{p.factura}</td>
                        <td style={{ padding: "13px 16px" }}>
                          <span style={{ padding: "3px 10px", borderRadius: "20px", fontSize: "11px", fontWeight: "700", background: colors.naranjaClaro, color: colors.naranja }}>
                            {p.mesAPagar}
                          </span>
                        </td>
                        <td style={{ padding: "13px 16px", fontSize: "12.5px", color: colors.textoSec }}>{p.recibidoPor}</td>
                        {/* NUEVO: columna de evidencia — link al archivo si existe */}
                        <td style={{ padding: "13px 16px" }}>
                          {p.archivoUrl ? (
                            <a
                              href={`https://sistema-tickets-it.onrender.com${p.archivoUrl}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              style={{ display: "inline-flex", alignItems: "center", gap: "5px", fontSize: "11.5px", color: "#2563eb", fontWeight: "700", textDecoration: "none" }}
                            >
                              <FaFileAlt style={{ fontSize: "10px" }} /> Ver archivo
                            </a>
                          ) : (
                            <span style={{ fontSize: "11px", color: colors.textoMuted }}>—</span>
                          )}
                        </td>
                        <td style={{ padding: "13px 16px" }}>
                          <button
                            onClick={() => enviarCorreo(p)}
                            disabled={enviandoCorreoId === p.id}
                            style={{ display: "flex", alignItems: "center", gap: "6px", padding: "6px 12px", borderRadius: "7px", border: "none", background: colors.naranjaClaro, color: colors.naranja, fontSize: "11.5px", fontWeight: "700", cursor: "pointer", whiteSpace: "nowrap" }}
                          >
                            <FaEnvelope style={{ fontSize: "10px" }} /> {enviandoCorreoId === p.id ? "Enviando..." : "Enviar por Correo"}
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
                {pagos.length > 0 && (
                  <tfoot>
                    <tr style={{ background: colors.fondo }}>
                      <td colSpan="2" style={{ padding: "12px 16px", fontSize: "12.5px", fontWeight: "700", color: colors.texto }}>Total</td>
                      <td style={{ padding: "12px 16px", fontSize: "13px", fontWeight: "800", color: colors.naranja }}>{formatoLempiras(totalPagado)}</td>
                      <td colSpan="6" />
                    </tr>
                  </tfoot>
                )}
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
