import { useState, useEffect, useCallback } from "react";
import Sidebar from "../components/Sidebar";
import Topbar from "../components/Topbar";
import {
  FaSearch, FaPlus, FaExclamationTriangle, FaTimes, FaSignOutAlt,
} from "react-icons/fa";

const colors = {
  naranja: "#ff7f22", naranjaOscuro: "#e66a10", naranjaClaro: "#fff1e6",
  texto: "#1e293b", textoSec: "#64748b", textoMuted: "#94a3b8",
  borde: "#eef1f5", fondo: "#FFF7F2", verde: "#16a34a",
  rojo: "#dc2626", rojoClaro: "#fee2e2", amarillo: "#d97706", amarilloClaro: "#fef3e2",
};

const AREAS = ["Logística", "Ventas", "GPS", "Mercadeo", "Contabilidad", "Bodega", "Báscula", "Suministro", "Silos", "Taller", "Producción", "Guardia", "Compras", "Caja", "Pagos", "Planin", "Transporte", "Créditos", "Gerencia", "Laboratorio", "BodegaPT", "IT"];

const inputStyle = {
  padding: "9px 12px", borderRadius: "8px", border: `1px solid ${colors.borde}`,
  fontSize: "12.5px", color: colors.texto, outline: "none", background: "#fafbfc",
  fontFamily: "inherit", width: "100%", boxSizing: "border-box",
};

const badgeCategoria = (cat) => {
  const c = (cat || "").toLowerCase();
  if (c.includes("electr")) return { bg: colors.naranjaClaro, color: colors.naranja };
  if (c.includes("herramient")) return { bg: colors.amarilloClaro, color: colors.amarillo };
  if (c.includes("mobiliario")) return { bg: "#f1f5f9", color: colors.textoSec };
  return { bg: colors.naranjaClaro, color: colors.naranja };
};

function TablaAlmacen({ tipo, titulo, token, onAgregar, onDarSalida }) {
  const [items, setItems] = useState([]);
  const [total, setTotal] = useState(0);
  const [totalStock, setTotalStock] = useState(0);
  const [pagina, setPagina] = useState(1);
  const [busqueda, setBusqueda] = useState("");
  const [cargando, setCargando] = useState(true);
  const porPagina = 8;

  const cargar = useCallback(async () => {
    setCargando(true);
    try {
      const params = new URLSearchParams({ tipo, pagina, porPagina, ...(busqueda ? { busqueda } : {}), _: Date.now() });
      const res = await fetch(`http://localhost:3000/api/almacen?${params}`, {
        headers: { Authorization: `Bearer ${token}` },
        cache: "no-store",
      });
      const data = await res.json();
      setItems(data.items || []);
      setTotal(data.total || 0);
      setTotalStock(data.totalStock || 0);
    } catch (err) {
      console.error(err);
    } finally {
      setCargando(false);
    }
  }, [tipo, pagina, busqueda, token]);

  useEffect(() => { cargar(); }, [cargar]);
  useEffect(() => { setPagina(1); }, [busqueda]);

  const totalPaginas = Math.max(1, Math.ceil(total / porPagina));

  return (
    <div style={{ background: "#fff", borderRadius: "12px", border: `1px solid ${colors.borde}`, overflow: "hidden", marginBottom: "18px" }}>
      <div style={{ padding: "16px 20px", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "10px" }}>
        <div>
          <h3 style={{ margin: 0, fontSize: "14px", fontWeight: "700", color: colors.texto }}>{titulo}</h3>
          <span style={{ fontSize: "11.5px", color: colors.textoSec }}>
            Total: <strong style={{ color: colors.naranja }}>{totalStock}</strong> unidades
            {" "}({total} registro{total !== 1 ? "s" : ""})
          </span>
        </div>
        <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
          <div style={{ position: "relative", width: "260px" }}>
            <FaSearch style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)", color: colors.textoMuted, fontSize: "12px" }} />
            <input
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              placeholder={`Buscar ${tipo === "equipo" ? "equipo" : "suministro"} por ID, categoría...`}
              style={{ ...inputStyle, paddingLeft: "32px" }}
            />
          </div>
          <button onClick={onAgregar}
            style={{ display: "flex", alignItems: "center", gap: "7px", padding: "9px 16px", borderRadius: "9px", border: "none", background: colors.naranja, color: "white", fontSize: "12.5px", fontWeight: "700", cursor: "pointer", whiteSpace: "nowrap" }}>
            <FaPlus style={{ fontSize: "10px" }} /> Agregar {tipo === "equipo" ? "Equipo" : "Suministro"}
          </button>
        </div>
      </div>

      <div style={{ overflowX: "auto" }}>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ background: colors.naranja, color: "white" }}>
              {["ID", "Categoría", "Descripción", "Cantidad", "Ubicación", "Características", "Acciones"].map((h) => (
                <th key={h} style={{ padding: "11px 16px", textAlign: "left", fontSize: "11px", fontWeight: "700", textTransform: "uppercase", letterSpacing: "0.3px" }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {cargando ? (
              <tr><td colSpan="7" style={{ padding: "26px", textAlign: "center", color: colors.textoMuted, fontSize: "13px" }}>Cargando...</td></tr>
            ) : items.length === 0 ? (
              <tr><td colSpan="7" style={{ padding: "26px", textAlign: "center", color: colors.textoMuted, fontSize: "13px" }}>Sin registros todavía.</td></tr>
            ) : (
              items.map((it) => {
                const badge = badgeCategoria(it.categoria);
                const stockBajo = it.stockActual < it.stockMinimo;
                return (
                  <tr key={it.id} style={{ borderBottom: `1px solid ${colors.fondo}`, background: stockBajo ? "#fffaf0" : "transparent" }}>
                    <td style={{ padding: "12px 16px", fontWeight: "700", color: colors.naranja, fontSize: "12.5px" }}>{it.folio}</td>
                    <td style={{ padding: "12px 16px" }}>
                      <span style={{ padding: "2px 10px", borderRadius: "20px", fontSize: "10.5px", fontWeight: "700", background: badge.bg, color: badge.color }}>
                        {it.categoria || "—"}
                      </span>
                    </td>
                    <td style={{ padding: "12px 16px", fontSize: "13px", color: colors.texto, fontWeight: "600" }}>{it.nombre}</td>
                    <td style={{ padding: "12px 16px", fontSize: "13px", color: stockBajo ? colors.rojo : colors.texto, fontWeight: "700" }}>
                      {it.stockActual} {stockBajo && <FaExclamationTriangle style={{ fontSize: "10px", marginLeft: "4px" }} title="Stock por debajo del mínimo" />}
                    </td>
                    <td style={{ padding: "12px 16px", fontSize: "12.5px", color: colors.textoSec }}>{it.ubicacion || "—"}</td>
                    <td style={{ padding: "12px 16px", fontSize: "12px", color: colors.textoMuted }}>{it.caracteristicas || "—"}</td>
                    <td style={{ padding: "12px 16px" }}>
                      <button 
                        onClick={() => onDarSalida(it)}
                        disabled={it.stockActual <= 0}
                        style={{ 
                          display: "flex", alignItems: "center", gap: "4px", padding: "5px 10px", borderRadius: "6px", 
                          border: "none", background: it.stockActual <= 0 ? colors.textoMuted : colors.naranjaClaro, 
                          color: it.stockActual <= 0 ? "white" : colors.naranja, fontSize: "11px", fontWeight: "700", 
                          cursor: it.stockActual <= 0 ? "not-allowed" : "pointer" 
                        }}
                      >
                        <FaSignOutAlt style={{ fontSize: "10px" }} /> Salida
                      </button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {total > 0 && (
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "12px 20px", borderTop: `1px solid ${colors.fondo}` }}>
          <span style={{ fontSize: "11.5px", color: colors.textoSec }}>
            Mostrando {(pagina - 1) * porPagina + 1}-{Math.min(pagina * porPagina, total)} de {total}
          </span>
          <div style={{ display: "flex", gap: "6px" }}>
            <button onClick={() => setPagina((p) => Math.max(1, p - 1))} disabled={pagina === 1}
              style={{ padding: "5px 10px", borderRadius: "6px", border: `1px solid ${colors.borde}`, background: "#fff", cursor: pagina === 1 ? "not-allowed" : "pointer", fontSize: "12px", color: colors.textoSec }}>‹</button>
            {Array.from({ length: totalPaginas }, (_, i) => i + 1).slice(0, 5).map((p) => (
              <button key={p} onClick={() => setPagina(p)}
                style={{ padding: "5px 11px", borderRadius: "6px", border: "none", background: p === pagina ? colors.naranja : "#f1f5f9", color: p === pagina ? "white" : colors.textoSec, cursor: "pointer", fontSize: "12px", fontWeight: "700" }}>
                {p}
              </button>
            ))}
            <button onClick={() => setPagina((p) => Math.min(totalPaginas, p + 1))} disabled={pagina === totalPaginas}
              style={{ padding: "5px 10px", borderRadius: "6px", border: `1px solid ${colors.borde}`, background: "#fff", cursor: pagina === totalPaginas ? "not-allowed" : "pointer", fontSize: "12px", color: colors.textoSec }}>›</button>
          </div>
        </div>
      )}
    </div>
  );
}

function ModalAgregarItem({ tipo, token, onClose, onGuardado }) {
  const [form, setForm] = useState({
    nombre: "", categoria: "", ubicacion: "", caracteristicas: "",
    unidad: "unidad", stockActual: "", stockMinimo: "5", costoUnitario: "",
  });
  const [guardando, setGuardando] = useState(false);

  const guardar = async (e) => {
    e.preventDefault();
    if (!form.nombre.trim()) { alert("El nombre/descripción es requerido"); return; }
    setGuardando(true);
    try {
      const res = await fetch("http://localhost:3000/api/almacen", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ ...form, tipo }),
      });
      const data = await res.json();
      if (!res.ok) { alert(data.message || "No se pudo guardar"); return; }
      onGuardado();
      onClose();
    } catch (err) {
      console.error(err);
      alert("Error al guardar");
    } finally {
      setGuardando(false);
    }
  };

  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(15,23,42,0.5)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000 }}>
      <div style={{ background: "#fff", borderRadius: "14px", padding: "26px", width: "440px", boxShadow: "0 10px 40px rgba(0,0,0,0.2)" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
          <h3 style={{ margin: 0, fontSize: "15px", fontWeight: "800", color: colors.texto }}>
            Agregar {tipo === "equipo" ? "Equipo" : "Suministro"}
          </h3>
          <FaTimes style={{ cursor: "pointer", color: colors.textoSec }} onClick={onClose} />
        </div>
        <form onSubmit={guardar} style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
          <input placeholder="Descripción (ej. Laptop Dell Latitude 5540)" required value={form.nombre}
            onChange={(e) => setForm({ ...form, nombre: e.target.value })} style={inputStyle} />
          <div style={{ display: "flex", gap: "10px" }}>
            <input placeholder="Categoría" value={form.categoria}
              onChange={(e) => setForm({ ...form, categoria: e.target.value })} style={inputStyle} />
            <input placeholder="Ubicación (ej. Estante A - Nivel 2)" value={form.ubicacion}
              onChange={(e) => setForm({ ...form, ubicacion: e.target.value })} style={inputStyle} />
          </div>
          <input placeholder="Características (ej. Intel i7, 16GB RAM, 512GB SSD)" value={form.caracteristicas}
            onChange={(e) => setForm({ ...form, caracteristicas: e.target.value })} style={inputStyle} />
          <div style={{ display: "flex", gap: "10px" }}>
            <input type="number" placeholder="Cantidad" value={form.stockActual}
              onChange={(e) => setForm({ ...form, stockActual: e.target.value })} style={inputStyle} />
            <input type="number" placeholder="Mínimo antes de alertar" value={form.stockMinimo}
              onChange={(e) => setForm({ ...form, stockMinimo: e.target.value })} style={inputStyle} />
          </div>
          <button type="submit" disabled={guardando}
            style={{ padding: "11px", background: colors.naranja, color: "white", border: "none", borderRadius: "9px", fontWeight: "700", fontSize: "13px", cursor: "pointer" }}>
            {guardando ? "Guardando..." : "Guardar"}
          </button>
        </form>
      </div>
    </div>
  );
}

function ModalSalidaItem({ item, token, onClose, onSalidaExitosa }) {
  const [form, setForm] = useState({ area: "", cantidad: "1", responsable: "" });
  const [procesando, setProcesando] = useState(false);

  const ejecutarSalida = async (e) => {
    e.preventDefault();
    const cantNum = parseInt(form.cantidad);

    if (!form.area.trim()) return alert("Debe seleccionar un área destino");
    if (isNaN(cantNum) || cantNum <= 0) return alert("Ingrese una cantidad válida");
    if (cantNum > item.stockActual) return alert(`No puedes retirar más de lo disponible (${item.stockActual})`);
    if (item.tipo === "equipo" && !form.responsable.trim()) return alert("Los equipos requieren asignar un responsable");

    setProcesando(true);
    try {
      const res = await fetch(`http://localhost:3000/api/almacen/salida/${item.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          area: form.area,
          cantidad: cantNum,
          responsable: item.tipo === "equipo" ? form.responsable : null
        }),
      });
      const data = await res.json();
      if (!res.ok) { alert(data.message || "Error al registrar la salida"); return; }
      onSalidaExitosa();
      onClose();
    } catch (err) {
      console.error(err);
      alert("Error en el servidor al despachar");
    } finally {
      setProcesando(false);
    }
  };

  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(15,23,42,0.5)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000 }}>
      <div style={{ background: "#fff", borderRadius: "14px", padding: "26px", width: "400px", boxShadow: "0 10px 40px rgba(0,0,0,0.2)" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "14px" }}>
          <div>
            <h3 style={{ margin: 0, fontSize: "14.5px", fontWeight: "800", color: colors.texto }}>Registrar Salida de Bodega</h3>
            <span style={{ fontSize: "12px", color: colors.naranja, fontWeight: "600" }}>{item.folio} — {item.nombre}</span>
          </div>
          <FaTimes style={{ cursor: "pointer", color: colors.textoSec }} onClick={onClose} />
        </div>
        
        <form onSubmit={ejecutarSalida} style={{ display: "flex", flexDirection: "column", gap: "14px", marginTop: "10px" }}>
          
          <div>
            <label style={{ fontSize: "11.5px", fontWeight: "700", color: colors.textoSec, display: "block", marginBottom: "5px" }}>Área Destino</label>
            <select required value={form.area} onChange={(e) => setForm({ ...form, area: e.target.value })} style={inputStyle}>
              <option value="">-- Seleccione Área --</option>
              {AREAS.map((a) => <option key={a} value={a}>{a}</option>)}
            </select>
          </div>

          <div>
            <label style={{ fontSize: "11.5px", fontWeight: "700", color: colors.textoSec, display: "block", marginBottom: "5px" }}>Cantidad (Disponibles: {item.stockActual})</label>
            <input type="number" min="1" max={item.stockActual} required value={form.cantidad}
              onChange={(e) => setForm({ ...form, cantidad: e.target.value })} style={inputStyle} />
          </div>

          {item.tipo === "equipo" && (
            <div>
              <label style={{ fontSize: "11.5px", fontWeight: "700", color: colors.textoSec, display: "block", marginBottom: "5px" }}>Responsable del Equipo</label>
              <input placeholder="Nombre completo del custodio" required value={form.responsable}
                onChange={(e) => setForm({ ...form, responsable: e.target.value })} style={inputStyle} />
            </div>
          )}

          <button type="submit" disabled={procesando}
            style={{ padding: "11px", background: colors.texto, color: "white", border: "none", borderRadius: "9px", fontWeight: "700", fontSize: "13px", cursor: "pointer", marginTop: "6px" }}>
            {procesando ? "Despachando..." : "Confirmar Salida"}
          </button>
        </form>
      </div>
    </div>
  );
}

export default function AlmacenBodega({ usuario, cerrarSesion }) {
  const token = localStorage.getItem("token");
  const [alerta, setAlerta] = useState({ total: 0, categoriasAfectadas: 0 });
  const [modalAbierto, setModalAbierto] = useState(null);
  const [itemParaSalida, setItemParaSalida] = useState(null); 
  const [refrescar, setRefrescar] = useState(0);

  const cargarAlerta = useCallback(async () => {
    try {
      const res = await fetch(`http://localhost:3000/api/almacen/alerta-stock-bajo?_=${Date.now()}`, {
        headers: { Authorization: `Bearer ${token}` },
        cache: "no-store",
      });
      const data = await res.json();
      setAlerta(data);
    } catch (err) {
      console.error(err);
    }
  }, [token]);

  useEffect(() => {
    cargarAlerta();
    const intervalo = setInterval(cargarAlerta, 60000);
    return () => clearInterval(intervalo);
  }, [cargarAlerta, refrescar]);

  return (
    <div style={{ display: "flex", minHeight: "100vh", backgroundColor: colors.fondo, fontFamily: "'Segoe UI', sans-serif" }}>
      <link href="https://fonts.googleapis.com/css2?family=Manrope:wght@500;700;800&display=swap" rel="stylesheet" />
      <Sidebar usuario={usuario} cerrarSesion={cerrarSesion} />

      <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>
        <Topbar usuario={usuario} cerrarSesion={cerrarSesion} />

        <div style={{ flex: 1, overflowY: "auto", padding: "24px 28px" }}>
          <h1 style={{ margin: "0 0 4px", fontSize: "20px", fontWeight: "800", color: colors.texto, fontFamily: "'Manrope', sans-serif" }}>
            Almacén - Bodega
          </h1>
          <p style={{ margin: "0 0 18px", fontSize: "12px", color: colors.textoSec }}>
            Registro completo de equipos y suministros almacenados en bodega
          </p>

          {alerta.total > 0 && (
            <div style={{ background: colors.amarilloClaro, border: `1px solid #fcd34d`, borderRadius: "10px", padding: "14px 18px", marginBottom: "18px", display: "flex", gap: "12px", alignItems: "flex-start" }}>
              <FaExclamationTriangle style={{ color: colors.amarillo, fontSize: "18px", marginTop: "1px" }} />
              <div>
                <p style={{ margin: 0, fontSize: "13.5px", fontWeight: "700", color: "#92400e" }}>Stock bajo</p>
                <p style={{ margin: "3px 0 0", fontSize: "12.5px", color: "#92400e" }}>
                  {alerta.categoriasAfectadas} categorías de equipos tienen inventario por debajo del mínimo.
                </p>
              </div>
            </div>
          )}

          <TablaAlmacen tipo="equipo" titulo="Equipos" token={token} onAgregar={() => setModalAbierto("equipo")} onDarSalida={(item) => setItemParaSalida(item)} key={`eq-${refrescar}`} />
          <TablaAlmacen tipo="suministro" titulo="Suministros" token={token} onAgregar={() => setModalAbierto("suministro")} onDarSalida={(item) => setItemParaSalida(item)} key={`sum-${refrescar}`} />
        </div>
      </div>

      {modalAbierto && (
        <ModalAgregarItem
          tipo={modalAbierto}
          token={token}
          onClose={() => setModalAbierto(null)}
          onGuardado={() => { setRefrescar((r) => r + 1); cargarAlerta(); }}
        />
      )}
      
      {itemParaSalida && (
        <ModalSalidaItem 
          item={itemParaSalida}
          token={token}
          onClose={() => setItemParaSalida(null)}
          onSalidaExitosa={() => { setRefrescar((r) => r + 1); cargarAlerta(); }}
        />
      )}
    </div>
  );
}