import { useState, useEffect } from "react";
import Sidebar from "../components/Sidebar";
import Topbar from "../components/Topbar";
import { FaCog, FaClock, FaSave } from "react-icons/fa";

const colors = {
  naranja: "#ff7f22", naranjaOscuro: "#e66a10", naranjaClaro: "#fff1e6",
  texto: "#1e293b", textoSec: "#64748b", textoMuted: "#94a3b8",
  borde: "#eef1f5", fondo: "#FFF7F2", verde: "#16a34a", verdeClaro: "#e9f9ee",
  rojo: "#dc2626",
};

const colorPrioridad = (p) => {
  const v = p?.toLowerCase();
  if (v === "urgente") return "#7c3aed";
  if (v === "alta") return colors.rojo;
  if (v === "media") return colors.naranja;
  return colors.verde;
};

const ORDEN_PRIORIDAD = { Urgente: 0, Alta: 1, Media: 2, Baja: 3 };

export default function Configuracion({ usuario, cerrarSesion }) {
  const token = localStorage.getItem("token");
  const [slaConfig, setSlaConfig] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [guardandoId, setGuardandoId] = useState(null);
  const [guardadoOkId, setGuardadoOkId] = useState(null);

  const cargarSLA = async () => {
    setCargando(true);
    try {
      const res = await fetch("http://localhost:3000/api/sla", { headers: { Authorization: `Bearer ${token}` } });
      const data = await res.json();
      const lista = Array.isArray(data) ? data : [];
      lista.sort((a, b) => (ORDEN_PRIORIDAD[a.prioridad] ?? 99) - (ORDEN_PRIORIDAD[b.prioridad] ?? 99));
      setSlaConfig(lista);
    } catch (err) {
      console.error(err);
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => { cargarSLA(); }, []);

  const actualizarHoras = (id, horas) => {
    setSlaConfig((prev) => prev.map((s) => (s.id === id ? { ...s, horasRespuesta: horas } : s)));
  };

  const guardar = async (item) => {
    setGuardandoId(item.id);
    try {
      const res = await fetch(`http://localhost:3000/api/sla/${item.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ horasRespuesta: item.horasRespuesta }),
      });
      if (!res.ok) {
        const data = await res.json();
        alert(data.message || "No se pudo guardar");
        return;
      }
      setGuardadoOkId(item.id);
      setTimeout(() => setGuardadoOkId(null), 1800);
    } catch (err) {
      console.error(err);
      alert("Error al guardar");
    } finally {
      setGuardandoId(null);
    }
  };

  return (
    <div style={{ display: "flex", minHeight: "100vh", backgroundColor: colors.fondo, fontFamily: "'Segoe UI', sans-serif" }}>
      <link href="https://fonts.googleapis.com/css2?family=Manrope:wght@500;700;800&display=swap" rel="stylesheet" />
      <Sidebar usuario={usuario} cerrarSesion={cerrarSesion} />

      <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>
        <Topbar usuario={usuario} cerrarSesion={cerrarSesion} />

        <div style={{ flex: 1, overflowY: "auto", padding: "24px 28px" }}>
          <h1 style={{ margin: "0 0 4px", fontSize: "20px", fontWeight: "800", color: colors.texto, fontFamily: "'Manrope', sans-serif", display: "flex", alignItems: "center", gap: "9px" }}>
            <FaCog style={{ color: colors.naranja, fontSize: "18px" }} /> Configuración del Sistema
          </h1>
          <p style={{ margin: "0 0 20px", fontSize: "12px", color: colors.textoSec }}>
            Tiempos de respuesta (SLA) que el sistema usa para calcular vencimientos de tickets
          </p>

          <div style={{ background: "#fff", borderRadius: "12px", border: `1px solid ${colors.borde}`, padding: "24px", maxWidth: "640px" }}>
            <h3 style={{ margin: "0 0 4px", fontSize: "14px", fontWeight: "700", color: colors.texto, display: "flex", alignItems: "center", gap: "8px" }}>
              <FaClock style={{ color: colors.naranja }} /> Tiempos de Respuesta por Prioridad
            </h3>
            <p style={{ margin: "0 0 18px", fontSize: "12px", color: colors.textoSec }}>
              Cuando se crea un ticket, este es el número de horas que tiene el equipo de IT antes de que se marque
              "en riesgo" en el dashboard. Los cambios aquí se reflejan de inmediato al abrir cualquier ticket
              (nuevo o viejo), no hace falta recrearlo.
            </p>

            {cargando ? (
              <p style={{ fontSize: "13px", color: colors.textoSec }}>Cargando configuración...</p>
            ) : slaConfig.length === 0 ? (
              <p style={{ fontSize: "13px", color: colors.textoMuted }}>
                No hay configuración de SLA todavía — corre tu <code>seed.js</code> para crearla.
              </p>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                {slaConfig.map((s) => (
                  <div key={s.id} style={{ display: "flex", alignItems: "center", gap: "14px", padding: "12px 14px", background: colors.fondo, borderRadius: "10px" }}>
                    <span style={{ width: "10px", height: "10px", borderRadius: "50%", background: colorPrioridad(s.prioridad), flexShrink: 0 }} />
                    <span style={{ flex: 1, fontSize: "13.5px", fontWeight: "700", color: colors.texto }}>{s.prioridad}</span>
                    <input
                      type="number"
                      min="0.5"
                      step="0.5"
                      value={s.horasRespuesta}
                      onChange={(e) => actualizarHoras(s.id, e.target.value)}
                      style={{ width: "80px", padding: "8px 10px", borderRadius: "7px", border: `1px solid ${colors.borde}`, fontSize: "13px", textAlign: "center", outline: "none" }}
                    />
                    <span style={{ fontSize: "12px", color: colors.textoSec, width: "36px" }}>horas</span>
                    <button
                      onClick={() => guardar(s)}
                      disabled={guardandoId === s.id}
                      style={{
                        display: "flex", alignItems: "center", gap: "6px", padding: "7px 14px", borderRadius: "8px", border: "none",
                        background: guardadoOkId === s.id ? colors.verde : colors.naranja, color: "white",
                        fontSize: "12px", fontWeight: "700", cursor: "pointer", fontFamily: "inherit", whiteSpace: "nowrap",
                      }}
                    >
                      <FaSave style={{ fontSize: "10px" }} /> {guardadoOkId === s.id ? "Guardado" : guardandoId === s.id ? "Guardando..." : "Guardar"}
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}